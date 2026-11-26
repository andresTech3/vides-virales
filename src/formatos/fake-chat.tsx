import React from 'react';
import { spring } from 'remotion';
import type { EscenaGuion } from '../esquemas/guion.schema';
import type { EstiloPreset } from '../estilos';
import { HyperTiltCard, HyperTypingIndicator } from '../remotion/hyperframes';

interface FormatProps {
  escena: EscenaGuion;
  estilo: EstiloPreset;
  frameEnEscena: number;
}

export const FakeChatRenderer: React.FC<FormatProps> = ({ escena, estilo, frameEnEscena }) => {
  const frame = frameEnEscena;

  const mensajes = escena.props?.mensajes || [
    { remitente: 'otro', texto: '¿Dónde estás?' },
    { remitente: 'yo', texto: 'En casa descansando 😴' },
    { remitente: 'otro', texto: 'Mentira. Estoy viendo tu auto afuera de su edificio.' },
  ];

  // Mostrar el indicador de "escribiendo..." antes de que aparezca el último mensaje
  const delayUltimo = (mensajes.length - 1) * 28;
  const mostrarEscribiendo = frame < delayUltimo && frame >= delayUltimo - 24;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 40px',
      }}
    >
      {/* Contenedor Mockup de Teléfono Móvil con HyperTiltCard 3D */}
      <HyperTiltCard
        frame={frame}
        inicioFrame={0}
        maxTiltDeg={4}
        width="880px"
        colorBorde="rgba(255, 255, 255, 0.2)"
        style={{ padding: 0, borderRadius: '48px', overflow: 'hidden' }}
      >
        <div
          style={{
            width: '100%',
            height: '1200px',
            background: '#0c0f14',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}
        >
          {/* Barra Superior de Contacto */}
          <div
            style={{
              padding: '28px 32px',
              background: 'rgba(255, 255, 255, 0.04)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#374151',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
              }}
            >
              🕵️‍♂️
            </div>
            <div>
              <div
                style={{
                  fontFamily: estilo.fuenteTitulo,
                  fontSize: '32px',
                  fontWeight: 800,
                  color: '#ffffff',
                }}
              >
                Número Desconocido
              </div>
              <div
                style={{
                  fontFamily: estilo.fuenteSubtitulo,
                  fontSize: '18px',
                  color: '#4ade80',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80' }} />
                En línea ahora
              </div>
            </div>
          </div>

          {/* Zona de Mensajes */}
          <div
            style={{
              flex: 1,
              padding: '36px 32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              overflow: 'hidden',
            }}
          >
            {mensajes.map((msg: any, i: number) => {
              const delay = i * 28;
              const esVisible = frame >= delay;
              if (!esVisible) return null;

              const entrada = spring({
                frame: frame - delay,
                fps: 30,
                config: { damping: 14, stiffness: 220, mass: 0.6 },
              });

              const esYo = msg.remitente === 'yo';

              return (
                <div
                  key={`msg-${i}`}
                  style={{
                    alignSelf: esYo ? 'flex-end' : 'flex-start',
                    maxWidth: '78%',
                    padding: '22px 28px',
                    borderRadius: esYo ? '28px 28px 6px 28px' : '28px 28px 28px 6px',
                    background: esYo ? '#059669' : '#1f2937',
                    color: '#ffffff',
                    fontFamily: estilo.fuenteSubtitulo,
                    fontSize: '32px',
                    fontWeight: 600,
                    lineHeight: 1.3,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                    transform: `scale(${entrada})`,
                    opacity: Math.min(1, (frame - delay) / 5),
                  }}
                >
                  {msg.texto}
                </div>
              );
            })}

            {/* Burbuja Animada "Escribiendo..." de HyperFrames */}
            {mostrarEscribiendo && (
              <HyperTypingIndicator frame={frame} />
            )}
          </div>
        </div>
      </HyperTiltCard>
    </div>
  );
};
