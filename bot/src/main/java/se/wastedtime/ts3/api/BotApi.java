package se.wastedtime.ts3.api;

import com.github.manevolent.ts3j.api.Channel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import se.wastedtime.ts3.bot.TeamspeakBot;
import se.wastedtime.ts3.core.DatabaseService;
import se.wastedtime.ts3.data.Health;
import se.wastedtime.ts3.data.SoundFile;

import java.util.List;

@RestController
@Slf4j
@RequestMapping("/api/")
@CrossOrigin
public class BotApi {

    private final DatabaseService databaseService;
    private final TeamspeakBot teamspeakBot;

    @Autowired
    public BotApi(DatabaseService databaseService, TeamspeakBot teamspeakBot) {
        this.databaseService = databaseService;
        this.teamspeakBot = teamspeakBot;
    }

    @GetMapping("/ts3/connect")
    public boolean connect() {
        teamspeakBot.setRunning(true);
        return teamspeakBot.isRunning();
    }

    @GetMapping("/ts3/disconnect")
    public boolean disconnect() {
        teamspeakBot.setRunning(false);
        return teamspeakBot.isRunning();
    }

    @GetMapping("/ts3/channels")
    public List<Channel> channels() {
        return teamspeakBot.getChannels();
    }

    @GetMapping("/ts3/channel")
    public Channel channel() {
        return teamspeakBot.getCurrentChannel();
    }

    @GetMapping("/ts3/channel/{id}/join")
    public void joinChannel(@PathVariable Integer id) {
        teamspeakBot.moveToChannel(id);
    }

    @GetMapping("/status")
    public Health status() {
        return new Health("Online", databaseService.getFiles().size(), teamspeakBot.isRunning());
    }

    @GetMapping("/reindex")
    public void reindex() {
        databaseService.reindex();
    }

    @GetMapping("/files")
    public List<SoundFile> getFiles() {
        return databaseService.getFiles();
    }

    @GetMapping("/files/{id}")
    public SoundFile getFile(@PathVariable String id) {
        return databaseService.getFile(id);
    }

    @GetMapping("/files/{id}/play")
    public void playFile(@PathVariable String id) {
        teamspeakBot.playFile(databaseService.getFile(id));
    }
}
