import React from 'react';
import { useCurrentFrame, interpolate, spring } from 'remotion';
import type { EscenaGuion } from '../esquemas/guion.schema';
import type { EstiloPreset } from '../estilos';
import { HyperTiltCard, HyperVoxAnnotate } from '../remotion/hyperframes';

interface FormatProps {
  escena: EscenaGuion;
  estilo: EstiloPreset;
  frameEnEscena: number;
}

export const StorytellingSplitRenderer: React.FC<FormatProps> = ({
  escena,
  estilo,
  frameEnEscena,
}) => {
  const frame = frameEnEscena;

  // Animación suave de flotación
  const floatY = Math.sin(frame * 0.08) * 8;

  // Animación del túnel procedural inferior (Satisfying / Kinetic ASMR loop)
  const tunnelSpeed = (frame * 5) % 80;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* MITAD SUPERIOR: HISTORIA / CONFESIÓN */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 40px 20px',
          position: 'relative',
          zIndex: 10,
          background: 'linear-gradient(180deg, #09090f 0%, #13111f 100%)',
          borderBottom: `3px solid ${estilo.colorAcento}`,
        }}
      >
        {/* Tarjeta estilo Reddit / Confesión Viral con HyperTiltCard 3D */}
        <HyperTiltCard
          frame={frame}
          inicioFrame={0}
          maxTiltDeg={4}
          width="920px"
          colorBorde="rgba(255, 255, 255, 0.18)"
        >
          {/* Header de Usuario */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${estilo.colorAcento}, ${estilo.colorSecundario})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '26px',
                fontWeight: 900,
                color: '#000000',
              }}
            >
              👤
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontFamily: estilo.fuenteSubtitulo,
                    fontSize: '22px',
                    fontWeight: 700,
                    color: '#ffffff',
                  }}
                >
                  u/ConfesionesAnonimas
                </span>
                <span
                  style={{
                    fontSize: '14px',
                    background: estilo.colorAcento,
                    color: '#000',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontWeight: 800,
                  }}
                >
                  OP
                </span>
              </div>
              <span
                style={{
                  fontFamily: estilo.fuenteSubtitulo,
                  fontSize: '15px',
                  color: 'rgba(255,255,255,0.5)',
                }}
              >
                Hace 4 horas • r/HistoriasDeImpacto
              </span>
            </div>
          </div>

          {/* Título de la Historia con Anotación Vox */}
          <HyperVoxAnnotate
            frame={frame}
            inicioFrame={8}
            labelCallout="TESTIMONIO VIRAL"
            colorMarcador="#f87171"
            colorEtiqueta="#facc15"
          >
            <h2
              style={{
                fontFamily: estilo.fuenteTitulo,
                fontSize: '44px',
                fontWeight: 900,
                color: estilo.colorTexto,
                lineHeight: 1.1,
                marginBottom: '16px',
                letterSpacing: '-0.02em',
                textShadow: '0 4px 15px rgba(0,0,0,0.8)',
              }}
            >
              {escena.tituloVisual || 'NO DEBÍ HABER REVISADO ESE MENSAJE'}
            </h2>
          </HyperVoxAnnotate>

          {/* Badge de Advertencia / Suspenso */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
            <span
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: '#f87171',
                background: 'rgba(248, 113, 113, 0.15)',
                border: '1px solid rgba(248, 113, 113, 0.3)',
                padding: '6px 14px',
                borderRadius: '999px',
              }}
            >
              ⚠ HISTORIA REAL
            </span>
            <span
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: estilo.colorAcento,
                background: 'rgba(250, 174, 51, 0.15)',
                border: `1px solid ${estilo.colorAcento}40`,
                padding: '6px 14px',
                borderRadius: '999px',
              }}
            >
              ⚡ SUSPENSO
            </span>
          </div>
        </HyperTiltCard>
      </div>

      {/* MITAD INFERIOR: GAMEPLAY / PROCEDURAL SATISFYING LOOP (ASMR) */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          background: '#040406',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Generador de Túnel Kinético Perspectivo 3D */}
        <svg width="100%" height="100%" viewBox="0 0 1080 960" style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <linearGradient id="gridGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={estilo.colorAcento} stopOpacity="0.8" />
              <stop offset="100%" stopColor="#040406" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Líneas de horizonte y perspectiva hacia el centro */}
          {Array.from({ length: 14 }).map((_, i) => {
            const angle = (i / 14) * Math.PI;
            const x = 540 + Math.cos(angle) * 900;
            const y = 960;
            return (
              <line
                key={`ray-${i}`}
                x1="540"
                y1="380"
                x2={x}
                y2={y}
                stroke={estilo.colorSecundario}
                strokeWidth="2.5"
                opacity="0.45"
              />
            );
          })}

          {/* Cuadrículas en movimiento hacia la cámara (simulando velocidad extrema) */}
          {Array.from({ length: 9 }).map((_, j) => {
            const progress = ((j * 80 + tunnelSpeed) % 720) / 720;
            const y = 380 + Math.pow(progress, 2.2) * 580;
            const width = Math.pow(progress, 1.8) * 1040;
            const x = 540 - width / 2;
            return (
              <line
                key={`h-${j}`}
                x1={x}
                y1={y}
                x2={x + width}
                y2={y}
                stroke={estilo.colorAcento}
                strokeWidth={2 + progress * 4}
                opacity={0.2 + progress * 0.8}
              />
            );
          })}

          {/* Esfera brillante en el punto de fuga */}
          <circle cx="540" cy="380" r="32" fill={estilo.colorAcento} filter="drop-shadow(0 0 24px #faae33)" />
        </svg>

        {/* Badge Flotante "GAMEPLAY SATISFACTORIO" */}
        <div
          style={{
            position: 'absolute',
            top: 24,
            right: 28,
            padding: '8px 18px',
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            borderRadius: '999px',
            border: '1px solid rgba(255,255,255,0.2)',
            fontFamily: estilo.fuenteSubtitulo,
            fontSize: '15px',
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '0.06em',
          }}
        >
          🎮 HIPERVUELO KINÉTICO
        </div>
      </div>
    </div>
  );
};
