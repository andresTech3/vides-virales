import React from 'react';
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

export const EntrevistaImpacto: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const camPunch = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.7, stiffness: 180 },
  });
  const camScale = interpolate(camPunch, [0, 1], [1.14, 1.0]);

  const titleSpring = spring({
    frame: frame - 2,
    fps,
    config: { damping: 12, mass: 0.5, stiffness: 200 },
  });

  const bottlesSpring = spring({
    frame: frame - 8,
    fps,
    config: { damping: 13, mass: 0.75, stiffness: 170 },
  });

  const quoteSpring = spring({
    frame: frame - 22,
    fps,
    config: { damping: 12, mass: 0.6, stiffness: 180 },
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
        transform: `scale(${camScale})`,
        transformOrigin: 'center center',
      }}
    >
      {/* Background dual glow (Gold on left, Cyan on right) */}
      <div
        style={{
          position: 'absolute',
          left: '25%',
          top: '50%',
          width: 600,
          height: 600,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, rgba(0,0,0,0) 70%)',
          filter: 'blur(60px)',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '75%',
          top: '50%',
          width: 600,
          height: 600,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.3) 0%, rgba(0,0,0,0) 70%)',
          filter: 'blur(60px)',
          zIndex: 0,
        }}
      />

      {/* Top Header Tag */}
      <div
        style={{
          position: 'absolute',
          top: 170,
          padding: '10px 30px',
          borderRadius: 30,
          backgroundColor: 'rgba(255, 230, 0, 0.15)',
          border: '1.5px solid #FFE600',
          boxShadow: '0 0 25px rgba(255, 230, 0, 0.5)',
          backdropFilter: 'blur(10px)',
          opacity: Math.max(0, titleSpring),
          transform: `scale(${titleSpring})`,
          zIndex: 20,
        }}
      >
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 22,
            fontWeight: 900,
            letterSpacing: 3,
            color: '#FFE600',
            textTransform: 'uppercase',
          }}
        >
          EL PODER DE LA MEMORIA OLFATIVA
        </span>
      </div>

      {/* Title */}
      <div
        style={{
          position: 'absolute',
          top: 240,
          textAlign: 'center',
          padding: '0 40px',
          opacity: Math.max(0, titleSpring),
          transform: `scale(${titleSpring})`,
          zIndex: 20,
        }}
      >
        <h2
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 60,
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1.15,
            margin: 0,
            textShadow: '0 0 30px rgba(255, 255, 255, 0.4), 0 6px 25px rgba(0,0,0,0.8)',
          }}
        >
          TU PRESENCIA ES
          <br />
          <span
            style={{
              fontStyle: 'italic',
              background: 'linear-gradient(90deg, #FFE600, #38bdf8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            LO QUE NUNCA OLVIDAN
          </span>
        </h2>
      </div>

      {/* Duo Bottles Side by Side */}
      <div
        style={{
          position: 'absolute',
          top: '53%',
          left: '50%',
          width: 800,
          height: 580,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 40,
          opacity: Math.max(0, bottlesSpring),
          transform: `translate(-50%, -50%) scale(${bottlesSpring}) translateY(${floatY}px)`,
          zIndex: 10,
        }}
      >
        {/* Royal Gold */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Img
            src={staticFile('lorakh_assets/bottle_gold.png')}
            style={{
              width: 320,
              height: 'auto',
              maxHeight: 460,
              objectFit: 'contain',
              filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.85)) drop-shadow(0 0 30px rgba(251, 191, 36, 0.6))',
            }}
          />
          <span
            style={{
              marginTop: 12,
              fontFamily: "'Playfair Display', serif",
              fontStyle: 'italic',
              fontSize: 26,
              fontWeight: 800,
              color: '#fbbf24',
              textShadow: '0 0 15px rgba(251, 191, 36, 0.8)',
            }}
          >
            Royal Gold
          </span>
        </div>

        {/* VS Divider Badge */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            backgroundColor: 'rgba(15, 20, 30, 0.95)',
            border: '2px solid rgba(255, 255, 255, 0.4)',
            boxShadow: '0 0 20px rgba(255, 255, 255, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Inter', sans-serif",
            fontSize: 22,
            fontWeight: 900,
            color: '#ffffff',
            zIndex: 15,
          }}
        >
          O
        </div>

        {/* Sapphire Ice */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Img
            src={staticFile('lorakh_assets/bottle_ice.png')}
            style={{
              width: 320,
              height: 'auto',
              maxHeight: 460,
              objectFit: 'contain',
              filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.85)) drop-shadow(0 0 30px rgba(56, 189, 248, 0.6))',
            }}
          />
          <span
            style={{
              marginTop: 12,
              fontFamily: "'Playfair Display', serif",
              fontStyle: 'italic',
              fontSize: 26,
              fontWeight: 800,
              color: '#38bdf8',
              textShadow: '0 0 15px rgba(56, 189, 248, 0.8)',
            }}
          >
            Sapphire Ice
          </span>
        </div>
      </div>

      {/* Quote Banner at bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: 180,
          left: 40,
          right: 40,
          textAlign: 'center',
          opacity: Math.max(0, quoteSpring),
          transform: `scale(${quoteSpring})`,
          zIndex: 20,
        }}
      >
        <div
          style={{
            padding: '16px 36px',
            borderRadius: 35,
            backgroundColor: 'rgba(10, 16, 28, 0.85)',
            border: '1.5px solid rgba(255, 255, 255, 0.25)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 26,
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: 1,
            }}
          >
            El currículum abre la puerta • Tu aroma cierra el trato
          </span>
        </div>
      </div>
    </div>
  );
};
