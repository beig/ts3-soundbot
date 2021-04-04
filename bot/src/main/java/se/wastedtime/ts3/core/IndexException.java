package se.wastedtime.ts3.core;

import lombok.EqualsAndHashCode;
import lombok.Value;

@EqualsAndHashCode(callSuper = true)
@Value
public class IndexException extends RuntimeException {
    String message;
}
