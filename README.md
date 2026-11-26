# 🎬 Generador de Cortos Animados 3D Virales — Cartoon 3D Short Engine

Motor automatizado de producción de shorts y reels verticales (9:16, 1080x1920 a 30 FPS / exportación 2K 1440x2560) con estética **Cartoon 3D** (personajes 2D planos con contornos de tinta en mundos 3D estilizados, iluminación toon, desenfoque de lente DOF, cámaras fluidas y diseño sonoro procedural con banda militar y SFX sintetizados).

Basado en la arquitectura y reglas de la skill [`cartoon-3d-short`](https://github.com/mromidev/claude-animated-shorts).

---

## 🚀 Inicio Rápido

### 1. Previsualizar en Remotion Studio
Abre la interfaz interactiva para ver y explorar la escena 3D cuadro a cuadro:
```bash
npm run estudio
```

### 2. Generar Stills de Prueba (Frames clave)
Renderiza frames estáticos individuales a resolución 0.5 con GPU ANGLE para verificar composición, luz y tinta:
```bash
npm run stills:bridge
# O un frame específico:
node scripts/bridge-stills.mjs out/bridge/x_ 100,400,1000 0.5
```

### 3. Síntesis y Mezcla de Audio Procedural
Genera la banda musical y efectos de sonido con ducking automático:
```bash
npm run audio:mix
```

### 4. Renderizado Final en Alta Calidad (MP4 1080x1920 / 2K)
```bash
npm run render:bridge
```

---

## 📐 Pipeline de Creación de un Corto

1. **Tema y Hechos (`SCRIPT.md`):**
   - Una historia verídica sorprendente con causa-efecto físico visible y una analogía cotidiana.
   - Fórmula: Hook → Setting (1831, lugar) → Escalada en 3 o 4 beats → Snap (el momento de quiebre) → Línea doble deadpan ("Por suerte... / Por desgracia...") → Explicación con analogía → Consecuencia/Regla → Remate final.
2. **Voz y Marcadores:**
   - Narración rápida y constante (~3.7 palabras/segundo) con timings de palabra (`words.json`).
3. **Plan de Tomas (`story.ts`):**
   - Definición de `SHOTS`, transiciones `XFADE`, cámara cinemática en smootherstep, profundidad de campo `dofAt`, y props de primer plano.
4. **Mundo 3D (`world.ts`, `build.ts`, `paint.ts`, `lights.ts`):**
   - Entorno 3D estilizado con texturas pintadas a mano en Canvas2D, presets de luz día y hora dorada (`lights.ts`), y sombreado cel-shaded (`shade.ts`).
5. **Personajes (`toon.ts`, `cast.ts`, `cardshade.ts`):**
   - Bean-head characters en vallas 2D orientadas a cámara sobre la capa `NOINK` (con su propio contorno plum), articulaciones stick y ciclos de caminata.
6. **Composición y Postprocesado (`Bridge.tsx`, `ink.ts`, `lensblur.ts`, `grade.ts`):**
   - Líneas de tinta sobre la geometría 3D → Thin-lens DOF → Bloom HDR emissivo → Mapeo tonal neutro → Corrección de color.
7. **Diseño Sonoro (`audio/`):**
   - Sintetizador procedural en Python (`dsp.py`, `instruments.py`, `sfx.py`, `music.py`) con mastering a -15 LUFS y limitador de picos.
8. **Control de Calidad (`scripts/short_qa.py`):**
   - Verificación automática de frames negros, congelados o saltos abruptos.

---

## 🛠️ Estructura del Proyecto

```
generador-videos-ia/
├── src/
│   ├── videos/bridge/         # Escena 3D completa (World, Bridge, Cast, Ink, Lens, Story)
│   ├── remotion/              # Composición raíz y orquestador Remotion
│   ├── esquemas/              # Esquemas de validación Zod
│   └── servicios/             # Generador de voz y utilidades
├── audio/                     # Motor de síntesis procedural de sonido (DSP, instrumentos, mix)
├── scripts/                   # Scripts de stills, merge y control de calidad QA
├── references/                # STYLE_BIBLE.md, análisis métricos y frames de referencia
└── salida/                    # Renders finales de video MP4
```
