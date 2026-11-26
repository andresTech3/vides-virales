import React from 'react';
import { interpolate, spring } from 'remotion';

export interface HyperTiltCardProps {
  children: React.ReactNode;
  frame: number;
  /** Fotograma de inicio */
  inicioFrame?: number;
  /** Inclinación máxima en grados */
  maxTiltDeg?: number;
  /** Ancho opcional */
  width?: string | number;
  /** Borde brillante acentuado */
  colorBorde?: string;
  style?: React.CSSProperties;
}

/**
 * HyperTiltCard — Inspirado en 'tilt-card' de HyperFrames.
 * 
 * Tarjeta en perspectiva 3D con elevación de capas de profundidad,
 * reflejo especular (sheen) que barre la superficie en la entrada y oscilación física.
 */
export const HyperTiltCard: React.FC<HyperTiltCardProps> = ({
  children,
  frame,
  inicioFrame = 0,
  maxTiltDeg = 6,
  width = '100%',
  colorBorde = 'rgba(56, 189, 248, 0.4)',
  style,
}) => {
  const frameRel = Math.max(0, frame - inicioFrame);

  // Entrada con spring suave
  const entrada = spring({
    frame: frameRel,
    fps: 30,
    config: { damping: 14, stiffness: 180, mass: 0.7 },
  });

  const scale = interpolate(entrada, [0, 1], [0.92, 1]);
  const translateY = interpolate(entrada, [0, 1], [25, 0]);
  const opacity = interpolate(entrada, [0, 1], [0, 1]);

  // Inclinación 3D continua oscilante
  const tiltX = Math.sin(frameRel * 0.05) * maxTiltDeg;
  const tiltY = Math.cos(frameRel * 0.04) * (maxTiltDeg * 0.8);

  // Barrido de reflejo de brillo (sheen)
  const sheenPos = interpolate(entrada, [0, 1], [-100, 200]);

  return (
    <div
      style={{
        perspective: '1000px',
        width,
        display: 'flex',
        justifyContent: 'center',
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        ...style,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
          transformStyle: 'preserve-3d',
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(18px)',
          borderRadius: '24px',
          border: `1.5px solid ${colorBorde}`,
          boxShadow: `0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px ${colorBorde}30`,
          overflow: 'hidden',
          padding: '28px',
        }}
      >
        {/* Barrido de brillo especular diagonal */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.18) 50%, transparent 60%)`,
            transform: `translateX(${sheenPos}%)`,
            pointerEvents: 'none',
          }}
        />

        {/* Capa de contenido interno con elevación en Z */}
        <div style={{ transform: 'translateZ(30px)', position: 'relative', zIndex: 2 }}>
          {children}
        </div>
      </div>
    </div>
  );
};
