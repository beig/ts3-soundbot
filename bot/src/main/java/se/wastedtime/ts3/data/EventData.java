package se.wastedtime.ts3.data;


import lombok.Value;

@Value
public class EventData {
    String clientId;
    EventDataType type;
    Object payload;

    public enum EventDataType {
        SOUNDFILE
    }
}



