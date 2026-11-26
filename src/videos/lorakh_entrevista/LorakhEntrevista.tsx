import React from 'react';
import { Audio, Sequence, staticFile, useCurrentFrame, interpolate } from 'remotion';
import { EntrevistaHook } from './EntrevistaHook';
import { EntrevistaError } from './EntrevistaError';
import { EntrevistaSolution } from './EntrevistaSolution';
import { EntrevistaImpacto } from './EntrevistaImpacto';
import { EntrevistaOutro } from './EntrevistaOutro';
import { EntrevistaSubtitles } from './EntrevistaSubtitles';
import { BokehBackground } from '../lorakh_quiz/BokehBackground';

export const LORAKH_ENTREVISTA_FRAMES = 1074; // 35.8s @ 30fps

const TransitionFlash: React.FC = () => {
  const frame = useCurrentFrame();
  const transitionPoints = [165, 324, 522, 720, 876];

  let flashOpacity = 0;
  for (const pt of transitionPoints) {
    if (frame >= pt && frame <= pt + 4) {
      flashOpacity = interpolate(frame, [pt, pt + 4], [0.75, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      break;
    }
  }

  if (flashOpacity <= 0.01) return null;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: '#ffffff',
        opacity: flashOpacity,
        zIndex: 99,
        pointerEvents: 'none',
      }}
    />
  );
};

export const LorakhEntrevista: React.FC = () => {
  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        position: 'relative',
        backgroundColor: '#030508',
        overflow: 'hidden',
        color: '#ffffff',
      }}
    >
      {/* 1. Global Master Audio (Natural Alvaro Voice + Suspense Club Beat + SFX) */}
      <Audio
        src={staticFile('lorakh_entrevista/entrevista_audio.mp3')}
        volume={1.0}
      />

      {/* 2. Scene 1: Hook (Frames 0 - 165, 5.5s) */}
      <Sequence from={0} durationInFrames={165}>
        <BokehBackground
          color1="#0d0406"
          color2="#1e0a12"
          haloColor="rgba(239, 68, 68, 0.40)"
        />
        <EntrevistaHook />
      </Sequence>

      {/* 3. Scene 2: El Error Fatal (Frames 165 - 324, 5.3s) */}
      <Sequence from={165} durationInFrames={159}>
        <BokehBackground
          color1="#180406"
          color2="#2b070d"
          haloColor="rgba(239, 68, 68, 0.50)"
        />
        <EntrevistaError />
      </Sequence>

      {/* 4. Scene 3: Solución 1 - Royal Gold (Frames 324 - 522, 6.6s) */}
      <Sequence from={324} durationInFrames={198}>
        <BokehBackground
          color1="#120802"
          color2="#2b1705"
          haloColor="rgba(251, 191, 36, 0.65)"
        />
        <EntrevistaSolution
          headerTag="PARA MÁXIMO ESTATUS Y CALMA"
          perfumeTitle="Royal Gold"
          subtitle="Cedro Blanco & Ámbar Imperial"
          essenceTag="AUTORIDAD & RESPETO"
          bottleImage="lorakh_assets/bottle_gold.png"
          colorTheme="#fbbf24"
          floatingIcons={[
            { icon: '💎', x: 20, y: 38, delay: 4 },
            { icon: '🥂', x: 80, y: 36, delay: 8 },
            { icon: '💼', x: 18, y: 58, delay: 12 },
            { icon: '⌚', x: 82, y: 60, delay: 16 },
          ]}
        />
      </Sequence>

      {/* 5. Scene 4: Solución 2 - Sapphire Ice (Frames 522 - 720, 6.6s) */}
      <Sequence from={522} durationInFrames={198}>
        <BokehBackground
          color1="#020b17"
          color2="#08233e"
          haloColor="rgba(56, 189, 248, 0.65)"
        />
        <EntrevistaSolution
          headerTag="PARA MENTE FRÍA Y SEGURIDAD"
          perfumeTitle="Sapphire Ice"
          subtitle="Cítricos Glaciares & Sándalo"
          essenceTag="FRESCURA & LIDERAZGO"
          bottleImage="lorakh_assets/bottle_ice.png"
          colorTheme="#38bdf8"
          floatingIcons={[
            { icon: '🧊', x: 20, y: 38, delay: 4 },
            { icon: '⚡', x: 80, y: 36, delay: 8 },
            { icon: '🌊', x: 18, y: 58, delay: 12 },
            { icon: '🧭', x: 82, y: 60, delay: 16 },
          ]}
        />
      </Sequence>

      {/* 6. Scene 5: El Impacto Psicológico (Frames 720 - 876, 5.2s) */}
      <Sequence from={720} durationInFrames={156}>
        <BokehBackground
          color1="#080c18"
          color2="#141c30"
          haloColor="rgba(255, 230, 0, 0.40)"
        />
        <EntrevistaImpacto />
      </Sequence>

      {/* 7. Scene 6: Outro & Call to Action (Frames 876 - 1074, 6.6s) */}
      <Sequence from={876} durationInFrames={198}>
        <BokehBackground
          color1="#0e0702"
          color2="#221205"
          haloColor="rgba(251, 191, 36, 0.50)"
        />
        <EntrevistaOutro />
      </Sequence>

      {/* 8. White Flash Cuts on Transitions */}
      <TransitionFlash />

      {/* 9. Dynamic Synchronized Subtitles */}
      <EntrevistaSubtitles />
    </div>
  );
};

