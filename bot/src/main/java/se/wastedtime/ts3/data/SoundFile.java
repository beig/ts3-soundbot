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

    @Id
    String name;
    String path;
    int duration;
    String description;
    String category;
    List<String> tags;
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
