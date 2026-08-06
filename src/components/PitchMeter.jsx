import { motion } from 'framer-motion'
import { GAME } from '../config/gameConfig'
import { clamp } from '../lib/musicTheory'

const RANGE = GAME.METER_RANGE_CENTS

function statusFor(absCents) {
  if (absCents === null) return { color: '#94a3b8', label: 'no signal', text: 'text-slate-400' }
  if (absCents <= 25) return { color: '#34d399', label: 'on pitch', text: 'text-good-300' }
  if (absCents <= 50) return { color: '#fbbf24', label: 'close', text: 'text-warn-400' }
  return { color: '#f87171', label: 'off pitch', text: 'text-bad-400' }
}

/**
 * Horizontal cents gauge: target sits at the centre, the glowing needle
 * shows the live deviation (clamped to ±RANGE visually).
 */
export default function PitchMeter({ cents, targetName }) {
  const absCents = cents == null ? null : Math.abs(cents)
  const status = statusFor(absCents)
  const leftPct = cents == null ? 50 : 50 + (clamp(cents, -RANGE, RANGE) / RANGE) * 50

  return (
    <div className="w-full">
      <div className="mb-2 flex items-end justify-between">
        <div className="text-sm text-slate-400">
          You are{' '}
          <span className={`font-semibold ${status.text}`}>{cents == null ? '…' : status.label}</span>
        </div>
        <div className={`font-display text-3xl font-black tabular-nums ${status.text}`}>
          {cents == null ? '—' : `${cents > 0 ? '+' : ''}${Math.round(cents)}¢`}
        </div>
      </div>

      <div className="relative h-20 w-full">
        {/* Zone background: red ±100→±50, amber ±50→±25, green ±25 centered on the target */}
        <div className="absolute inset-0 flex overflow-hidden rounded-2xl border border-white/10 bg-ink-800/80">
          <div className="h-full w-1/4 bg-bad-400/20" />
          <div className="h-full w-[12.5%] bg-warn-400/20" />
          <div className="h-full w-1/4 bg-good-400/15" />
          <div className="h-full w-[12.5%] bg-warn-400/20" />
          <div className="h-full w-1/4 bg-bad-400/20" />
        </div>

        {/* Tick labels */}
        {[-100, -50, 0, 50, 100].map((tick) => (
          <span
            key={tick}
            className="absolute bottom-1.5 text-[10px] font-medium tabular-nums text-slate-500"
            style={{ left: `${50 + (tick / RANGE) * 50}%`, transform: 'translateX(-50%)' }}
          >
            {tick === 0 ? `${targetName} (0¢)` : `${tick}¢`}
          </span>
        ))}

        {/* Centre marker */}
        <div className="absolute top-1 bottom-7 left-1/2 w-px -translate-x-1/2 bg-white/40" />

        {/* Needle */}
        <motion.div
          className="absolute top-1 bottom-7"
          style={{ x: '-50%' }}
          animate={{ left: `${leftPct}%` }}
          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        >
          <div
            className="h-full w-1.5 rounded-full"
            style={{ backgroundColor: status.color, boxShadow: `0 0 14px 2px ${status.color}88` }}
          />
        </motion.div>

        {/* Needle head */}
        <motion.div
          className="absolute -top-1"
          style={{ x: '-50%' }}
          animate={{ left: `${leftPct}%` }}
          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        >
          <div
            className="h-4 w-4 rounded-full border-2 border-white/70"
            style={{ backgroundColor: status.color, boxShadow: `0 0 16px 4px ${status.color}99` }}
          />
        </motion.div>
      </div>
    </div>
  )
}
