import React from 'react';
import { interpolate, spring } from 'remotion';
import type { EscenaGuion } from '../esquemas/guion.schema';
import type { EstiloPreset } from '../estilos';
import { HyperVoxAnnotate, HyperTypewriter, HyperFeatherSpotlight } from '../remotion/hyperframes';

interface FormatProps {
  escena: EscenaGuion;
  estilo: EstiloPreset;
  frameEnEscena: number;
}

export const MindblownFactsRenderer: React.FC<FormatProps> = ({ escena, estilo, frameEnEscena }) => {
  const frame = frameEnEscena;
  const pulse = Math.sin(frame * 0.15) * 0.05 + 1;

  const entrada = spring({
    frame,
    fps: 30,
    config: { damping: 10, stiffness: 240, mass: 0.5 },
  });

  const zoomScale = interpolate(entrada, [0, 1], [1.3, 1]) * pulse;
  const textoHero = escena.tituloVisual || escena.textoNarracion || 'DATO CIENTÍFICO IMPACTANTE';

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 48px',
        textAlign: 'center',
        position: 'relative',
      }}
    >
      {/* Foco Emplumado HyperFrames */}
      <HyperFeatherSpotlight
        frame={frame}
        centroX={50}
        centroY={50}
        radio={440}
        oscuridadMaxima={0.8}
        colorHalo={`${estilo.colorAcento}20`}
      />

      {/* Luz Estroboscópica Ambiental */}
      <div
        style={{
          position: 'absolute',
          width: '560px',
          height: '560px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${estilo.colorAcento}40 0%, transparent 70%)`,
          filter: 'blur(50px)',
          transform: `scale(${pulse * 1.25})`,
          pointerEvents: 'none',
        }}
      />

      {/* Badge Kinético */}
      <div
        style={{
          padding: '12px 28px',
          background: 'rgba(15, 23, 42, 0.75)',
          border: `2px solid ${estilo.colorAcento}`,
          borderRadius: '999px',
          fontFamily: estilo.fuenteSubtitulo,
          fontSize: '22px',
          fontWeight: 900,
          color: estilo.colorAcento,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: '36px',
          zIndex: 2,
          boxShadow: `0 0 25px ${estilo.colorAcento}40`,
        }}
      >
        🧠 FACT VERIFICADO • PSICOLOGÍA
      </div>

      {/* Frase Gigante de Impacto Kinético con Anotación Vox */}
      <div style={{ zIndex: 2, transform: `scale(${zoomScale})` }}>
        <HyperVoxAnnotate
          frame={frame}
          inicioFrame={6}
          labelCallout="ALERTA MENTAL"
          colorMarcador={estilo.colorAcento}
          colorEtiqueta="#38bdf8"
        >
          <h1
            style={{
              fontFamily: estilo.fuenteTitulo,
              fontSize: '78px',
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1.0,
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
              textShadow: `0 0 40px ${estilo.colorAcento}80, 0 10px 30px rgba(0,0,0,0.9)`,
              maxWidth: '920px',
            }}
          >
            <HyperTypewriter
              texto={textoHero}
              frame={frame}
              caracteresPorSegundo={32}
              inicioFrame={2}
              colorTexto="#ffffff"
              colorCursor={estilo.colorAcento}
            />
          </h1>
        </HyperVoxAnnotate>
      </div>

      {/* Subtítulo Inferior */}
      {escena.subtituloVisual && (
        <div
          style={{
            zIndex: 2,
            marginTop: '32px',
            fontFamily: estilo.fuenteSubtitulo,
            fontSize: '24px',
            fontWeight: 700,
            color: '#94a3b8',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            background: 'rgba(15, 23, 42, 0.65)',
            padding: '8px 24px',
            borderRadius: '999px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {escena.subtituloVisual}
        </div>
      )}
    </div>
  );
};
