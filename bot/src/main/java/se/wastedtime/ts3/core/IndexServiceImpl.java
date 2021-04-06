package se.wastedtime.ts3.core;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import se.wastedtime.ts3.Properties;

import java.io.File;
import java.util.ArrayList;

@Service
@Slf4j
public class IndexServiceImpl implements IndexService {

    private final Properties properties;

    @Autowired
    public IndexServiceImpl(Properties properties) {
        this.properties = properties;
    }

    @Override
    public ArrayList<File> getSoundFiles() {
        File dir = new File(properties.getSoundDirectory());
        if (!dir.exists() || !dir.isDirectory()) {
            throw new IndexException("sound folder not found");
        }

        String[] extensions = new String[]{"mp3"};
        return new ArrayList<>(FileUtils.listFiles(dir, extensions, true));
    }
}
