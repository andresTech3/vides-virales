/**
 * SoundDesign.tsx — Motor de Diseño Sonoro y Audio Ducking para Remotion.
 * - Sincroniza música de fondo con atenuación automática (ducking) cuando la voz habla.
 * - Dispara efectos sonoros (Whoosh, Impact Boom, Pop) en transiciones de escena y datos clave.
 */

import React from 'react';
import { Audio, Sequence, useCurrentFrame, interpolate } from 'remotion';
import type { GuionCompleto } from '../../esquemas/guion.schema';

export interface SoundDesignProps {
  guion: GuionCompleto;
  audioVozDataUrl?: string;
  musicaDataUrl?: string;
  sfxMap?: Record<string, string>;
}

export const SoundDesign: React.FC<SoundDesignProps> = ({
  guion,
  audioVozDataUrl,
  musicaDataUrl,
  sfxMap = {},
}) => {
  const frame = useCurrentFrame();

  // Recolectar todos los intervalos de palabras de todos los subtítulos
  const palabras = guion.escenas.flatMap((e) => e.subtitulos || []);

  // Determinar si hay alguna palabra sonando en este frame exacto
  const hayVozActiva = palabras.some(
    (p) => frame >= p.inicioFrame - 2 && frame <= p.finFrame + 3
  );

  // Auto-Ducking Dinámico: 0.10 si hay voz activa, 0.32 en silencios dramáticos
  const volumenMusica = hayVozActiva ? 0.11 : 0.32;

  return (
    <>
      {/* 1. Pista Principal de Voz en Off */}
      {audioVozDataUrl && <Audio src={audioVozDataUrl} volume={1.0} />}

      {/* 2. Pista de Música de Fondo con Ducking Automático */}
      {musicaDataUrl && (
        <Audio
          src={musicaDataUrl}
          volume={volumenMusica}
          loop
        />
      )}

      {/* 3. Efectos de Sonido (SFX) Sincronizados por Escena */}
      {guion.escenas.map((escena, idx) => {
        const esPrimera = idx === 0;
        const esDatoGrande = escena.tipo === 'dato_grande';
        const esImpacto = escena.tipo === 'consecuencia' || escena.tipo === 'giro';

        return (
          <React.Fragment key={`sfx-${escena.id}-${idx}`}>
            {/* Whoosh de transición en cada cambio de escena (excepto el frame 0 inicial) */}
            {!esPrimera && sfxMap.whoosh && (
              <Sequence
                from={Math.max(0, escena.inicioFrame - 4)}
                durationInFrames={20}
              >
                <Audio src={sfxMap.whoosh} volume={0.65} />
              </Sequence>
            )}

            {/* Impact Boom Sub-bajo en el Hook inicial y en datos gigantes */}
            {(esPrimera || esDatoGrande || esImpacto) && sfxMap.impact_boom && (
              <Sequence
                from={esPrimera ? 0 : escena.inicioFrame + 2}
                durationInFrames={40}
              >
                <Audio src={sfxMap.impact_boom} volume={esPrimera ? 0.9 : 0.75} />
              </Sequence>
            )}

            {/* Pop orgánico al revelarse badges y números clave */}
            {sfxMap.pop && (
              <Sequence
                from={escena.inicioFrame + 6}
                durationInFrames={12}
              >
                <Audio src={sfxMap.pop} volume={0.45} />
              </Sequence>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};
