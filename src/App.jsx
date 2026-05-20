import { useEffect, useMemo, useRef, useState } from 'react'
import { PitchDetector } from 'pitchy'
import './App.css'
import {
  applyLocalizedSeo,
  buildSoftwareSchema,
  detectLocale,
  getTranslator,
  LOCALE_LABELS,
  SUPPORTED_LOCALES,
} from './i18n'

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const ENHARMONIC_LABELS = {
  'C#': 'Db',
  'D#': 'Eb',
  'F#': 'Gb',
  'G#': 'Ab',
  'A#': 'Bb',
}

const NOTE_ALIASES = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
  DO: 0,
  RE: 2,
  MI: 4,
  FA: 5,
  SOL: 7,
  LA: 9,
  SI: 11,
  TI: 11,
}

const TUNINGS = {
  '48': {
    label: '48 voces',
    holes: 12,
    range: 'C4 - D7',
    reeds: 48,
    description: 'La cromática clásica de 12 agujeros: tres octavas en afinación solo.',
    blow: [60, 64, 67, 72, 72, 76, 79, 84, 84, 88, 91, 96],
    draw: [62, 65, 69, 71, 74, 77, 81, 83, 86, 89, 93, 95],
  },
  '64': {
    label: '64 voces',
    holes: 16,
    range: 'C3 - D7',
    reeds: 64,
    description: 'La de 16 agujeros añade una octava grave extra sin cambiar el patrón de respiración.',
    blow: [48, 52, 55, 60, 60, 64, 67, 72, 72, 76, 79, 84, 84, 88, 91, 96],
    draw: [50, 53, 57, 59, 62, 65, 69, 71, 74, 77, 81, 83, 86, 89, 93, 95],
  },
}

const KEY_OPTIONS = [
  { label: 'C', root: 0 },
  { label: 'Db', root: 1 },
  { label: 'D', root: 2 },
  { label: 'Eb', root: 3 },
  { label: 'E', root: 4 },
  { label: 'F', root: 5 },
  { label: 'F#', root: 6 },
  { label: 'G', root: 7 },
  { label: 'Ab', root: 8 },
  { label: 'A', root: 9 },
  { label: 'Bb', root: 10 },
  { label: 'B', root: 11 },
]

const MAJOR_SCALE_STEPS = new Set([0, 2, 4, 5, 7, 9, 11])
const MIN_CLARITY = 0.75
const MIN_LEVEL = 0.02
const MIN_SUSTAIN_MS = 120
const MAX_DEVIATION_CENTS = 35
const RELEASE_MS = 120
const AUTOPLAY_STORAGE_KEY = 'cromanota-autoplay-score'
const SONG_LIBRARY_STORAGE_KEY = 'cromanota-song-library'
const LOCALE_STORAGE_KEY = 'cromanota-locale'
const DEFAULT_SONG_TITLE = 'Cumpleaños feliz'
const DEFAULT_SONG_CATEGORY = 'Tradicionales'
const DEFAULT_USER_CATEGORY = 'Mis temas'
const DEFAULT_SCORE_TEXT =
  'G4:0.5 G4:0.5 A4:1 G4:1 C5:1 B4:2 | G4:0.5 G4:0.5 A4:1 G4:1 D5:1 C5:2 | G4:0.5 G4:0.5 G5:1 E5:1 C5:1 B4:1 A4:2 | F5:0.5 F5:0.5 E5:1 C5:1 D5:1 C5:2'
