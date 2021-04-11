package se.wastedtime.ts3.data;

import lombok.Data;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Data
public class SoundFile {
    String name;
    String path;
    int duration;
    String description;
    String category;
    List<String> tags;

    public Path getAsPath() {
        return Paths.get(getPath());
    }

    public File getAsFile() {
        return new File(getPath());
    }
}
