import fs from 'fs';
import path from 'path';
import type { GuionCompleto, EscenaGuion } from '../esquemas/guion.schema.js';
import { ESTILOS_PRESETS } from '../estilos/index.js';

export interface OpcionesHyperFrames {
  guion: GuionCompleto;
  dirDestino: string;
  rutaAudioVoz?: string;
}

/**
 * compilarProyectoHyperFrames — Construye un proyecto nativo y determinista de HyperFrames
 * listo para previsualizar en vivo o renderizar directamente a MP4 con npx hyperframes.
 */
export function compilarProyectoHyperFrames({
  guion,
  dirDestino,
  rutaAudioVoz,
}: OpcionesHyperFrames): {
  dirProyecto: string;
  rutaIndexHtml: string;
} {
  if (!fs.existsSync(dirDestino)) {
    fs.mkdirSync(dirDestino, { recursive: true });
  }

  const estilo = ESTILOS_PRESETS[guion.estilo] || ESTILOS_PRESETS.neon_kinetic;
  const finMaximoEscenas = Math.max(
    ...guion.escenas.map((e) => ((e.inicioFrame || 0) + (e.duracionFrames || 90)) / 30)
  );
  const duracionTotalSegundos = Math.ceil(
    Math.max(guion.duracionTotalSegundos || 0, finMaximoEscenas)
  );

  // Copiar audio si existe
  let nombreArchivoAudio = '';
  if (rutaAudioVoz && fs.existsSync(rutaAudioVoz)) {
    nombreArchivoAudio = 'voz.mp3';
    fs.copyFileSync(rutaAudioVoz, path.join(dirDestino, nombreArchivoAudio));
  }

  // 1. hyperframes.json
  const hyperframesConfig = {
    $schema: 'https://hyperframes.heygen.com/schema/hyperframes.json',
    registry: 'https://raw.githubusercontent.com/heygen-com/hyperframes/main/registry',
    paths: {
      blocks: 'compositions',
      components: 'compositions/components',
      assets: 'assets',
    },
    media: {
      autoProxy: true,
    },
  };
  fs.writeFileSync(
    path.join(dirDestino, 'hyperframes.json'),
    JSON.stringify(hyperframesConfig, null, 2),
    'utf8'
  );

  // 2. meta.json
  const metaConfig = {
    id: guion.id,
    name: guion.tema,
    createdAt: new Date().toISOString(),
    resolution: 'portrait',
    fps: 30,
    duration: duracionTotalSegundos,
  };
  fs.writeFileSync(
    path.join(dirDestino, 'meta.json'),
    JSON.stringify(metaConfig, null, 2),
    'utf8'
  );

  // 3. Generación de index.html con estándar HyperFrames + GSAP 3.14.2
  const htmlContent = generarHtmlHyperFrames(guion, estilo, duracionTotalSegundos, nombreArchivoAudio);
  const rutaIndexHtml = path.join(dirDestino, 'index.html');
  fs.writeFileSync(rutaIndexHtml, htmlContent, 'utf8');

  return {
    dirProyecto: dirDestino,
    rutaIndexHtml,
  };
}

