/**
 * Central game configuration — all tunable knobs live here.
 */

export const GAME = {
  /**
   * Note pool (MIDI numbers) the game randomly draws from.
   * C4 (60) through E5 (76) — a comfortable, singer-friendly range
   * built on the major scale so every note feels reachable.
   */
  NOTES: [60, 62, 64, 65, 67, 69, 71, 72, 74, 76],

  /** How long the target note rings when first revealed / replayed (ms). */
  REVEAL_NOTE_DURATION_MS: 2200,

  /** Seconds shown on the pre-singing countdown. */
  COUNTDOWN_SECONDS: 3,

  /** Length of the "sing now" window in ms (≈10 s → ~20 s total round). */
  SING_DURATION_MS: 10000,

  /** Scoring model. */
  SCORING: {
    /** 100 points minus |cents| / CENTS_PER_POINT → ~25¢ = 90 %, ~50¢ = 80 %. */
    CENTS_PER_POINT: 2.5,
    /** Frames with clarity below this are treated as noise, not singing. */
    MIN_CLARITY: 0.75,
    /** Frames with RMS below this are treated as silence. */
    MIN_RMS: 0.008,
    /** RMS that maps to full loudness weight for a frame. */
    RMS_REFERENCE: 0.05,
    /** Star thresholds (minimum accuracy %). */
    STARS: [
      { stars: 3, min: 90 },
      { stars: 2, min: 75 },
      { stars: 1, min: 60 },
    ],
  },

  /** Half-width of the pitch meter gauge in cents (± this value). */
  METER_RANGE_CENTS: 100,

  /** Time-domain window fed to Pitchy (samples). */
  PITCH_BUFFER_SIZE: 2048,

  /** Pitchy's clarity threshold (the constant k from the MPM paper). */
  PITCH_CLARITY_THRESHOLD: 0.9,

  /** Pitchy's minimum input volume in dB (0 = loudest possible). */
  PITCH_MIN_VOLUME_DB: -45,
}
