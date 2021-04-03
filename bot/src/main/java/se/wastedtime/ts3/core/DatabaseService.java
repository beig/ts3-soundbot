package se.wastedtime.ts3.core;

import se.wastedtime.ts3.data.SoundFile;

import java.util.List;

public interface DatabaseService {
    void loadDatabase();

    SoundFile getFile(String key);

    List<SoundFile> getFiles();

    void reindex();
}
