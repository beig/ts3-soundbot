package se.wastedtime.ts3;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.io.File;

@Data
@ConfigurationProperties(prefix = "bot")
public class Properties {
    String soundDirectory;
    String database;
    String categories;

    @Value("${bot.sound-directory:#{null}}")
    public void setSoundDirectory(String soundDirectory) {
        if (soundDirectory == null) {
            this.soundDirectory = new File("").getAbsolutePath() + File.separator + "sounds" + File.separator;
        } else {
            this.soundDirectory = soundDirectory;
        }
    }

    @Value("${bot.database-file:#{null}}")
    public void setDatabase(String database) {
        if (database == null) {
            this.database = new File("").getAbsolutePath() + File.separator + "database.json";
        } else {
            this.database = database;
        }
    }

    @Value("${bot.category-file:#{null}}")
    public void setCategories(String category) {
        if (category == null) {
            this.categories = new File("").getAbsolutePath() + File.separator + "categories.json";
        } else {
            this.categories = category;
        }
    }

}
