package se.wastedtime.ts3.core;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FileUtils;
import org.springframework.stereotype.Service;

import java.io.File;
import java.net.URL;
import java.util.ArrayList;

@Service
@Slf4j
public class IndexServiceImpl implements IndexService {

    @Override
    public ArrayList<File> getSoundFiles() {
        ClassLoader loader = Thread.currentThread().getContextClassLoader();
        URL url = loader.getResource("sounds");
        String path = url.getPath();
        File file = new File(path);
        String[] extensions = new String[]{"mp3"};

        return new ArrayList<>(FileUtils.listFiles(file, extensions, true));
    }
}
