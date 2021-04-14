package se.wastedtime.ts3.core;

import io.jsondb.JsonDBTemplate;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.jaudiotagger.audio.AudioFileIO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;
import org.springframework.util.FileCopyUtils;
import se.wastedtime.ts3.Properties;
import se.wastedtime.ts3.api.EventEmitter;
import se.wastedtime.ts3.data.SoundFile;
import se.wastedtime.ts3.data.SoundFileCreate;
import se.wastedtime.ts3.data.SoundFileUpdate;

import java.io.FileOutputStream;
import java.util.List;

@Service
@Slf4j
public class DatabaseServiceImpl implements DatabaseService {

    private final Properties properties;

    private final IndexService indexer;
    private final EventEmitter eventEmitter;
    private JsonDBTemplate jsonDB;

    @Autowired
    public DatabaseServiceImpl(Properties properties, IndexService indexer, EventEmitter eventEmitter) {
        this.properties = properties;
        this.indexer = indexer;
        this.eventEmitter = eventEmitter;
        loadDatabase();
    }

    @Override
    @SneakyThrows
    public void loadDatabase() {
        jsonDB = new JsonDBTemplate(properties.getDatabaseDirectory(), "se.wastedtime.ts3.data");
        if (!jsonDB.collectionExists(SoundFile.class)) {
            jsonDB.createCollection(SoundFile.class);
        }
    }

    @Override
    public SoundFile getFile(String key) {
        return jsonDB.findById(key, SoundFile.class);
    }

    @Override
    public List<SoundFile> getFiles() {
        return jsonDB.findAll(SoundFile.class);
    }

    @Override
    public SoundFile updateFile(SoundFileUpdate file) {
        SoundFile soundFile = new SoundFile(file);
        soundFile.setPlayCount(jsonDB.findById(file.getName(), SoundFile.class).getPlayCount());
        jsonDB.upsert(soundFile);
        this.eventEmitter.publishFileEvent(file);
        return soundFile;
    }

    @Override
    public SoundFile incPlayCount(SoundFile file) {
        file.setPlayCount(file.getPlayCount() + 1);
        jsonDB.upsert(file);
        this.eventEmitter.publishFileEvent(file);
        return null;
    }

    @Override
    @SneakyThrows
    public ByteArrayResource downloadFile(SoundFile file) {
        return new ByteArrayResource(FileCopyUtils.copyToByteArray(file.getAsFile()));
    }

    @Override
    @SneakyThrows
    public SoundFile createFile(SoundFileCreate file) {
        SoundFile byId = jsonDB.findById(file.getName(), SoundFile.class);
        if (byId != null) {
            throw new DatabaseException("File exists");
        } else {
            SoundFile soundFile = new SoundFile(file, properties.getDatabaseDirectory());
            FileOutputStream fileOutputStream = new FileOutputStream(soundFile.getAsFile());
            fileOutputStream.write(file.getData());
            fileOutputStream.close();
            soundFile.setDuration(AudioFileIO.read(soundFile.getAsFile()).getAudioHeader().getTrackLength());
            this.eventEmitter.publishFileEvent(file);
            jsonDB.insert(soundFile);
            return soundFile;
        }
    }
}
