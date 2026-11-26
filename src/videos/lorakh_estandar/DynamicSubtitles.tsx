import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import subtitlesData from '../../../public/lorakh_estandar/subtitles.json';
import type { SubtitleToken } from './types';

export const DynamicSubtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentSec = frame / fps;

  // Find active word or group of words
  const tokens = subtitlesData as SubtitleToken[];
  const activeIdx = tokens.findIndex(
    (t) => currentSec >= t.start && currentSec <= t.end
  );

  if (activeIdx === -1) {
    return null;
  }

  // Display a window of ~5-7 words around current word
  const startIdx = Math.max(0, activeIdx - 3);
  const endIdx = Math.min(tokens.length, activeIdx + 4);
  const windowTokens = tokens.slice(startIdx, endIdx);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 50,
        left: 40,
        right: 40,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px 12px',
        padding: '12px 24px',
        borderRadius: 20,
        backgroundColor: 'rgba(5, 10, 18, 0.70)',
        backdropFilter: 'blur(8px)',
        zIndex: 50,
        pointerEvents: 'none',
      }}
    >
      {windowTokens.map((t, i) => {
        const isCurrent = t === tokens[activeIdx];
        return (
          <span
            key={i}
            style={{
              fontFamily: "'Inter', -apple-system, sans-serif",
              fontSize: isCurrent ? 34 : 30,
              fontWeight: isCurrent ? 900 : 600,
              color: isCurrent ? '#FFE600' : 'rgba(255, 255, 255, 0.85)',
              transform: isCurrent ? 'scale(1.1)' : 'scale(1.0)',
              textShadow: isCurrent ? '0 0 15px rgba(255, 230, 0, 0.8)' : '0 2px 8px rgba(0, 0, 0, 0.6)',
              transition: 'all 0.1s ease',
            }}
          >
            {t.word}
          </span>
        );
      })}
    </div>
  );
};

