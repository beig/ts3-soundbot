package se.wastedtime.ts3.core;

import io.jsondb.JsonDBTemplate;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;
import org.springframework.util.FileCopyUtils;
import se.wastedtime.ts3.Properties;
import se.wastedtime.ts3.data.SoundFile;

import java.util.List;

@Service
@Slf4j
public class DatabaseServiceImpl implements DatabaseService {

    private final Properties properties;

    private final IndexService indexer;
    private JsonDBTemplate jsonDB;

    @Autowired
    public DatabaseServiceImpl(Properties properties, IndexService indexer) {
        this.properties = properties;
        this.indexer = indexer;
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
    @SneakyThrows
    public ByteArrayResource downloadFile(SoundFile file) {
        return new ByteArrayResource(FileCopyUtils.copyToByteArray(file.getAsFile()));
    }
}
