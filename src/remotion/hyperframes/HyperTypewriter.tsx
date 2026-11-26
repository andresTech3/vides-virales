import React from 'react';
import { interpolate } from 'remotion';

export interface HyperTypewriterProps {
  texto: string;
  frame: number;
  /** Velocidad de escritura en caracteres por segundo (ej: 25) */
  caracteresPorSegundo?: number;
  /** Fotograma de inicio */
  inicioFrame?: number;
  /** Color del texto */
  colorTexto?: string;
  /** Color del cursor parpadeante */
  colorCursor?: string;
  /** Mostrar cursor */
  mostrarCursor?: boolean;
  /** Estilos CSS opcionales */
  style?: React.CSSProperties;
}

/**
 * HyperTypewriter — Inspirado en 'typewriter' y 'typed-prompt' del catálogo HyperFrames.
 * 
 * Genera un revelado de caracteres determinista y fluido con cursor parpadeante
 * sincronizado al fotograma, eliminando cualquier desfase entre renders.
 */
export const HyperTypewriter: React.FC<HyperTypewriterProps> = ({
  texto,
  frame,
  caracteresPorSegundo = 26,
  inicioFrame = 0,
  colorTexto = '#ffffff',
  colorCursor = '#38bdf8',
  mostrarCursor = true,
  style,
}) => {
  const frameRel = Math.max(0, frame - inicioFrame);
  const segundos = frameRel / 30;

  // Cantidad de caracteres revelados en este fotograma
  const charsVisibles = Math.min(
    texto.length,
    Math.floor(segundos * caracteresPorSegundo)
  );
  const textoActual = texto.slice(0, charsVisibles);
  const completado = charsVisibles >= texto.length;

  // Parpadeo del cursor (cada 14 frames oscila)
  const cursorVisible =
    mostrarCursor && (!completado || Math.floor(frameRel / 10) % 2 === 0);

  return (
    <span
      style={{
        display: 'inline',
        color: colorTexto,
        ...style,
      }}
    >
      {textoActual}
      {cursorVisible && (
        <span
          style={{
            display: 'inline-block',
            width: '3px',
            height: '1.05em',
            backgroundColor: colorCursor,
            marginLeft: '3px',
            verticalAlign: 'baseline',
            boxShadow: `0 0 10px ${colorCursor}`,
          }}
        />
      )}
    </span>
  );
};
