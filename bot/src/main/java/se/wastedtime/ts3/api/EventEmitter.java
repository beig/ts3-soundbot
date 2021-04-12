package se.wastedtime.ts3.api;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;
import se.wastedtime.ts3.data.EventData;
import se.wastedtime.ts3.data.SoundFileUpdate;

@RestController
@Slf4j
@CrossOrigin
public class EventEmitter {

    final Sinks.Many<EventData> sink;

    public EventEmitter() {
        this.sink = Sinks.many().multicast().directAllOrNothing();
    }

    public void publishFileEvent(SoundFileUpdate soundFile) {
        this.sink.tryEmitNext(new EventData(soundFile.getClientId(), EventData.EventDataType.SOUNDFILE, soundFile));
    }

    @RequestMapping(value = "/event-stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<EventData>> get() {
        return this.sink.asFlux().map(e -> ServerSentEvent.builder(e).build());
    }
}


