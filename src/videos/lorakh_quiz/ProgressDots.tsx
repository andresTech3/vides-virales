import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

interface ProgressDotsProps {
  currentIdx: number; // 0 to 4
  total?: number;
  activeColor?: string;
}

export const ProgressDots: React.FC<ProgressDotsProps> = ({
  currentIdx,
  total = 5,
  activeColor = '#60a5fa',
}) => {
  const frame = useCurrentFrame();

  // Sonar ripple on active dot
  const rippleScale = 1.0 + ((frame % 30) / 30) * 0.9;
  const rippleOpacity = 0.9 - ((frame % 30) / 30) * 0.9;

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
        gap: 12,
        zIndex: 30,
      }}
    >
      {/* 5 Dots connected by neon track */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          padding: '10px 28px',
          borderRadius: 25,
          backgroundColor: 'rgba(5, 10, 20, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
        }}
      >
        {Array.from({ length: total }).map((_, idx) => {
          const isActive = idx === currentIdx;
          const isDone = idx < currentIdx;

          const dotColor = isActive
            ? activeColor
            : isDone
            ? 'rgba(255, 255, 255, 0.9)'
            : 'rgba(255, 255, 255, 0.25)';

          return (
            <div
              key={idx}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Sonar ripple ring for active dot */}
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    border: `2px solid ${activeColor}`,
                    transform: `scale(${rippleScale})`,
                    opacity: rippleOpacity,
                    pointerEvents: 'none',
                  }}
                />
              )}

              {/* Dot */}
              <div
                style={{
                  width: isActive ? 22 : 14,
                  height: isActive ? 22 : 14,
                  borderRadius: '50%',
                  backgroundColor: dotColor,
                  boxShadow: isActive
                    ? `0 0 18px ${activeColor}, 0 0 30px ${activeColor}`
                    : isDone
                    ? '0 0 8px rgba(255, 255, 255, 0.5)'
                    : 'none',
                  transition: 'all 0.2s ease',
                }}
              />
            </div>
          );
        })}

        {/* Counter label: 01 / 05 */}
        <span
          style={{
            marginLeft: 10,
            fontFamily: "'Inter', sans-serif",
            fontSize: 18,
            fontWeight: 800,
            color: activeColor,
            letterSpacing: 1.5,
          }}
        >
          {String(currentIdx + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
};
