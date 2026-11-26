import React from 'react';
import { interpolate, spring } from 'remotion';

export interface HyperCameraMoveProps {
  children: React.ReactNode;
  frame: number;
  /** Tipo de movimiento de cámara: 'punch_in', 'slow_drift', 'shake_punch', 'orbit_subtle' */
  tipo?: 'punch_in' | 'slow_drift' | 'shake_punch' | 'orbit_subtle';
  /** Intensidad global del movimiento (0.5 sutil a 1.5 intenso) */
  intensidad?: number;
  /** Si es true, añade un sutil viñeteado periférico dinámico */
  conDefocusBorde?: boolean;
}

/**
 * HyperCameraMove — Inspirado en 'yt-camera-move' y 'ui-focus-zoom' del catálogo HyperFrames.
 * 
 * Añade dinamismo cinematográfico continuo a cualquier composición:
 * - Resorte de aterrizaje inicial (punch-in acelerado).
 * - Drift / deriva constante en perspectiva 3D para evitar frames estáticos.
 * - Inclinación 3D (pitch y yaw) sutil con perspectiva de 1200px.
 */
export const HyperCameraMove: React.FC<HyperCameraMoveProps> = ({
  children,
  frame,
  tipo = 'punch_in',
  intensidad = 1.0,
  conDefocusBorde = true,
}) => {
  // Resorte suave de entrada
  const entrada = spring({
    frame,
    fps: 30,
    config: { damping: 18, stiffness: 140, mass: 0.8 },
  });

  let scale = 1.0;
  let rotateX = 0;
  let rotateY = 0;
  let panX = 0;
  let panY = 0;

  if (tipo === 'punch_in') {
    // Empieza en 1.06 y aterriza suavemente en 1.01 con suave zoom continuo
    const punchIn = interpolate(entrada, [0, 1], [1.06 * intensidad, 1.0]);
    const drift = 1.0 + (frame / 300) * 0.03 * intensidad;
    scale = punchIn * drift;
    rotateX = Math.sin(frame * 0.04) * 0.6 * intensidad;
    rotateY = Math.cos(frame * 0.03) * 0.8 * intensidad;
    panY = Math.sin(frame * 0.05) * 4 * intensidad;
  } else if (tipo === 'shake_punch') {
    // Sacudida de impacto en los primeros 12 frames
    const shakeFade = frame < 12 ? (1 - frame / 12) : 0;
    panX = Math.sin(frame * 3.1) * 8 * shakeFade * intensidad;
    panY = Math.cos(frame * 2.7) * 8 * shakeFade * intensidad;
    scale = 1.0 + shakeFade * 0.04 * intensidad + (frame / 300) * 0.02;
  } else if (tipo === 'orbit_subtle') {
    // Paneo orbital amplio
    scale = 1.02 + Math.sin(frame * 0.03) * 0.015 * intensidad;
    rotateY = Math.sin(frame * 0.02) * 2.0 * intensidad;
    rotateX = Math.cos(frame * 0.025) * 1.2 * intensidad;
    panX = Math.sin(frame * 0.02) * 12 * intensidad;
  } else {
    // Slow drift clásico
    scale = 1.0 + (frame / 300) * 0.04 * intensidad;
    panY = -(frame / 300) * 10 * intensidad;
  }

  // Viñeteado dinámico que aumenta durante aceleraciones
  const vignetaAlpha = conDefocusBorde
    ? interpolate(entrada, [0, 1], [0.45 * intensidad, 0.25 * intensidad])
    : 0;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        perspective: '1200px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          transform: `translate3d(${panX}px, ${panY}px, 0) scale(${scale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transformOrigin: 'center center',
          willChange: 'transform',
        }}
      >
        {children}
      </div>

      {/* Viñeta de Defocus Cinemática Periférica */}
      {conDefocusBorde && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at 50% 50%, transparent 60%, rgba(0, 0, 0, 0.7) 100%)',
            opacity: vignetaAlpha,
            pointerEvents: 'none',
            zIndex: 80,
          }}
        />
      )}
    </div>
  );
};
