import React from 'react';
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

export const QuizOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Camera push-in
  const camPunch = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.7, stiffness: 180 },
  });
  const camScale = interpolate(camPunch, [0, 1], [1.15, 1.0]) + Math.sin(frame * 0.08) * 0.01;

  // Header entrance
  const titlePop = spring({
    frame: frame - 2,
    fps,
    config: { damping: 12, mass: 0.6, stiffness: 190 },
  });

  // Lineup entrance
  const lineupPop = spring({
    frame: frame - 8,
    fps,
    config: { damping: 13, mass: 0.75, stiffness: 160 },
  });

  // Logo entrance
  const logoPop = spring({
    frame: frame - 24,
    fps,
    config: { damping: 12, mass: 0.6, stiffness: 180 },
  });

  const bottles = [
    { num: 1, name: 'Midnight', color: '#60a5fa' },
    { num: 2, name: 'Royal Gold', color: '#fbbf24' },
    { num: 3, name: 'Sapphire', color: '#38bdf8' },
    { num: 4, name: 'Velvet', color: '#fb7185' },
    { num: 5, name: 'Nocturne', color: '#f43f5e' },
  ];

  // Bouncing arrow
  const arrowBounce = Math.sin(frame * 0.25) * 8;

  // Gold shimmer on Lorakh badge
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
      {/* 1. Header: "¿Cuál eres tú? Comenta tu número 👇" */}
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
          ¿CUÁL ERES TÚ?
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
            Comenta tu número
          </span>
          <span style={{ fontSize: 36 }}>👇</span>
        </div>
      </div>

      {/* 2. Los 5 frascos en fila sobre estante de cristal con reflejo espejo */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          opacity: Math.max(0, lineupPop),
          transform: `scale(${lineupPop})`,
          zIndex: 10,
        }}
      >
        {/* Glow halo central */}
        <div
          style={{
            position: 'absolute',
            width: 850,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at center, rgba(234, 179, 8, 0.4) 0%, rgba(59, 130, 246, 0.2) 40%, rgba(0,0,0,0) 70%)',
            filter: 'blur(60px)',
            zIndex: 0,
          }}
        />

        <Img
          src={staticFile('lorakh_assets/bottle_lineup_quiz.png')}
          style={{
            width: 1040,
            height: 'auto',
            objectFit: 'contain',
            filter: 'drop-shadow(0 25px 35px rgba(0, 0, 0, 0.85)) drop-shadow(0 0 25px rgba(255, 230, 0, 0.3))',
            position: 'relative',
            zIndex: 1,
          }}
        />

        {/* Badges numéricos 1 al 5 debajo de cada frasco con entrada escalonada */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '92%',
            marginTop: 20,
            position: 'relative',
            zIndex: 10,
          }}
        >
          {bottles.map((b, idx) => {
            const bPop = spring({
              frame: frame - (6 + idx * 4),
              fps,
              config: { damping: 11, mass: 0.5, stiffness: 210 },
            });
            const bScale = Math.max(0, bPop);

            return (
              <div
                key={b.num}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  transform: `scale(${bScale})`,
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(10, 16, 28, 0.95)',
                    border: `2.5px solid ${b.color}`,
                    boxShadow: `0 0 20px ${b.color}aa, inset 0 0 10px ${b.color}44`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 26,
                    fontWeight: 900,
                    color: '#ffffff',
                  }}
                >
                  {b.num}
                </div>
                <span
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontStyle: 'italic',
                    fontSize: 22,
                    fontWeight: 800,
                    color: b.color,
                    textShadow: `0 0 12px ${b.color}88`,
                  }}
                >
                  {b.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Logo Lorakh Fragrance House abajo con shimmer metálico */}
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
