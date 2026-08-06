import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { usePitchDetection } from './hooks/usePitchDetection'
import { ToneSynthesizer } from './lib/toneSynthesizer'
import { midiToFrequency, midiToNoteName, closestMidi, centsBetween } from './lib/musicTheory'
import { summarizeRound } from './lib/scoring'
import { GAME } from './config/gameConfig'
import StartScreen from './components/StartScreen'
import NoteReveal from './components/NoteReveal'
import CountdownOverlay from './components/CountdownOverlay'
import SingPhase from './components/SingPhase'
import ResultsScreen from './components/ResultsScreen'

const PHASE = {
  IDLE: 'idle',
  REVEAL: 'reveal',
  COUNTDOWN: 'countdown',
  SINGING: 'singing',
  RESULTS: 'results',
}

function BackgroundFX() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#111b36_0%,#070b14_62%)]" />
      <motion.div
        className="absolute -left-24 -top-32 h-[28rem] w-[28rem] rounded-full bg-brand-500/25 blur-[110px]"
        animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -right-32 top-1/3 h-[26rem] w-[26rem] rounded-full bg-glow-500/20 blur-[120px]"
        animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-40 left-1/3 h-[30rem] w-[30rem] rounded-full bg-berry-500/15 blur-[130px]"
        animate={{ x: [0, 40, 0], y: [0, -40, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

export default function App() {
  const [phase, setPhase] = useState(PHASE.IDLE)
  const [targetMidi, setTargetMidi] = useState(null)
  const [live, setLive] = useState(null)
  const [result, setResult] = useState(null)
  const [round, setRound] = useState(0)

  const synthRef = useRef(null)
  if (!synthRef.current) synthRef.current = new ToneSynthesizer()
  const synth = synthRef.current

  const targetRef = useRef(null)
  const samplesRef = useRef([])
  const phaseRef = useRef(phase)
  phaseRef.current = phase

  const handleSample = useCallback((sample) => {
    if (phaseRef.current !== PHASE.SINGING) return
    samplesRef.current.push(sample)

    const target = targetRef.current
    if (sample.pitch != null && target != null) {
      setLive({
        ...sample,
        cents: centsBetween(sample.pitch, target),
        noteName: midiToNoteName(closestMidi(sample.pitch)),
      })
    } else {
      setLive({ ...sample, cents: null, noteName: null })
    }
  }, [])

  const { start: startDetection, stop: stopDetection, error: micError } = usePitchDetection(handleSample)

  const pickTarget = useCallback((previous) => {
    let pool = GAME.NOTES
    if (previous != null && pool.length > 1) {
      pool = pool.filter((note) => note !== previous)
    }
    return pool[Math.floor(Math.random() * pool.length)]
  }, [])

  const startRound = useCallback(() => {
    const midi = pickTarget(targetRef.current)
    targetRef.current = midi
    samplesRef.current = []
    setLive(null)
    setResult(null)
    setTargetMidi(midi)
    setRound((r) => r + 1)
    setPhase(PHASE.REVEAL)
  }, [pickTarget])

  const handleStart = useCallback(async () => {
    const ok = await startDetection()
    if (ok) startRound()
  }, [startDetection, startRound])

  const handleCountdownDone = useCallback(() => {
    setPhase(PHASE.SINGING)
  }, [])

  const handleSingingDone = useCallback(() => {
    stopDetection()
    const summary = summarizeRound(samplesRef.current, midiToFrequency(targetRef.current))
    setResult(summary)
    setPhase(PHASE.RESULTS)
    synth.fanfare(summary.stars)
  }, [stopDetection, synth])

  const handlePlayAgain = useCallback(async () => {
    const ok = await startDetection()
    if (ok) {
      startRound()
    } else {
      setPhase(PHASE.IDLE)
    }
  }, [startDetection, startRound])

  // Safety cleanup if the app unmounts mid-game.
  useEffect(
    () => () => {
      stopDetection()
      synth.dispose()
    },
    [stopDetection, synth],
  )

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <BackgroundFX />
      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-4 py-10">
        <AnimatePresence mode="wait">
          {phase === PHASE.IDLE && (
            <StartScreen key={`idle-${round}`} micError={micError} onStart={handleStart} />
          )}
          {phase === PHASE.REVEAL && (
            <NoteReveal key={`reveal-${round}`} midi={targetMidi} synth={synth} onReady={() => setPhase(PHASE.COUNTDOWN)} />
          )}
          {phase === PHASE.COUNTDOWN && (
            <CountdownOverlay key={`countdown-${round}`} synth={synth} onDone={handleCountdownDone} />
          )}
          {phase === PHASE.SINGING && (
            <SingPhase key={`singing-${round}`} midi={targetMidi} live={live} onDone={handleSingingDone} />
          )}
          {phase === PHASE.RESULTS && (
            <ResultsScreen key={`results-${round}`} midi={targetMidi} result={result} onPlayAgain={handlePlayAgain} />
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
