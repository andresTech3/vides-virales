export interface SubtitleToken {
  word: string;
  start: number;
  end: number;
  part: string;
}

export interface FloatingIcon {
  icon: string;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  delay: number; // frames
}

export interface ArchetypeData {
  id: string;
  index: number; // 0 to 4
  traitHeader: string; // "Si eres magnético y dueño de la noche..."
  perfumeTitle: string; // "Midnight Club"
  bottleImage: string; // "lorakh_assets/bottle_midnight.png"
  colorTheme: string; // accent color (e.g. #60a5fa)
  haloColor: string; // glow color (e.g. rgba(37,99,235,0.6))
  bgGradient: [string, string]; // [inner, outer]
  essenceKeyword: string; // "Seducción Letal"
  floatingIcons: FloatingIcon[];
  startFrame: number;
  endFrame: number;
}

