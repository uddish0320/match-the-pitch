import { memo } from 'react'
import { motion } from 'framer-motion'
import { GAME } from '../config/gameConfig'
import { clamp } from '../lib/musicTheory'

const RANGE = GAME.METER_RANGE_CENTS
const TICKS = [-100, -50, 0, 50, 100]

function statusFor(absCents) {
  if (absCents == null) return { color: '#94a3b8', label: 'Waiting for your voice', text: 'text-slate-400', glow: 'rgba(148, 163, 184, 0.3)' }
  if (absCents <= 25) return { color: '#34d399', label: 'On pitch', text: 'text-good-300', glow: 'rgba(52, 211, 153, 0.4)' }
  if (absCents <= 50) return { color: '#fbbf24', label: 'Close', text: 'text-warn-400', glow: 'rgba(251, 191, 36, 0.3)' }
  return { color: '#f87171', label: 'Off pitch', text: 'text-bad-400', glow: 'rgba(248, 113, 113, 0.3)' }
}

/**
 * Large horizontal cents gauge: the target sits at the centre, a single
 * glowing needle shows the (already smoothed) live deviation.
 * Reads well from a few metres away on a laptop screen.
 */
function PitchMeter({ cents, targetName }) {
  const absCents = cents == null ? null : Math.abs(cents)
  const status = statusFor(absCents)
  const clamped = cents == null ? 0 : clamp(cents, -RANGE, RANGE)
  const leftPct = cents == null ? 50 : 50 + (clamped / RANGE) * 50

  return (
    <div className="w-full select-none">
      {/* Readout row */}
      <div className="mb-4 flex items-end justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <motion.span
            className="h-3.5 w-3.5 shrink-0 rounded-full"
            style={{ backgroundColor: status.color, boxShadow: `0 0 14px 3px ${status.glow}` }}
            animate={cents != null ? { scale: [1, 1.15, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden
          />
          <span className={`truncate text-xs font-semibold uppercase tracking-[0.22em] sm:text-sm ${status.text}`}>
            {cents == null ? 'Waiting for your voice…' : status.label}
          </span>
        </div>
        <div
          className={`font-display text-6xl font-black leading-none tabular-nums sm:text-7xl ${status.text}`}
          aria-hidden
        >
          {cents == null ? '—' : `${cents > 0 ? '+' : ''}${Math.round(cents)}`}
          <span className="ml-1 text-2xl font-bold text-slate-400">¢</span>
        </div>
      </div>

      {/* Gauge */}
      <div
        role="meter"
        aria-valuemin={-RANGE}
        aria-valuemax={RANGE}
        aria-valuenow={Math.round(clamped)}
        aria-valuetext={
          cents == null ? 'no signal' : `${Math.round(cents)} cents, ${status.label.toLowerCase()}`
        }
        className="relative h-28 w-full lg:h-36"
      >
        {/* Zones: red ±100→±50, amber ±50→±25, green ±25 centred on the target */}
        <div className="absolute inset-x-0 top-1 bottom-9 flex overflow-hidden rounded-2xl border border-white/[0.08] bg-ink-800/80 backdrop-blur">
          <div className="h-full w-1/4 bg-bad-400/[0.12]" />
          <div className="h-full w-[12.5%] bg-warn-400/[0.10]" />
          <div className="h-full w-1/4 bg-good-400/[0.18] shadow-[inset_0_0_30px_rgba(52,211,153,0.12)]" />
          <div className="h-full w-[12.5%] bg-warn-400/[0.10]" />
          <div className="h-full w-1/4 bg-bad-400/[0.12]" />
        </div>

        {/* Tick marks */}
        {TICKS.map((tick) => (
          <div
            key={tick}
            className="absolute top-1 bottom-9 w-px bg-white/[0.12]"
            style={{ left: `${50 + (tick / RANGE) * 50}%` }}
          />
        ))}

        {/* Centre marker */}
        <div className="absolute top-1 bottom-9 w-0.5 -translate-x-1/2 bg-white/50 shadow-[0_0_6px_rgba(255,255,255,0.3)]" style={{ left: '50%' }} />

        {/* Needle (single animated element — bar + head move together) */}
        <motion.div
          className="absolute bottom-9 top-1 z-10"
          initial={false}
          animate={{ left: `${leftPct}%` }}
          transition={{ duration: 0.08, ease: 'easeOut' }}
        >
          <div className="relative h-full w-0">
            <div
              className="absolute inset-y-0 left-1/2 w-1.5 -translate-x-1/2 rounded-full"
              style={{ backgroundColor: status.color, boxShadow: `0 0 18px 4px ${status.glow}` }}
            />
            <div
              className="absolute left-1/2 top-0 h-5 w-5 -translate-x-1/2 rounded-full border-2 border-white/80"
              style={{ backgroundColor: status.color, boxShadow: `0 0 20px 6px ${status.glow}` }}
            />
          </div>
        </motion.div>

        {/* Tick labels */}
        {TICKS.map((tick) => (
          <span
            key={tick}
            className="absolute bottom-0 text-[11px] font-medium tabular-nums text-slate-500"
            style={{ left: `${50 + (tick / RANGE) * 50}%`, transform: 'translateX(-50%)' }}
          >
            {tick === 0 ? targetName : tick}
          </span>
        ))}
      </div>
    </div>
  )
}

function propsEqual(prev, next) {
  if (prev.targetName !== next.targetName) return false
  if (prev.cents == null !== (next.cents == null)) return false
  return Math.abs((prev.cents ?? 0) - (next.cents ?? 0)) < 0.5
}

export default memo(PitchMeter, propsEqual)
