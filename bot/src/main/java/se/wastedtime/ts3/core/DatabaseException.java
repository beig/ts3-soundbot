package se.wastedtime.ts3.core;

import lombok.EqualsAndHashCode;
import lombok.Value;

@EqualsAndHashCode(callSuper = true)
@Value
public class DatabaseException extends RuntimeException {
    String message;
}
