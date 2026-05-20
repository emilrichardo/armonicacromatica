# CromaNota - Prompt para Recrear la Aplicación con Otro Framework

## Descripción General del Proyecto

**Nombre del Proyecto:** CromaNota
**Tipo:** Aplicación web interactiva (SPA)
**Funcionalidad Principal:** Detector de notas de armónica cromática en tiempo real con reproductor de melodías automático

## Stack Tecnológico Actual (Referencia)

- React 19.2.6 con Vite 8.0.12
- Librería pitchy 4.1.0 para detección de tono
- CSS moderno con variables CSS y diseño responsive

---

# Skills Recomendadas para Instalar

Antes de comenzar a programar, descarga e instala las siguientes skills desde skill.sh. Estas te proporcionarán guidance específico para crear una interfaz de alta calidad:

## Cómo Instalar Skills desde skill.sh

```bash
# Usando opencode, carga las skills desde skill.sh
opencode skill add vite
opencode skill add frontend-design
opencode skill add web-design-guidelines
opencode skill add ui-ux-pro-max
opencode skill add vercel-react-best-practices
```

O manualmente, descarga cada skill de skill.sh y colócala en la carpeta `.agents/skills/` de tu proyecto.

## Skills Obligatorias

### 1. vite
- **Descargar de:** `https://skill.sh/s/vite` o busca "vite" en skill.sh
- **Propósito:** Configuración del build tool y servidor de desarrollo.
- **Cuándo usarla:** Al configurar el proyecto, configurar vite.config.js, resolver problemas de build, o configurar plugins.
- **Referencia:** Proporciona instrucciones para Vite 8 y migración a Rolldown.

### 2. frontend-design
- **Descargar de:** `https://skill.sh/s/frontend-design` o busca "frontend-design" en skill.sh
- **Propósito:** Crear interfaces web distintivas y de grado producción.
- **Cuándo usarla:** Al diseñar y construir componentes UI, páginas, o cualquier elemento visual de la aplicación.
- **Referencia:** Genera código creativo y pulido evitando estéticas genéricas de IA.

### 3. web-design-guidelines
- **Descargar de:** `https://skill.sh/s/web-design-guidelines` o busca "web-design-guidelines" en skill.sh
- **Propósito:** Revisar el código UI contra mejores prácticas de interfaces web.
- **Cuándo usarla:** Al terminar componentes UI, para verificar que cumplen con estándares de accesibilidad, diseño responsive, y UX.
- **Referencia:** Proporciona guidelines de accesibilidad, layout, tipografía, colores, etc.

## Skills Opcionales (según framework elegido)

### Si usas React/Next.js:
### 4. vercel-react-best-practices
- **Descargar de:** `https://skill.sh/s/vercel-react-best-practices` o busca "vercel-react" en skill.sh
- **Propósito:** Patrones de optimización de rendimiento para React.
- **Cuándo usarla:** Al escribir código React, para asegurar patrones óptimos de rendimiento.
- **Referencia:** Directrices de ingeniería de Vercel para React.

### Si usas Vue, Svelte, o framework con componentes:
### 5. ui-ux-pro-max
- **Descargar de:** `https://skill.sh/s/ui-ux-pro-max` o busca "ui-ux" en skill.sh
- **Propósito:** Inteligencia de diseño UI/UX para web y móvil.
- **Cuándo usarla:** Al planificar, construir, diseñar, implementar, o revisar componentes UI.
- **Referencia:** 50+ estilos, 161 paletas de colores, 57 combinaciones de fuentes, y más.

---

# Cómo Usar Estas Skills

Una vez instaladas, cárgalas cuando las necesites:

```bash
# Cargar una skill específica
skill name=vite
skill name=frontend-design
skill name=web-design-guidelines
```

Durante el desarrollo, cuando necesites guidance específico:
- Para configuración de build → usa la skill **vite**
- Para crear componentes UI → usa **frontend-design**
- Para revisar tu código → usa **web-design-guidelines**

Cada skill proporciona instrucciones detalladas y puede acceder a datos de referencia (tipografía, colores, layouts, etc.) para asegurar que tu implementación cumpla con estándares de calidad.

