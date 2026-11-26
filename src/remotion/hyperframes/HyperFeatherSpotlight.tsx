import React from 'react';
import { interpolate } from 'remotion';

export interface HyperFeatherSpotlightProps {
  frame: number;
  /** Coordenada horizontal del foco en porcentaje (ej: 50 para centro) */
  centroX?: number;
  /** Coordenada vertical del foco en porcentaje (ej: 42 para zona superior-media) */
  centroY?: number;
  /** Radio del foco (ej: 350px) */
  radio?: number;
  /** Oscuridad del fondo circundante (0 a 0.95) */
  oscuridadMaxima?: number;
  /** Color de tinte ambiental del halo (ej: rgba(56, 189, 248, 0.15)) */
  colorHalo?: string;
  /** Si debe tener una animación sutil de respiración o expansión */
  respiracion?: boolean;
}

/**
 * HyperFeatherSpotlight — Inspirado en 'yt-feather-highlight' y 'vignette' de HyperFrames.
 * 
 * Oscurece los bordes y crea un foco suave y emplumado que guía inmediatamente
 * los ojos del espectador hacia la información crítica (número gigante o sujeto 3D).
 */
export const HyperFeatherSpotlight: React.FC<HyperFeatherSpotlightProps> = ({
  frame,
  centroX = 50,
  centroY = 40,
  radio = 380,
  oscuridadMaxima = 0.75,
  colorHalo = 'rgba(56, 189, 248, 0.08)',
  respiracion = true,
}) => {
  // Animación de respiración del radio
  const modRadio = respiracion ? Math.sin(frame * 0.08) * 20 : 0;
  const radioFinal = radio + modRadio;

  // Entrada suave en los primeros 10 frames
  const opacidad = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 12,
        opacity: opacidad,
        background: `radial-gradient(circle ${radioFinal}px at ${centroX}% ${centroY}%, ${colorHalo} 0%, rgba(6, 8, 20, 0.25) 55%, rgba(6, 8, 20, ${oscuridadMaxima}) 100%)`,
      }}
    />
  );
};
