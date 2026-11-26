export interface SubtitleToken {
  word: string;
  start: number; // in seconds
  end: number;   // in seconds
  part: string;
}

export interface NotePillData {
  emoji: string;
  label: string;
  color: string;
}

export interface FloatingIconData {
  icon: string;
  x: number; // percentage from left
  y: number; // percentage from top
  delay: number; // in frames
}

export interface ProductSectionData {
  id: string;
  itemNumber: number;
  totalItems: number;
  name: string;
  category: string;
  quote: string;
  occasion: string;
  highlightWords: string[];
  bottleImage: string;
  themeColor: string;
  haloColor: string;
  accentColor: string;
  bgGradient: [string, string];
  notes: NotePillData[];
  floatingIcons: FloatingIconData[];
  startFrame: number;
  endFrame: number;
}

