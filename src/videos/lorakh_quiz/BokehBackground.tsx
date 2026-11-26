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

  const orbs = [
    { x: 160, y: 320, r: 150, speed: 0.8, phase: 0.2 },
    { x: 900, y: 480, r: 190, speed: 0.6, phase: 1.8 },
    { x: 240, y: 950, r: 220, speed: 0.9, phase: 3.2 },
    { x: 840, y: 1200, r: 170, speed: 0.7, phase: 4.5 },
    { x: 120, y: 1500, r: 200, speed: 0.5, phase: 2.3 },
    { x: 920, y: 1650, r: 230, speed: 0.8, phase: 5.1 },
    { x: 540, y: 380, r: 130, speed: 1.1, phase: 0.9 },
  ];

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(circle at 50% 50%, ${color2} 0%, ${color1} 75%, #030508 100%)`,
        overflow: 'hidden',
        zIndex: 0,
      }}
    >
      {/* Central glow halo behind hero product */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 760,
          height: 760,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${haloColor} 0%, rgba(0,0,0,0) 70%)`,
          filter: 'blur(70px)',
          opacity: 0.9,
        }}
      />

      {/* Floating Bokeh circles */}
      {orbs.map((orb, i) => {
        const floatY = (Math.sin((frame * 0.03 * orb.speed) + orb.phase) * 50) - ((frame * 0.45 * orb.speed) % 350);
        const floatX = Math.cos((frame * 0.02 * orb.speed) + orb.phase) * 30;
        const opacity = interpolate(
          Math.sin((frame * 0.04) + orb.phase),
          [-1, 1],
          [0.10, 0.26]
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

      {/* Cinematic vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          boxShadow: 'inset 0 0 180px rgba(0, 0, 0, 0.9)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

