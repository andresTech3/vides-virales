import React from 'react';
import { Audio, Sequence, staticFile, useCurrentFrame, interpolate } from 'remotion';
import { HookScene } from './HookScene';
import { ArchetypeScene } from './ArchetypeScene';
import { BokehBackground } from './BokehBackground';
import { ProgressDots } from './ProgressDots';
import { QuizOutro } from './QuizOutro';
import { QuizSubtitles } from './QuizSubtitles';
import type { ArchetypeData } from './types';

export const LORAKH_QUIZ_FRAMES = 1125; // 37.5s @ 30fps

const ARCHETYPES: ArchetypeData[] = [
  {
    id: 'arq1',
    index: 0,
    traitHeader: 'Si eres dueño de la noche y magnético...',
    perfumeTitle: 'Midnight Club',
    bottleImage: 'lorakh_assets/bottle_midnight.png',
    colorTheme: '#60a5fa',
    haloColor: 'rgba(37, 99, 235, 0.65)',
    bgGradient: ['#030712', '#0c1b36'],
    essenceKeyword: 'Seducción Letal',
    floatingIcons: [
      { icon: '🌙', x: 20, y: 38, delay: 4 },
      { icon: '🪩', x: 80, y: 36, delay: 8 },
      { icon: '👑', x: 18, y: 58, delay: 12 },
      { icon: '🔥', x: 82, y: 60, delay: 16 },
    ],
    startFrame: 105,
    endFrame: 270,
  },
  {
    id: 'arq2',
    index: 1,
    traitHeader: 'Si buscas poder y elegancia exclusiva...',
    perfumeTitle: 'Royal Gold',
    bottleImage: 'lorakh_assets/bottle_gold.png',
    colorTheme: '#fbbf24',
    haloColor: 'rgba(217, 119, 6, 0.65)',
    bgGradient: ['#120802', '#2a1604'],
    essenceKeyword: 'Distinción Pura',
    floatingIcons: [
      { icon: '💎', x: 20, y: 38, delay: 4 },
      { icon: '🥂', x: 80, y: 36, delay: 8 },
      { icon: '💼', x: 18, y: 58, delay: 12 },
      { icon: '⌚', x: 82, y: 60, delay: 16 },
    ],
    startFrame: 270,
    endFrame: 435,
  },
  {
    id: 'arq3',
    index: 2,
    traitHeader: 'Si eres libre, activo y lleno de energía...',
    perfumeTitle: 'Sapphire Ice',
    bottleImage: 'lorakh_assets/bottle_ice.png',
    colorTheme: '#38bdf8',
    haloColor: 'rgba(14, 165, 233, 0.65)',
    bgGradient: ['#020b17', '#08233e'],
    essenceKeyword: 'Frescura Explosiva',
    floatingIcons: [
      { icon: '🧊', x: 20, y: 38, delay: 4 },
      { icon: '⚡', x: 80, y: 36, delay: 8 },
      { icon: '🌊', x: 18, y: 58, delay: 12 },
      { icon: '🧭', x: 82, y: 60, delay: 16 },
    ],
    startFrame: 435,
    endFrame: 609,
  },
  {
    id: 'arq4',
    index: 3,
    traitHeader: 'Si eres carismático, dulce y seductor...',
    perfumeTitle: 'Velvet Amber',
    bottleImage: 'lorakh_assets/bottle_velvet.png',
    colorTheme: '#fb7185',
    haloColor: 'rgba(225, 29, 72, 0.65)',
    bgGradient: ['#17050e', '#340d1e'],
    essenceKeyword: 'Atracción Irresistible',
    floatingIcons: [
      { icon: '🌹', x: 20, y: 38, delay: 4 },
      { icon: '💖', x: 80, y: 36, delay: 8 },
      { icon: '✨', x: 18, y: 58, delay: 12 },
      { icon: '🍯', x: 82, y: 60, delay: 16 },
    ],
    startFrame: 609,
    endFrame: 780,
  },
  {
    id: 'arq5',
    index: 4,
    traitHeader: 'Si buscas máxima sobriedad y autoridad...',
    perfumeTitle: 'Nocturne Extrait',
    bottleImage: 'lorakh_assets/bottle_extrait.png',
    colorTheme: '#f43f5e',
    haloColor: 'rgba(190, 18, 60, 0.65)',
    bgGradient: ['#120206', '#290613'],
    essenceKeyword: 'Impacto Absoluto',
    floatingIcons: [
      { icon: '🏆', x: 20, y: 38, delay: 4 },
      { icon: '🧬', x: 80, y: 36, delay: 8 },
      { icon: '♠️', x: 18, y: 58, delay: 12 },
      { icon: '🛡️', x: 82, y: 60, delay: 16 },
    ],
    startFrame: 780,
    endFrame: 954,
  },
];

// High-impact transition flash overlay
const TransitionFlash: React.FC = () => {
  const frame = useCurrentFrame();
  const transitionPoints = [105, 270, 435, 609, 780, 954];

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

export const LorakhQuiz: React.FC = () => {
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
      {/* 1. Global Master Natural Audio (Clean Alvaro Voice + Club Phonk House + SFX) */}
      <Audio
        src={staticFile('lorakh_quiz/quiz_audio.mp3')}
        volume={1.0}
      />

      {/* 2. Scene 0: High-Dopamine Hook (Frames 0 - 105, 3.5s) */}
      <Sequence from={0} durationInFrames={105}>
        <BokehBackground
          color1="#0a0518"
          color2="#180b33"
          haloColor="rgba(234, 179, 8, 0.45)"
        />
        <HookScene />
      </Sequence>

      {/* 3. Archetype Sequences (5 Archetypes x 5.5-5.8s each) */}
      {ARCHETYPES.map((arq) => (
        <Sequence
          key={arq.id}
          from={arq.startFrame}
          durationInFrames={arq.endFrame - arq.startFrame}
        >
          <BokehBackground
            color1={arq.bgGradient[0]}
            color2={arq.bgGradient[1]}
            haloColor={arq.haloColor}
          />
          <ProgressDots
            currentIdx={arq.index}
            total={5}
            activeColor={arq.colorTheme}
          />
          <ArchetypeScene data={arq} />
        </Sequence>
      ))}

      {/* 4. Outro Cierre Final: Lineup + CTA (Frames 954 - 1125, 5.7s) */}
      <Sequence from={954} durationInFrames={171}>
        <BokehBackground
          color1="#0e0702"
          color2="#221205"
          haloColor="rgba(217, 119, 6, 0.50)"
        />
        <QuizOutro />
      </Sequence>

      {/* 5. Fast Kinetic Transition Flash */}
      <TransitionFlash />

      {/* 6. Global Synchronized Dynamic Subtitles */}
      <QuizSubtitles />
    </div>
  );
};
