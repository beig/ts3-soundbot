package se.wastedtime.ts3.data;


import lombok.Value;

@Value
public class EventData {
    EventDataType type;
    Object payload;

    public enum EventDataType {
        SOUNDFILE
    }
}