function generarHtmlHyperFrames(
  guion: GuionCompleto,
  estilo: any,
  duracionTotal: number,
  nombreArchivoAudio: string
): string {
  const escenasHtml = guion.escenas.map((escena, idx) => {
    const inicioSeg = (escena.inicioFrame || 0) / 30;
    const durSeg = (escena.duracionFrames || 90) / 30;

    const calloutLabel =
      escena.tipo === 'dato_grande'
        ? 'IMPACTO CRÍTICO'
        : escena.tipo === 'hook'
        ? 'TRANSMISIÓN EN VIVO'
        : 'TELEMETRÍA // SIM';

    // Generar spans para subtítulos palabra por palabra
    const subtitulosHtml = (escena.subtitulos || [])
      .map((sub, sIdx) => {
        return `<span id="sub-${idx}-${sIdx}" class="word-sub">${escapeHtml(sub.palabra)}</span>`;
      })
      .join(' ');

    return `
      <!-- ESCENA ${idx + 1}: ${escena.tipo} -->
      <div
        id="scene-${idx}"
        class="clip scene"
        data-start="${inicioSeg.toFixed(2)}"
        data-duration="${durSeg.toFixed(2)}"
        data-layout-allow-overlap
      >
        <!-- Badge Superior Glassmorphism -->
        <div class="scene-badge" data-layout-ignore data-layout-allow-overlap>
          <span class="badge-dot"></span>
          <span>${escapeHtml(escena.datoDestacado || 'SIMULACIÓN REAL')}</span>
        </div>

        <!-- Título con Vox Annotate -->
        <div class="title-container" data-layout-allow-overlap>
          <!-- Callout técnico flotante -->
          <div id="callout-${idx}" class="vox-callout" data-layout-ignore data-layout-allow-overlap>
            <div class="callout-chip" data-layout-ignore>
              <span class="callout-dot"></span>
              <span>${calloutLabel}</span>
            </div>
            <div class="callout-line"></div>
          </div>

          <h1 id="title-${idx}" class="scene-title">
            ${escapeHtml(escena.tituloVisual || escena.textoNarracion)}
          </h1>

          <!-- SVG Brush Stroke Marker -->
          <svg class="vox-marker-svg" viewBox="0 0 350 24" preserveAspectRatio="none" data-layout-ignore>
            <path
              id="marker-${idx}"
              d="M 5,16 Q 90,8 180,14 T 345,12"
              stroke="${estilo.colorAcento}"
              stroke-width="14"
              stroke-linecap="round"
              stroke-dasharray="350"
              stroke-dashoffset="350"
            />
          </svg>
        </div>

        <!-- Subtítulo Visual -->
        ${
          escena.subtituloVisual
            ? `<div class="scene-subtitle" data-layout-ignore data-layout-allow-overlap>${escapeHtml(escena.subtituloVisual)}</div>`
            : ''
        }

        <!-- Subtítulos Karaoke Dinámicos -->
        <div class="karaoke-container" data-layout-allow-overlap>
          ${subtitulosHtml}
        </div>
      </div>
    `;
  }).join('\n');

  // GSAP Animations Script
  const gsapTimelineCode = guion.escenas.map((escena, idx) => {
    const inicioSeg = (escena.inicioFrame || 0) / 30;
    const durSeg = (escena.duracionFrames || 90) / 30;
    const finSeg = inicioSeg + durSeg;

    const animWords = (escena.subtitulos || []).map((sub, sIdx) => {
      const subInicio = (sub.inicioFrame || 0) / 30;
      const subDur = Math.max(0.12, ((sub.finFrame - sub.inicioFrame) || 6) / 30);
      return `
        tl.to("#sub-${idx}-${sIdx}", {
          color: "${estilo.colorAcento}",
          scale: 1.15,
          textShadow: "0 0 20px ${estilo.colorAcento}",
          duration: 0.08,
          ease: "power2.out"
        }, ${subInicio.toFixed(3)});
        tl.to("#sub-${idx}-${sIdx}", {
          color: "#ffffff",
          scale: 1.0,
          textShadow: "none",
          duration: 0.12,
          ease: "power1.in"
        }, ${(subInicio + subDur).toFixed(3)});
      `;
    }).join('\n');

    return `
      // Escena ${idx + 1}
      ${idx === 0 ? `
      tl.to("#scene-0", { opacity: 1, scale: 1.0, y: 0, duration: 0.01 }, 0);
      ` : `
      tl.fromTo("#scene-${idx}", 
        { opacity: 0, scale: 0.94, y: 30 }, 
        { opacity: 1, scale: 1.0, y: 0, duration: 0.28, ease: "power3.out" }, 
        ${inicioSeg.toFixed(3)}
      );
      `}

      // Camera Drift
      tl.to("#scene-${idx}", 
        { scale: 1.03, y: -10, duration: ${Math.max(0.1, durSeg - 0.2).toFixed(3)}, ease: "none" }, 
        ${inicioSeg.toFixed(3)}
      );

      // Vox Marker Draw
      tl.fromTo("#marker-${idx}", 
        { strokeDashoffset: 350 }, 
        { strokeDashoffset: 0, duration: 0.35, ease: "power2.out" }, 
        ${(inicioSeg + 0.12).toFixed(3)}
      );

      // Vox Callout Pop
      tl.fromTo("#callout-${idx}", 
        { opacity: 0, y: 15, scale: 0.8 }, 
        { opacity: 1, y: 0, scale: 1.0, duration: 0.22, ease: "back.out(2)" }, 
        ${(inicioSeg + 0.2).toFixed(3)}
      );

      // Subtitles
      ${animWords}

      // Exit
      tl.to("#scene-${idx}", 
        { opacity: 0, scale: 1.04, duration: 0.18, ease: "power2.in", overwrite: "auto" }, 
        ${Math.max(0, finSeg - 0.18).toFixed(3)}
      );
    `;
  }).join('\n');

  return `<!doctype html>
<html lang="es" data-resolution="portrait">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <title>${escapeHtml(guion.tema)}</title>
    <!-- GSAP Runtime Oficial para HyperFrames -->
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@700;800;900&family=Space+Grotesk:wght@600;700;800&family=JetBrains+Mono:wght@700;800&display=swap" rel="stylesheet">
    <style>
      :root {
        --color-fondo: ${estilo.colorFondo || '#060814'};
        --color-acento: ${estilo.colorAcento || '#38bdf8'};
        --color-secundario: ${estilo.colorSecundario || '#f59e0b'};
        --color-texto: ${estilo.colorTexto || '#ffffff'};
        --font-titulo: 'Outfit', sans-serif;
        --font-subtitulo: 'Space Grotesk', sans-serif;
        --font-mono: 'JetBrains Mono', monospace;
      }
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      html, body {
        width: 1080px;
        height: 1920px;
        overflow: hidden;
        background: var(--color-fondo);
        font-family: var(--font-subtitulo);
        color: var(--color-texto);
      }
      #root {
        width: 1080px;
        height: 1920px;
        position: relative;
        overflow: hidden;
        background: radial-gradient(circle at 50% 30%, ${estilo.colorAcento}18 0%, transparent 65%), linear-gradient(180deg, var(--color-fondo) 0%, #000000 100%);
      }
      
      /* Barra de Progreso Viral Superior */
      #progress-bar {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 8px;
        background: rgba(255, 255, 255, 0.1);
        z-index: 100;
      }
      #progress-bar-fill {
        height: 100%;
        width: 0%;
        background: linear-gradient(90deg, var(--color-secundario), var(--color-acento));
        box-shadow: 0 0 16px var(--color-acento);
      }

      /* Scanlines OSD HyperScreenWarp */
      #scanlines {
        position: absolute;
        inset: 0;
        background-image: repeating-linear-gradient(0deg, rgba(0,0,0,0.35) 0px, rgba(0,0,0,0.35) 2px, transparent 2px, transparent 4px);
        opacity: 0.15;
        pointer-events: none;
        z-index: 5;
      }

      /* Viñeta radial */
      #vignette {
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.75) 100%);
        pointer-events: none;
        z-index: 5;
      }

      /* Escenas */
      .scene {
        position: absolute;
        inset: 0;
        width: 1080px;
        height: 1920px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justifyContent: flex-start;
        padding-top: 200px;
        padding-left: 50px;
        padding-right: 50px;
        text-align: center;
        opacity: 0;
        z-index: 20;
      }
      #scene-0 {
        opacity: 1;
      }

      /* Badge Superior */
      .scene-badge {
        display: inline-flex;
        align-items: center;
        gap: 12px;
        padding: 12px 28px;
        border-radius: 999px;
        background: rgba(15, 23, 42, 0.7);
        backdrop-filter: blur(16px);
        border: 1.5px solid ${estilo.colorAcento}80;
        margin-bottom: 28px;
        box-shadow: 0 0 30px ${estilo.colorAcento}40;
        font-family: var(--font-mono);
        font-size: 20px;
        font-weight: 800;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--color-acento);
      }
      .badge-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: var(--color-acento);
        box-shadow: 0 0 12px var(--color-acento);
      }

      /* Contenedor de Título + Vox Annotate */
      .title-container {
        position: relative;
        display: inline-block;
        max-width: 960px;
        margin-bottom: 24px;
      }

      .scene-title {
        font-family: var(--font-titulo);
        font-size: 80px;
        font-weight: 900;
        line-height: 1.03;
        letter-spacing: -0.02em;
        color: #ffffff;
        text-transform: uppercase;
        text-shadow: 0 4px 25px rgba(0,0,0,0.9), 0 0 40px ${estilo.colorAcento}40;
        position: relative;
        z-index: 2;
      }

      /* Vox Callout */
      .vox-callout {
        position: absolute;
        left: 50%;
        bottom: 100%;
        transform: translateX(-50%);
        margin-bottom: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        opacity: 0;
        z-index: 10;
      }
      .callout-chip {
        padding: 6px 18px;
        border-radius: 6px;
        background: rgba(15, 23, 42, 0.85);
        backdrop-filter: blur(16px);
        border: 1px solid var(--color-acento);
        box-shadow: 0 0 20px ${estilo.colorAcento}40;
        font-family: var(--font-mono);
        font-size: 15px;
        font-weight: 800;
        letter-spacing: 0.12em;
        color: var(--color-acento);
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .callout-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background-color: var(--color-acento);
        box-shadow: 0 0 10px var(--color-acento);
      }
      .callout-line {
        width: 2px;
        height: 16px;
        background-color: var(--color-acento);
      }

      /* SVG Marker */
      .vox-marker-svg {
        position: absolute;
        bottom: -6px;
        left: -4%;
        width: 108%;
        height: 28px;
        z-index: 1;
        overflow: visible;
        filter: drop-shadow(0 0 10px ${estilo.colorAcento}90);
      }

      /* Subtítulo */
      .scene-subtitle {
        font-family: var(--font-subtitulo);
        font-size: 24px;
        font-weight: 700;
        color: #94a3b8;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        max-width: 860px;
        background: rgba(15, 23, 42, 0.6);
        backdrop-filter: blur(12px);
        padding: 10px 26px;
        border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        margin-bottom: 50px;
      }

      /* Subtítulos Karaoke Dinámicos */
      .karaoke-container {
        position: absolute;
        bottom: 280px;
        left: 50px;
        right: 50px;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 14px;
        font-family: var(--font-titulo);
        font-size: 46px;
        font-weight: 900;
        text-transform: uppercase;
        line-height: 1.2;
      }
      .word-sub {
        color: rgba(255, 255, 255, 0.5);
        transition: color 0.1s ease;
        display: inline-block;
      }
    </style>
  </head>
  <body>
    <div
      id="root"
      data-composition-id="main"
      data-start="0"
      data-duration="${duracionTotal}"
      data-width="1080"
      data-height="1920"
    >
      <!-- Barra de Progreso -->
      <div id="progress-bar">
        <div id="progress-bar-fill"></div>
      </div>

      <!-- Efectos OSD HyperFrames -->
      <div id="scanlines" data-layout-ignore data-layout-allow-occlusion></div>
      <div id="vignette" data-layout-ignore data-layout-allow-occlusion></div>

      <!-- Audio sincronizado -->
      ${
        nombreArchivoAudio
          ? `<audio id="voiceover" src="${nombreArchivoAudio}" data-hf-src="audio" data-start="0" data-duration="${duracionTotal}"></audio>`
          : ''
      }

      <!-- Escenas renderizadas -->
      ${escenasHtml}
    </div>

    <script>
      // Timeline Maestra determinista GSAP para HyperFrames
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });

      // Progreso continuo de la barra superior
      tl.fromTo("#progress-bar-fill", 
        { width: "0%" }, 
        { width: "100%", duration: ${duracionTotal}, ease: "none" }, 
        0
      );

      ${gsapTimelineCode}

      window.__timelines["main"] = tl;
      tl.seek(0);
    </script>
  </body>
</html>`;
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
