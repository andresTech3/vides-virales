import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import type { EscenaGuion } from '../esquemas/guion.schema';
import type { EstiloPreset } from '../estilos';

interface FormatProps {
  escena: EscenaGuion;
  estilo: EstiloPreset;
  frameEnEscena: number;
}

export const QuoteWisdomRenderer: React.FC<FormatProps> = ({ escena, estilo, frameEnEscena }) => {
  const frame = frameEnEscena;

  // Movimiento cinematográfico lento (slow drift)
  const slowZoom = interpolate(frame, [0, 300], [1, 1.08]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '90px 60px',
        textAlign: 'center',
        transform: `scale(${slowZoom})`,
      }}
    >
      {/* Comillas Grandes */}
      <div
        style={{
          fontFamily: "'Georgia', serif",
          fontSize: '120px',
          color: estilo.colorAcento,
          lineHeight: 0.5,
          marginBottom: '32px',
          opacity: 0.7,
        }}
      >
        “
      </div>

      {/* Cita Textual */}
      <blockquote
        style={{
          fontFamily: "'Georgia', serif",
          fontSize: '56px',
          fontStyle: 'italic',
          fontWeight: 400,
          color: '#f8fafc',
          lineHeight: 1.25,
          letterSpacing: '-0.01em',
          maxWidth: '860px',
          marginBottom: '40px',
        }}
      >
        {escena.tituloVisual || escena.textoNarracion}
      </blockquote>

      {/* Autor */}
      <div
        style={{
          fontFamily: estilo.fuenteSubtitulo,
          fontSize: '24px',
          fontWeight: 700,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: estilo.colorAcento,
          borderTop: `1px solid ${estilo.colorAcento}50`,
          paddingTop: '16px',
        }}
      >
        {escena.subtituloVisual || 'MARCO AURELIO — MEDITACIONES'}
      </div>
    </div>
  );
};
