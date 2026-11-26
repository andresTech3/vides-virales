import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface HeaderDotsProps {
  currentIdx: number;
  total: number;
  activeColor: string;
}

export const HeaderDots: React.FC<HeaderDotsProps> = ({
  currentIdx,
  total,
  activeColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pop = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.6, stiffness: 180 },
  });

  return (
    <div
      style={{
        position: 'absolute',
        top: 80,
        left: 0,
        right: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        zIndex: 20,
        transform: `scale(${pop})`,
      }}
    >
      {/* Dots Row */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
        {Array.from({ length: total }).map((_, i) => {
          const isActive = i === currentIdx;
          return (
            <div
              key={i}
              style={{
                width: isActive ? 18 : 12,
                height: isActive ? 18 : 12,
                borderRadius: '50%',
                backgroundColor: isActive ? activeColor : 'rgba(255, 255, 255, 0.25)',
                boxShadow: isActive ? `0 0 16px ${activeColor}` : 'none',
                transition: 'all 0.3s ease',
              }}
            />
          );
        })}
      </div>

      {/* Item label */}
      <div
        style={{
          fontFamily: "'Inter', -apple-system, sans-serif",
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: 6,
          color: activeColor,
          textTransform: 'uppercase',
          textShadow: `0 0 20px ${activeColor}88`,
        }}
      >
        N.º {currentIdx + 1}
      </div>
    </div>
  );
};

