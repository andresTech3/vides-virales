import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import subtitlesData from '../../../public/lorakh_entrevista_pro/entrevista_pro_subtitles.json';

interface SubtitleToken {
  word: string;
  start: number;
  end: number;
  part: string;
  scene: string;
}

export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentSec = frame / fps;

  const tokens = subtitlesData as SubtitleToken[];
  const activeIdx = tokens.findIndex(
    (t) => currentSec >= t.start && currentSec <= t.end
  );

  if (activeIdx === -1) {
    return null;
  }

  const startIdx = Math.max(0, activeIdx - 2);
  const endIdx = Math.min(tokens.length, activeIdx + 4);
  const windowTokens = tokens.slice(startIdx, endIdx);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 75,
        left: 40,
        right: 40,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px 14px',
        padding: '14px 28px',
        borderRadius: 24,
        backgroundColor: 'rgba(5, 10, 20, 0.85)',
        border: '1.5px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.8)',
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
              fontSize: isCurrent ? 36 : 30,
              fontWeight: isCurrent ? 900 : 700,
              color: isCurrent ? '#FFE600' : 'rgba(255, 255, 255, 0.9)',
              transform: isCurrent ? 'scale(1.15)' : 'scale(1.0)',
              textShadow: isCurrent
                ? '0 0 20px rgba(255, 230, 0, 0.9), 0 3px 10px rgba(0, 0, 0, 0.9)'
                : '0 2px 8px rgba(0, 0, 0, 0.7)',
              transition: 'all 0.08s ease',
            }}
          >
            {t.word}
          </span>
        );
      })}
    </div>
  );
};

