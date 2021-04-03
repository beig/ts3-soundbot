package se.wastedtime.ts3.api;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import se.wastedtime.ts3.core.DatabaseService;
import se.wastedtime.ts3.data.Health;
import se.wastedtime.ts3.data.SoundFile;

import java.util.List;

@RestController
@Slf4j
@RequestMapping("/api/")
public class BotApi {

    private final DatabaseService databaseService;

    @Autowired
    public BotApi(DatabaseService databaseService) {
        this.databaseService = databaseService;
    }

    @GetMapping("/status")
    public Health status() {
        return new Health("OK", databaseService.getFiles().size(), false, false);
    }

    @GetMapping("/files")
    public List<SoundFile> getFiles() {
        return databaseService.getFiles();
    }

    @GetMapping("/files/{id}")
    public SoundFile getFile(@PathVariable String id) {
        return databaseService.getFile(id);
    }
}
