import React from 'react';
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

interface HeroBottleProps {
  imagePath: string;
  haloColor: string;
  glowSize?: number;
}

export const HeroBottle: React.FC<HeroBottleProps> = ({
  imagePath,
  haloColor,
  glowSize = 60,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring pop
  const enterScale = spring({
    frame,
    fps,
    config: { damping: 13, mass: 0.8, stiffness: 140 },
  });

  // Smooth floating sine motion
  const floatY = Math.sin(frame * 0.075) * 15;
  const shadowScaleX = 1.0 + Math.sin(frame * 0.075) * 0.12;
  const shadowOpacity = 0.55 - Math.sin(frame * 0.075) * 0.10;

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '49%',
        transform: 'translate(-50%, -50%)',
        width: 620,
        height: 750,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
      }}
    >
      {/* Floating bottle wrapper */}
      <div
        style={{
          transform: `translateY(${floatY}px) scale(${enterScale})`,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        {/* Soft edge rim glow */}
        <div
          style={{
            position: 'absolute',
            inset: 20,
            borderRadius: 40,
            boxShadow: `0 0 ${glowSize}px ${haloColor}66`,
            filter: 'blur(30px)',
            opacity: 0.8,
            zIndex: 0,
          }}
        />

        <Img
          src={staticFile(imagePath)}
          style={{
            width: 440,
            height: 'auto',
            maxHeight: 620,
            objectFit: 'contain',
            filter: `drop-shadow(0 25px 35px rgba(0, 0, 0, 0.75)) drop-shadow(0 0 25px ${haloColor}44)`,
            position: 'relative',
            zIndex: 1,
          }}
        />
      </div>

      {/* Realistic floor oval contact shadow with squash & stretch */}
      <div
        style={{
          position: 'absolute',
          bottom: 25,
          left: '50%',
          width: 340,
          height: 38,
          transform: `translateX(-50%) scaleX(${shadowScaleX * enterScale})`,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0) 80%)',
          opacity: shadowOpacity * enterScale,
          filter: 'blur(8px)',
          zIndex: 5,
        }}
      />
    </div>
  );
};

