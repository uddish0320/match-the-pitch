import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { GAME } from '../config/gameConfig'

const COUNTDOWN_SECONDS = GAME.COUNTDOWN_SECONDS

export default function CountdownOverlay({ synth, onDone }) {
  const [count, setCount] = useState(COUNTDOWN_SECONDS)

  useEffect(() => {
    let cancelled = false
    const timers = []

    const tick = (n) => {
      if (cancelled) return
      setCount(n)
      synth.beep({
        frequency: n === 0 ? 1046.5 : 660,
        durationMs: n === 0 ? 520 : 150,
        volume: n === 0 ? 0.22 : 0.14,
      })
    }

    // Play "3, 2, 1, Sing!" one second apart, then finish.
    for (let i = 0; i <= COUNTDOWN_SECONDS; i += 1) {
      timers.push(setTimeout(() => tick(COUNTDOWN_SECONDS - i), i * 1000))
    }
    timers.push(setTimeout(() => !cancelled && onDone(), (COUNTDOWN_SECONDS + 0.7) * 1000))

    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
  }, [synth, onDone])

  const display = count > 0 ? String(count) : 'Sing!'

  return (
    <div className="flex min-h-[70vh] w-full flex-col items-center justify-center">
      <p className="mb-4 text-lg font-semibold uppercase tracking-[0.35em] text-slate-400">Get ready to sing</p>
      <div className="relative flex h-56 w-56 items-center justify-center">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-brand-500/30"
          animate={{ scale: [1, 1.25], opacity: [0.6, 0] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'easeOut' }}
        />
        <AnimatePresence mode="popLayout">
          <motion.div
            key={display}
            initial={{ scale: 0.4, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 1.3, opacity: 0, y: -24 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            className={`font-display font-black ${
              count === 0
                ? 'bg-gradient-to-r from-good-300 to-glow-400 bg-clip-text text-8xl text-transparent'
                : 'text-9xl text-white'
            }`}
          >
            {display}
          </motion.div>
        </AnimatePresence>
      </div>
      {count === 0 && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-slate-300">
          Hold it steady — the meter is listening!
        </motion.p>
      )}
    </div>
  )
}
