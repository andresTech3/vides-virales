import React from 'react';
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

export const OutroChecklist: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titlePop = spring({
    frame: frame - 5,
    fps,
    config: { damping: 14, mass: 0.7, stiffness: 160 },
  });

  const cards = [
    {
      name: 'Perfume Barato',
      desc: 'Puro alcohol: se evapora en 20 minutos',
      icon: 'lorakh_assets/bottle_cheap.png',
      borderColor: '#ff4444',
      status: '❌',
      statusColor: '#ff4444',
    },
    {
      name: 'Lorakh Midnight Club',
      desc: 'Proyección pesada para la pista de baile',
      icon: 'lorakh_assets/bottle_midnight.png',
      borderColor: '#3b82f6',
      status: '✓',
      statusColor: '#60a5fa',
    },
    {
      name: 'Lorakh Royal Gold',
      desc: 'Seducción magnética para la barra VIP',
      icon: 'lorakh_assets/bottle_gold.png',
      borderColor: '#eab308',
      status: '✓',
      statusColor: '#facc15',
    },
    {
      name: 'Nocturne Extrait',
      desc: '35% aceites puros: 14 horas de duración real',
      icon: 'lorakh_assets/bottle_extrait.png',
      borderColor: '#f43f5e',
      status: '✓',
      statusColor: '#fb7185',
    },
  ];

  const ctaPop = spring({
    frame: frame - 70,
    fps,
    config: { damping: 13, mass: 0.6, stiffness: 170 },
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
        padding: '90px 45px 120px 45px',
        zIndex: 10,
      }}
    >
      {/* 1. Header */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          opacity: Math.max(0, titlePop),
          transform: `scale(${titlePop})`,
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 16,
            marginBottom: 20,
          }}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                backgroundColor: '#FFE600',
                boxShadow: '0 0 12px #FFE600',
              }}
            />
          ))}
        </div>

        <h1
          style={{
            fontFamily: "'Playfair Display', 'Georgia', serif",
            fontSize: 58,
            fontWeight: 800,
            lineHeight: 1.25,
            color: '#ffffff',
            margin: 0,
            maxWidth: 900,
          }}
        >
          Ahora ya sabes cuál elegir para la discoteca
        </h1>
      </div>

      {/* 2. Vertical Checklist of Cards */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 22,
        }}
      >
        {cards.map((c, i) => {
          const cardSpring = spring({
            frame: frame - (15 + i * 10),
            fps,
            config: { damping: 14, mass: 0.7, stiffness: 150 },
          });

          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 28px',
                borderRadius: 24,
                backgroundColor: 'rgba(12, 18, 30, 0.75)',
                border: `2px solid ${c.borderColor}`,
                boxShadow: `0 8px 30px rgba(0, 0, 0, 0.5), 0 0 20px ${c.borderColor}33`,
                backdropFilter: 'blur(12px)',
                opacity: Math.max(0, cardSpring),
                transform: `translateX(${(1 - cardSpring) * 60}px) scale(${cardSpring})`,
              }}
            >
              {/* Left: Thumbnail Bottle + Names */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                <Img
                  src={staticFile(c.icon)}
                  style={{
                    width: 72,
                    height: 96,
                    objectFit: 'contain',
                    filter: `drop-shadow(0 6px 12px rgba(0, 0, 0, 0.6))`,
                  }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontStyle: 'italic',
                      fontSize: 34,
                      fontWeight: 700,
                      color: '#ffffff',
                    }}
                  >
                    {c.name}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 22,
                      color: 'rgba(255, 255, 255, 0.75)',
                      fontWeight: 500,
                    }}
                  >
                    {c.desc}
                  </span>
                </div>
              </div>

              {/* Right: Checkmark badge */}
              <div
                style={{
                  fontSize: 40,
                  fontWeight: 900,
                  color: c.statusColor,
                  textShadow: `0 0 20px ${c.statusColor}`,
                  paddingLeft: 16,
                }}
              >
                {c.status}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Bottom CTA pill */}
      <div
        style={{
          opacity: Math.max(0, ctaPop),
          transform: `scale(${ctaPop})`,
          padding: '18px 45px',
          borderRadius: 40,
          backgroundColor: '#FFE600',
          boxShadow: '0 0 35px rgba(255, 230, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <span style={{ fontSize: 28 }}>👑</span>
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 26,
            fontWeight: 900,
            color: '#080d1a',
            letterSpacing: 1.5,
            textTransform: 'uppercase',
          }}
        >
          Elige Calidad • Elige Lorakh
        </span>
      </div>
    </div>
  );
};

