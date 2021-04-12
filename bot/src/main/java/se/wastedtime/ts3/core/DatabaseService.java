package se.wastedtime.ts3.core;

import org.springframework.core.io.ByteArrayResource;
import se.wastedtime.ts3.data.SoundFile;
import se.wastedtime.ts3.data.SoundFileUpdate;

import java.util.List;

public interface DatabaseService {
    void loadDatabase();

    SoundFile getFile(String key);

    List<SoundFile> getFiles();

    SoundFile updateFile(SoundFileUpdate file);

    SoundFile incPlayCount(SoundFile file);

    ByteArrayResource downloadFile(SoundFile file);
}
