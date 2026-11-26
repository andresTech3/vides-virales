import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import type { FloatingIconData, NotePillData } from './types';

interface ProductInfoProps {
  name: string;
  category: string;
  quote: string;
  occasion: string;
  highlightWords: string[];
  accentColor: string;
  notes: NotePillData[];
  floatingIcons: FloatingIconData[];
}

export const ProductInfo: React.FC<ProductInfoProps> = ({
  name,
  category,
  quote,
  occasion,
  highlightWords,
  accentColor,
  notes,
  floatingIcons,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animations
  const titleSpring = spring({
    frame: frame - 5,
    fps,
    config: { damping: 14, mass: 0.7, stiffness: 150 },
  });

  const lineWidth = interpolate(frame, [10, 30], [0, 280], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const quoteOpacity = interpolate(frame, [15, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const occasionOpacity = interpolate(frame, [25, 40], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Render occasion with highlighted words
  const renderOccasion = () => {
    const words = occasion.split(' ');
    return words.map((w, idx) => {
      const cleanW = w.replace(/[.,:;]/g, '').toLowerCase();
      const isHigh = highlightWords.some(hw => hw.toLowerCase() === cleanW);
      return (
        <span
          key={idx}
          style={{
            color: isHigh ? accentColor : '#ffffff',
            fontWeight: isHigh ? 800 : 500,
            textShadow: isHigh ? `0 0 15px ${accentColor}88` : 'none',
          }}
        >
          {w}{' '}
        </span>
      );
    });
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 15,
      }}
    >
      {/* 1. Product Title & Underline (Top area, below header dots) */}
      <div
        style={{
          position: 'absolute',
          top: 185,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          opacity: Math.max(0, titleSpring),
          transform: `translateY(${(1 - titleSpring) * 20}px)`,
        }}
      >
        <h1
          style={{
            fontFamily: "'Playfair Display', 'Georgia', 'Times New Roman', serif",
            fontStyle: 'italic',
            fontSize: 74,
            fontWeight: 700,
            color: '#ffffff',
            margin: 0,
            letterSpacing: 1.5,
            textAlign: 'center',
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.6)',
          }}
        >
          {name}
        </h1>

        {/* Animated accent underline */}
        <div
          style={{
            width: lineWidth,
            height: 4,
            borderRadius: 2,
            backgroundColor: accentColor,
            marginTop: 12,
            boxShadow: `0 0 12px ${accentColor}`,
          }}
        />
      </div>

      {/* 2. Floating Thematic Micro-Icons beside bottle */}
      {floatingIcons.map((item, idx) => {
        const iconSpring = spring({
          frame: frame - item.delay,
          fps,
          config: { damping: 12, mass: 0.5, stiffness: 200 },
        });
        const floatY = Math.sin((frame + idx * 25) * 0.09) * 12;
        const floatX = Math.cos((frame + idx * 20) * 0.08) * 8;

        return (
          <div
            key={idx}
            style={{
              position: 'absolute',
              left: `${item.x}%`,
              top: `${item.y}%`,
              transform: `translate(-50%, -50%) translateY(${floatY}px) translateX(${floatX}px) scale(${Math.max(0, iconSpring)})`,
              fontSize: 54,
              filter: `drop-shadow(0 0 16px ${accentColor}88)`,
              zIndex: 12,
            }}
          >
            {item.icon}
          </div>
        );
      })}

      {/* 3. Middle / Bottom Copy: Quote + Occasion */}
      <div
        style={{
          position: 'absolute',
          bottom: 270,
          left: 60,
          right: 60,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 12,
        }}
      >
        {/* Quote in Serif Italic */}
        <div
          style={{
            fontFamily: "'Playfair Display', 'Georgia', serif",
            fontStyle: 'italic',
            fontSize: 40,
            color: accentColor,
            opacity: quoteOpacity,
            letterSpacing: 0.5,
            textShadow: `0 0 15px ${accentColor}66`,
          }}
        >
          «{quote}»
        </div>

        {/* Occasion / Benefit Copy */}
        <div
          style={{
            fontFamily: "'Inter', -apple-system, sans-serif",
            fontSize: 32,
            lineHeight: 1.4,
            opacity: occasionOpacity,
            maxWidth: 880,
          }}
        >
          {renderOccasion()}
        </div>
      </div>

      {/* 4. Bottom Olfactive Note Pills */}
      <div
        style={{
          position: 'absolute',
          bottom: 120,
          left: 40,
          right: 40,
          display: 'flex',
          justifyContent: 'center',
          gap: 16,
          flexWrap: 'wrap',
          zIndex: 20,
        }}
      >
        {notes.map((note, idx) => {
          const pillSpring = spring({
            frame: frame - (35 + idx * 8),
            fps,
            config: { damping: 13, mass: 0.6, stiffness: 180 },
          });

          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 28px',
                borderRadius: 40,
                backgroundColor: 'rgba(10, 16, 26, 0.75)',
                border: `2px solid ${note.color}99`,
                boxShadow: `0 4px 20px rgba(0, 0, 0, 0.4), 0 0 15px ${note.color}44`,
                backdropFilter: 'blur(10px)',
                transform: `scale(${Math.max(0, pillSpring)})`,
                opacity: Math.max(0, pillSpring),
              }}
            >
              <span style={{ fontSize: 32 }}>{note.emoji}</span>
              <span
                style={{
                  fontFamily: "'Inter', -apple-system, sans-serif",
                  fontSize: 26,
                  fontWeight: 600,
                  color: '#ffffff',
                  letterSpacing: 0.5,
                }}
              >
                {note.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

