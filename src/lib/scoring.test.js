import { describe, expect, it } from 'vitest'
import { frameAccuracy, frameWeight, starsForAccuracy, summarizeRound } from './scoring'
import { midiToFrequency } from './musicTheory'

describe('frameAccuracy', () => {
  it('perfect match scores 100', () => {
    expect(frameAccuracy(0)).toBe(100)
  })

  it('50 cents off scores 80', () => {
    expect(frameAccuracy(50)).toBeCloseTo(80, 6)
    expect(frameAccuracy(-50)).toBeCloseTo(80, 6)
  })

  it('clamps at 0 for very far-off frames', () => {
    expect(frameAccuracy(250)).toBe(0)
    expect(frameAccuracy(1000)).toBe(0)
  })
})

describe('frameWeight', () => {
  it('ignores silence', () => {
    expect(frameWeight({ clarity: 0.95, rms: 0.001 })).toBe(0)
  })

  it('ignores noisy/unvoiced frames', () => {
    expect(frameWeight({ clarity: 0.4, rms: 0.2 })).toBe(0)
  })

  it('weights strong voiced frames above zero', () => {
    const weight = frameWeight({ clarity: 1, rms: 0.1 })
    expect(weight).toBeGreaterThan(0)
  })

  it('caps loudness weighting at 1×', () => {
    expect(frameWeight({ clarity: 1, rms: 1 })).toBeLessThanOrEqual(1)
  })
})

describe('starsForAccuracy', () => {
  it('applies the star thresholds', () => {
    expect(starsForAccuracy(95)).toBe(3)
    expect(starsForAccuracy(90)).toBe(3)
    expect(starsForAccuracy(89.9)).toBe(2)
    expect(starsForAccuracy(75)).toBe(2)
    expect(starsForAccuracy(60)).toBe(1)
    expect(starsForAccuracy(0)).toBe(0)
  })
})

describe('summarizeRound', () => {
  const target = midiToFrequency(69) // 440 Hz

  it('perfectly in-tune singing → 100 %, 3 stars', () => {
    const samples = Array.from({ length: 60 }, () => ({ pitch: 440, clarity: 0.95, rms: 0.1 }))
    const summary = summarizeRound(samples, target)
    expect(summary.accuracy).toBeCloseTo(100, 4)
    expect(summary.stars).toBe(3)
    expect(summary.bestCents).toBeCloseTo(0, 4)
    expect(summary.voicedFrames).toBe(60)
    expect(summary.totalFrames).toBe(60)
  })

  it('~99 cents flat → ~60 %, 1 star', () => {
    const almostOneSemitoneFlat = 440 * Math.pow(2, -99 / 1200) // ≈ -99 ¢
    const samples = Array.from({ length: 60 }, () => ({ pitch: almostOneSemitoneFlat, clarity: 0.95, rms: 0.1 }))
    const summary = summarizeRound(samples, target)
    expect(summary.accuracy).toBeCloseTo(60.4, 4)
    expect(summary.stars).toBe(1)
  })

  it('a completely silent window scores 0', () => {
    const samples = Array.from({ length: 60 }, () => ({ pitch: 440, clarity: 0.1, rms: 0.001 }))
    const summary = summarizeRound(samples, target)
    expect(summary.accuracy).toBe(0)
    expect(summary.stars).toBe(0)
    expect(summary.voicedFrames).toBe(0)
    expect(summary.totalFrames).toBe(60)
  })

  it('noise-heavy frames do not drag a clean performance down', () => {
    const clean = Array.from({ length: 50 }, () => ({ pitch: 440, clarity: 0.95, rms: 0.1 }))
    const noise = Array.from({ length: 50 }, () => ({ pitch: 200, clarity: 0.3, rms: 0.2 }))
    const summary = summarizeRound([...clean, ...noise], target)
    expect(summary.accuracy).toBeGreaterThan(90)
    expect(summary.voicedFrames).toBe(50)
  })

  it('mixed tuning reports the average deviation', () => {
    const samples = [
      { pitch: 440, clarity: 0.95, rms: 0.1 }, // 0 ¢
      { pitch: 466.16, clarity: 0.95, rms: 0.1 }, // ~ +100 ¢
    ]
    const summary = summarizeRound(samples, target)
    expect(summary.avgAbsCents).toBeCloseTo(50, 1)
    expect(summary.bestCents).toBeCloseTo(0, 1)
    expect(summary.worstCents).toBeCloseTo(100, 1)
  })
})
