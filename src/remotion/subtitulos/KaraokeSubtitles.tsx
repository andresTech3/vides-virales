import React from 'react';
import { useCurrentFrame, interpolate, spring } from 'remotion';
import type { PalabraSubtitulo } from '../../esquemas/guion.schema';

interface KaraokeSubtitlesProps {
  subtitulos: PalabraSubtitulo[];
  colorActivo?: string;
  colorInactivo?: string;
  estiloHormozi?: boolean;
}

// ── Diccionario de Emojis Virales Automáticos por Contexto ──────────────────
const DICCIONARIO_EMOJIS: Record<string, string> = {
  // Espacio & Cosmos
  espacio: '🚀',
  espacial: '🚀',
  universo: '🌌',
  orbita: '🛰️',
  orbital: '🛰️',
  cosmos: '🪐',
  cosmico: '🪐',
  planeta: '🌍',
  tierra: '🌍',
  luna: '🌕',
  sol: '☀️',
  astronauta: '👨‍🚀',
  cohete: '🚀',

  // Velocidad & Energía
  velocidad: '⚡',
  acelerar: '⚡',
  aceleraria: '⚡',
  rapido: '🏎️',
  kilometros: '💨',
  inercia: '🌪️',
  energia: '⚡',

  // Fuego, Calor & Temperatura
  fuego: '🔥',
  calor: '🔥',
  temperatura: '🌡️',
  fundir: '💥',
  fundidos: '💥',
  soldadura: '🔥',
  arder: '🔥',

  // Peligro, Muerte & Impacto
  muerte: '💀',
  morir: '💀',
  letal: '☠️',
  peligro: '⚠️',
  alerta: '🚨',
  colapso: '💥',
  impacto: '💥',
  frenos: '🛑',
  frenar: '🛑',
  blackout: '😵',
  aplastaria: '⚠️',

  // Gravedad & Física
  gravedad: '🌀',
  loop: '🎢',
  caida: '📉',
  montana: '🎢',
  rusa: '🎢',
  abismo: '🕳️',

  // Mente, Curiosidad & Tiempo
  tiempo: '⏱️',
  segundos: '⏱️',
  anos: '⏳',
  millones: '♾️',
  cerebro: '🧠',
  mente: '🧠',
  ojo: '👀',
  verdad: '🔍',
  respuesta: '💡',
  secreto: '🤫',
  preguntaras: '❓',
  subir: '🎢',
};

/**
 * Busca un emoji contextual para una palabra limpiando signos ortográficos
 */
function obtenerEmojiContextual(palabra: string): string | null {
  const limpia = palabra
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');

  for (const [clave, emoji] of Object.entries(DICCIONARIO_EMOJIS)) {
    if (limpia.startsWith(clave) || clave.startsWith(limpia)) {
      if (limpia.length >= 3 && clave.length >= 3) {
        return emoji;
      }
    }
  }
  return null;
}

/**
 * Subtítulos estilo Hormozi / MrBeast de Máxima Retención:
 * - 2 a 3 palabras visibles a la vez.
 * - Palabra activa con Spring Pop elástico de alto rebote.
 * - Cápsula de resaltado vibrante con contorno negro grueso.
 * - Emojis contextuales automáticos flotando con animación.
 */
export const KaraokeSubtitles: React.FC<KaraokeSubtitlesProps> = ({
  subtitulos,
  colorActivo = '#faae33',
  colorInactivo = '#ffffff',
  estiloHormozi = true,
}) => {
  const frame = useCurrentFrame();

  if (!subtitulos || subtitulos.length === 0) {
    return null;
  }

  // Encontrar el índice de la palabra activa en este frame
  const palabraActivaIndex = subtitulos.findIndex(
    (s) => frame >= s.inicioFrame && frame <= s.finFrame
  );

  const indexReferencia =
    palabraActivaIndex !== -1
      ? palabraActivaIndex
      : subtitulos.findIndex((s) => s.inicioFrame > frame);

  const idxBase = indexReferencia === -1 ? subtitulos.length - 1 : Math.max(0, indexReferencia);

  // Mostrar grupos de 2 o 3 palabras para ritmo dinámico
  const palabrasPorGrupo = 3;
  const grupoInicio = Math.floor(idxBase / palabrasPorGrupo) * palabrasPorGrupo;
  const palabrasVisibles = subtitulos.slice(grupoInicio, grupoInicio + palabrasPorGrupo);

  const primerFrameGrupo = palabrasVisibles[0]?.inicioFrame ?? 0;
  const ultimoFrameGrupo = palabrasVisibles[palabrasVisibles.length - 1]?.finFrame ?? 0;

  if (frame < primerFrameGrupo - 4 || frame > ultimoFrameGrupo + 12) {
    return null;
  }

  // Detectar emoji para la palabra activa
  const palabraActiva = subtitulos[palabraActivaIndex];
  const emojiActivo = palabraActiva ? obtenerEmojiContextual(palabraActiva.palabra) : null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 330, // Zona segura optimizada para UI de TikTok / Shorts
        left: 0,
        right: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
        pointerEvents: 'none',
      }}
    >
      {/* Emoji Contextual Flotante Animado (MrBeast Style) */}
      {emojiActivo && palabraActiva && (
        <div
          style={{
            fontSize: '52px',
            marginBottom: '8px',
            transform: `translateY(${Math.sin((frame - palabraActiva.inicioFrame) * 0.4) * 6}px) scale(${
              interpolate(
                spring({
                  frame: frame - palabraActiva.inicioFrame,
                  fps: 30,
                  config: { damping: 10, stiffness: 280, mass: 0.5 },
                }),
                [0, 1],
                [0.4, 1.25]
              )
            })`,
            filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.8))',
            transition: 'transform 0.05s ease',
          }}
        >
          {emojiActivo}
        </div>
      )}

      {/* Contenedor de Palabras Activas */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          padding: '8px 20px',
        }}
      >
        {palabrasVisibles.map((p, i) => {
          const indexAbsoluto = grupoInicio + i;
          const esActiva = indexAbsoluto === palabraActivaIndex;

          // Animación elástica de impacto cuando la palabra se activa
          const scaleSpring = spring({
            frame: frame - p.inicioFrame,
            fps: 30,
            config: {
              damping: 10,
              stiffness: 260,
              mass: 0.5,
            },
          });

          const scale = esActiva
            ? interpolate(scaleSpring, [0, 1], [0.92, 1.22])
            : 0.95;

          return (
            <span
              key={`${p.palabra}-${indexAbsoluto}`}
              style={{
                fontFamily: "'Syne', 'Impact', 'Montserrat', sans-serif",
                fontSize: esActiva ? '60px' : '52px',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '-0.02em',
                color: esActiva ? '#000000' : colorInactivo,
                backgroundColor: esActiva ? colorActivo : 'rgba(0, 0, 0, 0.55)',
                padding: esActiva ? '4px 16px' : '4px 10px',
                borderRadius: '12px',
                transform: `scale(${scale})`,
                display: 'inline-block',
                border: esActiva
                  ? '3px solid #ffffff'
                  : '2px solid rgba(255, 255, 255, 0.2)',
                boxShadow: esActiva
                  ? `0 0 28px ${colorActivo}, 0 8px 24px rgba(0,0,0,0.9)`
                  : '0 4px 14px rgba(0,0,0,0.7)',
                WebkitTextStroke: esActiva ? '1px #000000' : '2px #000000',
                transition: 'all 0.08s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              {p.palabra}
            </span>
          );
        })}
      </div>
    </div>
  );
};
