# 🎵 Match the Pitch

A polished, real-time musical **note-matching game** for university orientation events.

Students step up to a laptop + microphone, hear a randomly generated target note, sing it back, and get scored in real time on how accurately they matched the pitch. A full round takes **~50 seconds**.

<p align="center">
  <img src="public/favicon.svg" alt="Match the Pitch" width="96" />
</p>

## How it works

1. **Listen** — a random target note (from a singer-friendly pool, C4–E5) is played. Students can replay it as often as they like.
2. **Countdown** — 5-4-3-2-1-Sing! with beeps.
3. **Sing** — for 30 seconds, the app runs **real-time pitch detection** and shows a live deviation meter (in cents), the note being sung, and a draining timer.
4. **Score** — accuracy %, a 0–3 star rating, closest/average deviation, and how long the voice was detected. Then play again.

### Scoring

Every analysed frame is scored as `accuracy = max(0, 100 − |cents| / 2.5)` against the target frequency, so ~25¢ off ≈ 90 % and ~50¢ off ≈ 80 %. Frames are **weighted by detection clarity and loudness** — silence and background noise don't count against you.

| Accuracy | Stars |
| --- | --- |
| ≥ 90 % | ⭐⭐⭐ |
| ≥ 75 % | ⭐⭐ |
| ≥ 60 % | ⭐ |
| < 60 % | — |

## Tech stack

| Purpose | Library |
| --- | --- |
| UI framework | **React 19** (via **Vite 8**) |
| Styling | **Tailwind CSS 4** (Vite plugin, CSS-first config) |
| Animation | **Framer Motion 13** |
| Pitch detection | **Pitchy 4** — McLeod Pitch Method (no custom algorithm) |
| Audio in/out | **Web Audio API** — microphone capture + on-the-fly tone synthesis |

- **No backend, no database.** Everything runs locally in the browser; the microphone stream never leaves the laptop.
- **Works offline** after `npm install` — zero network requests at runtime (all sounds are synthesized, fonts are system fonts, no CDNs).
- Unit tests for the music-theory and scoring math run with **Vitest**.

## Getting started

```bash
npm install
npm run dev        # start the dev server (http://localhost:5173)
```

Other scripts:

```bash
npm run build      # production build → dist/
npm run preview    # preview the production build
npm test           # run the unit tests
```

> 🔒 The browser will ask for **microphone permission** when you press *Start*. The app needs a working mic and speakers/headphones (the target note is played through them). For the most reliable pitch tracking, use Chrome, Edge or Firefox on a laptop.

## Project structure

```
src/
├── config/gameConfig.js          # every tunable knob (note pool, timings, scoring)
├── lib/
│   ├── musicTheory.js            # freq ↔ MIDI ↔ note names, cents math (pure)
│   ├── musicTheory.test.js
│   ├── scoring.js                # frame accuracy, weighting, round summary (pure)
│   ├── scoring.test.js
│   └── toneSynthesizer.js        # Web Audio: target notes, beeps, fanfares
├── hooks/
│   ├── usePitchDetection.js      # mic → AnalyserNode → Pitchy → onSample frames
│   └── useGameState.js           # (game flow is orchestrated in App.jsx)
├── components/
│   ├── StartScreen.jsx           # landing + mic permission + error recovery
│   ├── NoteReveal.jsx            # target note card, staff notation, replay
│   ├── CountdownOverlay.jsx      # 5-4-3-2-1-Sing!
│   ├── SingPhase.jsx             # singing window (timer, live note)
│   ├── PitchMeter.jsx            # live cents gauge
│   ├── ResultsScreen.jsx         # score, stars, stats, confetti
│   ├── StaffNote.jsx             # note rendered on a treble-clef staff (SVG)
│   └── ui/                       # Button, Card, Screen, StarRating
├── App.jsx                       # game state machine + phase routing
├── main.jsx
└── index.css                     # Tailwind theme tokens
```

## How pitch detection works

1. `usePitchDetection` requests the microphone (`getUserMedia`) with processing features disabled for a cleaner signal.
2. Audio flows into an `AudioContext` → `MediaStreamSource` → `AnalyserNode`.
3. Every animation frame, a `Float32Array(2048)` of time-domain samples is handed to **Pitchy's `PitchDetector.findPitch()`**, which returns `[frequencyHz, clarity]` (clarity 0 = no voice).
4. The frequency is converted to the nearest note name and its cent deviation from the target for the meter and the score.

## Troubleshooting

- **"Microphone access was denied"** — click the mic icon in the browser's address bar, allow the site, and press *Start* again.
- **"No microphone was found"** — connect a mic or enable the laptop's internal mic, then retry.
- **"Microphone is busy"** — close other apps using the mic (Zoom, Meet, Teams), then retry.
- **Nothing is detected while singing** — speak/sing closer to the mic, raise the laptop volume if the target note is too quiet, or try headphones so the mic doesn't pick up the speakers.

## License

MIT
