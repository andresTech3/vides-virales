import React from 'react';
import { interpolate, spring } from 'remotion';

export interface HyperVoxAnnotateProps {
  /** Texto principal sobre el que se hace la anotación */
  children: React.ReactNode;
  /** Palabra o frase clave a destacar con el rotulador */
  palabraClave?: string;
  /** Etiqueta mono-espaciada técnica que aparece en el callout (ej: "+1.670 KM/H", "CRÍTICO") */
  labelCallout?: string;
  /** Color del resaltado tipo rotulador Vox (ej: #facc15 amarillo, #38bdf8 cian, #ef4444 rojo) */
  colorMarcador?: string;
  /** Color de la etiqueta técnica */
  colorEtiqueta?: string;
  /** Fotograma local en la escena */
  frame: number;
  /** Fotograma de inicio de la animación de anotación */
  inicioFrame?: number;
  /** Posición de la llamada ('arriba' o 'abajo') */
  posicionCallout?: 'arriba' | 'abajo';
}

/**
 * HyperVoxAnnotate — Componente inspirado en la primitiva 'vox-annotate' de HyperFrames.
 * 
 * Efecto:
 * 1. Dibuja un trazo de rotulador orgánico fluido por debajo del texto clave.
 * 2. Despliega un conector milimétrico animado hacia una etiqueta técnica tipo documental Vox/Bellingcat.
 * 3. Añade un pulso de atención de retención extrema.
 */
export const HyperVoxAnnotate: React.FC<HyperVoxAnnotateProps> = ({
  children,
  labelCallout,
  colorMarcador = '#facc15',
  colorEtiqueta = '#38bdf8',
  frame,
  inicioFrame = 10,
  posicionCallout = 'arriba',
}) => {
  const frameRelativo = Math.max(0, frame - inicioFrame);

  // Animación del trazo del marcador (0 a 1)
  const animMarcador = spring({
    frame: frameRelativo,
    fps: 30,
    config: { damping: 14, stiffness: 180, mass: 0.6 },
  });

  // Animación del conector y etiqueta técnica (empieza 4 frames después)
  const animCallout = spring({
    frame: Math.max(0, frameRelativo - 4),
    fps: 30,
    config: { damping: 16, stiffness: 220, mass: 0.5 },
  });

  // Longitud de dibujado del trazo SVG (stroke-dashoffset)
  const strokeOffset = interpolate(animMarcador, [0, 1], [300, 0]);
  const markerOpacity = interpolate(animMarcador, [0, 0.2, 1], [0, 0.85, 0.85]);

  // Transformación del callout
  const calloutTranslateY = interpolate(
    animCallout,
    [0, 1],
    [posicionCallout === 'arriba' ? 12 : -12, 0]
  );
  const calloutOpacity = interpolate(animCallout, [0, 0.3, 1], [0, 1, 1]);
  const calloutScale = interpolate(animCallout, [0, 1], [0.85, 1]);

  // Micro pulso de resplandor continuo después de asentarse
  const pulsoGlow =
    frameRelativo > 20
      ? 0.5 + Math.sin((frameRelativo - 20) * 0.15) * 0.25
      : 0.5;

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-block',
        margin: '0 auto',
      }}
    >
      {/* 1. CALLOUT EDITORIAL VOX FLOTANTE */}
      {labelCallout && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            transform: `translateX(-50%) translateY(${calloutTranslateY}px) scale(${calloutScale})`,
            [posicionCallout === 'arriba' ? 'bottom' : 'top']: '100%',
            marginBottom: posicionCallout === 'arriba' ? '18px' : 0,
            marginTop: posicionCallout === 'abajo' ? '18px' : 0,
            opacity: calloutOpacity,
            display: 'flex',
            flexDirection: posicionCallout === 'arriba' ? 'column' : 'column-reverse',
            alignItems: 'center',
            zIndex: 30,
            pointerEvents: 'none',
          }}
        >
          {/* Chip de Telemetría Monoespaciado */}
          <div
            style={{
              padding: '6px 16px',
              borderRadius: '6px',
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(16px)',
              border: `1px solid ${colorEtiqueta}`,
              boxShadow: `0 0 20px ${colorEtiqueta}40, 0 4px 15px rgba(0,0,0,0.6)`,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: colorEtiqueta,
                boxShadow: `0 0 10px ${colorEtiqueta}`,
                display: 'inline-block',
                opacity: pulsoGlow,
              }}
            />
            <span
              style={{
                fontFamily: "'Courier New', Courier, monospace",
                fontSize: '15px',
                fontWeight: 900,
                letterSpacing: '0.12em',
                color: colorEtiqueta,
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
              }}
            >
              {labelCallout}
            </span>
          </div>

          {/* Línea Conectora Milimétrica */}
          <div
            style={{
              width: '1.5px',
              height: '14px',
              backgroundColor: colorEtiqueta,
              opacity: 0.8,
            }}
          />
          <div
            style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              backgroundColor: colorEtiqueta,
            }}
          />
        </div>
      )}

      {/* 2. TEXTO HERO */}
      <div style={{ position: 'relative', zIndex: 2 }}>{children}</div>

      {/* 3. RESALTADO ORGÁNICO TIPO BROCHA (SVG) */}
      <svg
        style={{
          position: 'absolute',
          bottom: '-6px',
          left: '-4%',
          width: '108%',
          height: '24px',
          zIndex: 1,
          pointerEvents: 'none',
          overflow: 'visible',
        }}
        viewBox="0 0 300 24"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          d="M 5,16 Q 80,8 160,14 T 295,12"
          stroke={colorMarcador}
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="300"
          strokeDashoffset={strokeOffset}
          opacity={markerOpacity}
          style={{
            filter: `drop-shadow(0 0 8px ${colorMarcador}80)`,
          }}
        />
      </svg>
    </div>
  );
};