---

# Especificación de Funcionalidades

## 1. Detector de Notas en Tiempo Real

### 1.1 Captura de Audio

- Usar Web Audio API (`navigator.mediaDevices.getUserMedia`)
- Configuración de audio: `echoCancellation: false`, `noiseSuppression: false`, `autoGainControl: false`
- AnalyserNode con `fftSize: 2048` y `smoothingTimeConstant: 0.08`
- Selección de dispositivo de audio (mostrar lista de dispositivos disponibles)
- Fallback automático si el dispositivo seleccionado no está disponible

### 1.2 Detección de Tono

- Usar PitchDetector (biblioteca pitchy) para detección de frecuencia fundamental
- Rango de frecuencia válido: 100 Hz - 3000 Hz
- Claridad mínima (clarity): 0.75
- Nivel mínimo de audio: 0.02
- Tiempo de sostenimiento mínimo: 120ms para confirmar nota
- Tiempo de liberación (release): 120ms

### 1.3 Conversión Frecuencia-Nota

- Fórmula MIDI: `midi = Math.round(12 * Math.log2(frequency / 440) + 69)`
- Conversión a nota: extraer índice de nota (0-11) y octava
- Nombre de notas: `['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']`
- Notas enarmónicas: `C#=Db, D#=Eb, F#=Gb, G#=Ab, A#=Bb`
- Desviación en cents: `cents = Math.round(1200 * Math.log2(frequency / targetFrequency))`

### 1.4 Posicionamiento en la Armónica

- Para cada nota MIDI detectada, encontrar la mejor posición en la armónica
- Considerar: agujero, blows, draws, slide on/off
- Algoritmo de selección:

  1. Buscar notas que coincidan con MIDI
  2. Preferir celdas Do/Re (blow C / draw D) para notas C/C#
  3. Preferir misma celda para transiciones C#->B
  4. Calcular score: distancia entre agujeros + cambio de blow/draw + cambio de slide
  5. Ordenar por menor score

---

## 2. Armónica Visual

### 2.1 Configuraciones de Armónica

**48 voces (12 agujeros):**

- Blow: `[60, 64, 67, 72, 72, 76, 79, 84, 84, 88, 91, 96]`
- Draw: `[62, 65, 69, 71, 74, 77, 81, 83, 86, 89, 93, 95]`
- Rango: C4 - D7

**64 voces (16 agujeros):**

- Blow: `[48, 52, 55, 60, 60, 64, 67, 72, 72, 76, 79, 84, 84, 88, 91, 96]`
- Draw: `[50, 53, 57, 59, 62, 65, 69, 71, 74, 77, 81, 83, 86, 89, 93, 95]`
- Rango: C3 - D7

### 2.2 Renderizado Visual

- Grilla de agujeros (draw y blow)
- Indicador de slide (palanca)
- Números de agujero
- Estados: natural, slide-on, active, altered (indicador para notas fuera de escala)
- Animación de transición para cambio de nota
- Responsive: diseño adaptativo para móvil y desktop

### 2.3 Interacción

- Click en agujero para seleccionar posición manualmente
- Popover de opciones cuando hay múltiples posibilidades en un agujero

---

## 3. Autoplay (Reproductor de Partituras)

### 3.1 Formato de Partitura

El formato textual de las notas:

