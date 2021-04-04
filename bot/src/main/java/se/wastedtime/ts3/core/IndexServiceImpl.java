package se.wastedtime.ts3.core;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FileUtils;
import org.springframework.stereotype.Service;

import java.io.File;
import java.util.ArrayList;

@Service
@Slf4j
public class IndexServiceImpl implements IndexService {

    private static final String SOUND_DIRECTORY = new File("").getAbsolutePath() + File.separator + "sounds" + File.separator;

    @Override
    public ArrayList<File> getSoundFiles() {
        File dir = new File(SOUND_DIRECTORY);
        if (!dir.exists() || !dir.isDirectory()) {
            throw new IndexException("sound folder not found");
        }

        String[] extensions = new String[]{"mp3"};
        return new ArrayList<>(FileUtils.listFiles(dir, extensions, true));
    }
}
