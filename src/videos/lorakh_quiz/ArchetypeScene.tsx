import React from 'react';
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import type { ArchetypeData } from './types';

interface ArchetypeSceneProps {
  data: ArchetypeData;
}

export const ArchetypeScene: React.FC<ArchetypeSceneProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 1. Camera Punch-in & Rhythmic Beat Pulse
  const camPunch = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.7, stiffness: 180 },
  });
  const camScale = interpolate(camPunch, [0, 1], [1.18, 1.0]) + Math.sin(frame * 0.44) * 0.012;
  const camDrift = Math.sin(frame * 0.08) * 8;

  // 2. Trait Header Entrance
  const headerSpring = spring({
    frame: frame - 2,
    fps,
    config: { damping: 12, mass: 0.6, stiffness: 200 },
  });

  // 3. Perfume Title & Line Entrance
  const titleSpring = spring({
    frame: frame - 8,
    fps,
    config: { damping: 12, mass: 0.7, stiffness: 170 },
  });

  const lineWidth = interpolate(frame, [12, 32], [0, 360], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // 4. Bottle Entrance: Whip Rotation + Elastic Spring
  const bottleSpring = spring({
    frame: frame - 5,
    fps,
    config: { damping: 12, mass: 0.8, stiffness: 190 },
  });
  const bottleRot = interpolate(bottleSpring, [0, 1], [-12, 0]);
  const bottleScale = interpolate(bottleSpring, [0, 1], [0.55, 1.0]);

  // Levitation and 3D perspective tilt
  const floatY = Math.sin(frame * 0.09) * 16;
  const tiltY = Math.sin(frame * 0.07) * 7;
  const shadowScaleX = 1.0 + Math.sin(frame * 0.09) * 0.14;
  const shadowOpacity = 0.65 - Math.sin(frame * 0.09) * 0.12;

  // 5. Specular Shimmer / Light Sweep (frames 18 to 45)
  const shimmerProgress = interpolate(frame, [18, 45], [-160, 160], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // 6. Scent Mist Particles (frames 22 to 50)
  const mistActive = frame >= 22 && frame <= 55;
  const mistFrame = frame - 22;

  // 7. Essence Badge Entrance
  const essenceSpring = spring({
    frame: frame - 32,
    fps,
    config: { damping: 11, mass: 0.6, stiffness: 190 },
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
        transform: `scale(${camScale}) translateY(${camDrift}px)`,
        transformOrigin: 'center center',
      }}
    >
      {/* 1. Header: "Si eres [rasgo]..." */}
      <div
        style={{
          position: 'absolute',
          top: 155,
          left: 40,
          right: 40,
          textAlign: 'center',
          opacity: Math.max(0, headerSpring),
          transform: `translateY(${(1 - headerSpring) * 20}px)`,
          zIndex: 20,
        }}
      >
        <div
          style={{
            display: 'inline-block',
            padding: '10px 28px',
            borderRadius: 30,
            backgroundColor: 'rgba(10, 16, 28, 0.75)',
            border: `1px solid ${data.colorTheme}66`,
            backdropFilter: 'blur(10px)',
            boxShadow: `0 8px 25px rgba(0, 0, 0, 0.6)`,
          }}
        >
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: 0.5,
              color: '#ffffff',
              lineHeight: 1.3,
            }}
          >
            {data.traitHeader}
          </span>
        </div>
      </div>

      {/* 2. Título del perfume en serif itálica blanca con línea subrayada */}
      <div
        style={{
          position: 'absolute',
          top: 235,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          opacity: Math.max(0, titleSpring),
          transform: `scale(${titleSpring})`,
          zIndex: 20,
        }}
      >
        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontStyle: 'italic',
            fontSize: 74,
            fontWeight: 800,
            color: '#ffffff',
            margin: 0,
            letterSpacing: 2,
            textShadow: `0 0 35px ${data.colorTheme}aa, 0 6px 30px rgba(0, 0, 0, 0.9)`,
          }}
        >
          {data.perfumeTitle}
        </h1>

        {/* Línea subrayada luminosa con chispazo */}
        <div
          style={{
            position: 'relative',
            width: lineWidth,
            height: 4,
            borderRadius: 2,
            backgroundColor: data.colorTheme,
            marginTop: 10,
            boxShadow: `0 0 20px ${data.colorTheme}`,
          }}
        >
          {lineWidth > 10 && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: -4,
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                boxShadow: `0 0 15px #ffffff, 0 0 25px ${data.colorTheme}`,
              }}
            />
          )}
        </div>
      </div>

      {/* 3. Frasco 3D flotando con halo, shimmer, niebla de spray y sombra */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '52%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          height: 740,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          perspective: 1200,
        }}
      >
        {/* Pulsing Dual Neon Aura Rings behind the bottle */}
        <div
          style={{
            position: 'absolute',
            width: 460,
            height: 460,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${data.colorTheme}44 0%, ${data.colorTheme}11 50%, rgba(0,0,0,0) 70%)`,
            filter: 'blur(45px)',
            transform: `scale(${1.0 + Math.sin(frame * 0.12) * 0.1})`,
            zIndex: 1,
          }}
        />

        {/* Floating bottle container with Whip rotation & elastic bounce */}
        <div
          style={{
            transform: `translateY(${floatY}px) scale(${bottleScale}) rotateZ(${bottleRot}deg) rotateY(${tiltY}deg)`,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            zIndex: 5,
          }}
        >
          {/* Glass bottle image */}
          <Img
            src={staticFile(data.bottleImage)}
            style={{
              width: 440,
              height: 'auto',
              maxHeight: 620,
              objectFit: 'contain',
              filter: `drop-shadow(0 30px 45px rgba(0, 0, 0, 0.85)) drop-shadow(0 0 35px ${data.colorTheme}55)`,
              position: 'relative',
              zIndex: 2,
            }}
          />

          {/* Specular Shimmer / Light Beam passing across the bottle */}
          {frame >= 18 && frame <= 45 && (
            <div
              style={{
                position: 'absolute',
                top: 20,
                bottom: 20,
                left: 20,
                right: 20,
                overflow: 'hidden',
                pointerEvents: 'none',
                zIndex: 3,
                maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 80%)',
                WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 80%)',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: -100,
                  bottom: -100,
                  left: '50%',
                  width: 80,
                  background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0) 100%)',
                  transform: `translateX(${shimmerProgress}%) rotate(25deg)`,
                  filter: 'blur(6px)',
                  mixBlendMode: 'screen',
                }}
              />
            </div>
          )}

          {/* Scent Mist / Spritz Burst from nozzle (frame 22 to 55) */}
          {mistActive && (
            <div
              style={{
                position: 'absolute',
                top: 40,
                left: '50%',
                transform: 'translateX(-50%)',
                pointerEvents: 'none',
                zIndex: 6,
              }}
            >
              {[...Array(12)].map((_, i) => {
                const angle = (i / 12) * Math.PI - Math.PI / 2; // Fan out upwards
                const speed = 4.5 + (i % 3) * 2.0;
                const pDist = mistFrame * speed;
                const pX = Math.cos(angle) * pDist * 1.5;
                const pY = Math.sin(angle) * pDist;
                const pScale = interpolate(mistFrame, [0, 15, 30], [0.3, 1.4, 2.5], {
                  extrapolateRight: 'clamp',
                });
                const pOpacity = interpolate(mistFrame, [0, 8, 28], [0, 0.85, 0], {
                  extrapolateRight: 'clamp',
                });

                return (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      left: pX,
                      top: pY,
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      backgroundColor: data.colorTheme,
                      opacity: pOpacity,
                      transform: `scale(${pScale})`,
                      filter: 'blur(4px)',
                      boxShadow: `0 0 15px ${data.colorTheme}`,
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Dynamic Shadow with synchronized scaleX & blur */}
        <div
          style={{
            position: 'absolute',
            bottom: 25,
            left: '50%',
            width: 340,
            height: 38,
            transform: `translateX(-50%) scaleX(${shadowScaleX * bottleSpring})`,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0) 80%)',
            opacity: shadowOpacity * bottleSpring,
            filter: 'blur(10px)',
            zIndex: 4,
          }}
        />
      </div>

      {/* 4. Floating personality icons bursting out radially */}
      {data.floatingIcons.map((item, idx) => {
        const iconSpring = spring({
          frame: frame - item.delay,
          fps,
          config: { damping: 11, mass: 0.5, stiffness: 210 },
        });
        const iFloatY = Math.sin((frame + idx * 30) * 0.1) * 14;
        const iFloatX = Math.cos((frame + idx * 25) * 0.08) * 10;
        const iScale = Math.max(0, iconSpring);

        return (
          <div
            key={idx}
            style={{
              position: 'absolute',
              left: `${item.x}%`,
              top: `${item.y}%`,
              transform: `translate(-50%, -50%) translateY(${iFloatY}px) translateX(${iFloatX}px) scale(${iScale})`,
              fontSize: 56,
              filter: `drop-shadow(0 0 20px ${data.colorTheme})`,
              zIndex: 15,
            }}
          >
            {item.icon}
          </div>
        );
      })}

      {/* 5. Texto inferior bold: "Tu esencia es [PALABRA CLAVE]" */}
      <div
        style={{
          position: 'absolute',
          bottom: 175,
          left: 40,
          right: 40,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          opacity: Math.max(0, essenceSpring),
          transform: `scale(${essenceSpring})`,
          zIndex: 25,
        }}
      >
        <div
          style={{
            padding: '16px 40px',
            borderRadius: 45,
            backgroundColor: 'rgba(8, 14, 24, 0.88)',
            border: `2px solid ${data.colorTheme}`,
            boxShadow: `0 10px 35px rgba(0, 0, 0, 0.7), 0 0 35px ${data.colorTheme}66`,
            backdropFilter: 'blur(14px)',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 30,
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: 0.5,
            }}
          >
            Tu esencia es
          </span>
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 34,
              fontWeight: 900,
              color: data.colorTheme,
              letterSpacing: 1.5,
              textShadow: `0 0 25px ${data.colorTheme}`,
              textTransform: 'uppercase',
            }}
          >
            {data.essenceKeyword}
          </span>
        </div>
      </div>
    </div>
  );
};
