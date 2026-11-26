import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import subtitlesData from '../../../public/lorakh_quiz/quiz_subtitles.json';
import type { SubtitleToken } from './types';

export const QuizSubtitles: React.FC = () => {
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

  // Display a window of 4 to 6 words around the active word
  const startIdx = Math.max(0, activeIdx - 2);
  const endIdx = Math.min(tokens.length, activeIdx + 4);
  const windowTokens = tokens.slice(startIdx, endIdx);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 65,
        left: 40,
        right: 40,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px 14px',
        padding: '14px 28px',
        borderRadius: 24,
        backgroundColor: 'rgba(5, 10, 20, 0.78)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.7)',
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
              color: isCurrent ? '#FFE600' : 'rgba(255, 255, 255, 0.85)',
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
