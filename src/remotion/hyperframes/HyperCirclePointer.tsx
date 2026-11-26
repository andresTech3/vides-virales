import React from 'react';
import { interpolate, spring } from 'remotion';

export interface HyperCirclePointerProps {
  frame: number;
  /** Fotograma local en el que comienza el dibujo */
  inicioFrame?: number;
  /** Ancho de la elipse en píxeles */
  width?: number;
  /** Alto de la elipse en píxeles */
  height?: number;
  /** Color del trazo (ej: #facc15, #ef4444, #38bdf8) */
  color?: string;
  /** Chip o insignia opcional flotante (ej: "3s", "!", "META", "#1") */
  chipTexto?: string;
}

/**
 * HyperCirclePointer — Inspirado en 'yt-circle-pointer' del catálogo HyperFrames.
 * 
 * Traza un círculo o elipse orgánica estilo marcador alrededor de un elemento clave,
 * acompañado de un chip que pulsa periódicamente para capturar y retener la atención.
 */
export const HyperCirclePointer: React.FC<HyperCirclePointerProps> = ({
  frame,
  inicioFrame = 5,
  width = 240,
  height = 140,
  color = '#facc15',
  chipTexto,
}) => {
  const frameRel = Math.max(0, frame - inicioFrame);

  // Animación del trazo circular
  const animTrazo = spring({
    frame: frameRel,
    fps: 30,
    config: { damping: 15, stiffness: 160, mass: 0.6 },
  });

  // Longitud aproximada de la circunferencia
  const perimetro = Math.PI * (width + height);
  const strokeOffset = interpolate(animTrazo, [0, 1], [perimetro, 0]);

  // Animación del chip complementario
  const animChip = spring({
    frame: Math.max(0, frameRel - 8),
    fps: 30,
    config: { damping: 12, stiffness: 220, mass: 0.5 },
  });

  const chipScale = interpolate(animChip, [0, 1], [0.5, 1]);
  const chipOpacity = interpolate(animChip, [0, 0.4, 1], [0, 1, 1]);

  // Pulso periódico del chip cada 20 frames
  const pulsoChip = 1.0 + Math.sin(frameRel * 0.3) * 0.08;

  return (
    <div
      style={{
        position: 'relative',
        width: `${width}px`,
        height: `${height}px`,
        display: 'inline-block',
        pointerEvents: 'none',
      }}
    >
      {/* Trazo SVG Orgánico */}
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'visible',
          filter: `drop-shadow(0 0 10px ${color}90)`,
        }}
      >
        <ellipse
          cx={width / 2}
          cy={height / 2}
          rx={width / 2 - 8}
          ry={height / 2 - 8}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={perimetro}
          strokeDashoffset={strokeOffset}
          transform={`rotate(-12 ${width / 2} ${height / 2})`}
        />
      </svg>

      {/* Chip de Advertencia o Conteo Pulsante */}
      {chipTexto && (
        <div
          style={{
            position: 'absolute',
            top: '-12px',
            right: '-10px',
            transform: `scale(${chipScale * pulsoChip})`,
            opacity: chipOpacity,
            background: color,
            color: '#060814',
            fontFamily: "'Courier New', Courier, monospace",
            fontWeight: 900,
            fontSize: '14px',
            letterSpacing: '0.05em',
            padding: '4px 10px',
            borderRadius: '999px',
            boxShadow: `0 0 16px ${color}, 0 2px 8px rgba(0,0,0,0.7)`,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span>⚡</span>
          <span>{chipTexto}</span>
        </div>
      )}
    </div>
  );
};
