package se.wastedtime.ts3.data;

import lombok.Data;

import java.util.List;

@Data
public class SoundFile {
    String fileName;
    String path;
    String displayName;
    String categorie;
    List<String> tags;
}
