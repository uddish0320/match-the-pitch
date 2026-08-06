import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { GAME } from '../config/gameConfig'

const COUNTDOWN_SECONDS = GAME.COUNTDOWN_SECONDS
const SIZE = 300
const STROKE = 12
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

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
    <div
      className="flex w-full flex-col items-center justify-center"
      role="timer"
      aria-label={`Countdown, ${COUNTDOWN_SECONDS} seconds`}
    >
      <p className="mb-10 text-sm font-semibold uppercase tracking-[0.4em] text-slate-400 sm:text-base">
        Get ready to sing
      </p>

      <div className="relative flex h-72 w-72 items-center justify-center sm:h-80 sm:w-80">
        {/* Breathing halo */}
        <motion.div
          className="absolute inset-0 rounded-full bg-brand-500/10 blur-3xl"
          animate={{ scale: [1, 1.18, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Ring that drains over the countdown */}
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0 -rotate-90">
          <defs>
            <linearGradient id="countdown-ring" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={STROKE}
          />
          <motion.circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="url(#countdown-ring)"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: 0 }}
            animate={{ strokeDashoffset: CIRCUMFERENCE }}
            transition={{ duration: COUNTDOWN_SECONDS, ease: 'linear' }}
          />
        </svg>

        {/* Expanding ring pulse on every tick */}
        <AnimatePresence>
          {count > 0 && (
            <motion.div
              key={`pulse-${count}`}
              className="absolute inset-0 rounded-full border-2 border-brand-400/40"
              initial={{ scale: 0.95, opacity: 0.45 }}
              animate={{ scale: 1.4, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          )}
        </AnimatePresence>

        {/* Number / "Sing!" */}
        <div className="relative flex items-center justify-center">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={display}
              initial={{ scale: 0.3, opacity: 0, y: 18 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 1.25, opacity: 0, y: -20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              className={`font-display font-black leading-none ${
                count === 0
                  ? 'bg-gradient-to-r from-good-300 to-glow-300 bg-clip-text text-7xl text-transparent drop-shadow-[0_0_40px_rgba(52,211,153,0.5)] sm:text-8xl'
                  : 'text-8xl text-white sm:text-9xl'
              }`}
            >
              {display}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {count === 0 ? (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="mt-10 text-base font-semibold text-good-300"
        >
          Hold it steady — the meter is listening!
        </motion.p>
      ) : (
        <p className="mt-10 text-sm text-slate-500">Sing when the ring runs out</p>
      )}
    </div>
  )
}
