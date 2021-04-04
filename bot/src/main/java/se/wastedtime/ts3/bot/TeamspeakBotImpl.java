package se.wastedtime.ts3.bot;

import com.github.manevolent.ffmpeg4j.FFmpeg;
import com.github.manevolent.ts3j.api.Channel;
import com.github.manevolent.ts3j.api.Client;
import com.github.manevolent.ts3j.identity.LocalIdentity;
import com.github.manevolent.ts3j.protocol.client.ClientConnectionState;
import com.github.manevolent.ts3j.protocol.socket.client.LocalTeamspeakClientSocket;
import com.google.common.collect.Lists;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import se.wastedtime.ts3.bot.mixer.BufferedMixer;
import se.wastedtime.ts3.bot.mixer.Mixer;
import se.wastedtime.ts3.bot.mixer.MixerProcessTask;
import se.wastedtime.ts3.bot.mixer.TeamspeakFastMixerSink;
import se.wastedtime.ts3.bot.mixer.filter.MixerFilter;
import se.wastedtime.ts3.bot.mixer.filter.type.FilterDither;
import se.wastedtime.ts3.bot.mixer.filter.type.FilterGain;
import se.wastedtime.ts3.bot.mixer.filter.type.SoftClipFilter;
import se.wastedtime.ts3.bot.opus.OpusParameters;
import se.wastedtime.ts3.bot.player.FFmpegAudioPlayer;
import se.wastedtime.ts3.bot.player.ResampledAudioPlayer;
import se.wastedtime.ts3.bot.resample.FFmpegResampler;
import se.wastedtime.ts3.data.SoundFile;

import javax.sound.sampled.AudioFormat;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeoutException;
import java.util.function.Consumer;
import java.util.stream.StreamSupport;

@Slf4j
@Service
public class TeamspeakBotImpl implements TeamspeakBot {

    private final LocalTeamspeakClientSocket client;
    private final Mixer mixer;
    private final Consumer<Float> volumeControl;
    private boolean running = false;
    private int currentChannel = 0;

    @SneakyThrows
    public TeamspeakBotImpl() {
        FFmpeg.register();
        client = new LocalTeamspeakClientSocket();
        client.setNickname(Config.CLIENT_NAME);
        client.setHWID(Config.HWID);

        byte[] base64Identity = Base64.getDecoder().decode(Config.TS3_IDENTITY_BASE64);

        LocalIdentity identity = LocalIdentity.read(new ByteArrayInputStream(base64Identity));

        client.setIdentity(identity);
        client.addListener(this);

        // Create a new buffered mixer, which mixes many sources of audio.
        float sampleRate = 48000F;
        int channels = 2;
        float bufferSizePerChannel = (float) (sampleRate * Config.OPUS_BUFFER);
        int bufferSize = (int) (bufferSizePerChannel * channels);

        this.mixer = new BufferedMixer(bufferSize, sampleRate, channels);

        // < Filter chain >
        // Mine is rather basic. You could add EQs, limiters, stereo separation, light reverberation, etc. here
        // This gives a decent sound regardless of volume, and protects against clipping/distortions.
        // See the respective Filter java files for more information.
        {
            // Add a gain/volume filter, and attach the filter's control to the volumeControl function.
            FilterGain gainFilter = new FilterGain(1f);
            MixerFilter[] multichannelGainFilter = new MixerFilter[channels];
            for (int ch = 0; ch < channels; ch++) multichannelGainFilter[ch] = gainFilter;
            this.volumeControl = gainFilter::setQ;
            this.mixer.addFilter(multichannelGainFilter);

            // Add a soft-clip filter, which protects the output of the mixer from going beyond the limit of [-1,1]
            MixerFilter[] multichannelClipFilter = new MixerFilter[channels];
            for (int ch = 0; ch < channels; ch++) multichannelClipFilter[ch] = new SoftClipFilter();
            this.mixer.addFilter(multichannelClipFilter);

            // Add a dither filter, which inserts noise to reduce quantization/rounding errors with 24-bit audio.
            // This may be unnecessary on our 32-bit audio processing pipeline, not to mention OPUS probably doesn't
            // care, but I am adding it anyways since most DACs on the receiving end are 24-bit at most.
            MixerFilter[] multichannelDitherFilter = new MixerFilter[channels];
            for (int ch = 0; ch < channels; ch++) multichannelDitherFilter[ch] = new FilterDither(24);
            this.mixer.addFilter(multichannelDitherFilter);
        }

        AudioFormat audioFormat = new AudioFormat(sampleRate, 32, channels, true, false);
        TeamspeakFastMixerSink sink = new TeamspeakFastMixerSink(audioFormat, bufferSize * 4, OpusParameters.getInstance());
        mixer.addSink(sink);
        Thread mixerThread = new Thread(new MixerProcessTask(mixer, 20D, 2D));
        mixerThread.start();

        client.setMicrophone(sink);
    }

    @Override
    public boolean isRunning() {
        return this.running;
    }

    @Override
    public void setRunning(boolean running) {
        if (this.running != running) {
            if (running) {
                onStart();
            } else {
                onStop();
            }
            this.running = running;
        }
    }

    @Override
    @SneakyThrows
    public Channel getCurrentChannel() {
        Optional<Channel> first = StreamSupport.stream(client.listChannels().spliterator(), false).filter(channel -> channel.getId() == currentChannel).findFirst();
        return first.orElse(null);
    }

    @Override
    @SneakyThrows
    public List<Channel> getChannels() {
        return Lists.newArrayList(client.listChannels());
    }

    @Override
    @SneakyThrows
    public boolean moveToChannel(int cid) {
        client.joinChannel(cid, null);
        currentChannel = cid;
        return true;
    }

    @Override
    @SneakyThrows
    public List<Client> getClients() {
        return Lists.newArrayList(client.listClients());
    }

    @Override
    @SneakyThrows
    public void playFile(SoundFile file) {
        FFmpegAudioPlayer audioPlayer = FFmpegAudioPlayer.open(FFmpeg.getInputFormatByName("mp3"), Files.newInputStream(Paths.get(file.getPath())), 10240);
        mixer.addChannel(new ResampledAudioPlayer(audioPlayer, new FFmpegResampler(
                new AudioFormat(audioPlayer.getSampleRate(), 32, audioPlayer.getChannels(), true, false),
                new AudioFormat(mixer.getAudioSampleRate(), 32, mixer.getAudioChannels(), true, false),
                mixer.getBufferSize()
        ), mixer.getBufferSize()));
    }

    private void onStart() {
        while (true) {
            try {
                InetSocketAddress inetSocketAddress = new InetSocketAddress(InetAddress.getByName(Config.TS3_ADDRESS), Config.TS3_PORT);
                client.connect(inetSocketAddress, "", 10000L);
                client.subscribeAll();
                client.waitForState(ClientConnectionState.CONNECTED, 10000);

                break;
            } catch (IOException | TimeoutException | InterruptedException | ExecutionException e) {
                e.printStackTrace();
            }
        }
    }

    private void onStop() {
        try {
            client.disconnect();
        } catch (Exception e) {
            // Ignore
        }
    }
}
