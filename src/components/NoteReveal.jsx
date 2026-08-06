import { useEffect } from 'react'
import { motion } from 'framer-motion'
import Button from './ui/Button'
import Card from './ui/Card'
import Screen from './ui/Screen'
import StaffNote from './StaffNote'
import { GAME } from '../config/gameConfig'
import { midiToFrequency, midiToNoteName } from '../lib/musicTheory'

export default function NoteReveal({ midi, synth, onReady }) {
  const frequency = midiToFrequency(midi)
  const name = midiToNoteName(midi)

  // Play the target note once the reveal screen appears.
  useEffect(() => {
    const timer = setTimeout(() => {
      synth.playNote(frequency, { duration: GAME.REVEAL_NOTE_DURATION_MS })
    }, 350)
    return () => {
      clearTimeout(timer)
      synth.stopAll()
    }
  }, [frequency, synth])

  const replay = () => {
    synth.playNote(frequency, { duration: GAME.REVEAL_NOTE_DURATION_MS })
  }

  // R = replay note, Space = I'm ready.
  useEffect(() => {
    const onKey = (event) => {
      if (event.repeat) return
      if (event.code === 'KeyR') replay()
      if (event.code === 'Space') {
        event.preventDefault()
        onReady()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onReady])

  return (
    <Screen>
      <Card className="flex w-full max-w-xl flex-col items-center p-8 text-center sm:p-12">
        <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
          <span aria-hidden>🎵</span> Target note
        </p>

        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.1 }}
          className="mt-4"
        >
          <div className="bg-gradient-to-r from-brand-300 via-berry-400 to-glow-300 bg-clip-text font-display text-9xl font-black text-transparent drop-shadow-[0_0_40px_rgba(139,92,246,0.45)] sm:text-[10rem]">
            {name}
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5 w-full"
        >
          <StaffNote midi={midi} color="#c4b5fd" className="mx-auto [&_svg]:max-w-[260px] sm:[&_svg]:max-w-[300px]" />
        </motion.div>

        <motion.div
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Button variant="ghost" onClick={replay} className="w-full sm:w-auto">
            <span aria-hidden>🔊</span> Play note <span className="text-xs text-slate-500">(R)</span>
          </Button>
          <Button onClick={onReady} className="w-full sm:w-auto">
            I&rsquo;m ready <span className="text-xs text-white/70">(Space)</span>
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="animate-pulse-soft mt-6 text-sm text-slate-400"
        >
          When the countdown ends, sing {name} into the microphone.
        </motion.p>
      </Card>
    </Screen>
  )
}
