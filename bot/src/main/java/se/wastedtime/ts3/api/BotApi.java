package se.wastedtime.ts3.api;

import com.github.manevolent.ts3j.api.Channel;
import com.github.manevolent.ts3j.api.Client;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.web.bind.annotation.*;
import se.wastedtime.ts3.bot.BotException;
import se.wastedtime.ts3.bot.TeamspeakBot;
import se.wastedtime.ts3.bot.TeamspeakBotImpl;
import se.wastedtime.ts3.core.DatabaseService;
import se.wastedtime.ts3.data.Health;
import se.wastedtime.ts3.data.SoundFile;
import se.wastedtime.ts3.data.SoundFileUpdate;

import java.util.List;

@RestController
@Slf4j
@RequestMapping("/api/")
@CrossOrigin
public class BotApi {

    private final DatabaseService databaseService;
    private TeamspeakBot teamspeakBot;

    @Autowired
    public BotApi(DatabaseService databaseService) {
        this.databaseService = databaseService;
        this.teamspeakBot = new TeamspeakBotImpl();
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

    @GetMapping("/ts3/restart")
    public boolean restart() {
        disconnect();
        this.teamspeakBot = new TeamspeakBotImpl();
        this.teamspeakBot.setRunning(true);
        return teamspeakBot.isRunning();
    }

    @GetMapping("/ts3/channels")
    public List<Channel> channels() {
        if (!this.teamspeakBot.isRunning()) {
            throw new BotException("Bot not online");
        }
        return teamspeakBot.getChannels();
    }

    @GetMapping("/ts3/channel")
    public Channel channel() {
        if (!this.teamspeakBot.isRunning()) {
            throw new BotException("Bot not online");
        }
        return teamspeakBot.getCurrentChannel();
    }

    @GetMapping("/ts3/channel/{id}/join")
    public void joinChannel(@PathVariable Integer id) {
        if (!this.teamspeakBot.isRunning()) {
            throw new BotException("Bot not online");
        }
        teamspeakBot.moveToChannel(id);
    }

    @GetMapping("/ts3/users")
    public List<Client> getClients() {
        if (!this.teamspeakBot.isRunning()) {
            throw new BotException("Bot not online");
        }
        return teamspeakBot.getClients();
    }

    @GetMapping("/status")
    public Health status() {
        return new Health("Online", databaseService.getFiles().size(), teamspeakBot.isRunning());
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
        SoundFile file = databaseService.getFile(id);
        databaseService.incPlayCount(file);
        teamspeakBot.playFile(file);
    }

    @PutMapping("/files/{id}")
    public SoundFile updateFile(@PathVariable String id, @RequestBody SoundFileUpdate body) {
        return databaseService.updateFile(body);
    }

    @GetMapping("/files/{id}/download")
    public ByteArrayResource downloadFile(@PathVariable String id) {
        return databaseService.downloadFile(databaseService.getFile(id));
    }
}
