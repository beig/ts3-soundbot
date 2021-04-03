package se.wastedtime.ts3.bot.mixer.filter.type;


import se.wastedtime.ts3.bot.mixer.filter.MixerFilter;

/**
 * Compresses an audio signal (analog).
 * <p>
 * When Q is closer to 0, the signal volume is increased.
 * When Q is 1, the signal volume is not modified.
 * When Q is closer to infinity, the signal volume is reduced.
 */
public class FilterGain implements MixerFilter {
    private float q;

    public FilterGain(float q) {
        this.q = q;
    }

    public float getQ() {
        return q;
    }

    public void setQ(float q) {
        this.q = q;
    }

    @Override
    public int process(float[] samples, int offs, int len) {
        for (int i = 0; i < len; i++) {
            samples[i] = samples[i] * q;
        }

        return len - offs;
    }
}
