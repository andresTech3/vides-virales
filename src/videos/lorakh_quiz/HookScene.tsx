import React from 'react';
import { interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Img } from 'remotion';

export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 1. Camera punch-in
  const camScale = interpolate(frame, [0, 20, 95, 105], [0.88, 1.05, 1.12, 1.25], {
    extrapolateRight: 'clamp',
  });

  // 2. Entrance spring for main question
  const titleSpring = spring({
    frame: frame - 4,
    fps,
    config: { damping: 12, mass: 0.6, stiffness: 180 },
  });

  // 3. Badge spring
  const badgeSpring = spring({
    frame: frame - 16,
    fps,
    config: { damping: 11, mass: 0.5, stiffness: 200 },
  });

  // 4. Silhouette rapid flasher (frames 15 to 85)
  const bottles = [
    'lorakh_assets/bottle_midnight.png',
    'lorakh_assets/bottle_gold.png',
    'lorakh_assets/bottle_ice.png',
    'lorakh_assets/bottle_velvet.png',
    'lorakh_assets/bottle_extrait.png',
  ];
  const activeBottleIdx = Math.floor((frame / 8) % bottles.length);

  // 5. Pulsing rings
  const ringScale = 1.0 + Math.sin(frame * 0.15) * 0.08;

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
      {/* Background radial spotlight */}
      <div
        style={{
          position: 'absolute',
          width: 800,
          height: 800,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(234, 179, 8, 0.25) 0%, rgba(59, 130, 246, 0.15) 40%, rgba(0,0,0,0) 70%)',
          filter: 'blur(50px)',
          transform: `scale(${ringScale})`,
          zIndex: 0,
        }}
      />

      {/* Floating rapid bottle silhouette behind */}
      <div
        style={{
          position: 'absolute',
          top: '38%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 0.35,
          filter: 'brightness(0.7) blur(2px) drop-shadow(0 0 40px rgba(255,255,255,0.4))',
          zIndex: 1,
        }}
      >
        <Img
          src={staticFile(bottles[activeBottleIdx])}
          style={{
            width: 380,
            height: 'auto',
            objectFit: 'contain',
          }}
        />
      </div>

      {/* Brand micro-tag */}
      <div
        style={{
          position: 'absolute',
          top: 260,
          padding: '8px 24px',
          borderRadius: 20,
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          zIndex: 10,
        }}
      >
        <span style={{ fontSize: 20 }}>👑</span>
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 16,
            fontWeight: 800,
            letterSpacing: 4,
            color: '#FFE600',
            textTransform: 'uppercase',
          }}
        >
          LORAKH FRAGRANCE TEST
        </span>
      </div>

      {/* Question Main Title */}
      <div
        style={{
          position: 'absolute',
          top: 360,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: '0 40px',
          opacity: Math.max(0, titleSpring),
          transform: `scale(${titleSpring})`,
          zIndex: 10,
        }}
      >
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 78,
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1.1,
            margin: 0,
            textShadow: '0 0 40px rgba(255, 255, 255, 0.4), 0 8px 30px rgba(0, 0, 0, 0.8)',
          }}
        >
          ¿CUÁL ES TU
          <br />
          <span
            style={{
              fontStyle: 'italic',
              background: 'linear-gradient(90deg, #60a5fa, #fbbf24, #fb7185)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 25px rgba(251, 191, 36, 0.6))',
            }}
          >
            PERFUME IDEAL?
          </span>
        </h1>
      </div>

      {/* Question badge "Según tu personalidad" */}
      <div
        style={{
          position: 'absolute',
          bottom: 460,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          opacity: Math.max(0, badgeSpring),
          transform: `scale(${badgeSpring}) translateY(${Math.sin(frame * 0.12) * 6}px)`,
          zIndex: 10,
        }}
      >
        <div
          style={{
            padding: '16px 44px',
            borderRadius: 50,
            backgroundColor: 'rgba(255, 230, 0, 0.15)',
            border: '2px solid #FFE600',
            boxShadow: '0 0 35px rgba(255, 230, 0, 0.5), inset 0 0 15px rgba(255, 230, 0, 0.3)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 32,
              fontWeight: 900,
              letterSpacing: 2,
              color: '#FFE600',
              textTransform: 'uppercase',
              textShadow: '0 0 20px #FFE600',
            }}
          >
            SEGÚN TU PERSONALIDAD
          </span>
        </div>

        {/* Small sub-hint */}
        <span
          style={{
            marginTop: 18,
            fontFamily: "'Inter', sans-serif",
            fontSize: 22,
            fontWeight: 600,
            color: 'rgba(255, 255, 255, 0.7)',
            letterSpacing: 1,
          }}
        >
          5 Fragancias • Encuentra la tuya 👇
        </span>
      </div>

      {/* Floating emojis popping */}
      {['🔥', '💎', '🌙', '⚡'].map((emoji, idx) => {
        const offset = idx * 25;
        const eX = idx === 0 ? 160 : idx === 1 ? 920 : idx === 2 ? 180 : 900;
        const eY = idx === 0 ? 700 : idx === 1 ? 680 : idx === 2 ? 1150 : 1200;
        const eFloat = Math.sin((frame + offset) * 0.1) * 14;

        return (
          <div
            key={idx}
            style={{
              position: 'absolute',
              left: eX,
              top: eY,
              fontSize: 54,
              transform: `translate(-50%, -50%) translateY(${eFloat}px) scale(${Math.min(1, frame / 15)})`,
              filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.6))',
              zIndex: 12,
            }}
          >
            {emoji}
          </div>
        );
      })}
    </div>
  );
};

