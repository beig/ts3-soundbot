package se.wastedtime.ts3.core;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.stream.JsonReader;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FileUtils;
import org.jaudiotagger.audio.AudioFile;
import org.jaudiotagger.audio.AudioFileIO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;
import org.springframework.util.FileCopyUtils;
import se.wastedtime.ts3.Properties;
import se.wastedtime.ts3.data.Category;
import se.wastedtime.ts3.data.JsonCategoryWrapper;
import se.wastedtime.ts3.data.JsonFileWrapper;
import se.wastedtime.ts3.data.SoundFile;

import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class DatabaseServiceImpl implements DatabaseService {

    private final Properties properties;

    private final IndexService indexer;
    private final Map<String, SoundFile> soundFiles = new HashMap<>();
    private final Map<String, Category> categoryMap = new HashMap<>();
    private final Gson gson = new GsonBuilder().setPrettyPrinting().create();
    private File databaseFile;

    @Autowired
    public DatabaseServiceImpl(Properties properties, IndexService indexer) {
        this.properties = properties;
        this.indexer = indexer;
        loadCategories();
        loadDatabase();
        syncDatabase();
    }

    @Override
    @SneakyThrows
    public void loadDatabase() {
        if (!new File(properties.getDatabase()).exists()) {
            databaseFile = setUpDatabase();
        } else {
            databaseFile = new File(properties.getDatabase());
        }

        JsonReader reader = new JsonReader(new FileReader(databaseFile));
        JsonFileWrapper wrapper = gson.fromJson(reader, JsonFileWrapper.class);
        if (wrapper.getFiles() != null)
            wrapper.getFiles().forEach(soundFile -> soundFiles.put(soundFile.getFileName(), soundFile));
    }

    @Override
    public SoundFile getFile(String key) {
        return soundFiles.get(key);
    }

    @Override
    public List<SoundFile> getFiles() {
        return new ArrayList<>(soundFiles.values());
    }

    @Override
    public void reindex() {
        syncDatabase();
    }

    @Override
    @SneakyThrows
    public ByteArrayResource downloadFile(SoundFile file) {
        return new ByteArrayResource(FileCopyUtils.copyToByteArray(file.getAsFile()));
    }

    @SneakyThrows
    private void syncDatabase() {
        for (File file : this.indexer.getSoundFiles()) {
            if (!soundFiles.containsKey(file.getName())) {
                SoundFile soundFile = new SoundFile();
                soundFile.setFileName(file.getName());
                soundFile.setPath(file.getPath());
                AudioFile af = AudioFileIO.read(soundFile.getAsFile());
                soundFile.setDuration(af.getAudioHeader().getTrackLength());

                if (categoryMap.containsKey(file.getName())) {
                    Category category = categoryMap.get(file.getName());
                        soundFile.setCategory(category.getCategory());
                        soundFile.setDisplayName(category.getDescription());
                }


                soundFiles.put(file.getName(), soundFile);
                log.info("Adding file '{}' to database", file.getName());
            }
        }

        JsonFileWrapper wrapper = new JsonFileWrapper(new ArrayList<>(soundFiles.values()));
        FileWriter fileWriter = new FileWriter(databaseFile);
        gson.toJson(wrapper, fileWriter);
        fileWriter.flush();
        fileWriter.close();
    }

    @SneakyThrows
    private File setUpDatabase() {
        File file = new File(properties.getDatabase());
        FileUtils.touch(file);
        FileUtils.write(file, "{}", StandardCharsets.UTF_8);
        return file;
    }

    @SneakyThrows
    private void loadCategories() {
        System.out.println(properties.getCategories());
        if (!new File(properties.getCategories()).exists()) {
            throw new DatabaseException("Missing category file");
        } else {
            File categoriesFile = new File(properties.getCategories());
            JsonReader reader = new JsonReader(new FileReader(categoriesFile));
            JsonCategoryWrapper wrapper = gson.fromJson(reader, JsonCategoryWrapper.class);
            if (wrapper.getCategories() != null) {
                wrapper.getCategories().forEach(category -> categoryMap.put(category.getFile(), category));
            }
        }
    }
}
