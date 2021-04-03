package se.wastedtime.ts3.data;

import lombok.Value;

@Value
public class Health {
    String status;
    int files;
    boolean botOnline;
    boolean isPlaying;
}
