import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

interface BokehBackgroundProps {
  color1: string;
  color2: string;
  haloColor: string;
}

export const BokehBackground: React.FC<BokehBackgroundProps> = ({
  color1,
  color2,
  haloColor,
}) => {
  const frame = useCurrentFrame();

  // 12 subtle floating bokeh orbs
  const orbs = [
    { x: 180, y: 350, r: 140, speed: 0.8, phase: 0 },
    { x: 880, y: 520, r: 180, speed: 0.6, phase: 1.5 },
    { x: 260, y: 920, r: 210, speed: 0.9, phase: 3.0 },
    { x: 820, y: 1250, r: 160, speed: 0.7, phase: 4.2 },
    { x: 140, y: 1540, r: 190, speed: 0.5, phase: 2.1 },
    { x: 910, y: 1680, r: 220, speed: 0.8, phase: 5.0 },
    { x: 540, y: 400, r: 120, speed: 1.1, phase: 0.7 },
    { x: 490, y: 1400, r: 170, speed: 0.6, phase: 3.8 },
  ];

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(circle at 50% 52%, ${color2} 0%, ${color1} 75%, #03060a 100%)`,
        overflow: 'hidden',
        zIndex: 0,
      }}
    >
      {/* Central glow halo behind hero product */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '52%',
          width: 720,
          height: 720,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${haloColor} 0%, rgba(0,0,0,0) 70%)`,
          filter: 'blur(60px)',
          opacity: 0.85,
        }}
      />

      {/* Floating Bokeh circles */}
      {orbs.map((orb, i) => {
        const floatY = (Math.sin((frame * 0.03 * orb.speed) + orb.phase) * 60) - ((frame * 0.5 * orb.speed) % 400);
        const floatX = Math.cos((frame * 0.02 * orb.speed) + orb.phase) * 35;
        const opacity = interpolate(
          Math.sin((frame * 0.04) + orb.phase),
          [-1, 1],
          [0.10, 0.28]
        );

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: orb.x + floatX,
              top: orb.y + floatY,
              width: orb.r,
              height: orb.r,
              borderRadius: '50%',
              backgroundColor: haloColor,
              opacity,
              filter: 'blur(45px)',
              pointerEvents: 'none',
            }}
          />
        );
      })}

      {/* Subtle vignette border */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          boxShadow: 'inset 0 0 160px rgba(0, 0, 0, 0.85)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

