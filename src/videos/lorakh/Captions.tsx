import React from 'react';
import { useCurrentFrame } from 'remotion';
import words from './voice/words.json';

type Word = { start: number; end: number; content: string };
const WORDS = words as Word[];

const HIGHLIGHT_WORDS = new Set([
  'lorakh',
  'perfume',
  'discoteca',
  'calidad',
  'barato',
  'aceites',
  'esenciales',
  'presencia',
  'ámbar',
  'alcohol',
  'evapora',
  'idénticos',
  'fondo',
  'estela',
  'piel',
  'huele',
  'apaga',
]);

type CaptionChunk = {
  start: number;
  end: number;
  text: string;
  hasHighlight: boolean;
};

const CHUNKS: CaptionChunk[] = [];
let i = 0;
while (i < WORDS.length) {
  const w1 = WORDS[i];
  const clean1 = w1.content.toLowerCase().replace(/[^a-záéíóúñ]/g, '');
  const isShort = clean1.length <= 3 && i + 1 < WORDS.length;

  if (isShort) {
    const w2 = WORDS[i + 1];
    const clean2 = w2.content.toLowerCase().replace(/[^a-záéíóúñ]/g, '');
    const hasHighlight = HIGHLIGHT_WORDS.has(clean1) || HIGHLIGHT_WORDS.has(clean2);
    CHUNKS.push({
      start: w1.start,
      end: w2.end + 0.05,
      text: `${w1.content} ${w2.content}`,
      hasHighlight,
    });
    i += 2;
  } else {
    const hasHighlight = HIGHLIGHT_WORDS.has(clean1);
    CHUNKS.push({
      start: w1.start,
      end: w1.end + 0.05,
      text: w1.content,
      hasHighlight,
    });
    i += 1;
  }
}

export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const time = frame / 30;

  const activeChunk = CHUNKS.find((c) => time >= c.start && time < c.end);
  if (!activeChunk) return null;

  const chunkFrame = Math.max(0, Math.round((time - activeChunk.start) * 30));
  const scale = chunkFrame < 3 ? 1.15 - chunkFrame * 0.05 : 1.0;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 380,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: 'none',
        zIndex: 100,
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
      }}
    >
      <div
        style={{
          fontFamily: "'Arial Black', Impact, Montserrat, sans-serif",
          fontSize: 82,
          fontWeight: 900,
          color: activeChunk.hasHighlight ? '#FFE600' : '#FFFFFF',
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          WebkitTextStroke: '16px #000000',
          paintOrder: 'stroke fill',
          textShadow: '0 8px 30px rgba(0, 0, 0, 0.95)',
          padding: '0 40px',
          textAlign: 'center',
          lineHeight: 1.1,
        }}
      >
        {activeChunk.text}
      </div>
    </div>
  );
};

