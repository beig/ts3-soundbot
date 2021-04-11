package se.wastedtime.ts3;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.io.File;

@Data
@ConfigurationProperties(prefix = "bot")
public class Properties {

    String soundDirectory;
    String databaseDirectory;

    @Value("${bot.sound-directory:#{null}}")
    public void setSoundDirectory(String soundDirectory) {
        if (soundDirectory == null) {
            this.soundDirectory = new File("").getAbsolutePath() + File.separator + "sounds" + File.separator;
        } else {
            this.soundDirectory = soundDirectory;
        }
    }

    @Value("${database-file:#{null}}")
    public void setDatabase(String database) {
        if (database == null) {
            this.databaseDirectory = new File("").getAbsolutePath() + File.separator;
        } else {
            this.databaseDirectory = database;
        }
    }
}