const DEFAULT_SONGS = [
  {
    id: 'happy-birthday',
    title: DEFAULT_SONG_TITLE,
    category: DEFAULT_SONG_CATEGORY,
    scoreText: DEFAULT_SCORE_TEXT,
    sourceKey: 0,
    targetKey: 0,
    tempo: 92,
  },
]
const SCALE_PATTERNS = [
  { id: 'major', name: 'Mayor', category: 'Diatonicas', steps: [0, 2, 4, 5, 7, 9, 11, 12] },
  { id: 'natural-minor', name: 'Menor natural', category: 'Diatonicas', steps: [0, 2, 3, 5, 7, 8, 10, 12] },
  { id: 'harmonic-minor', name: 'Menor armonica', category: 'Diatonicas', steps: [0, 2, 3, 5, 7, 8, 11, 12] },
  { id: 'melodic-minor', name: 'Menor melodica', category: 'Diatonicas', steps: [0, 2, 3, 5, 7, 9, 11, 12] },
  { id: 'major-pentatonic', name: 'Pentatonica mayor', category: 'Pentatonicas', steps: [0, 2, 4, 7, 9, 12] },
  { id: 'minor-pentatonic', name: 'Pentatonica menor', category: 'Pentatonicas', steps: [0, 3, 5, 7, 10, 12] },
  { id: 'blues', name: 'Blues', category: 'Blues', steps: [0, 3, 5, 6, 7, 10, 12] },
  { id: 'dorian', name: 'Dorica', category: 'Modos', steps: [0, 2, 3, 5, 7, 9, 10, 12] },
  { id: 'phrygian', name: 'Frigia', category: 'Modos', steps: [0, 1, 3, 5, 7, 8, 10, 12] },
  { id: 'lydian', name: 'Lidia', category: 'Modos', steps: [0, 2, 4, 6, 7, 9, 11, 12] },
  { id: 'mixolydian', name: 'Mixolidia', category: 'Modos', steps: [0, 2, 4, 5, 7, 9, 10, 12] },
  { id: 'locrian', name: 'Locria', category: 'Modos', steps: [0, 1, 3, 5, 6, 8, 10, 12] },
  { id: 'chromatic', name: 'Cromatica', category: 'Simetricas', steps: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
]

function isScaleAlteration(note, keyRoot) {
  return !MAJOR_SCALE_STEPS.has((note.midi - keyRoot + 120) % 12)
}

function midiToFrequency(midi) {
  return 440 * 2 ** ((midi - 69) / 12)
}

function midiToNote(midi) {
  const noteIndex = ((midi % 12) + 12) % 12
  const octave = Math.floor(midi / 12) - 1
  const name = NOTE_NAMES[noteIndex]

  return {
    midi,
    name,
    octave,
    label: `${name}${octave}`,
    shortLabel: name,
    alt: ENHARMONIC_LABELS[name] ?? null,
    frequency: midiToFrequency(midi),
  }
}

function buildScaleExercise(pattern, keyOption) {
  const rootMidi = 60 + keyOption.root
  const ascendingMidis = pattern.steps.map((step) => rootMidi + step)
  const descendingMidis = ascendingMidis.slice(0, -1).reverse()
  const ascendingTokens = ascendingMidis.map((midi) => `${midiToNote(midi).label}:0.5`)
  const descendingTokens = descendingMidis.map((midi) => `${midiToNote(midi).label}:0.5`)

  return {
    id: pattern.id,
    title: `${keyOption.label} ${pattern.name}`,
    category: `Escalas · ${pattern.category}`,
    scoreText: `${ascendingTokens.join(' ')} | ${descendingTokens.join(' ')}`,
    sourceKey: keyOption.root,
    targetKey: keyOption.root,
    tempo: 84,
  }
}

function buildLayout(tuning) {
  return tuning.blow.map((blowMidi, index) => {
    const drawMidi = tuning.draw[index]

    return {
      hole: index + 1,
      blow: midiToNote(blowMidi),
      blowSlide: midiToNote(blowMidi + 1),
      draw: midiToNote(drawMidi),
      drawSlide: midiToNote(drawMidi + 1),
    }
  })
}

function calculateLevel(buffer) {
  let sum = 0

  for (let index = 0; index < buffer.length; index += 1) {
    sum += buffer[index] * buffer[index]
  }

  return Math.min(1, Math.sqrt(sum / buffer.length) * 4)
}

function frequencyToNoteData(frequency) {
  const midi = Math.round(12 * Math.log2(frequency / 440) + 69)
  const targetFrequency = midiToFrequency(midi)
  const cents = Math.round(1200 * Math.log2(frequency / targetFrequency))

  return {
    note: midiToNote(midi),
    cents,
  }
}

function formatCents(cents, t) {
  if (cents === 0) {
    return t('tuned')
  }

  return `${cents > 0 ? '+' : ''}${cents} ${t('cents')}`
}

function normalizeSongRecord(song) {
  return {
    ...song,
    category: song.category?.trim() || DEFAULT_USER_CATEGORY,
  }
}

function groupItemsByCategory(items) {
  return items.reduce((groups, item) => {
    const category = item.category?.trim() || DEFAULT_USER_CATEGORY
    const existingGroup = groups.find((group) => group.category === category)

    if (existingGroup) {
      existingGroup.items.push(item)
      return groups
    }

    groups.push({ category, items: [item] })
    return groups
  }, [])
}

function getPreferredInputId(inputs) {
  const realInputs = inputs.filter((device) => device.deviceId && device.deviceId !== 'default')

  if (realInputs.length === 0) {
    return 'default'
  }

  const preferred = realInputs.find((device) =>
    /built-in|macbook|internal|integrado/i.test(device.label),
  )

  return preferred?.deviceId ?? realInputs[0].deviceId
}

function describeAudioError(error, t) {
  if (!(error instanceof Error)) {
    return t('noMicAccess')
  }

  const name = 'name' in error ? error.name : 'Error'
  const detail = error.message ? ` ${error.message}` : ''

  return `${name}.${detail}`.trim()
}

function buildCandidates(layout, midi) {
  const candidates = []

  layout.forEach((column) => {
    const options = [
      { tone: 'draw', slide: false, note: column.draw },
      { tone: 'draw', slide: true, note: column.drawSlide },
      { tone: 'blow', slide: false, note: column.blow },
      { tone: 'blow', slide: true, note: column.blowSlide },
    ]

    options.forEach((option) => {
      if (option.note.midi === midi) {
        candidates.push({
          hole: column.hole,
          tone: option.tone,
          slide: option.slide,
          note: option.note,
          blowName: column.blow.name,
          drawName: column.draw.name,
        })
      }
    })
  })

  return candidates
}

function preferDoReCell(candidates, midi) {
  const noteName = NOTE_NAMES[((midi % 12) + 12) % 12]

  if (noteName !== 'C' && noteName !== 'C#') {
    return candidates
  }

  const doReCandidates = candidates.filter(
    (candidate) =>
      candidate.tone === 'blow' &&
      candidate.blowName === 'C' &&
      candidate.drawName === 'D',
  )

  return doReCandidates.length > 0 ? doReCandidates : candidates
}

function preferSiCellForDoSharp(candidates, midi, previousPosition) {
  const noteName = NOTE_NAMES[((midi % 12) + 12) % 12]

  if (noteName !== 'C#' || previousPosition?.note?.name !== 'B') {
    return candidates
  }

  const sameHoleCandidates = candidates.filter(
    (candidate) =>
      candidate.hole === previousPosition.hole &&
      candidate.tone === 'blow' &&
      candidate.slide,
  )

  return sameHoleCandidates.length > 0 ? sameHoleCandidates : candidates
}

function findBestPosition(layout, midi, previousPosition) {
  const rawCandidates = buildCandidates(layout, midi)
  const contextualCandidates = preferSiCellForDoSharp(rawCandidates, midi, previousPosition)
  const candidates =
    contextualCandidates === rawCandidates
      ? preferDoReCell(rawCandidates, midi)
      : contextualCandidates

  if (candidates.length === 0) {
    return null
  }

  if (!previousPosition) {
    return candidates.sort((left, right) => {
      if (left.hole !== right.hole) {
        return left.hole - right.hole
      }

      if (left.slide !== right.slide) {
        return Number(left.slide) - Number(right.slide)
      }

      return left.tone.localeCompare(right.tone)
    })[0]
  }

  return candidates
    .map((candidate) => {
      const score =
        Math.abs(candidate.hole - previousPosition.hole) * 20 +
        (candidate.tone !== previousPosition.tone ? 6 : 0) +
        (candidate.slide !== previousPosition.slide ? 2 : 0) +
        (candidate.slide ? 1 : 0)

      return { candidate, score }
    })
    .sort((left, right) => left.score - right.score)[0].candidate
}

function normalizeAccidental(value = '') {
  return value.replace('♯', '#').replace('♭', 'b')
}

function normalizeScoreText(scoreText) {
  return scoreText
    .replaceAll('：', ':')
    .replaceAll('，', ',')
    .replaceAll('；', ' ')
    .replaceAll(';', ' ')
    .replaceAll('\t', ' ')
}

function splitScoreLines(scoreText) {
  const lines = normalizeScoreText(scoreText)
    .split(/\r?\n|\|/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  return lines.length > 0 ? lines : [normalizeScoreText(scoreText).trim()].filter(Boolean)
}

function parseScoreToken(token, index) {
  const cleaned = token
    .trim()
    .replace(/^[[({<"']+/, '')
    .replace(/[\])}>,"'.!?]+$/g, '')

  if (!cleaned || cleaned === '|') {
    return null
  }

  const restMatch = cleaned.match(/^(R|REST|SILENCE)(?::(\d+(?:[.,]\d+)?))?$/i)
  if (restMatch) {
    return {
      id: `${cleaned}-${index}`,
      type: 'rest',
      duration: Number((restMatch[2] ?? 1).toString().replace(',', '.')),
      label: 'R',
    }
  }

  const noteMatch = cleaned.match(
    /^([A-Ga-g]|do|re|mi|fa|sol|la|si|ti)([#b♯♭]?)(-?\d+)?(?::(\d+(?:[.,]\d+)?))?$/i,
  )

  if (!noteMatch) {
    return {
      id: `${cleaned}-${index}`,
      type: 'error',
      token: cleaned,
    }
  }

  const noteName = noteMatch[1].toUpperCase()
  const accidental = normalizeAccidental(noteMatch[2] ?? '')
  const octave = Number(noteMatch[3] ?? 4)
  const duration = Number((noteMatch[4] ?? 1).toString().replace(',', '.'))
  const basePitch = NOTE_ALIASES[noteName]

  if (!Number.isFinite(duration) || basePitch === undefined) {
    return {
      id: `${cleaned}-${index}`,
      type: 'error',
      token: cleaned,
    }
  }

  if (duration === 0) {
    return null
  }

  if (duration < 0) {
    return {
      id: `${cleaned}-${index}`,
      type: 'error',
      token: cleaned,
    }
  }

  const accidentalOffset = accidental === '#' ? 1 : accidental === 'b' ? -1 : 0
  const midi = (octave + 1) * 12 + basePitch + accidentalOffset

  return {
    id: `${cleaned}-${index}`,
    type: 'note',
    duration,
    midi,
    label: cleaned.toUpperCase(),
  }
}

function parseScoreText(scoreText) {
  const events = []
  const normalizedLines = splitScoreLines(scoreText)
  let tokenIndex = 0

  normalizedLines.forEach((line, lineIndex) => {
    const tokens = line
      .replaceAll(',', ' ')
      .split(/\s+/)
      .map((token) => token.trim())
      .filter(Boolean)

    tokens.forEach((token) => {
      const parsed = parseScoreToken(token, tokenIndex)
      tokenIndex += 1

      if (!parsed) {
        return
      }

      if (parsed.type !== 'error') {
        events.push({
          ...parsed,
          lineIndex,
        })
      }
    })
  })

  return {
    events,
    errors: [],
  }
}

function buildAutoplaySequence(layout, events, semitoneShift) {
  const sequence = []
  let previousPosition = null

  events.forEach((event) => {
    if (event.type === 'rest') {
      sequence.push({
        ...event,
        transposedMidi: null,
        note: null,
        position: null,
      })
      return
    }

    const transposedMidi = event.midi + semitoneShift
    const position = findBestPosition(layout, transposedMidi, previousPosition)
    const note = midiToNote(transposedMidi)

    if (position) {
      previousPosition = position
    }

    sequence.push({
      ...event,
      transposedMidi,
      note,
      position,
    })
  })

  return sequence
}

function serializeAutoplayState(payload) {
  return JSON.stringify({
    ...payload,
    savedAt: Date.now(),
  })
}

function readStoredAutoplayState() {
  try {
    const raw = window.localStorage.getItem(AUTOPLAY_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function readStoredSongLibrary() {
  try {
    const raw = window.localStorage.getItem(SONG_LIBRARY_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []

    return Array.isArray(parsed) ? parsed.map(normalizeSongRecord) : []
  } catch {
    return []
  }
}

function playHarmonicaTone(audioContext, frequency, durationMs) {
  const now = audioContext.currentTime
  const durationSeconds = durationMs / 1000
  const output = audioContext.createGain()
  const filter = audioContext.createBiquadFilter()
  const vibrato = audioContext.createOscillator()
  const vibratoGain = audioContext.createGain()

  const body = audioContext.createOscillator()
  const reed = audioContext.createOscillator()
  const breath = audioContext.createOscillator()

  output.gain.setValueAtTime(0.0001, now)
  output.gain.linearRampToValueAtTime(0.16, now + 0.03)
  output.gain.exponentialRampToValueAtTime(0.1, now + Math.max(0.08, durationSeconds * 0.65))
  output.gain.exponentialRampToValueAtTime(0.0001, now + durationSeconds + 0.12)

  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(2400, now)
  filter.Q.setValueAtTime(1.1, now)

  body.type = 'triangle'
  body.frequency.setValueAtTime(frequency, now)

  reed.type = 'sawtooth'
  reed.frequency.setValueAtTime(frequency * 2, now)
  reed.detune.setValueAtTime(4, now)

  breath.type = 'sine'
  breath.frequency.setValueAtTime(frequency * 3, now)
  breath.detune.setValueAtTime(-7, now)

  const bodyGain = audioContext.createGain()
  const reedGain = audioContext.createGain()
  const breathGain = audioContext.createGain()

  bodyGain.gain.value = 0.12
  reedGain.gain.value = 0.035
  breathGain.gain.value = 0.02

  vibrato.type = 'sine'
  vibrato.frequency.value = 5.3
  vibratoGain.gain.value = 12

  vibrato.connect(vibratoGain)
  vibratoGain.connect(body.detune)
  vibratoGain.connect(reed.detune)

  body.connect(bodyGain)
  reed.connect(reedGain)
  breath.connect(breathGain)

  bodyGain.connect(filter)
  reedGain.connect(filter)
  breathGain.connect(filter)
  filter.connect(output)
  output.connect(audioContext.destination)

  vibrato.start(now)
  body.start(now)
  reed.start(now)
  breath.start(now)

  const stopAt = now + durationSeconds + 0.14

  vibrato.stop(stopAt)
  body.stop(stopAt)
  reed.stop(stopAt)
  breath.stop(stopAt)

  return () => {
    try {
      vibrato.stop()
      body.stop()
      reed.stop()
      breath.stop()
    } catch {
      return
    }
  }
}

function App() {
  const [storedAutoplayState] = useState(() => readStoredAutoplayState())
  const [locale, setLocale] = useState(() => {
    const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY)

    if (storedLocale && SUPPORTED_LOCALES.includes(storedLocale)) {
      return storedLocale
    }

    return detectLocale(navigator.languages ?? [navigator.language].filter(Boolean))
  })
  const t = getTranslator(locale)
  const [instrument, setInstrument] = useState(storedAutoplayState?.instrument ?? '64')
  const [micState, setMicState] = useState('idle')
  const [detected, setDetected] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [inputLevel, setInputLevel] = useState(0)
  const [audioInputs, setAudioInputs] = useState([])
  const [selectedInputId, setSelectedInputId] = useState('default')
  const [activeInputLabel, setActiveInputLabel] = useState(t('noDevice'))
  const [selectedKey, setSelectedKey] = useState(storedAutoplayState?.targetKey ?? 0)
  const [theme, setTheme] = useState(() => {
    const savedTheme = window.localStorage.getItem('cromanota-theme')

    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme
    }

    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  const [scoreText, setScoreText] = useState(storedAutoplayState?.scoreText ?? DEFAULT_SCORE_TEXT)
  const [songTitle, setSongTitle] = useState(storedAutoplayState?.songTitle ?? DEFAULT_SONG_TITLE)
  const [songCategory, setSongCategory] = useState(storedAutoplayState?.songCategory ?? DEFAULT_SONG_CATEGORY)
  const [songLibrary, setSongLibrary] = useState(() => readStoredSongLibrary())
  const [playerMode, setPlayerMode] = useState(storedAutoplayState?.playerMode ?? 'songs')
  const [selectedScalePatternId, setSelectedScalePatternId] = useState(
    storedAutoplayState?.selectedScalePatternId ?? SCALE_PATTERNS[0].id,
  )
  const [sourceKey, setSourceKey] = useState(storedAutoplayState?.sourceKey ?? 0)
  const [targetKey, setTargetKey] = useState(storedAutoplayState?.targetKey ?? 0)
  const [tempo, setTempo] = useState(storedAutoplayState?.tempo ?? 92)
  const [scorePanelOpen, setScorePanelOpen] = useState(false)
  const [scoreHelpOpen, setScoreHelpOpen] = useState(false)
  const [promptCopied, setPromptCopied] = useState(false)
  const [autoplayStatus, setAutoplayStatus] = useState('idle')
  const [autoplayIndex, setAutoplayIndex] = useState(-1)
  const [autoplayCurrent, setAutoplayCurrent] = useState(null)
  const [manualSelection, setManualSelection] = useState(null)
  const [manualOptionsKey, setManualOptionsKey] = useState('')
  const [lineMotion, setLineMotion] = useState('idle')
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const detectorRef = useRef(null)
  const dataRef = useRef(null)
  const streamRef = useRef(null)
  const rafRef = useRef(0)
  const pendingDetectionRef = useRef(null)
  const lastConfirmedAtRef = useRef(0)
  const detectedRef = useRef(null)
  const lastPositionsRef = useRef([])
  const autoplayAudioContextRef = useRef(null)
  const autoplayAdvanceTimeoutRef = useRef(0)
  const autoplayCurrentStopRef = useRef(null)
  const previewAudioContextRef = useRef(null)
  const scorePanelSnapshotRef = useRef(null)
  const songWorkspaceRef = useRef(null)
  const scaleWorkspaceRef = useRef(null)
  const scoreHelpRef = useRef(null)
  const previousLineIndexRef = useRef(null)

  const tuning = TUNINGS[instrument]
  const layout = buildLayout(tuning)
  const transposeAmount = targetKey - sourceKey
  const parsedScore = useMemo(() => parseScoreText(scoreText), [scoreText])
  const scoreLines = useMemo(() => splitScoreLines(scoreText), [scoreText])
  const autoplayError = useMemo(() => {
    if (parsedScore.events.length === 0) {
      return t('autoplayEmpty')
    }

    if (parsedScore.errors.length > 0) {
      return `${t('autoplayParseError')} ${parsedScore.errors.join(', ')}`
    }

    return ''
  }, [parsedScore, t])
  const baseEvents = useMemo(
    () => (autoplayError ? [] : parsedScore.events),
    [autoplayError, parsedScore.events],
  )
  const transcribedSequence = useMemo(
    () =>
      baseEvents.length
        ? buildAutoplaySequence(layout, baseEvents, transposeAmount)
        : [],
    [baseEvents, layout, transposeAmount],
  )
  const transcriptionUnavailable = useMemo(
    () => transcribedSequence.filter((event) => event.type === 'note' && !event.position).length,
    [transcribedSequence],
  )
  const savedLabel = autoplayError ? '' : t('autoplaySaved')
  const selectedSequenceEvent =
    autoplayIndex >= 0 && autoplayIndex < transcribedSequence.length
      ? transcribedSequence[autoplayIndex]
      : null
  const currentLineLabel = selectedSequenceEvent ? selectedSequenceEvent.lineIndex + 1 : 1
  const currentLineIndex = selectedSequenceEvent?.lineIndex ?? 0
  const currentLineText = scoreLines[currentLineIndex] ?? scoreLines[0] ?? ''
  const visibleScoreLines = useMemo(() => {
    const maxEventLine = transcribedSequence.reduce(
      (maxLine, event) => Math.max(maxLine, event.lineIndex),
      0,
    )
    const maxLineIndex = Math.max(scoreLines.length - 1, maxEventLine, 0)

    return [currentLineIndex - 1, currentLineIndex, currentLineIndex + 1]
      .filter((lineIndex) => lineIndex >= 0 && lineIndex <= maxLineIndex)
      .map((lineIndex) => ({
        lineIndex,
        text: scoreLines[lineIndex] ?? '',
        events: transcribedSequence.filter((event) => event.lineIndex === lineIndex),
        position:
          lineIndex < currentLineIndex
            ? 'previous'
            : lineIndex > currentLineIndex
              ? 'next'
              : 'current',
      }))
  }, [currentLineIndex, scoreLines, transcribedSequence])
  const selectedScalePattern = useMemo(
    () => SCALE_PATTERNS.find((pattern) => pattern.id === selectedScalePatternId) ?? SCALE_PATTERNS[0],
    [selectedScalePatternId],
  )
  const selectedScaleExercise = useMemo(() => {
    const tonic = KEY_OPTIONS.find((key) => key.root === sourceKey) ?? KEY_OPTIONS[0]
    return buildScaleExercise(selectedScalePattern, tonic)
  }, [selectedScalePattern, sourceKey])
  const selectedSongValue = useMemo(() => {
    const savedSong = songLibrary.find(
      (song) => song.title === songTitle && song.scoreText === scoreText,
    )

    if (savedSong) {
      return `saved:${savedSong.id}`
    }

    const defaultSong = DEFAULT_SONGS.find(
      (song) => song.title === songTitle && song.scoreText === scoreText,
    )

    if (defaultSong) {
      return `default:${defaultSong.id}`
    }

    return 'current'
  }, [scoreText, songLibrary, songTitle])
  const defaultSongGroups = useMemo(() => groupItemsByCategory(DEFAULT_SONGS), [])
  const savedSongGroups = useMemo(() => groupItemsByCategory(songLibrary), [songLibrary])
  const scaleGroups = useMemo(() => groupItemsByCategory(SCALE_PATTERNS), [])

  useEffect(() => {
    if (selectedSequenceEvent == null) {
      return
    }

    const previousLineIndex = previousLineIndexRef.current
    previousLineIndexRef.current = selectedSequenceEvent.lineIndex

    if (previousLineIndex == null || previousLineIndex === selectedSequenceEvent.lineIndex) {
      return
    }

    setLineMotion(selectedSequenceEvent.lineIndex > previousLineIndex ? 'forward' : 'backward')
    const timeoutId = window.setTimeout(() => setLineMotion('idle'), 420)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [selectedSequenceEvent])

  useEffect(() => {
    applyLocalizedSeo(locale)
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)

    const schemaId = 'cromanota-software-schema'
    let schema = document.getElementById(schemaId)

    if (!schema) {
      schema = document.createElement('script')
      schema.id = schemaId
      schema.type = 'application/ld+json'
      document.head.appendChild(schema)
    }

    schema.textContent = JSON.stringify(buildSoftwareSchema(locale))
  }, [locale])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('cromanota-theme', theme)
  }, [theme])

  useEffect(() => {
    detectedRef.current = detected
  }, [detected])

  useEffect(() => {
    if (playerMode === 'songs') {
      songWorkspaceRef.current = {
        songTitle,
        scoreText,
        sourceKey,
        targetKey,
        tempo,
        instrument,
        songCategory,
      }
      return
    }

    scaleWorkspaceRef.current = {
      sourceKey,
      targetKey,
      tempo,
      instrument,
      selectedScalePatternId,
    }
  }, [
    instrument,
    playerMode,
    scoreText,
    selectedScalePatternId,
    songCategory,
    songTitle,
    sourceKey,
    targetKey,
    tempo,
  ])

  useEffect(() => {
    function handleDocumentPointerDown(event) {
      if (!scoreHelpOpen) {
        return
      }

      if (scoreHelpRef.current?.contains(event.target)) {
        return
      }

      setScoreHelpOpen(false)
    }

    document.addEventListener('pointerdown', handleDocumentPointerDown)

    return () => {
      document.removeEventListener('pointerdown', handleDocumentPointerDown)
    }
  }, [scoreHelpOpen])

  useEffect(() => {
    async function syncAudioInputs() {
      if (!navigator.mediaDevices?.enumerateDevices) {
        return
      }

      const devices = await navigator.mediaDevices.enumerateDevices()
      const inputs = devices.filter((device) => device.kind === 'audioinput')

      setAudioInputs(inputs)

      if (inputs.length === 0) {
        setSelectedInputId('default')
        return
      }

      if (!inputs.some((device) => device.deviceId === selectedInputId)) {
        setSelectedInputId(getPreferredInputId(inputs))
      }
    }

    syncAudioInputs()
  }, [selectedInputId])

  useEffect(() => {
    if (autoplayError || baseEvents.length === 0) {
      return
    }

    window.localStorage.setItem(
      AUTOPLAY_STORAGE_KEY,
      serializeAutoplayState({
        instrument,
        sourceKey,
        targetKey,
        tempo,
        scoreText,
        songTitle,
        songCategory,
        playerMode,
        selectedScalePatternId,
        transcription: {
          instrument,
          targetKey,
          unavailable: transcriptionUnavailable,
          sequence: transcribedSequence,
          baseEvents,
        },
      }),
    )
  }, [
    autoplayError,
    baseEvents,
    instrument,
    sourceKey,
    targetKey,
    tempo,
    scoreText,
    songTitle,
    songCategory,
    playerMode,
    selectedScalePatternId,
    transcriptionUnavailable,
    transcribedSequence,
  ])

  useEffect(() => {
    window.localStorage.setItem(SONG_LIBRARY_STORAGE_KEY, JSON.stringify(songLibrary))
  }, [songLibrary])

  function stopListening() {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    analyserRef.current = null
    detectorRef.current = null
    dataRef.current = null
    pendingDetectionRef.current = null
    lastConfirmedAtRef.current = 0
    lastPositionsRef.current = []
    setDetected(null)
    setInputLevel(0)
    setActiveInputLabel(t('noDevice'))
    setMicState('idle')
  }

  function stopAutoplay({ keepSelection = true } = {}) {
    if (autoplayAdvanceTimeoutRef.current) {
      window.clearTimeout(autoplayAdvanceTimeoutRef.current)
      autoplayAdvanceTimeoutRef.current = 0
    }

    if (autoplayCurrentStopRef.current) {
      autoplayCurrentStopRef.current()
      autoplayCurrentStopRef.current = null
    }

    if (autoplayAudioContextRef.current) {
      autoplayAudioContextRef.current.close()
      autoplayAudioContextRef.current = null
    }

    setAutoplayCurrent(null)
    setAutoplayStatus('idle')
    if (!keepSelection) {
      setAutoplayIndex(-1)
    }
  }

  function pauseAutoplay() {
    if (autoplayAdvanceTimeoutRef.current) {
      window.clearTimeout(autoplayAdvanceTimeoutRef.current)
      autoplayAdvanceTimeoutRef.current = 0
    }

    if (autoplayCurrentStopRef.current) {
      autoplayCurrentStopRef.current()
      autoplayCurrentStopRef.current = null
    }

    if (autoplayAudioContextRef.current) {
      autoplayAudioContextRef.current.close()
      autoplayAudioContextRef.current = null
    }

    setAutoplayCurrent(null)
    setAutoplayStatus('paused')
  }

  function stopPreview() {
    if (previewAudioContextRef.current) {
      previewAudioContextRef.current.close()
      previewAudioContextRef.current = null
    }
  }

  async function previewCellNote(note) {
    if (!note) {
      return
    }

    if (!previewAudioContextRef.current || previewAudioContextRef.current.state === 'closed') {
      previewAudioContextRef.current = new window.AudioContext()
    }

    await previewAudioContextRef.current.resume()
    playHarmonicaTone(previewAudioContextRef.current, note.frequency, 520)
  }

  async function handleManualCellSelection(position) {
    if (!position?.note) {
      return
    }

    if (autoplayStatus === 'playing') {
      pauseAutoplay()
    }

    const isSameSelection =
      manualSelection &&
      manualSelection.hole === position.hole &&
      manualSelection.tone === position.tone &&
      manualSelection.slide === position.slide

    if (isSameSelection) {
      setManualSelection(null)
      setManualOptionsKey('')
      return
    }

    setManualSelection(position)
    setManualOptionsKey(`${position.tone}-${position.hole}`)
    setAutoplayCurrent(null)
    setAutoplayIndex(-1)
    await previewCellNote(position.note)
  }

  function saveCurrentSong() {
    const normalizedTitle = songTitle.trim() || t('untitledSong')
    const normalizedCategory = songCategory.trim() || t('uncategorized')
    const songPayload = {
      id: `${Date.now()}`,
      title: normalizedTitle,
      category: normalizedCategory,
      scoreText,
      sourceKey,
      targetKey,
      tempo,
      instrument,
      updatedAt: Date.now(),
    }

    setSongTitle(normalizedTitle)
    setSongCategory(normalizedCategory)
    setSongLibrary((currentLibrary) => {
      const existingIndex = currentLibrary.findIndex((song) => song.title === normalizedTitle)

      if (existingIndex < 0) {
        return [songPayload, ...currentLibrary]
      }

      return currentLibrary.map((song, index) =>
        index === existingIndex ? { ...song, ...songPayload, id: song.id } : song,
      )
    })
  }

  function applySong(song) {
    const nextSourceKey = Number.isFinite(song.sourceKey) ? song.sourceKey : 0
    const nextTargetKey = Number.isFinite(song.targetKey) ? song.targetKey : 0

    stopAutoplay({ keepSelection: false })
    setManualSelection(null)
    setManualOptionsKey('')
    setSongTitle(song.title)
    setSongCategory(song.category?.trim() || t('uncategorized'))
    setScoreText(song.scoreText)
    setSourceKey(nextSourceKey)
    setTargetKey(nextTargetKey)
    setSelectedKey(nextTargetKey)
    setTempo(song.tempo ?? 92)
    if (song.instrument && TUNINGS[song.instrument]) {
      setInstrument(song.instrument)
    }
  }

  function loadSong(song) {
    applySong(song)
  }

  function applyScaleExerciseByValues(patternId, keyRoot) {
    const pattern = SCALE_PATTERNS.find((item) => item.id === patternId) ?? SCALE_PATTERNS[0]
    const tonic = KEY_OPTIONS.find((key) => key.root === keyRoot) ?? KEY_OPTIONS[0]
    const exercise = buildScaleExercise(pattern, tonic)

    stopAutoplay({ keepSelection: false })
    setManualSelection(null)
    setManualOptionsKey('')
    setSongTitle(exercise.title)
    setSongCategory(exercise.category)
    setScoreText(exercise.scoreText)
  }

  function handleSongSelect(event) {
    const value = event.target.value

    if (value === 'current') {
      return
    }

    const [kind, songId] = value.split(':')
    const song =
      kind === 'default'
        ? DEFAULT_SONGS.find((defaultSong) => defaultSong.id === songId)
        : songLibrary.find((savedSong) => savedSong.id === songId)

    if (song) {
      applySong(song)
    }
  }

  function handleScalePatternSelect(event) {
    const nextPatternId = event.target.value
    setSelectedScalePatternId(nextPatternId)

    if (playerMode === 'scales') {
      applyScaleExerciseByValues(nextPatternId, sourceKey)
    }
  }

  function handleSourceKeyChange(event) {
    const nextKey = Number(event.target.value)
    setSourceKey(nextKey)

    if (playerMode === 'scales') {
      applyScaleExerciseByValues(selectedScalePatternId, nextKey)
    }
  }

  function handlePlayerModeChange(nextMode) {
    if (nextMode === playerMode) {
      return
    }

    setScorePanelOpen(false)
    setScoreHelpOpen(false)

    if (nextMode === 'scales') {
      songWorkspaceRef.current = {
        songTitle,
        songCategory,
        scoreText,
        sourceKey,
        targetKey,
        tempo,
        instrument,
      }

      const savedScaleWorkspace = scaleWorkspaceRef.current
      if (savedScaleWorkspace) {
        const nextPatternId = savedScaleWorkspace.selectedScalePatternId ?? selectedScalePatternId
        const nextSourceKey = savedScaleWorkspace.sourceKey ?? sourceKey
        const nextTargetKey = savedScaleWorkspace.targetKey ?? targetKey

        setSelectedScalePatternId(nextPatternId)
        setSourceKey(nextSourceKey)
        setTargetKey(nextTargetKey)
        setSelectedKey(nextTargetKey)
        setTempo(savedScaleWorkspace.tempo ?? tempo)
        if (savedScaleWorkspace.instrument && TUNINGS[savedScaleWorkspace.instrument]) {
          setInstrument(savedScaleWorkspace.instrument)
        }

        applyScaleExerciseByValues(nextPatternId, nextSourceKey)
      } else {
        applyScaleExerciseByValues(selectedScalePatternId, sourceKey)
      }

      setPlayerMode('scales')
      return
    }

    scaleWorkspaceRef.current = {
      sourceKey,
      targetKey,
      tempo,
      instrument,
      selectedScalePatternId,
    }

    setPlayerMode('songs')

    const savedSongWorkspace = songWorkspaceRef.current
    if (savedSongWorkspace) {
      applySong(savedSongWorkspace)
      return
    }

    applySong(DEFAULT_SONGS[0])
  }

  function renderSongSelect(className = '') {
    return (
      <select className={className} value={selectedSongValue} onChange={handleSongSelect}>
        {selectedSongValue === 'current' ? (
          <option value="current">{songTitle.trim() || t('untitledSong')}</option>
        ) : null}
        {defaultSongGroups.map((group) => (
          <optgroup key={`default-${group.category}`} label={`${t('defaultSongs')} · ${group.category}`}>
            {group.items.map((song) => (
              <option key={song.id} value={`default:${song.id}`}>
                {song.title}
              </option>
            ))}
          </optgroup>
        ))}
        {savedSongGroups.map((group) => (
          <optgroup key={`saved-${group.category}`} label={`${t('savedSongs')} · ${group.category}`}>
            {group.items.map((song) => (
              <option key={song.id} value={`saved:${song.id}`}>
                {song.title}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    )
  }

  function renderScaleSelect(className = '') {
    return (
      <select className={className} value={selectedScalePatternId} onChange={handleScalePatternSelect}>
        {scaleGroups.map((group) => (
          <optgroup key={group.category} label={group.category}>
            {group.items.map((pattern) => (
              <option key={pattern.id} value={pattern.id}>
                {pattern.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    )
  }

  function deleteSong(songId) {
    setSongLibrary((currentLibrary) => currentLibrary.filter((song) => song.id !== songId))
  }

  function startNewSong() {
    stopAutoplay({ keepSelection: false })
    setManualSelection(null)
    setManualOptionsKey('')
    scorePanelSnapshotRef.current = {
      songTitle: songTitle.trim() ? songTitle : DEFAULT_SONG_TITLE,
      songCategory: songCategory.trim() ? songCategory : DEFAULT_SONG_CATEGORY,
      scoreText: scoreText.trim() ? scoreText : DEFAULT_SCORE_TEXT,
      sourceKey,
      targetKey,
      tempo,
      instrument,
    }

    if (!scoreText.trim()) {
      setScoreText(DEFAULT_SCORE_TEXT)
    }

    if (!songTitle.trim()) {
      setSongTitle(DEFAULT_SONG_TITLE)
    }

    if (!songCategory.trim()) {
      setSongCategory(DEFAULT_SONG_CATEGORY)
    }

    setScorePanelOpen(true)
  }

  function closeScorePanel() {
    const snapshot = scorePanelSnapshotRef.current

    if (!scoreText.trim() && snapshot) {
      setSongTitle(snapshot.songTitle)
      setSongCategory(snapshot.songCategory)
      setScoreText(snapshot.scoreText)
      setSourceKey(snapshot.sourceKey)
      setTargetKey(snapshot.targetKey)
      setSelectedKey(snapshot.targetKey)
      setTempo(snapshot.tempo)
      setInstrument(snapshot.instrument)
    }

    setScoreHelpOpen(false)
    setScorePanelOpen(false)
  }

  function setSelectedAutoplayEvent(index) {
    const nextEvent = transcribedSequence[index] ?? null
    setManualSelection(null)
    setManualOptionsKey('')
    setAutoplayIndex(nextEvent ? index : -1)
    setAutoplayCurrent(nextEvent?.type === 'note' && nextEvent.position ? nextEvent : null)
  }

  async function previewSequenceEvent(index) {
    const event = transcribedSequence[index]

    if (!event) {
      return
    }

    setSelectedAutoplayEvent(index)

    if (event.type === 'note' && event.note && event.position) {
      await previewCellNote(event.note)
    }
  }

  async function playSequenceFromIndex(startIndex) {
    if (autoplayError || !transcribedSequence.length) {
      stopAutoplay({ keepSelection: true })
      return
    }

    if (autoplayAdvanceTimeoutRef.current) {
      window.clearTimeout(autoplayAdvanceTimeoutRef.current)
      autoplayAdvanceTimeoutRef.current = 0
    }

    if (autoplayCurrentStopRef.current) {
      autoplayCurrentStopRef.current()
      autoplayCurrentStopRef.current = null
    }

    const safeIndex = Math.max(0, Math.min(startIndex, transcribedSequence.length - 1))
    const playbackContext =
      autoplayAudioContextRef.current && autoplayAudioContextRef.current.state !== 'closed'
        ? autoplayAudioContextRef.current
        : new window.AudioContext()

    autoplayAudioContextRef.current = playbackContext
    await playbackContext.resume()
    setAutoplayStatus('playing')

    const beatMs = 60000 / Math.max(40, tempo)

    const playStep = (index) => {
      const event = transcribedSequence[index]

      if (!event) {
        stopAutoplay({ keepSelection: true })
        return
      }

      if (autoplayCurrentStopRef.current) {
        autoplayCurrentStopRef.current()
        autoplayCurrentStopRef.current = null
      }

      setSelectedAutoplayEvent(index)

      const durationMs = event.duration * beatMs
      const isPlayableNote = event.type === 'note' && event.note && event.position

      if (isPlayableNote) {
        autoplayCurrentStopRef.current = playHarmonicaTone(playbackContext, event.note.frequency, durationMs)
      }

      autoplayAdvanceTimeoutRef.current = window.setTimeout(() => {
        if (index >= transcribedSequence.length - 1) {
          stopAutoplay({ keepSelection: false })
          previousLineIndexRef.current = null
          return
        }

        playStep(index + 1)
      }, durationMs)
    }

    playStep(safeIndex)
  }

  async function navigateAutoplayTo(index) {
    const safeIndex = Math.max(0, Math.min(index, transcribedSequence.length - 1))

    if (autoplayStatus === 'playing') {
      await playSequenceFromIndex(safeIndex)
      return
    }

    await previewSequenceEvent(safeIndex)
  }

  async function navigateByNote(direction) {
    if (!transcribedSequence.length) {
      return
    }

    const baseIndex = autoplayIndex >= 0 ? autoplayIndex : 0
    await navigateAutoplayTo(baseIndex + direction)
  }

  async function navigateByLine(direction) {
    if (!transcribedSequence.length) {
      return
    }

    const baseIndex = autoplayIndex >= 0 ? autoplayIndex : 0
    const currentLine = transcribedSequence[baseIndex]?.lineIndex ?? 0
    const targetLine = currentLine + direction
    const targetIndex = transcribedSequence.findIndex((event) => event.lineIndex === targetLine)

    if (targetIndex >= 0) {
      await navigateAutoplayTo(targetIndex)
    }
  }

  async function handleCopyPrompt() {
    try {
      await navigator.clipboard.writeText(t('autoplayGuidePrompt'))
      setPromptCopied(true)
      window.setTimeout(() => setPromptCopied(false), 1600)
    } catch {
      setPromptCopied(false)
    }
  }

  useEffect(() => {
    return () => {
      stopListening()
      stopAutoplay()
      stopPreview()
    }
    // The cleanup only needs the refs from this mounted instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function analyseFrame() {
    const analyser = analyserRef.current
    const data = dataRef.current
    const audioContext = audioContextRef.current
    if (!analyser || !data || !audioContext) {
      return
    }

    analyser.getFloatTimeDomainData(data)
    const level = calculateLevel(data)
    setInputLevel(level)

    const now = audioContext.currentTime * 1000

    const detector = detectorRef.current
    const [frequency, clarity] = detector
      ? detector.findPitch(data, audioContext.sampleRate)
      : [0, 0]

    if (frequency >= 100 && frequency <= 3000 && clarity >= MIN_CLARITY && level >= MIN_LEVEL) {
      const pitch = frequencyToNoteData(frequency)
      const currentCandidate = pendingDetectionRef.current
      const nextDetection = {
        ...pitch,
        frequency,
        clarity,
        timestamp: now,
      }

      const sameNote =
        currentCandidate &&
        currentCandidate.note.midi === pitch.note.midi &&
        Math.abs(currentCandidate.cents - pitch.cents) <= MAX_DEVIATION_CENTS

      if (!sameNote) {
        pendingDetectionRef.current = nextDetection
      } else if (now - currentCandidate.timestamp >= MIN_SUSTAIN_MS) {
        const matchedPosition = findBestPosition(
          layout,
          pitch.note.midi,
          lastPositionsRef.current[0] ?? null,
        )

        pendingDetectionRef.current = nextDetection
        lastConfirmedAtRef.current = now
        lastPositionsRef.current = matchedPosition ? [matchedPosition] : []
        setDetected({
          note: pitch.note,
          cents: pitch.cents,
          frequency,
          clarity,
          position: matchedPosition,
        })
      }
    } else {
      pendingDetectionRef.current = null

      if (detectedRef.current && now - lastConfirmedAtRef.current >= RELEASE_MS) {
        lastPositionsRef.current = []
        setDetected(null)
      }
    }

    rafRef.current = requestAnimationFrame(analyseFrame)
  }

  async function startListening(inputId = selectedInputId) {
    try {
      stopListening()
      setErrorMessage('')
      setMicState('requesting')

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(t('unsupportedMic'))
      }

      const baseAudioConfig = {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      }

      let stream

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio:
            inputId && inputId !== 'default'
              ? {
                  ...baseAudioConfig,
                  deviceId: { ideal: inputId },
                }
              : baseAudioConfig,
        })
      } catch (deviceError) {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: baseAudioConfig,
        })

        setErrorMessage(`${t('fallbackMic')} ${describeAudioError(deviceError, t)}`)
      }

      const audioContext = new window.AudioContext({ latencyHint: 'interactive' })
      await audioContext.resume()
      const analyser = audioContext.createAnalyser()
      const source = audioContext.createMediaStreamSource(stream)

      analyser.fftSize = 2048
      analyser.smoothingTimeConstant = 0.08
      source.connect(analyser)

      streamRef.current = stream
      const activeTrack = stream.getAudioTracks()[0]
      setActiveInputLabel(activeTrack?.label || t('activeMic'))
      audioContextRef.current = audioContext
      analyserRef.current = analyser
      dataRef.current = new Float32Array(analyser.fftSize)
      detectorRef.current = PitchDetector.forFloat32Array(analyser.fftSize)
      if (navigator.mediaDevices?.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const inputs = devices.filter((device) => device.kind === 'audioinput')
        setAudioInputs(inputs)

        if (
          activeTrack?.label &&
          inputs.some((device) => device.label === activeTrack.label) &&
          selectedInputId === 'default'
        ) {
          const matched = inputs.find((device) => device.label === activeTrack.label)

          if (matched?.deviceId) {
            setSelectedInputId(matched.deviceId)
          }
        }
      }

      setMicState('listening')
      analyseFrame()
    } catch (error) {
      setMicState('error')
      setErrorMessage(
        error instanceof Error
          ? error.message
          : t('noMicAccess'),
      )
    }
  }

  async function handleInputChange(event) {
    const nextInputId = event.target.value
    const shouldRestart = micState === 'listening'

    setSelectedInputId(nextInputId)

    if (shouldRestart) {
      stopListening()
      await startListening(nextInputId)
    }
  }

  async function handleAutoplay() {
    if (autoplayError || !transcribedSequence.length) {
      stopAutoplay({ keepSelection: true })
      return
    }

    const startIndex = autoplayIndex >= 0 ? autoplayIndex : 0
    stopAutoplay({ keepSelection: true })
    await playSequenceFromIndex(startIndex)
  }

  const liveNote = manualSelection ?? autoplayCurrent ?? selectedSequenceEvent ?? detected
  const activePositions = liveNote?.position ? [liveNote.position] : []
  const holeStates = layout.map((column) => {
    const drawPosition = activePositions.find(
      (position) => position.hole === column.hole && position.tone === 'draw',
    )
    const blowPosition = activePositions.find(
      (position) => position.hole === column.hole && position.tone === 'blow',
    )

    return {
      hole: column.hole,
      drawMode: drawPosition ? (drawPosition.slide ? 'slide' : 'natural') : null,
      blowMode: blowPosition ? (blowPosition.slide ? 'slide' : 'natural') : null,
    }
  })

  const activeSlide = Boolean(liveNote?.position?.slide)
  const getHoleDisplay = (hole) => {
    if (instrument !== '64') {
      return {
        label: hole,
        isLow: false,
      }
    }

    return {
      label: hole <= 4 ? hole : hole - 4,
      isLow: hole <= 4,
    }
  }

  return (
    <main className="app-shell">
      <nav className="top-nav" aria-label={t('mainControls')}>
        <div className="brand-lockup">
          <div className="brand-logo" aria-hidden="true">
            <span></span>
            <span></span>
          </div>
          <div>
            <p className="brand-kicker">{t('project')}</p>
            <h1 className="brand-title">CromaNota</h1>
          </div>
        </div>

        <div className="nav-controls">
          <label className="input-select key-select">
            <span>{t('key')}</span>
            <select
              value={selectedKey}
              onChange={(event) => setSelectedKey(Number(event.target.value))}
            >
              {KEY_OPTIONS.map((key) => (
                <option key={key.label} value={key.root}>
                  {key.label} {t('major')}
                </option>
              ))}
            </select>
          </label>

          <div className="instrument-toggle" role="tablist" aria-label={t('harmonicaType')}>
            {Object.entries(TUNINGS).map(([key, value]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={instrument === key}
                className={instrument === key ? 'toggle-chip active' : 'toggle-chip'}
                onClick={() => setInstrument(key)}
              >
                <span>{value.reeds} {t('voices')}</span>
                <small>{value.holes} {t('holes')}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="menu-controls">
          <label className="input-select locale-select">
            <span>{t('language')}</span>
            <select value={locale} onChange={(event) => setLocale(event.target.value)}>
              {SUPPORTED_LOCALES.map((supportedLocale) => (
                <option key={supportedLocale} value={supportedLocale}>
                  {LOCALE_LABELS[supportedLocale] ?? supportedLocale.toUpperCase()}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="theme-toggle"
            onClick={() => setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))}
            aria-label={theme === 'dark' ? t('enableLight') : t('enableDark')}
          >
            <span aria-hidden="true">{theme === 'dark' ? '☼' : '●'}</span>
            <span>{theme === 'dark' ? t('light') : t('dark')}</span>
          </button>
        </div>
      </nav>

      <section className="layout-panel">
        <div className="orientation-prompt" role="status">
          <span className="phone-rotate" aria-hidden="true"></span>
          <strong>{t('rotateTitle')}</strong>
          <span>{t('rotateDescription')}</span>
        </div>

        <header className="app-intro">
          <small>
            {t('developedBy')} ·{' '}
            <a className="contact-link" href="mailto:emilrichardo@gmail.com">
              emilrichardo@gmail.com
            </a>
          </small>
        </header>

        <div
          className="note-readout-hero layout-note-readout"
          aria-label={t('liveRegionLabel')}
          aria-live="polite"
        >
          <div className="note-main">
            {liveNote ? liveNote.note.shortLabel : ''}
            {liveNote?.note.alt ? (
              <span className="enharmonic">/{liveNote.note.alt}</span>
            ) : null}
          </div>
          <div className="mini-metrics">
            <strong>{detected ? `${detected.frequency.toFixed(1)} Hz` : autoplayCurrent ? t('autoplayPlaying') : ''}</strong>
            <strong>{detected ? formatCents(detected.cents, t) : autoplayCurrent ? autoplayCurrent.note.label : ''}</strong>
            <strong>
              {liveNote?.position
                ? `${liveNote.position.tone === 'draw' ? t('draw') : t('blow')} · ${t('hole')} ${liveNote.position.hole}`
                : ''}
            </strong>
          </div>
        </div>

        <div className="harmonica-scroll" dir="ltr">
          <div
            className="harmonica-frame"
            style={{ '--holes': layout.length, '--harmonica-width': `${layout.length * 70 + 126}px` }}
          >
            <div className="harmonica-mouthpiece"></div>
            <div className="harmonica-body">
              <div className="holes-row draw-row">
                <div
                  className="holes-grid"
                  style={{ gridTemplateColumns: `repeat(${layout.length}, minmax(0, 1fr))` }}
                >
                  {layout.map((column, index) => {
                    const display = getHoleDisplay(column.hole)

                    return (
                      <HoleBubble
                        key={`${column.hole}-draw`}
                        note={column.draw}
                        slideNote={column.drawSlide}
                        mode={holeStates[index].drawMode}
                        tone="draw"
                        hole={display.label}
                        lowHole={display.isLow}
                        showNumber
                        altered={isScaleAlteration(column.draw, selectedKey)}
                        onPreview={handleManualCellSelection}
                        basePosition={{
                          hole: column.hole,
                          tone: 'draw',
                          slide: false,
                          note: column.draw,
                        }}
                        slidePosition={{
                          hole: column.hole,
                          tone: 'draw',
                          slide: true,
                          note: column.drawSlide,
                        }}
                        showOptions={manualOptionsKey === `draw-${column.hole}`}
                      />
                    )
                  })}
                </div>
              </div>
              <div className="holes-row blow-row">
                <div
                  className="holes-grid"
                  style={{ gridTemplateColumns: `repeat(${layout.length}, minmax(0, 1fr))` }}
                >
                  {layout.map((column, index) => (
                    <HoleBubble
                      key={`${column.hole}-blow`}
                      note={column.blow}
                      slideNote={column.blowSlide}
                      mode={holeStates[index].blowMode}
                      tone="blow"
                      hole={column.hole}
                      altered={isScaleAlteration(column.blow, selectedKey)}
                      onPreview={handleManualCellSelection}
                      basePosition={{
                        hole: column.hole,
                        tone: 'blow',
                        slide: false,
                        note: column.blow,
                      }}
                      slidePosition={{
                        hole: column.hole,
                        tone: 'blow',
                        slide: true,
                        note: column.blowSlide,
                      }}
                      showOptions={manualOptionsKey === `blow-${column.hole}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className={activeSlide ? 'slider-lever active' : 'slider-lever'}>
              <div className="slider-knob"></div>
            </div>
          </div>
        </div>
      </section>

      <section className="autoplay-panel" aria-label={t('autoplayTitle')}>
        <div className="score-panel-shell">
          <div className="score-panel-launcher">
            <div className="player-mode-tabs" role="tablist" aria-label={t('playerModeLabel')}>
              <button
                type="button"
                role="tab"
                aria-selected={playerMode === 'songs'}
                className={playerMode === 'songs' ? 'player-mode-tab active' : 'player-mode-tab'}
                onClick={() => handlePlayerModeChange('songs')}
              >
                {t('songsTab')}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={playerMode === 'scales'}
                className={playerMode === 'scales' ? 'player-mode-tab active' : 'player-mode-tab'}
                onClick={() => handlePlayerModeChange('scales')}
              >
                {t('scalesTab')}
              </button>
            </div>

            <div className={scorePanelOpen ? 'score-panel-trigger active' : 'score-panel-trigger'}>
              <span className="score-panel-trigger-copy">
                <small>{playerMode === 'songs' ? t('songsTab') : t('scalesTab')}</small>
                {playerMode === 'songs' ? renderSongSelect('home-song-select') : renderScaleSelect('home-song-select')}
                <div
                  key={`${currentLineIndex}-${lineMotion}`}
                  className={`score-line-stack ${lineMotion !== 'idle' ? `line-${lineMotion}` : ''}`}
                >
                  {visibleScoreLines.map((line) => (
                    <div key={line.lineIndex} className={`score-line-row ${line.position}`}>
                      <em className="score-current-line">{`${t('line')} ${line.lineIndex + 1}`}</em>
                      <span className="score-line-events">
                        {line.events.length > 0 ? (
                          line.events.map((event) => (
                            <button
                              key={event.id}
                              type="button"
                              className={selectedSequenceEvent?.id === event.id ? 'score-event-chip active' : 'score-event-chip'}
                              onClick={() => navigateAutoplayTo(transcribedSequence.findIndex((item) => item.id === event.id))}
                            >
                              {event.type === 'rest' ? 'R' : event.note.label}
                            </button>
                          ))
                        ) : (
                          <span className="score-event-chip muted">
                            {line.text || currentLineText || t('autoplayFormat')}
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </span>
              {playerMode === 'songs' ? (
                <button
                  type="button"
                  className="load-notes-button"
                  onClick={startNewSong}
                  aria-expanded={scorePanelOpen}
                  aria-controls="score-options-panel"
                >
                  <span>+</span>
                  {t('loadNewSong')}
                </button>
              ) : (
                <span className="scale-practice-badge">{selectedScaleExercise.category}</span>
              )}
            </div>

            <div className="score-playback-console">
              {transcribedSequence.length > 0 ? (
                <div className="score-panel-mini-nav" aria-label={t('autoplayNavigation')}>
                  <button type="button" className="mini-nav-button" onClick={() => navigateByLine(-1)} aria-label={t('prevLine')}>
                    «
                  </button>
                  <button type="button" className="mini-nav-button" onClick={() => navigateByNote(-1)} aria-label={t('prevNote')}>
                    ‹
                  </button>
                  <button
                    type="button"
                    className={autoplayStatus === 'playing' ? 'mini-nav-button active' : 'mini-nav-button'}
                    onClick={autoplayStatus === 'playing' ? pauseAutoplay : handleAutoplay}
                    aria-label={autoplayStatus === 'playing' ? t('pause') : t('autoplayPlay')}
                    aria-pressed={autoplayStatus === 'playing'}
                  >
                    {autoplayStatus === 'playing' ? '❚❚' : '▶'}
                  </button>
                  <button type="button" className="mini-nav-button" onClick={() => navigateByNote(1)} aria-label={t('nextNote')}>
                    ›
                  </button>
                  <button type="button" className="mini-nav-button" onClick={() => navigateByLine(1)} aria-label={t('nextLine')}>
                    »
                  </button>
                </div>
              ) : null}

              <div className="score-player-controls" role="group" aria-label={t('autoplayTitle')}>
                <label className="player-setting">
                  <span>{playerMode === 'scales' ? t('scaleTonic') : t('autoplaySourceKey')}</span>
                  <select value={sourceKey} onChange={handleSourceKeyChange}>
                    {KEY_OPTIONS.map((key) => (
                      <option key={`player-source-${key.label}`} value={key.root}>
                        {key.label} {t('major')}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="player-setting">
                  <span>{t('autoplayTargetKey')}</span>
                  <select
                    value={targetKey}
                    onChange={(event) => {
                      const nextKey = Number(event.target.value)
                      setTargetKey(nextKey)
                      setSelectedKey(nextKey)
                    }}
                  >
                    {KEY_OPTIONS.map((key) => (
                      <option key={`player-target-${key.label}`} value={key.root}>
                        {key.label} {t('major')}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="player-setting tempo-setting">
                  <span>{t('autoplayTempo')}</span>
                  <input
                    type="number"
                    min="40"
                    max="220"
                    value={tempo}
                    onChange={(event) => setTempo(Number(event.target.value))}
                  />
                </label>
              </div>
            </div>
          </div>

          {scorePanelOpen ? (
              <div
                id="score-options-panel"
                className="score-panel drawer-open"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="score-panel-header">
                  <div>
                    <h2>{t('loadNewSong')}</h2>
                  </div>
                  <div className="score-panel-actions">
                    <div ref={scoreHelpRef} className="score-panel-info">
                      <button
                        type="button"
                        className="score-panel-info-toggle"
                        aria-label={t('autoplayInfoLabel')}
                        onClick={() => setScoreHelpOpen((current) => !current)}
                      >
                        i
                      </button>
                      {scoreHelpOpen ? (
                        <div className="score-panel-info-card">
                          <strong>{t('autoplayGuideTitle')}</strong>
                          <p>{t('autoplayGuideIntro')}</p>
                          <ol className="score-guide-steps">
                            <li>{t('autoplayGuideStep1')}</li>
                            <li>{t('autoplayGuideStep2')}</li>
                            <li>{t('autoplayGuideStep3')}</li>
                          </ol>
                          <div className="score-guide-prompt">
                            <div className="score-guide-prompt-head">
                              <span>{t('autoplayGuidePromptLabel')}</span>
                              <button type="button" className="copy-prompt-button" onClick={handleCopyPrompt}>
                                {promptCopied ? t('copied') : t('copy')}
                              </button>
                            </div>
                            <pre>{t('autoplayGuidePrompt')}</pre>
                          </div>
                        </div>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      className="score-panel-close"
                      onClick={closeScorePanel}
                      aria-label={t('closePanel')}
                    >
                      ×
                    </button>
                  </div>
                </div>

                <div className="autoplay-grid">
                  <div className="score-input-stack">
                    <label className="autoplay-score song-title-field">
                      <span>{t('songTitle')}</span>
                      {renderSongSelect()}
                    </label>
                    <label className="autoplay-score song-title-field">
                      <span>{t('songCategory')}</span>
                      <input
                        type="text"
                        value={songCategory}
                        onChange={(event) => setSongCategory(event.target.value)}
                        placeholder={t('uncategorized')}
                      />
                    </label>
                    <label className="autoplay-score">
                      <span>{t('autoplayScore')}</span>
                      <textarea
                        value={scoreText}
                        onChange={(event) => setScoreText(event.target.value)}
                        placeholder={t('autoplayPlaceholder')}
                      />
                    </label>
                    <button
                      type="button"
                      className="score-guide-button"
                      onClick={() => setScoreHelpOpen((current) => !current)}
                    >
                      {t('autoplayGuideButton')}
                    </button>

                    <section className="song-library" aria-label={t('playlist')}>
                      <div className="song-library-head">
                        <strong>{t('playlist')}</strong>
                        <button type="button" className="save-song-button" onClick={saveCurrentSong}>
                          {t('saveSong')}
                        </button>
                      </div>
                      {songLibrary.length > 0 ? (
                        <div className="song-library-list">
                          {songLibrary.map((song) => (
                            <article key={song.id} className="song-library-item">
                              <button type="button" className="song-library-load" onClick={() => loadSong(song)}>
                                <strong>{song.title}</strong>
                                <span>{`${song.category || t('uncategorized')} · ${song.tempo} bpm · ${KEY_OPTIONS.find((key) => key.root === song.targetKey)?.label ?? 'C'}`}</span>
                              </button>
                              <button type="button" className="song-icon-button" onClick={() => loadSong(song)} aria-label={t('editSong')}>
                                ✎
                              </button>
                              <button type="button" className="song-icon-button danger" onClick={() => deleteSong(song.id)} aria-label={t('deleteSong')}>
                                ×
                              </button>
                            </article>
                          ))}
                        </div>
                      ) : (
                        <p className="song-library-empty">{t('emptyPlaylist')}</p>
                      )}
                    </section>
                  </div>

                </div>

                <div className="autoplay-panel-footer">
                  <div className="autoplay-meta">
                    <strong>{savedLabel}</strong>
                    <span>{`${t('line')} ${currentLineLabel} · ${currentLineText || t('autoplayFormat')}`}</span>
                  </div>

                  <button type="button" className="save-song-button wide" onClick={saveCurrentSong}>
                    {t('saveSong')}
                  </button>

                  <div className="autoplay-nav-row">
                    <button type="button" className="secondary-button" onClick={() => navigateByLine(-1)} aria-label={t('prevLine')}>
                      «
                    </button>
                    <button type="button" className="secondary-button" onClick={() => navigateByNote(-1)} aria-label={t('prevNote')}>
                      ‹
                    </button>
                    <button
                      type="button"
                      className={autoplayStatus === 'playing' ? 'secondary-button active' : 'secondary-button'}
                      onClick={autoplayStatus === 'playing' ? pauseAutoplay : handleAutoplay}
                      aria-label={autoplayStatus === 'playing' ? t('pause') : t('autoplayPlay')}
                      aria-pressed={autoplayStatus === 'playing'}
                    >
                      {autoplayStatus === 'playing' ? '❚❚' : '▶'}
                    </button>
                    <button type="button" className="secondary-button" onClick={() => navigateByNote(1)} aria-label={t('nextNote')}>
                      ›
                    </button>
                    <button type="button" className="secondary-button" onClick={() => navigateByLine(1)} aria-label={t('nextLine')}>
                      »
                    </button>
                  </div>

                  <div className="autoplay-action-row">
                    {autoplayStatus === 'playing' || autoplayStatus === 'paused' ? (
                      <button type="button" className="primary-button autoplay-single-action" onClick={() => stopAutoplay({ keepSelection: false })}>
                        <span className="button-icon" aria-hidden="true">■</span>
                        <span>{t('stop')}</span>
                      </button>
                    ) : (
                      <button type="button" className="primary-button autoplay-single-action" onClick={handleAutoplay}>
                        <span className="button-icon" aria-hidden="true">▶</span>
                        <span>{t('autoplayPlay')}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
          ) : null}
        </div>

        {autoplayError ? <p className="error-text">{autoplayError}</p> : null}
      </section>

      <section className="detector-footer">
        <label className="input-select">
          <span>{t('mic')}</span>
          <select
            value={selectedInputId}
            onChange={handleInputChange}
            disabled={micState === 'requesting'}
          >
            <option value="default">{t('defaultMic')}</option>
            {audioInputs
              .filter((device) => device.deviceId && device.deviceId !== 'default')
              .map((device, index) => (
                <option key={device.deviceId || `device-${index}`} value={device.deviceId || 'default'}>
                  {device.label || `${t('mic')} ${index + 1}`}
                </option>
              ))}
          </select>
        </label>

        <div className="level-panel compact-level">
          <div className="level-labels">
            <span>{activeInputLabel}</span>
            <strong>{Math.round(inputLevel * 100)}%</strong>
          </div>
          <div className="level-meter" aria-hidden="true">
            <div
              className="level-fill"
              style={{ transform: `scaleX(${Math.max(0.03, inputLevel)})` }}
            ></div>
          </div>
        </div>

        <div className="detector-topline">
          <span className={`status-dot status-${micState}`}></span>
          <span>
            {micState === 'listening' && t('listening')}
            {micState === 'requesting' && t('requesting')}
            {micState === 'idle' && t('idle')}
            {micState === 'error' && t('error')}
          </span>
        </div>

        <div className="detector-actions compact-actions">
          {micState === 'listening' ? (
            <button type="button" className="primary-button" onClick={stopListening}>
              <span className="button-icon" aria-hidden="true">■</span>
              <span>{t('stop')}</span>
            </button>
          ) : (
            <button
              type="button"
              className="primary-button"
              onClick={() => startListening()}
              disabled={micState === 'requesting'}
            >
              <span className="button-icon" aria-hidden="true">◉</span>
              <span>{micState === 'requesting' ? t('permission') : t('listen')}</span>
            </button>
          )}
          {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
        </div>
      </section>
    </main>
  )
}

function HoleBubble({
  note,
  slideNote,
  mode,
  tone,
  hole,
  showNumber = false,
  lowHole = false,
  altered = false,
  onPreview,
  basePosition,
  slidePosition,
  showOptions = false,
}) {
  const active = mode !== null
  const isSlide = mode === 'slide'
  const displayedNote = isSlide ? slideNote : note
  const bubbleClass = `hole-bubble ${tone} ${active ? 'active' : ''} ${isSlide ? 'slide-on' : ''} ${altered ? 'altered' : ''}`.trim()
  const numberClass = lowHole ? 'hole-number low-hole' : 'hole-number'

  function handleClick() {
    onPreview?.(basePosition ?? { hole, tone, slide: false, note })
  }

  return (
    <span className="hole-bubble-wrap">
      {showOptions ? (
        <span className={`cell-option-popover ${tone === 'draw' ? 'up' : 'down'}`}>
          <button type="button" onClick={() => onPreview?.(basePosition ?? { hole, tone, slide: false, note })}>
            {note.shortLabel}
          </button>
          <button type="button" onClick={() => onPreview?.(slidePosition ?? { hole, tone, slide: true, note: slideNote })}>
            BTN {slideNote.shortLabel}
          </button>
        </span>
      ) : null}
      <button
        type="button"
        className={bubbleClass}
        onClick={handleClick}
        title={`Click: ${displayedNote.label}${isSlide ? ' · BTN' : ''}`}
        aria-label={`${tone} ${hole}. ${displayedNote.label}${isSlide ? '. Boton presionado' : ''}`}
      >
        {showNumber ? <span className={numberClass}>{hole}</span> : null}
        <strong>{displayedNote.shortLabel}</strong>
        {isSlide ? (
          <em className="slide-flag">BTN</em>
        ) : null}
      </button>
    </span>
  )
}

export default App
