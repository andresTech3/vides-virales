import React from 'react';

export interface HyperScreenWarpProps {
  frame: number;
  /** Intensidad de las líneas de escaneo (0.05 a 0.3) */
  scanlineOpacidad?: number;
  /** Mostrar timestamp y telemetría de laboratorio */
  conTelemetria?: boolean;
  /** Título del monitor (ej: "SIMULACIÓN FÍSICA A-01", "BIO-LAB LEVEL 4") */
  tituloTelemetria?: string;
  /** Tinte del monitor: 'cian', 'ambar', 'verde', 'neutro' */
  tinte?: 'cian' | 'ambar' | 'verde' | 'neutro';
}

/**
 * HyperScreenWarp — Inspirado en 'yt-screen-warp' del catálogo HyperFrames.
 * 
 * Añade una capa cinematográfica de pantalla analógica/monitor de telemetría:
 * - Scanlines horizontales nítidas.
 * - Brillo sutil de fósforo en los bordes.
 * - Telemetría militar/científica (código de tiempo, REC, retícula de laboratorio).
 */
export const HyperScreenWarp: React.FC<HyperScreenWarpProps> = ({
  frame,
  scanlineOpacidad = 0.12,
  conTelemetria = true,
  tituloTelemetria = 'LABORATORY TELEMETRY // REAL-TIME SIM',
  tinte = 'cian',
}) => {
  const colorTinte =
    tinte === 'cian'
      ? '#38bdf8'
      : tinte === 'ambar'
      ? '#f59e0b'
      : tinte === 'verde'
      ? '#10b981'
      : '#ffffff';

  // Código de tiempo militar determinista
  const segundos = Math.floor(frame / 30);
  const milisegundos = ((frame % 30) * 33).toString().padStart(2, '0');
  const codigoTiempo = `00:00:${segundos.toString().padStart(2, '0')}:${milisegundos}`;

  // Pulso del indicador REC
  const pulsoRec = Math.sin(frame * 0.2) > 0;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 50,
        overflow: 'hidden',
      }}
    >
      {/* 1. SCANLINES HORIZONTALES (Líneas CRT ultra nítidas) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.45) 0px, rgba(0, 0, 0, 0.45) 2px, transparent 2px, transparent 4px)',
          opacity: scanlineOpacidad,
        }}
      />

      {/* 2. VIÑETA CRT CON RESPLANDOR PERIFÉRICO */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at 50% 50%, transparent 65%, rgba(6, 8, 20, 0.7) 100%)',
          boxShadow: `inset 0 0 60px ${colorTinte}15`,
        }}
      />

      {/* 3. RETÍCULA Y TELEMETRÍA CIENTÍFICA */}
      {conTelemetria && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            padding: '40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: '13px',
            letterSpacing: '0.12em',
            color: `${colorTinte}90`,
            textTransform: 'uppercase',
          }}
        >
          {/* Header Superior: REC + Título */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#ef4444',
                  boxShadow: '0 0 8px #ef4444',
                  opacity: pulsoRec ? 1 : 0.25,
                }}
              />
              <span style={{ color: '#ef4444', fontWeight: 900 }}>REC [30 FPS]</span>
            </div>
            <span>{tituloTelemetria}</span>
          </div>

          {/* Footer Inferior: Frame y Timecode */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>FRAME: #{frame.toString().padStart(4, '0')}</span>
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.75)',
                padding: '4px 12px',
                borderRadius: '4px',
                border: `1px solid ${colorTinte}30`,
              }}
            >
              <span>TC: {codigoTiempo}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
