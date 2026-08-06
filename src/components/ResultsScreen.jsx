import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Button from './ui/Button'
import Card from './ui/Card'
import Screen from './ui/Screen'
import StarRating from './ui/StarRating'
import { midiToNoteName } from '../lib/musicTheory'
import { framesToSeconds } from '../lib/scoring'

const RADIUS = 92
const STROKE = 14
const SIZE = (RADIUS + STROKE) * 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/** Eased count-up so the accuracy number animates in. */
function useCountUp(target) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    let raf
    const start = performance.now()
    const duration = 900
    const step = (now) => {
      const progress = Math.min(1, (now - start) / duration)
      setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))))
      if (progress < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target])
  return value
}

function Confetti({ pieces }) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {pieces.map((piece, i) => (
        <motion.div
          key={i}
          className="absolute top-0 rounded-[2px]"
          style={{
            left: `${piece.left}%`,
            width: piece.size,
            height: piece.size * 0.6,
            backgroundColor: piece.color,
          }}
          initial={{ top: '-6%', rotate: 0, opacity: 1 }}
          animate={{ top: '112%', rotate: piece.rotate * 3, opacity: [1, 1, 0.3] }}
          transition={{ duration: piece.duration, delay: piece.delay, ease: 'easeIn' }}
        />
      ))}
    </div>
  )
}

const HEADLINES = {
  3: { title: 'Pitch perfect!', sub: 'Flawless ears. The crowd is impressed.' },
  2: { title: 'Great job!', sub: 'Really close — that was a solid performance.' },
  1: { title: 'Nice try!', sub: 'You found the note. A little more and it snaps into tune.' },
  0: { title: 'Give it another go!', sub: 'Every singer starts somewhere. Ready for round two?' },
}

function Stat({ label, value, unit }) {
  return (
    <div className="glass rounded-2xl px-4 py-3.5 text-center">
      <div className="font-display text-2xl font-black tabular-nums text-white">
        {value}
        {unit && <span className="ml-0.5 text-sm font-semibold text-slate-400">{unit}</span>}
      </div>
      <div className="mt-1 text-[11px] font-medium uppercase tracking-widest text-slate-500">{label}</div>
    </div>
  )
}

export default function ResultsScreen({ midi, result, onPlayAgain }) {
  const name = midiToNoteName(midi)
  const { accuracy, stars, bestCents, avgAbsCents, voicedFrames } = result
  const animatedAccuracy = useCountUp(Math.round(accuracy))
  const headline = HEADLINES[stars] ?? HEADLINES[0]

  const confettiPieces = useMemo(() => {
    const count = stars === 0 ? 8 : 14 + stars * 10
    const colors = ['#8b5cf6', '#22d3ee', '#f472b6', '#fbbf24', '#34d399', '#fde047']
    return Array.from({ length: count }, (_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 0.7,
      duration: 1.6 + Math.random() * 1.4,
      rotate: Math.random() * 360,
      size: 6 + Math.random() * 8,
      color: colors[i % colors.length],
    }))
  }, [stars])

  // Space bar starts the next round.
  useEffect(() => {
    const onKey = (event) => {
      if (event.code === 'Space' && !event.repeat) {
        event.preventDefault()
        onPlayAgain()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onPlayAgain])

  return (
    <Screen>
      <Card className="relative w-full max-w-xl overflow-hidden p-8 text-center sm:p-10">
        <Confetti pieces={confettiPieces} />

        {/* Target chip */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-slate-300 backdrop-blur"
        >
          <span aria-hidden>🎵</span> Target — {name}
        </motion.div>

        <motion.h2
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="font-display mt-5 text-3xl font-black text-white sm:text-4xl"
        >
          {headline.title}
        </motion.h2>

        <div className="mt-6">
          <StarRating rating={stars} size="h-16 w-16" />
        </div>

        {/* Accuracy ring */}
        <div
          className="relative mx-auto mt-8"
          style={{ width: SIZE, height: SIZE }}
          role="img"
          aria-label={`Accuracy ${Math.round(accuracy)} percent, ${stars} of 3 stars`}
        >
          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0 -rotate-90">
            <defs>
              <linearGradient id="accuracy-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#34d399" />
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
              stroke="url(#accuracy-grad)"
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              initial={{ strokeDashoffset: CIRCUMFERENCE }}
              animate={{ strokeDashoffset: CIRCUMFERENCE * (1 - accuracy / 100) }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="font-display bg-gradient-to-r from-good-300 to-glow-300 bg-clip-text text-6xl font-black tabular-nums text-transparent">
              {animatedAccuracy}
              <span className="text-3xl">%</span>
            </div>
            <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500">
              Accuracy
            </div>
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-6 text-sm text-slate-400"
        >
          {headline.sub}
        </motion.p>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Closest" value={bestCents == null ? '—' : Math.round(bestCents)} unit="¢" />
          <Stat label="Average" value={avgAbsCents == null ? '—' : Math.round(avgAbsCents)} unit="¢" />
          <Stat label="Singing" value={framesToSeconds(voicedFrames).toFixed(1)} unit="s" />
          <Stat label="Stars" value={stars} unit=" / 3" />
        </div>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.75, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 flex flex-col items-center justify-center"
        >
          <Button size="lg" onClick={onPlayAgain} className="w-full sm:w-auto sm:px-12">
            Play again <span className="text-xs text-white/70">(Space)</span>
          </Button>
        </motion.div>
      </Card>
    </Screen>
  )
}
