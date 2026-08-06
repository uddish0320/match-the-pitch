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

const CHIPS = [
  { icon: '🔒', label: '100% in-browser' },
  { icon: '📴', label: 'Works offline' },
  { icon: '⚡', label: '~20 second rounds' },
]

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2Z" />
    </svg>
  )
}

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
      {/* Logo medallion with a slow rotating gradient halo */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        className="relative mb-8"
      >
        <motion.div
          className="absolute -inset-2 rounded-full bg-[conic-gradient(from_0deg,#8b5cf6,#ec4899,#22d3ee,#8b5cf6)] opacity-70 blur-[6px] will-change-transform"
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-ink-900 ring-1 ring-white/10">
          <svg viewBox="0 0 64 64" className="h-12 w-12" aria-hidden>
            <defs>
              <linearGradient id="logo-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#c4b5fd" />
                <stop offset="100%" stopColor="#f472b6" />
              </linearGradient>
            </defs>
            <path
              d="M40 14v23.2a9.6 9.6 0 1 1-4-7.8V22.2l-12 2.9v22.1a9.6 9.6 0 1 1-4-7.8V18.9L40 14z"
              fill="url(#logo-grad)"
            />
          </svg>
        </div>
      </motion.div>

      <motion.h1
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.08 }}
        className="font-display text-center text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl"
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
        className="mt-3 max-w-md text-center text-base text-slate-400"
      >
        Hear the note, sing it back, and see how close you can get. Takes about 20 seconds — no experience
        needed.
      </motion.p>

      <div className="mt-9 grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.24 + i * 0.1 }}
          >
            <Card className="flex h-full flex-col items-center gap-3 p-6 text-center">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-brand-500/25 to-berry-500/15 text-2xl"
                aria-hidden
              >
                {step.icon}
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-white">{step.title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-slate-400">{step.text}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.55 }}
        className="mt-10 flex flex-col items-center gap-5"
      >
        <Button size="lg" onClick={onStart} className="gap-3 px-10">
          <MicIcon /> Start — allow microphone
        </Button>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {CHIPS.map((chip) => (
            <span
              key={chip.label}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300"
            >
              <span aria-hidden>{chip.icon}</span> {chip.label}
            </span>
          ))}
        </div>

        <p className="text-xs text-slate-500">
          Press <kbd className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5 font-mono">Space</kbd> to
          start · your voice never leaves this laptop
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
