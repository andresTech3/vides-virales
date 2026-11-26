import React from 'react';
import { interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Img } from 'remotion';

export const EntrevistaHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Camera progressive punch zoom
  const camScale = interpolate(frame, [0, 25, 140, 165], [0.88, 1.04, 1.10, 1.22], {
    extrapolateRight: 'clamp',
  });

  // Header entrance
  const titleSpring = spring({
    frame: frame - 4,
    fps,
    config: { damping: 12, mass: 0.6, stiffness: 180 },
  });

  // Timer entrance
  const timerSpring = spring({
    frame: frame - 14,
    fps,
    config: { damping: 11, mass: 0.5, stiffness: 200 },
  });

  // Calculate ticking seconds from 04:59 down
  const elapsedSec = Math.floor(frame / 30);
  const remainingSec = Math.max(54, 59 - elapsedSec);
  const timerString = `04:${String(remainingSec).padStart(2, '0')}`;

  // Pulse on each second tick
  const tickPulse = 1.0 + Math.sin(frame * 0.209) * 0.05;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `scale(${camScale})`,
        transformOrigin: 'center center',
      }}
    >
      {/* Background radial glow */}
      <div
        style={{
          position: 'absolute',
          width: 850,
          height: 850,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(239, 68, 68, 0.22) 0%, rgba(245, 158, 11, 0.15) 45%, rgba(0,0,0,0) 70%)',
          filter: 'blur(55px)',
          zIndex: 0,
        }}
      />

      {/* Floating bottle silhouette in background */}
      <div
        style={{
          position: 'absolute',
          top: '46%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 0.28,
          filter: 'brightness(0.6) blur(2px) drop-shadow(0 0 45px rgba(251, 191, 36, 0.5))',
          zIndex: 1,
        }}
      >
        <Img
          src={staticFile('lorakh_assets/bottle_gold.png')}
          style={{ width: 440, height: 'auto', objectFit: 'contain' }}
        />
      </div>

      {/* Top Tag: Situación de Alto Impacto */}
      <div
        style={{
          position: 'absolute',
          top: 210,
          padding: '10px 28px',
          borderRadius: 30,
          backgroundColor: 'rgba(239, 68, 68, 0.18)',
          border: '1.5px solid #ef4444',
          boxShadow: '0 0 25px rgba(239, 68, 68, 0.45)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          zIndex: 20,
        }}
      >
        <span style={{ fontSize: 22 }}>⏱️</span>
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 18,
            fontWeight: 900,
            letterSpacing: 3,
            color: '#ffffff',
            textTransform: 'uppercase',
          }}
        >
          DECISIÓN EN 5 MINUTOS
        </span>
      </div>

      {/* Ticking Digital Chronometer */}
      <div
        style={{
          position: 'absolute',
          top: 310,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          opacity: Math.max(0, timerSpring),
          transform: `scale(${timerSpring * tickPulse})`,
          zIndex: 20,
        }}
      >
        <div
          style={{
            padding: '12px 36px',
            borderRadius: 20,
            backgroundColor: 'rgba(15, 20, 30, 0.85)',
            border: '2px solid rgba(255, 230, 0, 0.8)',
            boxShadow: '0 0 35px rgba(255, 230, 0, 0.4), inset 0 0 15px rgba(255, 230, 0, 0.2)',
          }}
        >
          <span
            style={{
              fontFamily: "'Courier New', monospace",
              fontSize: 58,
              fontWeight: 900,
              letterSpacing: 4,
              color: '#FFE600',
              textShadow: '0 0 20px #FFE600',
            }}
          >
            {timerString}
          </span>
        </div>
      </div>

      {/* Main Question Title */}
      <div
        style={{
          position: 'absolute',
          top: 480,
          left: 40,
          right: 40,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          opacity: Math.max(0, titleSpring),
          transform: `scale(${titleSpring})`,
          zIndex: 20,
        }}
      >
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 28,
            fontWeight: 800,
            color: 'rgba(255, 255, 255, 0.85)',
            letterSpacing: 2,
            textTransform: 'uppercase',
          }}
        >
          Antes de la entrevista de tu vida...
        </span>

        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 70,
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1.15,
            margin: '18px 0 0 0',
            textShadow: '0 0 35px rgba(255, 255, 255, 0.4), 0 8px 30px rgba(0, 0, 0, 0.9)',
          }}
        >
          ¿QUÉ PERFUME USAS
          <br />
          <span
            style={{
              fontStyle: 'italic',
              background: 'linear-gradient(90deg, #FFE600, #fbbf24, #f59e0b)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 25px rgba(251, 191, 36, 0.7))',
            }}
          >
            PARA QUE TE RECUERDEN?
          </span>
        </h1>
      </div>

      {/* Floating context emojis */}
      {[
        { emoji: '👔', x: 180, y: 1100, delay: 0 },
        { emoji: '💼', x: 900, y: 1080, delay: 15 },
        { emoji: '👑', x: 200, y: 1350, delay: 30 },
        { emoji: '✨', x: 880, y: 1380, delay: 45 },
      ].map((item, idx) => {
        const floatY = Math.sin((frame + item.delay) * 0.1) * 12;
        return (
          <div
            key={idx}
            style={{
              position: 'absolute',
              left: item.x,
              top: item.y,
              fontSize: 54,
              transform: `translate(-50%, -50%) translateY(${floatY}px) scale(${Math.min(1, frame / 20)})`,
              filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.5))',
              zIndex: 15,
            }}
          >
            {item.emoji}
          </div>
        );
      })}
    </div>
  );
};

