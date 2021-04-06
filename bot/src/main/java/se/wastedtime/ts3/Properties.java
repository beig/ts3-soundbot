package se.wastedtime.ts3;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.io.File;

@Data
@ConfigurationProperties(prefix = "bot")
public class Properties {
    String soundDirectory;
    String database;

    @org.springframework.beans.factory.annotation.Value("${bot.sound-directory:#{null}}")
    public void setSoundDirectory(String soundDirectory) {
        if (soundDirectory == null) {
            this.soundDirectory = new File("").getAbsolutePath() + File.separator + "sounds" + File.separator;
        } else {
            this.soundDirectory = soundDirectory;
        }
    }

    @org.springframework.beans.factory.annotation.Value("${bot.database-file:#{null}}")
    public void setDatabase(String database) {
        if (database == null) {
            this.database = new File("").getAbsolutePath() + File.separator + "database.json";
        } else {
            this.database = database;
        }
    }
}
