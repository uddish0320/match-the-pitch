import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Screen from './ui/Screen'
import PitchMeter from './PitchMeter'
import { GAME } from '../config/gameConfig'
import { midiToNoteName } from '../lib/musicTheory'

const SING_MS = GAME.SING_DURATION_MS

/**
 * The "sing now" phase: live pitch meter, detected note and a draining
 * timer bar. Calls `onDone` once the singing window elapses.
 */
export default function SingPhase({ midi, live, onDone }) {
  const targetName = midiToNoteName(midi)

  useEffect(() => {
    const timer = setTimeout(onDone, SING_MS)
    return () => clearTimeout(timer)
  }, [onDone])

  const singing = live?.pitch != null && live.clarity >= GAME.SCORING.MIN_CLARITY

  return (
    <Screen>
      <div className="flex w-full max-w-2xl flex-col items-center gap-6">
        {/* Target pill */}
        <div className="flex items-center gap-3 rounded-full border border-brand-500/30 bg-brand-500/10 px-5 py-2">
          <span className="text-sm font-semibold uppercase tracking-widest text-slate-300">Match</span>
          <span className="font-display text-2xl font-black text-brand-300">{targetName}</span>
        </div>

        {/* Live detected note */}
        <div className="flex min-h-[7.5rem] flex-col items-center justify-center">
          <AnimatedNote name={live?.noteName ?? null} active={singing} />
        </div>

        {/* Deviation meter */}
        <PitchMeter cents={live?.cents ?? null} targetName={targetName} />

        {/* Timer bar */}
        <div className="w-full">
          <div className="mb-1.5 flex items-center justify-between text-xs font-medium uppercase tracking-widest text-slate-500">
            <span>Sing!</span>
            <span>{Math.ceil(SING_MS / 1000)}s</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-good-400 to-glow-400"
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: SING_MS / 1000, ease: 'linear' }}
            />
          </div>
        </div>
      </div>
    </Screen>
  )
}

function AnimatedNote({ name, active }) {
  if (!name) {
    return (
      <div className="flex flex-col items-center">
        <div className="font-display text-5xl font-black text-slate-600">—</div>
        <p className="mt-2 text-sm text-slate-500">
          <span className="animate-pulse-soft">Listening</span>
          <span className="animate-pulse-soft" style={{ animationDelay: '0.2s' }}>
            …
          </span>
        </p>
      </div>
    )
  }
  return (
    <div className="flex flex-col items-center">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={name}
          initial={{ scale: 0.6, opacity: 0, y: 14 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.7, opacity: 0, y: -14 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className={`font-display text-7xl font-black ${active ? 'text-white' : 'text-slate-500'}`}
        >
          {name}
        </motion.div>
      </AnimatePresence>
      <p className={`mt-2 text-sm font-medium ${active ? 'text-good-300' : 'text-slate-500'}`}>
        {active ? 'Locked on — keep singing!' : 'Sing now…'}
      </p>
    </div>
  )
}
