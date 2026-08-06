/**
 * Scoring engine.
 *
 * Every analysed frame of the singing window becomes one sample:
 *   { pitch, clarity, rms }
 *
 * - `frameAccuracy` converts a cent deviation into 0–100.
 * - `frameWeight` downweights (or drops) frames that are mostly silence or
 *   noise, so whispered/noisy frames can't tank a good performance.
 * - `summarizeRound` produces the final round report.
 */

import { centsBetween } from './musicTheory'
import { GAME } from '../config/gameConfig'

const { CENTS_PER_POINT, MIN_CLARITY, MIN_RMS, RMS_REFERENCE, STARS } = GAME.SCORING

/** 0–100 accuracy for a single frame given its deviation from the target, in cents. */
export function frameAccuracy(cents) {
  return Math.max(0, Math.min(100, 100 - Math.abs(cents) / CENTS_PER_POINT))
}

/**
 * How much a frame should count toward the final score (0 = ignore it).
 * Frames must be both voiced (clarity) and loud enough (RMS).
 */
export function frameWeight({ clarity = 0, rms = 0 } = {}) {
  if (clarity < MIN_CLARITY || rms < MIN_RMS) return 0
  const loudness = Math.min(1, Math.max(0.25, rms / RMS_REFERENCE))
  return clarity * loudness
}

/** 0–3 stars for a given overall accuracy (0–100). */
export function starsForAccuracy(accuracy) {
  for (const { stars, min } of STARS) {
    if (accuracy >= min) return stars
  }
  return 0
}

/**
 * Aggregate the frames of one singing window into a round summary.
 *
 * @param {Array<{pitch: number, clarity: number, rms: number}>} samples
 * @param {number} targetFrequency target note frequency in Hz
 * @returns {{
 *   accuracy: number,
 *   avgAbsCents: number,
 *   bestCents: number,
 *   worstCents: number,
 *   stars: number,
 *   voicedFrames: number,
 *   totalFrames: number,
 * }}
 */
export function summarizeRound(samples, targetFrequency) {
  let weightedAccuracy = 0
  let weightedAbsCents = 0
  let totalWeight = 0
  let bestCents = Infinity
  let worstCents = 0
  let voicedFrames = 0

  for (const sample of samples) {
    const weight = frameWeight(sample)
    if (weight <= 0) continue

    const cents = centsBetween(sample.pitch, targetFrequency)
    const absCents = Math.abs(cents)

    weightedAccuracy += frameAccuracy(cents) * weight
    weightedAbsCents += absCents * weight
    totalWeight += weight
    bestCents = Math.min(bestCents, absCents)
    worstCents = Math.max(worstCents, absCents)
    voicedFrames += 1
  }

  const accuracy = totalWeight > 0 ? weightedAccuracy / totalWeight : 0
  const avgAbsCents = totalWeight > 0 ? weightedAbsCents / totalWeight : null

  return {
    accuracy,
    avgAbsCents,
    bestCents: bestCents === Infinity ? null : bestCents,
    worstCents: worstCents > 0 ? worstCents : null,
    stars: starsForAccuracy(accuracy),
    voicedFrames,
    totalFrames: samples.length,
  }
}

/** Rough wall-clock seconds covered by `frameCount` rAF samples (~60 fps). */
export function framesToSeconds(frameCount) {
  return frameCount / 60
}
