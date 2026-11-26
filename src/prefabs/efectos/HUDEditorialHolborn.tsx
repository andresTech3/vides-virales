/**
 * HUDEditorialHolborn — Overlay técnico y editorial idéntico a las referencias virales.
 * 
 * Incluye:
 * - Header de estación: ubicación, punto GPS pulsante, reloj militar digital.
 * - Pill badge de métrica en vivo: "PEOPLE PER MIN: 150 (+30%)".
 * - Tarjeta lateral de flujo de pasajeros y velocidad de avance.
 * - Subtítulos editoriales nítidos con resaltado de palabras clave en ámbar/naranja.
 */

import React from 'react';
import { interpolate } from 'remotion';

export interface PropsHUDEditorial {
  ubicacion?: string;
  tiempoReloj?: string;
  metricaPrincipal?: {
    etiqueta: string;
    valor: string;
    incremento?: string;
  };
  telemetria?: Array<{
    clave: string;
    valor: string;
    color?: string;
  }>;
  /** Progreso de la escena actual (0–1) */
  t?: number;
  /** Frame actual relativo */
  frame?: number;
  /** Texto destacado en pantalla (editorial) */
  textoEditorial?: string;
  palabraClave?: string;
}

export const HUDEditorialHolborn: React.FC<PropsHUDEditorial> = ({
  ubicacion = 'HOLBORN STATION — LONDON',
  tiempoReloj = '08:31:32',
  metricaPrincipal = {
    etiqueta: 'PEOPLE PER MIN',
    valor: '150',
    incremento: '+30%',
  },
  telemetria = [
    { clave: 'ESCALATOR ANGLE', valor: '30.0°' },
    { clave: 'FLOW VELOCITY', valor: '0.75 m/s' },
    { clave: 'PASSENGER DENSITY', valor: '1.4 p/m²' },
  ],
  t = 0,
  frame = 0,
  textoEditorial,
  palabraClave,
}) => {
  // Animación de entrada suave
  const opacidadEntrada = Math.min(1, t * 5);
  const translateY = interpolate(t, [0, 0.15], [-20, 0], {
    extrapolateRight: 'clamp',
  });

  // Reloj digital militar animado en tiempo real basado en el frame
  const segundosBase = 32 + Math.floor(frame / 30);
  const minBase = 31 + Math.floor(segundosBase / 60);
  const ss = (segundosBase % 60).toString().padStart(2, '0');
  const mm = (minBase % 60).toString().padStart(2, '0');
  const relojAnimado = `08:${mm}:${ss}`;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '60px 48px',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        color: '#ffffff',
        zIndex: 50,
        opacity: opacidadEntrada,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {/* ── HEADER SUPERIOR EDITORIAL ──────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          width: '100%',
        }}
      >
        {/* Lado izquierdo: Ubicación + Dot pulsante */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(15, 23, 42, 0.72)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              padding: '8px 18px',
              borderRadius: '999px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
            }}
          >
            {/* Dot verde de estado en vivo */}
            <span
              style={{
                width: '9px',
                height: '9px',
                borderRadius: '50%',
                background: '#22c55e',
                boxShadow: '0 0 10px #22c55e',
                display: 'inline-block',
              }}
            />
            <span
              style={{
                fontSize: '15px',
                fontWeight: 700,
                letterSpacing: '1.2px',
                textTransform: 'uppercase',
                color: '#f8fafc',
              }}
            >
              {ubicacion}
            </span>
          </div>

          {/* Reloj militar en vivo */}
          <div
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.65)',
              fontFamily: "'Courier New', Courier, monospace",
              letterSpacing: '1.5px',
              paddingLeft: '14px',
            }}
          >
            TIME: {relojAnimado} UTC+1
          </div>
        </div>

        {/* Lado derecho: Badge métrico principal */}
        {metricaPrincipal && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              padding: '12px 20px',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            }}
          >
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '1.5px',
                color: 'rgba(255, 255, 255, 0.55)',
                textTransform: 'uppercase',
                marginBottom: '4px',
              }}
            >
              {metricaPrincipal.etiqueta}
            </span>
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '8px',
              }}
            >
              <span
                style={{
                  fontSize: '28px',
                  fontWeight: 900,
                  color: '#ffffff',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {metricaPrincipal.valor}
              </span>
              {metricaPrincipal.incremento && (
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 800,
                    color: '#22c55e',
                    background: 'rgba(34, 197, 94, 0.15)',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                  }}
                >
                  {metricaPrincipal.incremento}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── TELEMETRÍA LATERAL DERECHA (Puntos técnicos) ───────────────── */}
      <div
        style={{
          alignSelf: 'flex-end',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          background: 'rgba(10, 15, 26, 0.65)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '14px 18px',
          borderRadius: '14px',
          minWidth: '220px',
        }}
      >
        <div
          style={{
            fontSize: '10px',
            fontWeight: 800,
            letterSpacing: '1.8px',
            color: '#38bdf8',
            textTransform: 'uppercase',
            marginBottom: '4px',
          }}
        >
          // TELEMETRY STREAM
        </div>
        {telemetria.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '12px',
              gap: '16px',
            }}
          >
            <span style={{ color: 'rgba(255, 255, 255, 0.55)', fontWeight: 500 }}>
              {item.clave}
            </span>
            <span
              style={{
                color: item.color ?? '#f8fafc',
                fontWeight: 700,
                fontFamily: "'Courier New', Courier, monospace",
              }}
            >
              {item.valor}
            </span>
          </div>
        ))}
      </div>

      {/* ── TEXTO EDITORIAL INFERIOR (Gancho o explicación científica) ─── */}
      {textoEditorial && (
        <div
          style={{
            width: '100%',
            textAlign: 'center',
            marginBottom: '80px',
          }}
        >
          <div
            style={{
              display: 'inline-block',
              background: 'rgba(9, 13, 22, 0.82)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              padding: '18px 32px',
              borderRadius: '20px',
              maxWidth: '920px',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5)',
            }}
          >
            <p
              style={{
                fontSize: '28px',
                fontWeight: 700,
                lineHeight: 1.35,
                margin: 0,
                letterSpacing: '-0.3px',
                color: '#f8fafc',
              }}
            >
              {palabraClave
                ? textoEditorial.split(new RegExp(`(${palabraClave})`, 'gi')).map((part, i) =>
                    part.toLowerCase() === palabraClave.toLowerCase() ? (
                      <span
                        key={i}
                        style={{
                          color: '#f97316',
                          textShadow: '0 0 20px rgba(249, 115, 22, 0.5)',
                          fontWeight: 900,
                        }}
                      >
                        {part}
                      </span>
                    ) : (
                      part
                    )
                  )
                : textoEditorial}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
