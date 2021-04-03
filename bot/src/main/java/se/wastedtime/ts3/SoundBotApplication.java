package se.wastedtime.ts3;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import se.wastedtime.ts3.core.DatabaseService;

@SpringBootApplication
@Slf4j
@EnableScheduling
public class SoundBotApplication {

    private final DatabaseService database;

    @Autowired
    public SoundBotApplication(DatabaseService database) {
        this.database = database;
    }

    public static void main(String[] args) {
        SpringApplication.run(SoundBotApplication.class, args);
    }

}
