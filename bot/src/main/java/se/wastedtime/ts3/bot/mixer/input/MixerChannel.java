package se.wastedtime.ts3.bot.mixer.input;

public interface MixerChannel extends AudioProvider {

    default String getName() {
        return getClass().getSimpleName();
    }

    /**
     * Finds if the channel is still playing audio.
     *
     * @return true if the channel is playing audio.
     */
    boolean isPlaying();

}
