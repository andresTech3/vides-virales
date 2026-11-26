import React from 'react';
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

export const EntrevistaOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const camPunch = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.7, stiffness: 180 },
  });
  const camScale = interpolate(camPunch, [0, 1], [1.14, 1.0]);

  const titlePop = spring({
    frame: frame - 2,
    fps,
    config: { damping: 12, mass: 0.6, stiffness: 190 },
  });

  const cardsPop = spring({
    frame: frame - 8,
    fps,
    config: { damping: 12, mass: 0.7, stiffness: 170 },
  });

  const logoPop = spring({
    frame: frame - 24,
    fps,
    config: { damping: 12, mass: 0.6, stiffness: 180 },
  });

  const arrowBounce = Math.sin(frame * 0.25) * 8;

  const shimmerX = interpolate(frame, [30, 70], [-100, 200], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '110px 40px 90px 40px',
        transform: `scale(${camScale})`,
        transformOrigin: 'center center',
      }}
    >
      {/* 1. Header: "¿CUÁL LLEVARÍAS TÚ?" */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          opacity: Math.max(0, titlePop),
          transform: `scale(${titlePop})`,
          zIndex: 20,
        }}
      >
        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 72,
            fontWeight: 900,
            lineHeight: 1.15,
            color: '#ffffff',
            margin: 0,
            textShadow: '0 0 35px rgba(255, 255, 255, 0.4), 0 6px 30px rgba(0, 0, 0, 0.9)',
          }}
        >
          ¿CUÁL LLEVARÍAS TÚ?
        </h1>

        <div
          style={{
            marginTop: 14,
            padding: '10px 32px',
            borderRadius: 30,
            backgroundColor: 'rgba(255, 230, 0, 0.15)',
            border: '2px solid #FFE600',
            boxShadow: '0 0 30px rgba(255, 230, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            transform: `translateY(${arrowBounce}px)`,
          }}
        >
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 34,
              fontWeight: 900,
              color: '#FFE600',
              letterSpacing: 1,
              textShadow: '0 0 20px #FFE600',
            }}
          >
            Comenta tu elección
          </span>
          <span style={{ fontSize: 36 }}>👇</span>
        </div>
      </div>

      {/* 2. Interactive Vote Cards (Gold vs Ice) */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          gap: 30,
          opacity: Math.max(0, cardsPop),
          transform: `scale(${cardsPop})`,
          zIndex: 10,
        }}
      >
        {/* Option 1: Royal Gold */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '24px 16px',
            borderRadius: 30,
            backgroundColor: 'rgba(15, 20, 30, 0.85)',
            border: '2.5px solid #fbbf24',
            boxShadow: '0 0 35px rgba(251, 191, 36, 0.4), inset 0 0 20px rgba(251, 191, 36, 0.15)',
          }}
        >
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              backgroundColor: '#fbbf24',
              color: '#000000',
              fontFamily: "'Inter', sans-serif",
              fontSize: 26,
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 10,
            }}
          >
            1
          </div>
          <Img
            src={staticFile('lorakh_assets/bottle_gold.png')}
            style={{ width: 220, height: 320, objectFit: 'contain', filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.8))' }}
          />
          <span
            style={{
              marginTop: 10,
              fontFamily: "'Playfair Display', serif",
              fontStyle: 'italic',
              fontSize: 28,
              fontWeight: 800,
              color: '#fbbf24',
            }}
          >
            Royal Gold
          </span>
          <span
            style={{
              marginTop: 4,
              fontFamily: "'Inter', sans-serif",
              fontSize: 18,
              fontWeight: 700,
              color: 'rgba(255, 255, 255, 0.85)',
            }}
          >
            Autoridad & Estatus
          </span>
        </div>

        {/* Option 2: Sapphire Ice */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '24px 16px',
            borderRadius: 30,
            backgroundColor: 'rgba(15, 20, 30, 0.85)',
            border: '2.5px solid #38bdf8',
            boxShadow: '0 0 35px rgba(56, 189, 248, 0.4), inset 0 0 20px rgba(56, 189, 248, 0.15)',
          }}
        >
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              backgroundColor: '#38bdf8',
              color: '#000000',
              fontFamily: "'Inter', sans-serif",
              fontSize: 26,
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 10,
            }}
          >
            2
          </div>
          <Img
            src={staticFile('lorakh_assets/bottle_ice.png')}
            style={{ width: 220, height: 320, objectFit: 'contain', filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.8))' }}
          />
          <span
            style={{
              marginTop: 10,
              fontFamily: "'Playfair Display', serif",
              fontStyle: 'italic',
              fontSize: 28,
              fontWeight: 800,
              color: '#38bdf8',
            }}
          >
            Sapphire Ice
          </span>
          <span
            style={{
              marginTop: 4,
              fontFamily: "'Inter', sans-serif",
              fontSize: 18,
              fontWeight: 700,
              color: 'rgba(255, 255, 255, 0.85)',
            }}
          >
            Frescura & Liderazgo
          </span>
        </div>
      </div>

      {/* 3. Luxury Lorakh Logo Below */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          opacity: Math.max(0, logoPop),
          transform: `scale(${logoPop})`,
          padding: '16px 52px',
          borderRadius: 40,
          backgroundColor: 'rgba(16, 22, 34, 0.92)',
          border: '2px solid #FFE600cc',
          boxShadow: '0 0 35px rgba(255, 230, 0, 0.45)',
          overflow: 'hidden',
          marginBottom: 40,
          zIndex: 20,
        }}
      >
        {/* Shimmer sweep */}
        <div
          style={{
            position: 'absolute',
            top: -20,
            bottom: -20,
            left: 0,
            width: 40,
            background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 100%)',
            transform: `translateX(${shimmerX}px) rotate(25deg)`,
            filter: 'blur(4px)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 32 }}>👑</span>
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 38,
              fontWeight: 900,
              letterSpacing: 5,
              color: '#FFE600',
              textShadow: '0 0 25px rgba(255, 230, 0, 0.7)',
            }}
          >
            LORAKH
          </span>
        </div>

        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 17,
            fontWeight: 800,
            letterSpacing: 6,
            color: 'rgba(255, 255, 255, 0.95)',
            textTransform: 'uppercase',
          }}
        >
          FRAGRANCE HOUSE
        </span>
      </div>
    </div>
  );
};