- Estructura: `NOTA+OCTAVA:DURACION`
- Ejemplo: `G4:0.5 G4:0.5 A4:1 G4:1 C5:1 B4:2 | G4:0.5 G4:0.5 A4:1 G4:1 D5:1 C5:2`
- Separador de frases: `|`
- Silencio: `R:DURACION`
- Notas válidas: A-G, do-re-mi-fa-sol-la-si-ti (español), y sostenidos/bemoles (#, b, ♯, ♭)
- Duración: número positivo (0.5 = corchea, 1 = negra, 2 = blanca, etc.)

### 3.2 Transcripción

- Convertir notas de la partitura a digitación de armónica cromática
- Considerar tonalidad original (sourceKey) y tonalidad destino (targetKey)
- Transponer semitonos: `transposedMidi = event.midi + semitoneShift`
- Mostrar notas fuera de rango con indicador visual

### 3.3 Reproducción

- Tempo variable (BPM, rango: 40-200)
- Sintetizador de audio usando Web Audio API:
  - Oscilador triangle (frecuencia base)
  - Oscilador sawtooth (armónico reed, frecuencia x2, detune +4)
  - Oscilador sine (breath, frecuencia x3, detune -7)
  - Filtro lowpass (frecuencia 2400Hz, Q 1.1)
  - Vibrato (5.3Hz, gain 12)
  - Envolvente: attack 30ms, decay, release 120ms

### 3.4 Navegación

- Anterior/siguiente nota
- Anterior/siguiente línea
- Play/Pause/Stop
- Reproducción automática desde posición actual

---

## 4. Modo Ejercicios de Escalas

### 4.1 Escalas Disponibles

**Diatónicas:**

- Mayor: `[0, 2, 4, 5, 7, 9, 11, 12]`
- Menor natural: `[0, 2, 3, 5, 7, 8, 10, 12]`
- Menor armónica: `[0, 2, 3, 5, 7, 8, 11, 12]`
- Menor melódica: `[0, 2, 3, 5, 7, 9, 11, 12]`

**Pentatónicas:**

- Pentatónica mayor: `[0, 2, 4, 7, 9, 12]`
- Pentatónica menor: `[0, 3, 5, 7, 10, 12]`

**Blues:**

- Blues: `[0, 3, 5, 6, 7, 10, 12]`

**Modos:**

- Dórica: `[0, 2, 3, 5, 7, 9, 10, 12]`
- Frigia: `[0, 1, 3, 5, 7, 8, 10, 12]`
- Lidia: `[0, 2, 4, 6, 7, 9, 11, 12]`
- Mixolidia: `[0, 2, 4, 5, 7, 9, 10, 12]`
- Locria: `[0, 1, 3, 5, 6, 8, 10, 12]`

**Simétricas:**

- Cromática: `[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]`

### 4.2 Generación de Ejercicios

- Generar escala ascendente y descendente desde tónica
- Formato de partitura automático
- Combinaciones de tonalidad + escala

---

## 5. Biblioteca de Canciones

### 5.1 Canciones por Defecto

```javascript
const DEFAULT_SONGS = [
  {
    id: 'happy-birthday',
    title: 'Cumpleaños feliz',
    category: 'Tradicionales',
    scoreText: 'G4:0.5 G4:0.5 A4:1 G4:1 C5:1 B4:2 | G4:0.5 G4:0.5 A4:1 G4:1 D5:1 C5:2 | G4:0.5 G4:0.5 G5:1 E5:1 C5:1 B4:1 A4:2 | F5:0.5 F5:0.5 E5:1 C5:1 D5:1 C5:2',
    sourceKey: 0,
    targetKey: 0,
    tempo: 92,
  },
]
```

### 5.2 Funcionalidad

- Guardar canciones personalizadas en localStorage
- Cargar canciones guardadas
- Editar y eliminar canciones
- Categorías configurables

---

## 6. Persistencia de Estado

### 6.1 Claves de localStorage

- `cromanota-autoplay-score`: Estado actual del reproductor
- `cromanota-theme`: Tema actual ('light' o 'dark')

### 6.2 Estado Guardado

- instrument, sourceKey, targetKey, tempo
- scoreText, songTitle, songCategory
- playerMode, selectedScalePatternId
- Secuencia transcrita completa

---

## 7. Internacionalización (i18n)

### 7.1 Idiomas Soportados

Inglés, Español, Chino, Alemán, Francés, Portugués, Italiano, Japonés, Coreano, Ruso

### 7.2 Estructura de Traducciones

Cada idioma contiene:

- SEO: title, description, keywords, locale
- UI: Todas las etiquetas, botones, mensajes
- Autoplay: Todas las etiquetas del reproductor

---

## 8. Theme (Modo Oscuro/Claro)

### 8.1 Variables CSS

```css
:root {
  --paper: #ffffff;
  --ink: #1f1d18;
  --muted: #7a756b;
  --line: rgba(31, 29, 24, 0.12);
  --control: #f5f3ef;
  --panel: #ffffff;
  --accent: #f5a623;
  --accent-soft: rgba(245, 166, 35, 0.18);
  --draw: #e8e4da;
  --instrument: #e8e4da;
  --font-display: system-ui;
  --font-sans: system-ui;
}

:root[data-theme='dark'] {
  --paper: #f5f5f5;
  --ink: #f5f5f5;
  --muted: #8a867c;
  --line: rgba(245, 245, 245, 0.12);
  --control: #2a2824;
  --panel: #1e1c19;
  --accent: #f5a623;
  --accent-soft: rgba(245, 166, 35, 0.18);
  --draw: #3a2d2d;
  --instrument: #2a2824;
}
```

---

# Especificación de UI/UX

## Estructura de Componentes

### 1. Navbar Superior

- Logo + título "CromaNota"
- Selector de tonalidad (12 keys: C, Db, D, Eb, E, F, F#, G, Ab, A, Bb, B)
- Toggle de instrumento (48 voces / 64 voces)
- Botón de theme (light/dark)

### 2. Panel de Armónica

- Nota detectada en display principal (nota + enarmónica si aplica)
- Métricas: Hz, cents, blow/draw, número de agujero
- Visualización de armónica con agujeros interactivos

### 3. Footer de Controles

- Selector de micrófono
- Nivel de audio (meter visual)
- Estado del detector (idle, requesting, listening, error)
- Botón principal (Start/Stop listening)

### 4. Panel de Autoplay (Drawer lateral)

- Tabs: Songs / Scale Exercises
- Selector de canción/escala
- Editor de partitura (textarea)
- Controles: tono original, tono destino, tempo
- Botones: Transcribe, Play, Pause
- Navegación: prev/next note, prev/next line
- Biblioteca de canciones guardadas
- Guía para convertir partituras con IA

---

## Wireframes de la Interfaz

A continuación se presentan los wireframes ASCII de cada vista de la aplicación:

### 1. Vista Principal - Desktop (≥980px)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  [●] CromaNota                            Key: [C ▼]  [48 ▼] [64 ▼]   ☼ LIGHT  │
│       Project                                                                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│                    ┌───────────────────────────────┐                               │
│                    │         CromaNota             │                               │
│                    │   detecta tu armónica         │                               │
│                    │                               │                               │
│                    │   Developed by Emil          │                               │
│                    └───────────────────────────────┘                               │
│                                                                                         │
│                          ┌────────┬────────┐                                      │
│                          │   C#   │  523   │  ← Nota detectada + Hz              │
│                          │  / Db  │  +12c  │  ← Enarmónica + cents               │
│                          │ Blow·1 │  523Hz │  ← Posición en armónica             │
│                          └────────┴────────┘                                      │
│                                                                                         │
│   ┌─────────────────────────────────────────────────────────────────────────────┐    │
│   │                                                                             │    │
│   │   ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○  ○    ← 12 agujeros (48 voces)                  │    │
│   │   │ │ │ │ │ │ │ │ │ │ │ │  |                                                  │    │
│   │   ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○  ○    ← Draw row                                 │    │
│   │                               ║                                           │    │
│   │                               ║  ← Palanca (slider lever)                  │    │
│   └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────┘
│ Mic: [Built-in Microphone ▼]     ████████░░  ● Listening    [🎤 START]           │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 2. Vista Principal - Mobile (<680px)

```
┌─────────────────────────┐
│ [●] Key:[C▼]  [48][64] ☼ │
├─────────────────────────┤
│                         │
│    ┌────┐               │
│    │ C# │  523Hz        │
│    │/Db │  +12c         │
│    └────┘  Blow·1       │
│                         │
│   ┌─────────────────┐   │
│   │ ○ ○ ○ ○ ○ ○ ○ ○ │   │
│   │ ○ ○ ○ ○ ○ ○ ○ ○ │   │
│   └─────────────────┘   │
│                         │
│ emilrichardo@...        │
└─────────────────────────┘
│ [Mic▼] ████░░ [●] [START]│
└─────────────────────────┘
```

### 3. Panel de Autoplay - Drawer Lateral (abierta)

```
┌─────────────────────────────────────────────┐
│  Partituras                          [×] [?]│
├─────────────────────────────────────────────┤
│  [ Canciones ] [ Ejercicios ]               │
├─────────────────────────────────────────────┤
│                                             │
│  Seleccionar: [Cumpleaños feliz ▼]          │
│                                             │
│  ─────────────────────────────────────────   │
│                                             │
│  Título:  [Cumpleaños feliz              ]  │
│  Categoría:[Tradicionales               ]   │
│                                             │
│  ╔═══════════════════════════════════════╗ │
│  ║ G4:0.5 G4:0.5 A4:1 G4:1 C5:1 B4:2 |   ║ │
│  ║ G4:0.5 G4:0.5 A4:1 G4:1 D5:1 C5:2 |   ║ │
│  ║ G4:0.5 G4:0.5 G5:1 E5:1 C5:1 B4:1     ║ │
│  ║ A4:2 | F5:0.5 F5:0.5 E5:1 C5:1 D5:1   ║ │
│  ║ C5:2                                    ║ │
│  ╚═══════════════════════════════════════╝ │
│                                             │
│  Tono original: [C ▼]   Tono destino: [C ▼]│
│  Tempo: [92] BPM                              │
│                                             │
│  ┌────────────────────────────────────────┐ │
│  │ 1  2  3  4  5  6  7  8  9  10  11  12  │ │
│  │ G  A  B  C  D  E  F  G  A  B  C  D     │ │
│  │ ■  ■  ■  ■  ■  ■  ■  ■  ■  ■  ■  ■   │ │
│  └────────────────────────────────────────┘ │
│  notas disponibles                           │
│                                             │
│  [ GUARDAR ]  [▶ PLAY] [ ⏸ PAUSE ]          │
│                                             │
│  [◀◀] [◀] [▶] [▶▶]   Línea: 1/4             │
│                                             │
├─────────────────────────────────────────────┤
│  Guía: Cómo convertir partitura con IA [+]  │
├─────────────────────────────────────────────┤
│  MIS TEMAS                                   │
│  ┌─────────────────────────────────────────┐│
│  │ Canción 1                    [▶] [🗑]   ││
│  │ Canción 2                    [▶] [🗑]   ││
│  └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
```

### 4. Armónica Visual - 48 Voces (12 agujeros)

```
┌────────────────────────────────────────────────────────────────────────┐
│                                                                        │
│  Draw:   ●  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●                          │
│          D  E  F  G  A  B  C  D  E  F  G  A                          │
│  Hole:   1  2  3  4  5  6  7  8  9 10 11 12                         │
│          ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─                          │
│  Blow:   C  D  E  F  G  A  B  C  D  E  F  G                          │
│          ●  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●                          │
│                                                                        │
│                                         ┌──────────┐                  │
│                                         │  ═══●══  │  ← Palanca       │
│                                         │  (slide) │    en posición  │
│                                         └──────────┘    natural       │
└────────────────────────────────────────────────────────────────────────┘

Leyenda:
  ● = agujero inactivo
  ● = agujero activo (nota detectada)
  ● = slide activado
  ○ = indicador de alteración (nota fuera de escala mayor)
```

### 5. Armónica Visual - 64 Voces (16 agujeros)

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                                                                                │
│  Draw:   ●  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●                    │
│          C  D  E  F  G  A  B  C  D  E  F  G  A  B  C  D                    │
│  Hole:   1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16                   │
│          ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─                   │
│  Blow:   C  D  E  F  G  A  B  C  D  E  F  G  A  B  C  D                    │
│          ●  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●                    │
│                                                                                │
│  Nota: Los agujeros 1-4 tienen octava grave (C3-C4)                          │
│        Los agujeros 5-16 tienen octavas medias y altas                       │
│                                                                                │
│                                         ┌──────────┐                         │
│                                         │  ═══●══  │                         │
│                                         └──────────┘                         │
└────────────────────────────────────────────────────────────────────────────────┘
```

### 6. Selector de Escala - Modo Ejercicios

```
┌─────────────────────────────────────────────┐
│  Partituras                          [×]   │
├─────────────────────────────────────────────┤
│  [ Canciones ] [ Ejercicios ]               │
├─────────────────────────────────────────────┤
│                                             │
│  Seleccionar escala:                        │
│                                             │
│  ┌─────────────────────────────────────────┐│
│  │ └─ Diatónicas                          ││
│  │    ├─ Mayor                            ││
│  │    ├─ Menor natural                    ││
│  │    ├─ Menor armónica                   ││
│  │    └─ Menor melódica                    ││
│  │ └─ Pentatónicas                        ││
│  │    ├─ Pentatónica mayor                ││
│  │    └─ Pentatónica menor                ││
│  │ └─ Blues                               ││
│  │    └─ Blues                            ││
│  │ └─ Modos                               ││
│  │    ├─ Dórica                           ││
│  │    ├─ Frigia                           ││
│  │    ├─ Lidia                            ││
│  │    ├─ Mixolidia                        ││
│  │    └─ Locria                           ││
│  │ └─ Simétricas                          ││
│  │    └─ Cromática                        ││
│  └─────────────────────────────────────────┘│
│                                             │
│  Tónica: [C ▼]   Tempo: [84] BPM            │
│                                             │
│  Ejercicio: C Mayor                         │
│  ═══════════════════════════════════════   │
│  C4:0.5 D4:0.5 E4:0.5 F4:0.5 G4:0.5        │
│  A4:0.5 B4:0.5 C5:0.5 | B4:0.5 A4:0.5      │
│  G4:0.5 F4:0.5 E4:0.5 D4:0.5 C4:0.5        │
│                                             │
│  [▶ PLAY]  [◀◀][◀][▶][▶▶]                   │
└─────────────────────────────────────────────┘
```

### 7. Selector de Micrófono y Estado

```
┌────────────────────────────────────────────────────────┐
│  Micrófono: [MacBook Pro Mic     ▼]                    │
│                                                        │
│  Nivel de audio:                                       │
│  [████████████░░░░░░░]  ← barra de nivel              │
│                                                        │
│  Estado: ● Listening  (idle/requesting/listening/error)│
└────────────────────────────────────────────────────────┘
```

### 8. Tema Oscuro/Dark Mode

```
┌─────────────────────────────────────────────────────────┐
│  [●] CromaNota                            Key:[C▼] [☾]  │
│                                                    DARK  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                    ┌─────────────────┐                  │
│                    │    C#           │  ← Texto claro   │
│                    │   /Db           │    sobre fondo   │
│                    │  523Hz +12c     │    oscuro        │
│                    └─────────────────┘                  │
│                                                         │
│   ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○  ← Agujeros oscuros        │
│   ● = activo = texto oscuro                            │
│                                                         │
└─────────────────────────────────────────────────────────┘

Variables CSS para Dark Mode:
  --paper: #f5f5f5
  --ink: #f5f5f5
  --muted: #8a867c
  --control: #2a2824
  --panel: #1e1c19
  --draw: #3a2d2d
  --instrument: #2a2824
```

---

## Estilos CSS Específicos

### Breakpoints

- Desktop: > 980px
- Tablet: 680px - 980px
- Mobile: < 680px

### Tipografía

- Font display: system-ui (para títulos)
- Font sans: system-ui (para texto)

### Animaciones

- Rotación de teléfono (landscape prompt): 1700ms ease-in-out infinite
- Cambio de línea: 420ms cubic-bezier(0.2, 0.8, 0.2, 1)
- Transiciones de estado: 100-120ms ease
- Score drawer: 220ms cubic-bezier(0.2, 0.8, 0.2, 1)

---

# Constantes y Datos de Referencia

## Notas Musicales

```javascript
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

const NOTE_ALIASES = {
  C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11,
  DO: 0, RE: 2, MI: 4, FA: 5, SOL: 7, LA: 9, SI: 11, TI: 11,
}

const ENHARMONIC_LABELS = {
  'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb',
}
```

## Opciones de Tonalidad

```javascript
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
```

## Configuraciones de Armónica

```javascript
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
```

## Parámetros de Detección

```javascript
const MIN_CLARITY = 0.75
const MIN_LEVEL = 0.02
const MIN_SUSTAIN_MS = 120
const MAX_DEVIATION_CENTS = 35
const RELEASE_MS = 120
```

---

# SEO y Metadata

## Meta Tags

- title, description, keywords
- Open Graph (og:title, og:description, og:type, og:locale, og:url)
- Twitter Card
- Canonical URL
- Lang attribute

## Schema.org

- SoftwareApplication
- applicationCategory: MusicApplication
- Creators, offers (free)

---

# Errores a Manejar

1. **Sin acceso a micrófono**: Mostrar mensaje de error claro
2. **Navegador sin getUserMedia**: Mostrar mensaje de navegador incompatible
3. **Error de dispositivo**: Fallback a micrófono por defecto
4. **Partitura vacía**: Mensaje "Escribí al menos una nota"
5. **Tokens inválidos**: Mostrar cuáles tokens no se pudieron leer
6. **Notas fuera de rango**: Contador de notas no reproducibles

---

# Especificación para Nuevo Framework

## Estructura de Archivos Sugerida

```
/
├── index.html
├── package.json (o configuración de build)
├── vite.config.js (o configuración equivalente)
├── src/
│   ├── main.js (entry point)
│   ├── App.js (componente principal)
│   ├── App.css (estilos)
│   ├── i18n.js (traducciones)
│   └── (otros componentes/utilidades según el framework)
```

## Requisitos del Build

- Soporte ES Modules
- Dev server con hot reload
- Build de producción optimizado
- Soporte para CSS moderno

## Dependencias Necesarias

- **pitchy ^4.1.0**: Esta librería DEBE mantenerse para la detección de tono. NO reemplazarla.
- Framework de tu elección (Vue, Svelte, vanilla JS, etc.)

---

# Checklist de Implementación

- [ ] Setup de proyecto con build tool
- [ ] Estructura de componentes base
- [ ] Sistema de variables CSS y theme
- [ ] i18n con 10 idiomas (en, es, zh, de, fr, pt, it, ja, ko, ru)
- [ ] Detector de notas con Web Audio API
- [ ] Visual de armónica (48 y 64 voces)
- [ ] Interacción con agujeros
- [ ] Autoplay parser y transcripción
- [ ] Sintetizador de audio para playback
- [ ] Navegación de partitura
- [ ] Biblioteca de canciones (CRUD)
- [ ] Ejercicios de escalas (12 patrones)
- [ ] Persistencia localStorage
- [ ] SEO y Schema.org
- [ ] Responsive design (mobile/tablet/desktop)
- [ ] Animaciones y transiciones
- [ ] Manejo de errores

---

# Notas Importantes

Este prompt contiene TODOS los detalles de implementación de la aplicación original. El código debe funcionar exactamente igual que el original. Presta especial atención a:

1. **La lógica de detección de tono con pitchy**: Mantener la librería pitchy, no reemplazarla por otra solución.
2. **El algoritmo de posicionamiento en la armónica**: El score se calcula con `abs(candidate.hole - previousPosition.hole) * 20 + (candidate.tone !== previousPosition.tone ? 6 : 0) + (candidate.slide !== previousPosition.slide ? 2 : 0) + (candidate.slide ? 1 : 0)`
3. **El sintetizador de audio**: Osciladores específicos (triangle + sawtooth + sine), filtros, vibrato, y envolvente exacta.
4. **La transcripción de partituras**: Including transposición y manejo de notas fuera de rango.
5. **El sistema de i18n**: Los 10 idiomas completos con todas las etiquetas.
6. **El CSS**: Todas las variables CSS, breakpoints, y animaciones especificadas.
7. **La estructura de datos**: Las configuraciones de armónica, escalas, y constantes exactas.

El código generado debe compilar y ejecutarse correctamente a la primera intención. Este prompt es autocontenido y no requiere consulta adicional.