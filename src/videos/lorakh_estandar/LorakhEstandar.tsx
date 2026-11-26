import React from 'react';
import { Audio, Sequence, staticFile } from 'remotion';
import { BokehBackground } from './BokehBackground';
import { DynamicSubtitles } from './DynamicSubtitles';
import { HeaderDots } from './HeaderDots';
import { HeroBottle } from './HeroBottle';
import { HookScene } from './HookScene';
import { OutroChecklist } from './OutroChecklist';
import { ProductInfo } from './ProductInfo';
import type { ProductSectionData } from './types';

export const LORAKH_ESTANDAR_FRAMES = 1800; // 60.0s @ 30fps

const PRODUCTS: ProductSectionData[] = [
  {
    id: 'item1',
    itemNumber: 0,
    totalItems: 4,
    name: 'El Frasco Barato',
    category: 'Copia Sintética',
    quote: 'Puro alcohol y humo',
    occasion: 'Se evapora a los 20 minutos con el calor de la pista y no huele a nada.',
    highlightWords: ['20', 'minutos', 'calor', 'evapora', 'nada'],
    bottleImage: 'lorakh_assets/bottle_cheap.png',
    themeColor: '#1a0d12',
    haloColor: 'rgba(220, 38, 38, 0.45)',
    accentColor: '#f87171',
    bgGradient: ['#0f070a', '#1e0d14'],
    notes: [
      { emoji: '💨', label: '90% Alcohol', color: '#f87171' },
      { emoji: '🌫️', label: 'Cero Estela', color: '#fca5a5' },
      { emoji: '⏳', label: 'Dura 20 min', color: '#f87171' },
    ],
    floatingIcons: [
      { icon: '⏱️', x: 22, y: 42, delay: 8 },
      { icon: '💨', x: 78, y: 40, delay: 14 },
      { icon: '❌', x: 24, y: 58, delay: 20 },
    ],
    startFrame: 225, // 7.5s
    endFrame: 540,   // 18.0s
  },
  {
    id: 'item2',
    itemNumber: 1,
    totalItems: 4,
    name: 'Midnight Club',
    category: 'Lorakh Extrait',
    quote: 'Dominio absoluto en la pista',
    occasion: 'Proyección bestial para romper la noche. Ron oscuro, tabaco dulce y vainilla a 3 metros.',
    highlightWords: ['romper', 'noche', 'tabaco', 'vainilla', '3', 'metros'],
    bottleImage: 'lorakh_assets/bottle_midnight.png',
    themeColor: '#09152b',
    haloColor: 'rgba(37, 99, 235, 0.55)',
    accentColor: '#60a5fa',
    bgGradient: ['#040a16', '#0d1f3d'],
    notes: [
      { emoji: '🥃', label: 'Ron Oscuro', color: '#60a5fa' },
      { emoji: '🍂', label: 'Tabaco Dulce', color: '#93c5fd' },
      { emoji: '✨', label: 'Vainilla Negra', color: '#bfdbfe' },
    ],
    floatingIcons: [
      { icon: '🪩', x: 20, y: 42, delay: 8 },
      { icon: '👑', x: 80, y: 40, delay: 14 },
      { icon: '🔥', x: 22, y: 58, delay: 20 },
    ],
    startFrame: 540, // 18.0s
    endFrame: 885,   // 29.5s
  },
  {
    id: 'item3',
    itemNumber: 2,
    totalItems: 4,
    name: 'Royal Gold',
    category: 'Lorakh Extrait',
    quote: 'Atracción magnética VIP',
    occasion: 'El imán de la barra. Ámbar cálido y maderas finas para dejar tu recuerdo en su ropa.',
    highlightWords: ['imán', 'barra', 'ámbar', 'recuerdo', 'ropa'],
    bottleImage: 'lorakh_assets/bottle_gold.png',
    themeColor: '#201205',
    haloColor: 'rgba(217, 119, 6, 0.55)',
    accentColor: '#fbbf24',
    bgGradient: ['#120902', '#2a1705'],
    notes: [
      { emoji: '🍯', label: 'Ámbar Cálido', color: '#fbbf24' },
      { emoji: '🪵', label: 'Cedro Real', color: '#fde68a' },
      { emoji: '🍊', label: 'Bergamota', color: '#f59e0b' },
    ],
    floatingIcons: [
      { icon: '🥂', x: 20, y: 42, delay: 8 },
      { icon: '💖', x: 80, y: 40, delay: 14 },
      { icon: '💎', x: 22, y: 58, delay: 20 },
    ],
    startFrame: 885,  // 29.5s
    endFrame: 1215,  // 40.5s
  },
  {
    id: 'item4',
    itemNumber: 3,
    totalItems: 4,
    name: 'Nocturne Extrait',
    category: 'Lorakh Extrait',
    quote: '35% de aceites puros',
    occasion: 'Catorce horas de presencia imponente sin evaporarse jamás.',
    highlightWords: ['35%', 'catorce', 'horas', 'presencia', 'imponente'],
    bottleImage: 'lorakh_assets/bottle_extrait.png',
    themeColor: '#220810',
    haloColor: 'rgba(225, 29, 72, 0.55)',
    accentColor: '#fb7185',
    bgGradient: ['#120308', '#2e0a16'],
    notes: [
      { emoji: '🧪', label: '35% Aceite', color: '#fb7185' },
      { emoji: '🛡️', label: 'Anti-Sudor', color: '#fda4af' },
      { emoji: '⏳', label: '14+ Horas', color: '#f43f5e' },
    ],
    floatingIcons: [
      { icon: '⚡', x: 20, y: 42, delay: 8 },
      { icon: '🧬', x: 80, y: 40, delay: 14 },
      { icon: '🏆', x: 22, y: 58, delay: 20 },
    ],
    startFrame: 1215, // 40.5s
    endFrame: 1545,  // 51.5s
  },
];

