/**
 * Pure music-theory helpers: frequency ↔ MIDI ↔ note-name conversions
 * and cent-based deviation math (12-tone equal temperament, A4 = 440 Hz).
 * No browser APIs — fully unit-testable.
 */

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

const A4_MIDI = 69
const A4_FREQUENCY = 440

/** MIDI note number (60 = C4) → frequency in Hz. */
export function midiToFrequency(midi) {
  return A4_FREQUENCY * Math.pow(2, (midi - A4_MIDI) / 12)
}

/** Frequency in Hz → fractional MIDI note number. */
export function frequencyToMidi(frequency) {
  return A4_MIDI + 12 * Math.log2(frequency / A4_FREQUENCY)
}

/** MIDI note number → nearest whole MIDI note. */
export function closestMidi(frequency) {
  return Math.round(frequencyToMidi(frequency))
}

/** MIDI note number → display name, e.g. 60 → "C4", 66 → "F#4". */
export function midiToNoteName(midi) {
  const pitchClass = NOTE_NAMES[((midi % 12) + 12) % 12]
  const octave = Math.floor(midi / 12) - 1
  return `${pitchClass}${octave}`
}

/** Frequency → display name of the nearest note, e.g. 440 → "A4". */
export function frequencyToNoteName(frequency) {
  if (!Number.isFinite(frequency) || frequency <= 0) return null
  return midiToNoteName(closestMidi(frequency))
}

/**
 * Deviation between two frequencies in cents.
 * Positive means freqA is sharp relative to freqB.
 */
export function centsBetween(freqA, freqB) {
  return 1200 * Math.log2(freqA / freqB)
}

/** Deviation of a frequency from the nearest equal-tempered note, in cents. */
export function centsOffNearest(frequency) {
  const midi = closestMidi(frequency)
  return centsBetween(frequency, midiToFrequency(midi))
}

/** True when the frequency is within `toleranceCents` of the given MIDI note. */
export function isCloseToNote(frequency, midi, toleranceCents = 50) {
  return Math.abs(centsBetween(frequency, midiToFrequency(midi))) <= toleranceCents
}

/** Clamp a number into [min, max]. */
export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}
