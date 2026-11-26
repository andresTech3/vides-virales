import React from 'react';
import { interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Img } from 'remotion';

export const EntrevistaError: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Camera shake around frame 60-80 (when voice says "arruina tu primera impresión")
  const isShaking = frame >= 65 && frame <= 95;
  const shakeX = isShaking ? Math.sin(frame * 1.8) * 8 : 0;
  const shakeY = isShaking ? Math.cos(frame * 2.2) * 6 : 0;

  // Punch zoom on entry
  const camPunch = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.7, stiffness: 180 },
  });
  const camScale = interpolate(camPunch, [0, 1], [1.16, 1.0]);

  // Red badge entrance
  const badgeSpring = spring({
    frame: frame - 2,
    fps,
    config: { damping: 12, mass: 0.5, stiffness: 210 },
  });

  // Bottle spring
  const bottleSpring = spring({
    frame: frame - 8,
    fps,
    config: { damping: 13, mass: 0.8, stiffness: 170 },
  });

  // Cross mark pop
  const crossPop = spring({
    frame: frame - 25,
    fps,
    config: { damping: 10, mass: 0.5, stiffness: 220 },
  });

  const floatY = Math.sin(frame * 0.09) * 12;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transform: `scale(${camScale}) translate(${shakeX}px, ${shakeY}px)`,
        transformOrigin: 'center center',
      }}
    >
      {/* Red warning radial background */}
      <div
        style={{
          position: 'absolute',
          width: 800,
          height: 800,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(239, 68, 68, 0.35) 0%, rgba(185, 28, 28, 0.15) 50%, rgba(0,0,0,0) 75%)',
          filter: 'blur(60px)',
          zIndex: 0,
        }}
      />

      {/* Top Warning Pill */}
      <div
        style={{
          position: 'absolute',
          top: 170,
          padding: '12px 32px',
          borderRadius: 30,
          backgroundColor: 'rgba(239, 68, 68, 0.22)',
          border: '2px solid #ef4444',
          boxShadow: '0 0 30px rgba(239, 68, 68, 0.6)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          opacity: Math.max(0, badgeSpring),
          transform: `scale(${badgeSpring})`,
          zIndex: 20,
        }}
      >
        <span style={{ fontSize: 26 }}>⚠️</span>
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 26,
            fontWeight: 900,
            letterSpacing: 2,
            color: '#ffffff',
            textTransform: 'uppercase',
          }}
        >
          EL ERROR FATAL
        </span>
      </div>

      {/* Title: Perfume Genérico */}
      <div
        style={{
          position: 'absolute',
          top: 250,
          textAlign: 'center',
          zIndex: 20,
        }}
      >
        <h2
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 48,
            fontWeight: 900,
            color: '#f87171',
            margin: 0,
            textShadow: '0 0 25px rgba(239, 68, 68, 0.7)',
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}
        >
          FRAGANCIA BARATA / COPIA
        </h2>
        <span
          style={{
            display: 'block',
            marginTop: 8,
            fontFamily: "'Inter', sans-serif",
            fontSize: 24,
            fontWeight: 600,
            color: 'rgba(255, 255, 255, 0.75)',
          }}
        >
          Salida a alcohol etílico • Marea al entrevistador
        </span>
      </div>

      {/* Cheap bottle with Red Cross mark */}
      <div
        style={{
          position: 'absolute',
          top: '52%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 500,
          height: 600,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10,
        }}
      >
        {/* Floating bottle */}
        <div
          style={{
            transform: `translateY(${floatY}px) scale(${bottleSpring})`,
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Img
            src={staticFile('lorakh_assets/bottle_cheap.png')}
            style={{
              width: 380,
              height: 'auto',
              maxHeight: 520,
              objectFit: 'contain',
              filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.85)) drop-shadow(0 0 35px rgba(239, 68, 68, 0.45)) grayscale(0.2)',
            }}
          />

          {/* Big Neon Red X Icon */}
          <div
            style={{
              position: 'absolute',
              top: '40%',
              left: '50%',
              transform: `translate(-50%, -50%) scale(${Math.max(0, crossPop)})`,
              width: 140,
              height: 140,
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.95)',
              border: '4px solid #ffffff',
              boxShadow: '0 0 45px #ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 80,
              color: '#ffffff',
              fontWeight: 900,
              zIndex: 15,
            }}
          >
            ✕
          </div>
        </div>

        {/* Sombra elíptica */}
        <div
          style={{
            position: 'absolute',
            bottom: 30,
            left: '50%',
            width: 280,
            height: 32,
            transform: 'translateX(-50%)',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 75%)',
            filter: 'blur(8px)',
            zIndex: 4,
          }}
        />
      </div>

      {/* Negative tag alert at bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: 180,
          padding: '14px 38px',
          borderRadius: 35,
          backgroundColor: 'rgba(20, 10, 15, 0.85)',
          border: '1.5px solid rgba(239, 68, 68, 0.6)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.7), 0 0 25px rgba(239, 68, 68, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          zIndex: 20,
        }}
      >
        <span style={{ fontSize: 24 }}>🚫</span>
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 26,
            fontWeight: 800,
            color: '#fca5a5',
            letterSpacing: 1,
          }}
        >
          Arruina tu primera impresión al instante
        </span>
      </div>
    </div>
  );
};

