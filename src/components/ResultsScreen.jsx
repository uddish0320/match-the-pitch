import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Button from './ui/Button'
import Card from './ui/Card'
import Screen from './ui/Screen'
import StarRating from './ui/StarRating'
import StaffNote from './StaffNote'
import { midiToNoteName } from '../lib/musicTheory'
import { framesToSeconds } from '../lib/scoring'

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
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl" aria-hidden>
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
          initial={{ y: -30, rotate: 0, opacity: 1 }}
          animate={{ y: '105%', rotate: piece.rotate * 3, opacity: [1, 1, 0.4] }}
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
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center">
      <div className="font-display text-2xl font-black tabular-nums text-white">
        {value}
        {unit && <span className="ml-0.5 text-sm font-semibold text-slate-400">{unit}</span>}
      </div>
      <div className="mt-0.5 text-[11px] font-medium uppercase tracking-widest text-slate-500">{label}</div>
    </div>
  )
}

export default function ResultsScreen({ midi, result, onPlayAgain }) {
  const name = midiToNoteName(midi)
  const { accuracy, stars, bestCents, avgAbsCents, voicedFrames } = result
  const animatedAccuracy = useCountUp(Math.round(accuracy))
  const headline = HEADLINES[stars] ?? HEADLINES[0]

  const confettiPieces = useMemo(() => {
    const count = stars === 0 ? 10 : 12 + stars * 8
    const colors = ['#8b5cf6', '#22d3ee', '#f472b6', '#fbbf24', '#34d399']
    return Array.from({ length: count }, (_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 0.7,
      duration: 1.5 + Math.random() * 1.5,
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
      <Card className="relative w-full max-w-xl overflow-visible p-8 text-center sm:p-10">
        <Confetti pieces={confettiPieces} />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400"
        >
          Target: {name}
        </motion.p>

        <motion.h2
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="font-display mt-2 text-4xl font-black text-white"
        >
          {headline.title}
        </motion.h2>

        <div className="mt-4">
          <StarRating rating={stars} size="h-14 w-14" />
        </div>

        <div className="mt-6 flex flex-col items-center">
          <div className="font-display bg-gradient-to-r from-brand-300 to-glow-300 bg-clip-text text-7xl font-black tabular-nums text-transparent">
            {animatedAccuracy}
            <span className="text-3xl">%</span>
          </div>
          <p className="mt-1 text-sm text-slate-400">{headline.sub}</p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Closest" value={bestCents == null ? '—' : Math.round(bestCents)} unit="¢" />
          <Stat label="Average" value={avgAbsCents == null ? '—' : Math.round(avgAbsCents)} unit="¢" />
          <Stat label="Voiced" value={framesToSeconds(voicedFrames).toFixed(1)} unit="s" />
          <Stat label="Stars" value={stars} unit=" / 3" />
        </div>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
        >
          <Button onClick={onPlayAgain} className="w-full sm:w-auto sm:px-10">
            Play again <span className="text-xs text-white/70">(Space)</span>
          </Button>
        </motion.div>
      </Card>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6"
      >
        <StaffNote midi={midi} className="mx-auto" showLabel={false} />
      </motion.div>
    </Screen>
  )
}
