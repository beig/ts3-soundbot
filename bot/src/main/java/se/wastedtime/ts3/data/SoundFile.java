package se.wastedtime.ts3.data;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.jsondb.annotation.Document;
import io.jsondb.annotation.Id;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Data
@NoArgsConstructor
@Document(collection = "files", schemaVersion = "1.0")
public class SoundFile {

    public SoundFile(SoundFileUpdate update) {
        this.name = update.getName();
        this.duration = update.getDuration();
        this.description = update.getDescription();
        this.category = update.getCategory();
        this.tags = update.getTags();
        this.softDeleted = update.isSoftDeleted();
        this.path = update.getPath();
    }

    public SoundFile(SoundFileCreate file, String directory) {
        this.name = file.getName();
        this.description = file.getDescription();
        this.category = file.getCategory();
        this.tags = file.getTags();
        this.softDeleted = false;
        this.path = directory + File.separator + this.name;
    }

    @Id
    String name;
    String path;
    int duration;
    String description;
    String category;
    List<String> tags;
    int playCount;
    boolean softDeleted;

    @JsonIgnore
    public Path getAsPath() {
        return Paths.get(getPath());
    }

    @JsonIgnore
    public File getAsFile() {
        return new File(getPath());
    }

}
