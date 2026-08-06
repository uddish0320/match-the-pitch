import { memo } from 'react'
import { motion } from 'framer-motion'
import { GAME } from '../config/gameConfig'
import { clamp } from '../lib/musicTheory'

const RANGE = GAME.METER_RANGE_CENTS
const TICKS = [-100, -50, 0, 50, 100]

function statusFor(absCents) {
  if (absCents == null) return { color: '#94a3b8', label: 'Waiting for your voice', text: 'text-slate-400' }
  if (absCents <= 25) return { color: '#34d399', label: 'On pitch', text: 'text-good-300' }
  if (absCents <= 50) return { color: '#fbbf24', label: 'Close', text: 'text-warn-400' }
  return { color: '#f87171', label: 'Off pitch', text: 'text-bad-400' }
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
      <div className="mb-3 flex items-end justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className="h-3 w-3 shrink-0 rounded-full"
            style={{ backgroundColor: status.color, boxShadow: `0 0 12px 2px ${status.color}99` }}
            aria-hidden
          />
          <span className={`truncate text-xs font-semibold uppercase tracking-[0.22em] sm:text-sm ${status.text}`}>
            {cents == null ? 'Waiting for your voice…' : status.label}
          </span>
        </div>
        <div
          className={`font-display text-5xl font-black leading-none tabular-nums sm:text-6xl ${status.text}`}
          aria-hidden
        >
          {cents == null ? '—' : `${cents > 0 ? '+' : ''}${Math.round(cents)}`}
          <span className="ml-0.5 text-2xl font-bold text-slate-400">¢</span>
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
        className="relative h-24 w-full lg:h-32"
      >
        {/* Zones: red ±100→±50, amber ±50→±25, green ±25 centred on the target */}
        <div className="absolute inset-x-0 top-1 bottom-8 flex overflow-hidden rounded-2xl border border-white/10 bg-ink-800/70">
          <div className="h-full w-1/4 bg-bad-400/15" />
          <div className="h-full w-[12.5%] bg-warn-400/15" />
          <div className="h-full w-1/4 bg-good-400/20 shadow-[inset_0_0_24px_rgba(52,211,153,0.14)]" />
          <div className="h-full w-[12.5%] bg-warn-400/15" />
          <div className="h-full w-1/4 bg-bad-400/15" />
        </div>

        {/* Tick marks */}
        {TICKS.map((tick) => (
          <div
            key={tick}
            className="absolute top-1 bottom-8 w-px bg-white/15"
            style={{ left: `${50 + (tick / RANGE) * 50}%` }}
          />
        ))}

        {/* Centre marker */}
        <div className="absolute top-1 bottom-8 w-0.5 -translate-x-1/2 bg-white/50" style={{ left: '50%' }} />

        {/* Needle (single animated element — bar + head move together) */}
        <motion.div
          className="absolute bottom-8 top-1 z-10"
          initial={false}
          animate={{ left: `${leftPct}%` }}
          transition={{ duration: 0.08, ease: 'easeOut' }}
        >
          <div className="relative h-full w-0">
            <div
              className="absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 rounded-full"
              style={{ backgroundColor: status.color, boxShadow: `0 0 16px 3px ${status.color}88` }}
            />
            <div
              className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-white/80"
              style={{ backgroundColor: status.color, boxShadow: `0 0 18px 5px ${status.color}aa` }}
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
