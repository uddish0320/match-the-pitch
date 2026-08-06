import { describe, expect, it } from 'vitest'
import {
  midiToFrequency,
  frequencyToMidi,
  closestMidi,
  midiToNoteName,
  frequencyToNoteName,
  centsBetween,
  centsOffNearest,
  isCloseToNote,
} from './musicTheory'

describe('midiToFrequency', () => {
  it('A4 (69) is exactly 440 Hz', () => {
    expect(midiToFrequency(69)).toBeCloseTo(440, 6)
  })

  it('C4 (60) is ~261.63 Hz', () => {
    expect(midiToFrequency(60)).toBeCloseTo(261.6256, 2)
  })

  it('an octave up doubles the frequency', () => {
    expect(midiToFrequency(81)).toBeCloseTo(midiToFrequency(69) * 2, 6)
  })

  it('semitones map to 12-TET ratios', () => {
    expect(midiToFrequency(70)).toBeCloseTo(440 * Math.pow(2, 1 / 12), 6)
  })
})

describe('frequencyToMidi / closestMidi', () => {
  it('440 Hz is MIDI 69', () => {
    expect(frequencyToMidi(440)).toBeCloseTo(69, 6)
  })

  it('rounds to the nearest semitone', () => {
    expect(closestMidi(442)).toBe(69)
    expect(closestMidi(466.16)).toBe(70)
  })

  it('round trip midi → freq → midi', () => {
    for (const midi of [57, 60, 64, 69, 76, 84]) {
      expect(closestMidi(midiToFrequency(midi))).toBe(midi)
    }
  })
})

describe('midiToNoteName', () => {
  it('names notes with sharps and octaves', () => {
    expect(midiToNoteName(60)).toBe('C4')
    expect(midiToNoteName(61)).toBe('C#4')
    expect(midiToNoteName(66)).toBe('F#4')
    expect(midiToNoteName(69)).toBe('A4')
    expect(midiToNoteName(76)).toBe('E5')
    expect(midiToNoteName(57)).toBe('A3')
  })
})

describe('frequencyToNoteName', () => {
  it('440 Hz is A4', () => {
    expect(frequencyToNoteName(440)).toBe('A4')
  })

  it('rejects invalid input', () => {
    expect(frequencyToNoteName(0)).toBeNull()
    expect(frequencyToNoteName(NaN)).toBeNull()
  })
})

describe('centsBetween', () => {
  it('unison is 0 cents', () => {
    expect(centsBetween(440, 440)).toBeCloseTo(0, 6)
  })

  it('an octave up is +1200 cents', () => {
    expect(centsBetween(880, 440)).toBeCloseTo(1200, 6)
  })

  it('an octave down is -1200 cents', () => {
    expect(centsBetween(220, 440)).toBeCloseTo(-1200, 6)
  })

  it('a semitone is ~100 cents', () => {
    expect(centsBetween(440 * Math.pow(2, 1 / 12), 440)).toBeCloseTo(100, 6)
  })
})

describe('centsOffNearest', () => {
  it('an in-tune note is ~0 cents off', () => {
    expect(Math.abs(centsOffNearest(440))).toBeLessThan(1)
  })

  it('a quarter-tone sharp note is ~50 cents off', () => {
    const quarterToneUp = 440 * Math.pow(2, 1 / 24)
    expect(Math.abs(centsOffNearest(quarterToneUp))).toBeCloseTo(50, 1)
  })
})

describe('isCloseToNote', () => {
  it('judges tolerance around the target note', () => {
    expect(isCloseToNote(440, 69)).toBe(true)
    expect(isCloseToNote(466.16, 69)).toBe(false)
    expect(isCloseToNote(466.16, 70)).toBe(true)
  })
})
