import { useEffect } from 'react'
import { motion } from 'framer-motion'
import Button from './ui/Button'
import Card from './ui/Card'
import Screen from './ui/Screen'

const STEPS = [
  {
    icon: '👂',
    title: 'Listen',
    text: 'A target note is played. Listen closely — replay it as many times as you need.',
  },
  {
    icon: '🎤',
    title: 'Sing',
    text: 'Sing the note back into the microphone when the countdown ends.',
  },
  {
    icon: '⭐',
    title: 'Score',
    text: 'Get rated on how accurately you match the pitch — up to 3 stars.',
  },
]

export default function StartScreen({ micError, onStart }) {
  // Space bar starts the game.
  useEffect(() => {
    const onKey = (event) => {
      if (event.code === 'Space' && !event.repeat) {
        event.preventDefault()
        onStart()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onStart])

  return (
    <Screen>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 18 }}
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-500 to-berry-500 shadow-xl shadow-brand-500/40"
      >
        <svg viewBox="0 0 64 64" className="h-12 w-12" aria-hidden>
          <path d="M40 14v23.2a9.6 9.6 0 1 1-4-7.8V22.2l-12 2.9v22.1a9.6 9.6 0 1 1-4-7.8V18.9L40 14z" fill="#fff" />
        </svg>
      </motion.div>

      <motion.h1
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.08 }}
        className="font-display text-center text-5xl font-black tracking-tight text-white sm:text-6xl"
      >
        Match{' '}
        <span className="bg-gradient-to-r from-brand-400 via-berry-400 to-glow-400 bg-clip-text text-transparent">
          the Pitch
        </span>
      </motion.h1>

      <motion.p
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.16 }}
        className="mt-3 max-w-md text-center text-slate-400"
      >
        Hear the note, sing it back, and see how close you can get. Takes about 20 seconds — no experience needed.
      </motion.p>

      <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.24 + i * 0.1 }}
          >
            <Card className="flex h-full flex-col items-center p-5 text-center">
              <span className="text-3xl" aria-hidden>
                {step.icon}
              </span>
              <h2 className="mt-2 font-semibold text-white">{step.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-slate-400">{step.text}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.55 }}
        className="mt-8 flex flex-col items-center gap-4"
      >
        <Button size="lg" onClick={onStart} className="px-12">
          🎤 Start — Allow Microphone
        </Button>
        <p className="text-xs text-slate-500">
          Or press <kbd className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5 font-mono">Space</kbd>. Your voice never leaves this laptop — everything runs in your browser.
        </p>

        {micError && (
          <Card className="mt-2 w-full max-w-lg border-rose-400/30 bg-rose-500/10 p-5 text-left">
            <h3 className="flex items-center gap-2 font-semibold text-rose-200">
              <span aria-hidden>🎙️</span> Microphone problem
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-rose-100/80">{micError}</p>
            <p className="mt-2 text-xs leading-relaxed text-rose-100/60">
              Tip: check the mic icon in your browser’s address bar, grant permission, and try again.
            </p>
            <div className="mt-3">
              <Button variant="dark" size="md" onClick={onStart}>
                Try again
              </Button>
            </div>
          </Card>
        )}
      </motion.div>
    </Screen>
  )
}
