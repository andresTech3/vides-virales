import React from 'react';
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animations
  const titlePop = spring({
    frame: frame - 5,
    fps,
    config: { damping: 14, mass: 0.7, stiffness: 160 },
  });

  const lineupPop = spring({
    frame: frame - 15,
    fps,
    config: { damping: 13, mass: 0.8, stiffness: 130 },
  });

  const tagLeftPop = spring({
    frame: frame - 35,
    fps,
    config: { damping: 12, mass: 0.6, stiffness: 180 },
  });

  const tagRightPop = spring({
    frame: frame - 55,
    fps,
    config: { damping: 12, mass: 0.6, stiffness: 180 },
  });

  const subtitleOpacity = interpolate(frame, [70, 95], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '100px 40px 140px 40px',
        zIndex: 10,
      }}
    >
      {/* 1. Hook Header */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          maxWidth: 960,
          opacity: Math.max(0, titlePop),
          transform: `scale(${titlePop})`,
        }}
      >
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 26,
            fontWeight: 800,
            letterSpacing: 4,
            color: '#FFE600',
            textTransform: 'uppercase',
            marginBottom: 16,
            textShadow: '0 0 20px #FFE60088',
          }}
        >
          DISCOTECA & VIDA NOCTURNA
        </span>

        <h1
          style={{
            fontFamily: "'Playfair Display', 'Georgia', serif",
            fontSize: 66,
            fontWeight: 800,
            lineHeight: 1.25,
            color: '#ffffff',
            margin: 0,
            textShadow: '0 4px 30px rgba(0, 0, 0, 0.8)',
          }}
        >
          ¿Comprar perfume barato o invertir en calidad?
        </h1>
      </div>

      {/* 2. Central Lineup with Glass Shelf Reflection */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          opacity: Math.max(0, lineupPop),
          transform: `scale(${lineupPop})`,
        }}
      >
        {/* Glow halo behind bottles */}
        <div
          style={{
            position: 'absolute',
            width: 750,
            height: 380,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at center, rgba(30, 80, 160, 0.45) 0%, rgba(0,0,0,0) 70%)',
            filter: 'blur(50px)',
            zIndex: 0,
          }}
        />

        <Img
          src={staticFile('lorakh_assets/bottle_lineup.png')}
          style={{
            width: 1020,
            height: 'auto',
            objectFit: 'contain',
            filter: 'drop-shadow(0 20px 30px rgba(0, 0, 0, 0.8))',
            position: 'relative',
            zIndex: 1,
          }}
        />

        {/* Tag 1: Cheap pointer (pointing left) */}
        <div
          style={{
            position: 'absolute',
            left: 50,
            top: -20,
            padding: '12px 24px',
            borderRadius: 30,
            backgroundColor: 'rgba(220, 40, 40, 0.85)',
            border: '2px solid #ff6666',
            boxShadow: '0 0 25px rgba(220, 40, 40, 0.6)',
            fontFamily: "'Inter', sans-serif",
            fontSize: 22,
            fontWeight: 700,
            color: '#ffffff',
            transform: `scale(${Math.max(0, tagLeftPop)})`,
            zIndex: 10,
          }}
        >
          ❌ Se muere en 20 min
        </div>

        {/* Tag 2: Lorakh pointer (pointing right) */}
        <div
          style={{
            position: 'absolute',
            right: 50,
            top: -20,
            padding: '12px 24px',
            borderRadius: 30,
            backgroundColor: 'rgba(16, 26, 45, 0.9)',
            border: '2px solid #FFE600',
            boxShadow: '0 0 25px rgba(255, 230, 0, 0.4)',
            fontFamily: "'Inter', sans-serif",
            fontSize: 22,
            fontWeight: 700,
            color: '#FFE600',
            transform: `scale(${Math.max(0, tagRightPop)})`,
            zIndex: 10,
          }}
        >
          ✨ Lorakh: Proyecta 14h
        </div>
      </div>

      {/* 3. Bottom Premise Quote */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          maxWidth: 900,
          opacity: subtitleOpacity,
        }}
      >
        <p
          style={{
            fontFamily: "'Playfair Display', 'Georgia', serif",
            fontStyle: 'italic',
            fontSize: 40,
            lineHeight: 1.4,
            color: '#FFE600',
            margin: 0,
            textShadow: '0 0 20px rgba(255, 230, 0, 0.5)',
          }}
        >
          «Aunque por fuera se vean parecidos... en la pista la diferencia es brutal.»
        </p>
      </div>
    </div>
  );
};

