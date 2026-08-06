/**
 * Web Audio tone synthesizer — produces every sound in the game:
 * the target note, countdown ticks and result fanfares.
 *
 * Everything is synthesized on the fly (no audio assets), so the app
 * works fully offline.
 */

const C5 = 523.25
const E5 = 659.25
const G5 = 783.99
const C6 = 1046.5
const G4 = 392.0

export class ToneSynthesizer {
  constructor() {
    this.ctx = null
    this.activeNodes = new Set()
  }

  /** Lazily create / resume the shared AudioContext (call from a user gesture). */
  async ensureContext() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext
      if (!Ctx) {
        throw new Error('Web Audio API is not supported by this browser.')
      }
      this.ctx = new Ctx()
    }
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume()
    }
    return this.ctx
  }

  /**
   * Play a note at the given frequency with a smooth attack/release envelope.
   *
   * @param {number} frequency Hz
   * @param {object} [options]
   * @param {number} [options.duration=1600] total sounding time in ms
   * @param {number} [options.volume=0.28] peak gain (0–1)
   * @param {number} [options.when=0] seconds from now to start
   * @returns {Promise<void>}
   */
  async playNote(frequency, { duration = 1600, volume = 0.28, when = 0 } = {}) {
    const ctx = await this.ensureContext()
    const t0 = ctx.currentTime + Math.max(0, when)
    const dur = duration / 1000
    const release = 0.18

    const master = ctx.createGain()
    master.connect(ctx.destination)

    // Fundamental (sine) + a quiet octave overtone for warmth.
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(frequency, t0)

    const warm = ctx.createOscillator()
    warm.type = 'triangle'
    warm.frequency.setValueAtTime(frequency * 2, t0)
    const warmGain = ctx.createGain()
    warmGain.gain.setValueAtTime(0.07, t0)
    warm.connect(warmGain)
    warmGain.connect(master)

    master.gain.setValueAtTime(0.0001, t0)
    master.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), t0 + 0.02)
    master.gain.setValueAtTime(volume, t0 + Math.max(0, dur - release))
    master.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)

    osc.connect(master)
    osc.start(t0)
    warm.start(t0)
    osc.stop(t0 + dur + 0.1)
    warm.stop(t0 + dur + 0.1)

    const nodes = [osc, warm, warmGain, master]
    this.activeNodes.add(nodes)
    osc.onended = () => {
      this.activeNodes.delete(nodes)
      osc.disconnect()
      warm.disconnect()
      warmGain.disconnect()
      master.disconnect()
    }
  }

  /** Short tick used by the countdown (and a higher, longer "go" signal). */
  async beep({ frequency = 660, durationMs = 140, volume = 0.14 } = {}) {
    await this.playNote(frequency, { duration: durationMs, volume, when: 0 })
  }

  /** End-of-round fanfare, graded by star count. */
  async fanfare(stars) {
    if (stars >= 2) {
      // Rising major arpeggio.
      this.playNote(C5, { duration: 320, volume: 0.22, when: 0 })
      this.playNote(E5, { duration: 320, volume: 0.22, when: 0.18 })
      this.playNote(G5, { duration: 320, volume: 0.22, when: 0.36 })
      this.playNote(C6, { duration: 900, volume: 0.26, when: 0.54 })
    } else if (stars === 1) {
      // Short rising third.
      this.playNote(C5, { duration: 300, volume: 0.2, when: 0 })
      this.playNote(E5, { duration: 700, volume: 0.2, when: 0.22 })
    } else {
      // Gentle descending gesture — encouraging, not harsh.
      this.playNote(E5, { duration: 260, volume: 0.16, when: 0 })
      this.playNote(C5, { duration: 260, volume: 0.16, when: 0.2 })
      this.playNote(G4, { duration: 800, volume: 0.16, when: 0.4 })
    }
  }

  /** Silence everything currently sounding (used on screen changes/unmount). */
  stopAll() {
    for (const nodes of this.activeNodes) {
      for (const node of nodes) {
        try {
          if (typeof node.stop === 'function') node.stop()
        } catch {
          /* already stopped — fine */
        }
      }
    }
    this.activeNodes.clear()
  }

  /** Close the shared context (optional; the page teardown handles it too). */
  async dispose() {
    this.stopAll()
    if (this.ctx && this.ctx.state !== 'closed') {
      try {
        await this.ctx.close()
      } catch {
        /* no-op */
      }
    }
    this.ctx = null
  }
}