export const LorakhEstandar: React.FC = () => {
  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        position: 'relative',
        backgroundColor: '#05070d',
        overflow: 'hidden',
        color: '#ffffff',
      }}
    >
      {/* 1. Global Master Natural Audio (Unmodified Voice + Chic Subtle House Beat + SFX) */}
      <Audio
        src={staticFile('lorakh_estandar/lorakh_estandar_audio.mp3')}
        volume={1.0}
      />

      {/* 2. Scene Sequences */}
      {/* Hook Scene (0 - 225 frames, 0 - 7.5s) */}
      <Sequence from={0} durationInFrames={225}>
        <BokehBackground
          color1="#040914"
          color2="#0a182e"
          haloColor="rgba(59, 130, 246, 0.45)"
        />
        <HookScene />
      </Sequence>

      {/* Product Items Carousel */}
      {PRODUCTS.map((prod) => {
        const dur = prod.endFrame - prod.startFrame;
        return (
          <Sequence
            key={prod.id}
            from={prod.startFrame}
            durationInFrames={dur}
          >
            <BokehBackground
              color1={prod.bgGradient[0]}
              color2={prod.bgGradient[1]}
              haloColor={prod.haloColor}
            />
            <HeaderDots
              currentIdx={prod.itemNumber}
              total={prod.totalItems}
              activeColor={prod.accentColor}
            />
            <HeroBottle
              imagePath={prod.bottleImage}
              haloColor={prod.accentColor}
            />
            <ProductInfo
              name={prod.name}
              category={prod.category}
              quote={prod.quote}
              occasion={prod.occasion}
              highlightWords={prod.highlightWords}
              accentColor={prod.accentColor}
              notes={prod.notes}
              floatingIcons={prod.floatingIcons}
            />
          </Sequence>
        );
      })}

      {/* Outro Decision Matrix / Checklist (1545 - 1800 frames, 51.5s - 60.0s) */}
      <Sequence from={1545} durationInFrames={255}>
        <BokehBackground
          color1="#050811"
          color2="#101826"
          haloColor="rgba(255, 230, 0, 0.45)"
        />
        <OutroChecklist />
      </Sequence>

      {/* 3. Global Synchronized Dynamic Subtitles */}
      <DynamicSubtitles />
    </div>
  );
};
