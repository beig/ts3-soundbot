package se.wastedtime.ts3.bot;

import lombok.EqualsAndHashCode;
import lombok.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@EqualsAndHashCode(callSuper = true)
@Value
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class BotException extends RuntimeException {
    String message;
}
