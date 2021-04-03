package se.wastedtime.ts3.bot.resample;

import javax.sound.sampled.AudioFormat;

public interface ResamplerFactory {
    Resampler create(AudioFormat in, AudioFormat out, int bufferSize);
}
