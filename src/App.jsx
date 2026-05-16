import { useEffect, useRef, useState } from 'react'
import { PitchDetector } from 'pitchy'
import './App.css'

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const ENHARMONIC_LABELS = {
  'C#': 'Db',
  'D#': 'Eb',
  'F#': 'Gb',
  'G#': 'Ab',
  'A#': 'Bb',
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

  for (let i = 0; i < buffer.length; i += 1) {
    sum += buffer[i] * buffer[i]
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

function formatCents(cents) {
  if (cents === 0) {
    return 'afinada'
  }

  return `${cents > 0 ? '+' : ''}${cents} cents`
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

function describeAudioError(error) {
  if (!(error instanceof Error)) {
    return 'No se pudo acceder al micrófono.'
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

function App() {
  const [instrument, setInstrument] = useState('64')
  const [micState, setMicState] = useState('idle')
  const [detected, setDetected] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [inputLevel, setInputLevel] = useState(0)
  const [audioInputs, setAudioInputs] = useState([])
  const [selectedInputId, setSelectedInputId] = useState('default')
  const [activeInputLabel, setActiveInputLabel] = useState('Sin dispositivo')
  const [selectedKey, setSelectedKey] = useState(0)
  const [theme, setTheme] = useState(() => {
    const savedTheme = window.localStorage.getItem('cromanota-theme')

    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme
    }

    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
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

  const tuning = TUNINGS[instrument]
  const layout = buildLayout(tuning)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('cromanota-theme', theme)
  }, [theme])

  useEffect(() => {
    detectedRef.current = detected
  }, [detected])

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
    setActiveInputLabel('Sin dispositivo')
    setMicState('idle')
  }

  useEffect(() => {
    return () => {
      stopListening()
    }
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
        throw new Error('Este navegador no expone getUserMedia para el microfono.')
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

        setErrorMessage(`Fallback al micrófono por defecto tras error: ${describeAudioError(deviceError)}`)
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
      setActiveInputLabel(activeTrack?.label || 'Micrófono activo')
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
          : 'No se pudo acceder al micrófono.',
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

  const activePositions = detected?.position ? [detected.position] : []
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

  const activeSlide = Boolean(detected?.position?.slide)
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
      <nav className="top-nav" aria-label="Controles principales">
        <div className="brand-lockup">
          <div className="brand-logo" aria-hidden="true">
            <span></span>
            <span></span>
          </div>
          <div>
            <p className="brand-kicker">Proyecto</p>
            <h1 className="brand-title">CromaNota</h1>
          </div>
        </div>

        <div className="nav-controls">
          <label className="input-select key-select">
            <span>Tonalidad</span>
            <select
              value={selectedKey}
              onChange={(event) => setSelectedKey(Number(event.target.value))}
            >
              {KEY_OPTIONS.map((key) => (
                <option key={key.label} value={key.root}>
                  {key.label} mayor
                </option>
              ))}
            </select>
          </label>

          <div className="instrument-toggle" role="tablist" aria-label="Tipo de armonica">
            {Object.entries(TUNINGS).map(([key, value]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={instrument === key}
                className={instrument === key ? 'toggle-chip active' : 'toggle-chip'}
                onClick={() => setInstrument(key)}
              >
                <span>{value.label}</span>
                <small>{value.holes} agujeros</small>
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="theme-toggle"
          onClick={() => setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))}
          aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
        >
          <span aria-hidden="true">{theme === 'dark' ? '☼' : '●'}</span>
          <span>{theme === 'dark' ? 'Claro' : 'Dark'}</span>
        </button>
      </nav>

      <section className="layout-panel">
        <div className="orientation-prompt" role="status">
          <span className="phone-rotate" aria-hidden="true"></span>
          <strong>Gira la pantalla</strong>
          <span>Usala horizontal para ver la armonica completa.</span>
        </div>

        <header className="app-intro">
          <p className="intro-kicker">Detector cromático en vivo</p>
          <h2>CromaNota escucha tu armonica</h2>
          <p>Visualiza la celda exacta, el uso de palanca y las alteraciones segun la tonalidad.</p>
          <small>
            Desarrollado por Emil Gonzalez ·{' '}
            <a className="contact-link" href="mailto:emilrichardo@gmail.com">
              emilrichardo@gmail.com
            </a>
          </small>
        </header>

        <div className="note-readout-hero layout-note-readout" aria-live="polite">
          <div className="note-main">
            {detected ? detected.note.shortLabel : ''}
            {detected?.note.alt ? (
              <span className="enharmonic">/{detected.note.alt}</span>
            ) : null}
          </div>
          <div className="mini-metrics">
            <strong>{detected ? `${detected.frequency.toFixed(1)} Hz` : ''}</strong>
            <strong>{detected ? formatCents(detected.cents) : ''}</strong>
            <strong>
              {detected?.position
                ? `${detected.position.tone === 'draw' ? 'Aspirada' : 'Soplada'} · Agujero ${detected.position.hole}`
                : ''}
            </strong>
          </div>
        </div>

        <div className="harmonica-scroll">
          <div className="harmonica-frame">
            <div className="harmonica-mouthpiece"></div>
            <div className="harmonica-body" style={{ '--holes': layout.length }}>
              <div className="holes-row draw-row">
                <div
                  className="holes-grid"
                  style={{ gridTemplateColumns: `repeat(${layout.length}, minmax(0, 1fr))` }}
                >
                {layout.map((column, index) => (
                  (() => {
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
                      />
                    )
                  })()
                ))}
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

      <section className="detector-footer">
        <label className="input-select">
          <span>Mic</span>
          <select
            value={selectedInputId}
            onChange={handleInputChange}
            disabled={micState === 'requesting'}
          >
            <option value="default">Micrófono por defecto</option>
            {audioInputs
              .filter((device) => device.deviceId && device.deviceId !== 'default')
              .map((device, index) => (
                <option key={device.deviceId || `device-${index}`} value={device.deviceId || 'default'}>
                  {device.label || `Micrófono ${index + 1}`}
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
            {micState === 'listening' && 'Escuchando'}
            {micState === 'requesting' && 'Pidiendo permiso'}
            {micState === 'idle' && 'Microfono apagado'}
            {micState === 'error' && 'Error'}
          </span>
        </div>

        <div className="detector-actions compact-actions">
          {micState === 'listening' ? (
            <button type="button" className="primary-button" onClick={stopListening}>
              <span className="button-icon" aria-hidden="true">■</span>
              <span>Detener</span>
            </button>
          ) : (
            <button
              type="button"
              className="primary-button"
              onClick={() => startListening()}
              disabled={micState === 'requesting'}
            >
              <span className="button-icon" aria-hidden="true">◉</span>
              <span>{micState === 'requesting' ? 'Permiso...' : 'Escuchar'}</span>
            </button>
          )}
          {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
        </div>
      </section>
    </main>
  )
}

function HoleBubble({ note, slideNote, mode, tone, hole, showNumber = false, lowHole = false, altered = false }) {
  const active = mode !== null
  const isSlide = mode === 'slide'
  const bubbleClass = `hole-bubble ${tone} ${active ? 'active' : ''} ${isSlide ? 'slide-on' : ''} ${altered ? 'altered' : ''}`.trim()
  const numberClass = lowHole ? 'hole-number low-hole' : 'hole-number'

  return (
    <div className={bubbleClass}>
      {showNumber ? <span className={numberClass}>{hole}</span> : null}
      <strong>{note.shortLabel}</strong>
      {isSlide ? (
        <em className="slide-flag">BTN {slideNote.shortLabel}</em>
      ) : null}
    </div>
  )
}

export default App
