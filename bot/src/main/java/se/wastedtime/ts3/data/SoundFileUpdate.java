package se.wastedtime.ts3.data;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class SoundFileUpdate {
    String name;
    String path;
    int duration;
    String description;
    String category;
    List<String> tags;
    boolean softDeleted;
    String clientId;
}
