package se.wastedtime.ts3.bot.opus;

public final class OpusPacket {
    private final int samples;
    private final byte[] bytes;

    public OpusPacket(int samples, byte[] bytes) {
        this.samples = samples;
        this.bytes = bytes;
    }

    public int getSamples() {
        return samples;
    }

    public byte[] getBytes() {
        return bytes;
    }
}
