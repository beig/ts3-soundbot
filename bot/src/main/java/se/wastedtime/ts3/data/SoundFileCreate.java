package se.wastedtime.ts3.data;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class SoundFileCreate {
    String name;
    int duration;
    String description;
    String category;
    List<String> tags;
    String clientId;
    byte[] data;
}
