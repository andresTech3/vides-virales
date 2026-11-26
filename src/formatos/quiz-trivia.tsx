import React from 'react';
import type { EscenaGuion } from '../esquemas/guion.schema';
import type { EstiloPreset } from '../estilos';
import { HyperVoxAnnotate, HyperTiltCard, HyperCirclePointer } from '../remotion/hyperframes';

interface FormatProps {
  escena: EscenaGuion;
  estilo: EstiloPreset;
  frameEnEscena: number;
}

export const QuizTriviaRenderer: React.FC<FormatProps> = ({ escena, estilo, frameEnEscena }) => {
  const frame = frameEnEscena;
  const duracionTotal = escena.duracionFrames || 120;

  // Temporizador regresivo de 3 segundos (90 frames)
  const timerProgress = Math.min(1, Math.max(0, 1 - frame / (duracionTotal * 0.75)));
  const segundosRestantes = Math.max(1, Math.ceil(timerProgress * 3));
  const esFaseRevelacion = escena.tipo === 'quiz_revelacion' || frame > duracionTotal * 0.75;

  const opciones = escena.props?.opciones || [
    { texto: 'La Luna', esCorrecta: false },
    { texto: 'La Tierra (Correcta)', esCorrecta: true },
    { texto: 'Marte', esCorrecta: false },
  ];

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 48px',
        textAlign: 'center',
      }}
    >
      {/* Badge Superior de Trivia */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 28px',
          borderRadius: '999px',
          background: 'rgba(234, 179, 8, 0.15)',
          border: '2px solid #eab308',
          marginBottom: '28px',
        }}
      >
        <span style={{ fontSize: '24px' }}>🎯</span>
        <span
          style={{
            fontFamily: estilo.fuenteSubtitulo,
            fontSize: '22px',
            fontWeight: 900,
            color: '#facc15',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          TRIVIA RELÁMPAGO • ¿SABES LA RESPUESTA?
        </span>
      </div>

      {/* Pregunta con HyperVoxAnnotate */}
      <HyperVoxAnnotate
        frame={frame}
        inicioFrame={6}
        labelCallout="DESAFÍO EN VIVO"
        colorMarcador="#facc15"
        colorEtiqueta="#38bdf8"
      >
        <h2
          style={{
            fontFamily: estilo.fuenteTitulo,
            fontSize: '52px',
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1.15,
            marginBottom: '32px',
            maxWidth: '920px',
            textShadow: '0 4px 20px rgba(0,0,0,0.8)',
          }}
        >
          {escena.tituloVisual || escena.textoNarracion || '¿Cuál de estos planetas tiene mayor densidad?'}
        </h2>
      </HyperVoxAnnotate>

      {/* Temporizador Circular con Tic-Tac */}
      {!esFaseRevelacion && (
        <div
          style={{
            position: 'relative',
            width: '130px',
            height: '130px',
            marginBottom: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="130" height="130" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r="60" stroke="rgba(255,255,255,0.15)" strokeWidth="10" fill="none" />
            <circle
              cx="70"
              cy="70"
              r="60"
              stroke={timerProgress < 0.3 ? '#f87171' : '#faae33'}
              strokeWidth="10"
              fill="none"
              strokeDasharray={377}
              strokeDashoffset={377 * (1 - timerProgress)}
              strokeLinecap="round"
              transform="rotate(-90 70 70)"
            />
          </svg>
          <span
            style={{
              position: 'absolute',
              fontFamily: estilo.fuenteTitulo,
              fontSize: '48px',
              fontWeight: 900,
              color: timerProgress < 0.3 ? '#f87171' : '#ffffff',
            }}
          >
            {segundosRestantes}
          </span>
        </div>
      )}

      {/* Tarjetas de Opciones dentro de HyperTiltCard */}
      <HyperTiltCard frame={frame} inicioFrame={8} maxTiltDeg={4} width="880px" colorBorde={estilo.colorAcento}>
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}
        >
          {opciones.map((op: any, i: number) => {
            const letras = ['A', 'B', 'C', 'D'];
            const esCorrecta = op.esCorrecta;

            let bg = 'rgba(255, 255, 255, 0.05)';
            let border = '1.5px solid rgba(255, 255, 255, 0.15)';
            let textColor = '#ffffff';

            if (esFaseRevelacion) {
              if (esCorrecta) {
                bg = 'rgba(74, 222, 128, 0.25)';
                border = '3px solid #4ade80';
                textColor = '#4ade80';
              } else {
                bg = 'rgba(248, 113, 113, 0.12)';
                border = '1px solid rgba(248, 113, 113, 0.3)';
                textColor = 'rgba(255, 255, 255, 0.4)';
              }
            }

            return (
              <div
                key={`opt-${i}`}
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '24px',
                  padding: '20px 28px',
                  background: bg,
                  border,
                  borderRadius: '20px',
                  backdropFilter: 'blur(12px)',
                  transform: esFaseRevelacion && esCorrecta ? 'scale(1.03)' : 'scale(1)',
                  boxShadow: esFaseRevelacion && esCorrecta ? '0 0 35px rgba(74, 222, 128, 0.4)' : 'none',
                  transition: 'transform 0.2s ease',
                }}
              >
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '14px',
                    background: esFaseRevelacion && esCorrecta ? '#4ade80' : estilo.colorAcento,
                    color: '#000000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    fontWeight: 900,
                    flexShrink: 0,
                  }}
                >
                  {letras[i] || '•'}
                </div>
                <span
                  style={{
                    fontFamily: estilo.fuenteSubtitulo,
                    fontSize: '28px',
                    fontWeight: 800,
                    color: textColor,
                    textAlign: 'left',
                  }}
                >
                  {op.texto}
                </span>
                {esFaseRevelacion && esCorrecta && (
                  <>
                    <span style={{ marginLeft: 'auto', fontSize: '28px' }}>✅</span>
                    <div style={{ position: 'absolute', right: '-15px', top: '-15px' }}>
                      <HyperCirclePointer
                        frame={frame}
                        inicioFrame={Math.floor(duracionTotal * 0.75)}
                        width={120}
                        height={60}
                        color="#4ade80"
                        chipTexto="CORRECTO"
                      />
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </HyperTiltCard>
    </div>
  );
};
