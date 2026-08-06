/**
 * Real-time pitch detection powered by Pitchy (McLeod Pitch Method).
 *
 * Owns the entire audio capture chain:
 *   getUserMedia → AudioContext → MediaStreamSource → AnalyserNode
 *   → rAF loop → Pitchy.PitchDetector → onSample({ pitch, clarity, rms })
 *
 * Pitchy is the detection engine — this hook only wires browser audio
 * into it and streams the results out.
 *
 * Reliability notes:
 * - The AudioContext is created once and reused across rounds (starting the
 *   mic again is much faster than rebuilding the whole context).
 * - start() is guarded against double-invocation (double-click / key repeat)
 *   and against races with stop() while the mic permission prompt is open.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { PitchDetector } from 'pitchy'
import { GAME } from '../config/gameConfig'

const BUFFER_SIZE = GAME.PITCH_BUFFER_SIZE

function computeRms(input) {
  let sum = 0
  for (let i = 0; i < input.length; i += 1) {
    sum += input[i] * input[i]
  }
  return Math.sqrt(sum / input.length)
}

function mapMicError(err) {
  const name = err?.name ?? ''
  if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
    return 'Microphone access was denied. Click "Allow" in your browser\u2019s address bar, then try again.'
  }
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
    return 'No microphone was found. Plug one in (or check your laptop\u2019s mic is enabled) and try again.'
  }
  if (name === 'NotReadableError' || name === 'TrackStartError') {
    return 'Your microphone is busy or not responding. Close other apps using it (Zoom, Meet, etc.) and try again.'
  }
  if (name === 'OverconstrainedError') {
    return 'Your microphone could not satisfy the audio settings. Try a different mic and try again.'
  }
  if (name === 'SecurityError') {
    return 'Microphone access was blocked. This app must run over http(s) with mic permission enabled.'
  }
  if (err?.message?.includes('getUserMedia')) {
    return 'This browser does not support microphone capture. Try the latest Chrome, Edge or Firefox.'
  }
  return err?.message || 'Could not start the microphone. Please try again.'
}

/**
 * @param {(sample: {pitch: number | null, clarity: number, rms: number, sampleRate: number}) => void} onSample
 *   Called on every analysed frame (≈60 Hz) while running.
 */
export function usePitchDetection(onSample) {
  const [isActive, setIsActive] = useState(false)
  const [error, setError] = useState(null)
  const onSampleRef = useRef(onSample)

  useEffect(() => {
    onSampleRef.current = onSample
  }, [onSample])

  const engineRef = useRef({
    ctx: null,
    rafId: null,
    stream: null,
    source: null,
    analyser: null,
    detector: null,
    input: null,
    running: false,
    aborted: false,
    startPromise: null,
  })

  const stop = useCallback(() => {
    const engine = engineRef.current
    engine.running = false
    engine.aborted = true
    if (engine.rafId) {
      cancelAnimationFrame(engine.rafId)
      engine.rafId = null
    }
    if (engine.source) {
      try {
        engine.source.disconnect()
      } catch {
        /* already disconnected */
      }
      engine.source = null
    }
    if (engine.stream) {
      engine.stream.getTracks().forEach((track) => track.stop())
      engine.stream = null
    }
    engine.analyser = null
    engine.detector = null
    engine.input = null
    setIsActive(false)
  }, [])

  /** Request the mic and start streaming pitch frames. Resolves true on success. */
  const start = useCallback(async () => {
    const engine = engineRef.current
    if (engine.running) return true
    // Guard against rapid double-invocation (double-click / key repeat).
    if (engine.startPromise) return engine.startPromise

    engine.startPromise = (async () => {
      engine.aborted = false
      setError(null)
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('getUserMedia is not available in this browser.')
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          },
        })
        // A stop() may have arrived while the permission prompt was open.
        if (engine.aborted) {
          stream.getTracks().forEach((track) => track.stop())
          return false
        }

        // Reuse a single AudioContext across rounds for fast restarts.
        let ctx = engine.ctx
        if (!ctx || ctx.state === 'closed') {
          const Ctx = window.AudioContext || window.webkitAudioContext
          ctx = new Ctx()
          engine.ctx = ctx
        }
        if (ctx.state === 'suspended') await ctx.resume()
        if (engine.aborted) {
          stream.getTracks().forEach((track) => track.stop())
          return false
        }

        const source = ctx.createMediaStreamSource(stream)
        const analyser = ctx.createAnalyser()
        analyser.fftSize = BUFFER_SIZE
        analyser.smoothingTimeConstant = 0
        source.connect(analyser)

        const detector = PitchDetector.forFloat32Array(BUFFER_SIZE)
        detector.minVolumeDecibels = GAME.PITCH_MIN_VOLUME_DB
        detector.clarityThreshold = GAME.PITCH_CLARITY_THRESHOLD

        const input = new Float32Array(BUFFER_SIZE)

        engine.stream = stream
        engine.source = source
        engine.analyser = analyser
        engine.detector = detector
        engine.input = input
        engine.running = true
        setIsActive(true)

        const loop = () => {
          if (!engine.running) return
          analyser.getFloatTimeDomainData(input)
          // Pitchy does the pitch detection — we never implement our own.
          const [pitch, clarity] = detector.findPitch(input, ctx.sampleRate)
          onSampleRef.current?.({
            pitch: pitch > 0 ? pitch : null,
            clarity,
            rms: computeRms(input),
            sampleRate: ctx.sampleRate,
          })
          engine.rafId = requestAnimationFrame(loop)
        }
        engine.rafId = requestAnimationFrame(loop)
        return true
      } catch (err) {
        setError(mapMicError(err))
        stop()
        return false
      } finally {
        engine.startPromise = null
      }
    })()

    return engine.startPromise
  }, [stop])

  // Full teardown when the hook unmounts (also releases the shared context).
  useEffect(
    () => () => {
      stop()
      const engine = engineRef.current
      if (engine.ctx && engine.ctx.state !== 'closed') {
        engine.ctx.close().catch(() => {})
      }
      engine.ctx = null
    },
    [stop],
  )

  return { start, stop, isActive, error }
}
