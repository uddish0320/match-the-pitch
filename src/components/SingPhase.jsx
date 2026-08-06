import { memo, useEffect, useState } from 'react'
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
function SingPhase({ midi, live, onDone }) {
  const targetName = midiToNoteName(midi)
  const [remainingSec, setRemainingSec] = useState(Math.ceil(SING_MS / 1000))

  useEffect(() => {
    const timer = setTimeout(onDone, SING_MS)
    return () => clearTimeout(timer)
  }, [onDone])

  useEffect(() => {
    const interval = setInterval(() => setRemainingSec((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Screen>
      <div className="flex w-full max-w-3xl flex-col items-center gap-8 lg:gap-10">
        {/* Target pill */}
        <motion.div
          initial={{ y: -12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-3 rounded-full border border-brand-500/30 bg-brand-500/10 px-5 py-2 backdrop-blur"
        >
          <span
            className="h-2 w-2 rounded-full bg-brand-400 shadow-[0_0_10px_2px_rgba(167,139,250,0.8)]"
            aria-hidden
          />
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-300">Match</span>
          <span className="font-display text-3xl font-black leading-none text-brand-300">{targetName}</span>
        </motion.div>

        {/* Live detected note */}
        <div className="flex min-h-[9.5rem] flex-col items-center justify-center">
          <AnimatedNote name={live?.noteName ?? null} active={live?.active ?? false} />
        </div>

        {/* Deviation meter */}
        <PitchMeter cents={live?.cents ?? null} targetName={targetName} />

        {/* Timer */}
        <div className="w-full max-w-xl">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
            <span className="animate-pulse-soft text-good-300">Sing!</span>
            <span className="tabular-nums">{remainingSec}s</span>
          </div>
          <div className="h-3.5 w-full overflow-hidden rounded-full bg-white/10 ring-1 ring-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-good-400 via-glow-400 to-glow-500"
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

const AnimatedNote = memo(function AnimatedNote({ name, active }) {
  if (!name) {
    return (
      <div className="flex flex-col items-center">
        <div className="flex h-28 items-center justify-center">
          <motion.div
            animate={{ opacity: [0.35, 0.75, 0.35] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="font-display text-7xl font-black leading-none text-slate-600"
          >
            —
          </motion.div>
        </div>
        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
          <span className="animate-pulse-soft">Listening</span>
          <span className="animate-pulse-soft" style={{ animationDelay: '0.2s' }}> · </span>
          <span className="animate-pulse-soft" style={{ animationDelay: '0.4s' }}> · </span>
          <span className="animate-pulse-soft" style={{ animationDelay: '0.6s' }}> · </span>
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={name}
          initial={{ scale: 0.5, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.6, opacity: 0, y: -16 }}
          transition={{ type: 'spring', stiffness: 340, damping: 22 }}
          className={`font-display text-8xl font-black leading-none tracking-tight lg:text-9xl ${
            active
              ? 'text-white drop-shadow-[0_0_45px_rgba(52,211,153,0.45)]'
              : 'text-slate-500'
          }`}
        >
          {name}
        </motion.div>
      </AnimatePresence>
      <motion.p
        animate={{ opacity: active ? 1 : 0.65 }}
        className={`mt-3 text-xs font-semibold uppercase tracking-[0.3em] ${
          active ? 'text-good-300' : 'text-slate-500'
        }`}
      >
        {active ? 'Locked on — keep singing!' : 'Sing now…'}
      </motion.p>
    </div>
  )
})

export default SingPhase
