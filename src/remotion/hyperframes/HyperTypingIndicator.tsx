import React from 'react';

export interface HyperTypingIndicatorProps {
  frame: number;
  colorBurbuja?: string;
  colorPuntos?: string;
}

/**
 * HyperTypingIndicator — Inspirado en 'typing-indicator' del catálogo HyperFrames.
 * 
 * La clásica burbuja animada de 3 puntos ("escribiendo...") con oscilación sinusoidal
 * desfasada por punto, idéntica a iMessage/WhatsApp.
 */
export const HyperTypingIndicator: React.FC<HyperTypingIndicatorProps> = ({
  frame,
  colorBurbuja = '#1f2937',
  colorPuntos = '#9ca3af',
}) => {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '16px 22px',
        borderRadius: '24px 24px 24px 6px',
        background: colorBurbuja,
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        alignSelf: 'flex-start',
      }}
    >
      {[0, 1, 2].map((i) => {
        const offset = i * 0.4;
        const translateY = Math.sin(frame * 0.25 + offset) * 5;
        const opacity = 0.4 + (Math.sin(frame * 0.25 + offset) + 1) * 0.3;

        return (
          <div
            key={i}
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: colorPuntos,
              transform: `translateY(${translateY}px)`,
              opacity,
            }}
          />
        );
      })}
    </div>
  );
};
