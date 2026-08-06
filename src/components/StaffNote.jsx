import { midiToNoteName } from '../lib/musicTheory'

/**
 * Renders a note on a treble-clef staff as inline SVG.
 *
 * Staff geometry: bottom line E4 (MIDI 64) at staffPos 0, lines every 2
 * staffPos up to F5 (MIDI 77) at staffPos 8. Ledger lines are drawn for
 * every note outside the staff, including the space positions adjacent
 * to it (matching standard engraving practice).
 */

const PITCH_CLASS_TO_LETTER = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6] // C C# D D# E F F# G G# A A# B

function staffPosForMidi(midi) {
  const letterIndex = PITCH_CLASS_TO_LETTER[((midi % 12) + 12) % 12]
  const octave = Math.floor(midi / 12) - 1
  return (octave - 4) * 7 + (letterIndex - 2)
}

function ledgerPositions(staffPos) {
  const positions = []
  if (staffPos < 0) {
    for (let p = staffPos; p < 0; p += 2) positions.push(p)
  } else if (staffPos > 8) {
    for (let p = staffPos; p > 8; p -= 2) positions.push(p)
  }
  return positions
}

export default function StaffNote({ midi, className = '', color = '#a78bfa', showLabel = true }) {
  const staffPos = staffPosForMidi(midi)
  const ledgers = ledgerPositions(staffPos)

  const width = 230
  const height = 190
  const yOf = (pos) => 30 + pos * 14
  const noteX = 92
  const stemUp = staffPos <= 4

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[240px]" role="img" aria-label={`Note ${midiToNoteName(midi)}`}>
        {/* Treble clef glyph (falls back gracefully on systems without the symbol). */}
        <text x="14" y="128" fontSize="74" fill="rgba(255,255,255,0.85)" fontFamily="'Noto Music', 'Segoe UI Symbol', 'Apple Symbols', sans-serif">
          𝄞
        </text>

        {/* Staff lines: E4, G4, B4, D5, F5 */}
        {[0, 2, 4, 6, 8].map((pos) => (
          <line key={pos} x1="58" y1={yOf(pos)} x2={width - 8} y2={yOf(pos)} stroke="rgba(255,255,255,0.35)" strokeWidth="1.4" />
        ))}

        {/* Ledger lines */}
        {ledgers.map((pos) => (
          <line key={`ledger-${pos}`} x1={noteX - 26} y1={yOf(pos)} x2={noteX + 26} y2={yOf(pos)} stroke="rgba(255,255,255,0.5)" strokeWidth="1.4" />
        ))}

        {/* Note head */}
        <ellipse
          cx={noteX}
          cy={yOf(staffPos)}
          rx="10"
          ry="7.4"
          fill={color}
          transform={`rotate(-20 ${noteX} ${yOf(staffPos)})`}
        />

        {/* Stem */}
        {stemUp ? (
          <rect x={noteX + 7} y={yOf(staffPos) - 44} width="2.6" height="44" rx="1.3" fill={color} />
        ) : (
          <rect x={noteX - 9.6} y={yOf(staffPos)} width="2.6" height="44" rx="1.3" fill={color} />
        )}

        {/* Graceful fallback label inside the staff area when the clef glyph is unavailable is handled by showLabel below. */}
      </svg>

      {showLabel && (
        <div className="mt-1 rounded-full border border-white/10 bg-white/5 px-3 py-0.5 text-sm font-semibold tracking-widest text-slate-300">
          {midiToNoteName(midi)}
        </div>
      )}
    </div>
  )
}
