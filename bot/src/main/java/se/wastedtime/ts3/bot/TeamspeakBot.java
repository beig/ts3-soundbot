package se.wastedtime.ts3.bot;

import com.github.manevolent.ts3j.api.Channel;
import com.github.manevolent.ts3j.api.Client;
import com.github.manevolent.ts3j.event.TS3Listener;
import se.wastedtime.ts3.data.SoundFile;

import java.util.List;

public interface TeamspeakBot extends TS3Listener {
    boolean isRunning();

    void setRunning(boolean running);

    Channel getCurrentChannel();

    List<Channel> getChannels();

    boolean moveToChannel(int cid);

    List<Client> getClients();

    void playFile(SoundFile file);
}
