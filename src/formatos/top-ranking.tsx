import React from 'react';
import { interpolate, spring } from 'remotion';
import type { EscenaGuion } from '../esquemas/guion.schema';
import type { EstiloPreset } from '../estilos';
import { HyperTiltCard, HyperCirclePointer, HyperVoxAnnotate } from '../remotion/hyperframes';

interface FormatProps {
  escena: EscenaGuion;
  estilo: EstiloPreset;
  frameEnEscena: number;
}

export const TopRankingRenderer: React.FC<FormatProps> = ({ escena, estilo, frameEnEscena }) => {
  const frame = frameEnEscena;
  const posicion = escena.props?.posicion || (escena.id.includes('1') ? 1 : escena.id.includes('2') ? 2 : 3);

  const entrada = spring({
    frame,
    fps: 30,
    config: { damping: 12, stiffness: 200, mass: 0.7 },
  });

  const scale = interpolate(entrada, [0, 1], [0.6, 1]);
  const rotate = interpolate(entrada, [0, 1], [-15, 0]);

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
      {/* Insignia de Ranking Gigante con CirclePointer HyperFrames */}
      <div style={{ position: 'relative', marginBottom: '35px' }}>
        <div
          style={{
            width: '180px',
            height: '180px',
            borderRadius: '40px',
            background: `linear-gradient(135deg, ${posicion === 1 ? '#faae33' : '#38bdf8'}, ${posicion === 1 ? '#f59e0b' : '#6366f1'})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: estilo.fuenteTitulo,
            fontSize: '96px',
            fontWeight: 900,
            color: '#000000',
            boxShadow: `0 0 60px ${posicion === 1 ? '#faae33' : '#38bdf8'}80`,
            transform: `scale(${scale}) rotate(${rotate}deg)`,
          }}
        >
          #{posicion}
        </div>
        <div style={{ position: 'absolute', top: '-15px', left: '-30px', pointerEvents: 'none' }}>
          <HyperCirclePointer
            frame={frame}
            inicioFrame={4}
            width={240}
            height={210}
            color={posicion === 1 ? '#facc15' : '#38bdf8'}
            chipTexto={posicion === 1 ? 'TOP #1' : `RANGO #${posicion}`}
          />
        </div>
      </div>

      {/* Tarjeta de Contenido con HyperTiltCard 3D */}
      <HyperTiltCard frame={frame} inicioFrame={6} maxTiltDeg={5} width="920px" colorBorde={estilo.colorAcento}>
        {/* Título de la Posición */}
        <HyperVoxAnnotate
          frame={frame}
          inicioFrame={12}
          labelCallout={`NIVEL ${posicion}`}
          colorMarcador={estilo.colorAcento}
          colorEtiqueta={estilo.colorSecundario}
        >
          <h2
            style={{
              fontFamily: estilo.fuenteTitulo,
              fontSize: '68px',
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1.05,
              marginBottom: '20px',
              textTransform: 'uppercase',
              textShadow: '0 4px 20px rgba(0,0,0,0.8)',
            }}
          >
            {escena.tituloVisual || `PUESTO NÚMERO ${posicion}`}
          </h2>
        </HyperVoxAnnotate>

        {/* Subtítulo / Revelación */}
        <div
          style={{
            fontFamily: estilo.fuenteSubtitulo,
            fontSize: '26px',
            fontWeight: 700,
            color: estilo.colorAcento,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            background: 'rgba(0,0,0,0.5)',
            padding: '12px 28px',
            borderRadius: '999px',
            border: `1.5px solid ${estilo.colorAcento}40`,
            marginTop: '16px',
            display: 'inline-block',
          }}
        >
          {escena.subtituloVisual || 'DATO CONFIDENCIAL Y VERIFICADO'}
        </div>
      </HyperTiltCard>
    </div>
  );
};
