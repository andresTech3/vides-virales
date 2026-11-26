import type { EstiloVisual } from '../esquemas/brief.schema';

export interface EstiloPreset {
  nombre: EstiloVisual;
  colorFondo: string;
  colorAcento: string;
  colorTexto: string;
  colorSecundario: string;
  fuenteTitulo: string;
  fuenteSubtitulo: string;
}

export const ESTILOS_PRESETS: Record<EstiloVisual, EstiloPreset> = {
  // ── Estilos 3D ──────────────────────────────────────────────────────────
  neon_kinetic: {
    nombre: 'neon_kinetic',
    colorFondo: '#0a0a0f',
    colorAcento: '#faae33',
    colorTexto: '#ffffff',
    colorSecundario: '#22d3ee',
    fuenteTitulo: "'Syne', 'Impact', sans-serif",
    fuenteSubtitulo: "'Plus Jakarta Sans', sans-serif",
  },
  lowpoly3d: {
    nombre: 'lowpoly3d',
    colorFondo: '#181028',
    colorAcento: '#c084fc',
    colorTexto: '#f3e8ff',
    colorSecundario: '#38bdf8',
    fuenteTitulo: "'Syne', sans-serif",
    fuenteSubtitulo: "'Plus Jakarta Sans', sans-serif",
  },
  fps_realista: {
    nombre: 'fps_realista',
    colorFondo: '#1a1a2e',
    colorAcento: '#faae33',
    colorTexto: '#ffffff',
    colorSecundario: '#22d3ee',
    fuenteTitulo: "'Syne', 'Impact', sans-serif",
    fuenteSubtitulo: "'Plus Jakarta Sans', sans-serif",
  },
  clay_arcilla: {
    nombre: 'clay_arcilla',
    colorFondo: '#fdf4ec',
    colorAcento: '#f97316',
    colorTexto: '#1c1010',
    colorSecundario: '#ec4899',
    fuenteTitulo: "'Syne', sans-serif",
    fuenteSubtitulo: "'Plus Jakarta Sans', sans-serif",
  },
  cinematic_dark: {
    nombre: 'cinematic_dark',
    colorFondo: '#080808',
    colorAcento: '#eab308',
    colorTexto: '#f8fafc',
    colorSecundario: '#94a3b8',
    fuenteTitulo: "'Georgia', serif",
    fuenteSubtitulo: "'Plus Jakarta Sans', sans-serif",
  },
  // ── Estilos 2D / Ilustración ──────────────────────────────────────────
  pixelart: {
    nombre: 'pixelart',
    colorFondo: '#12121e',
    colorAcento: '#4ade80',
    colorTexto: '#ffffff',
    colorSecundario: '#facc15',
    fuenteTitulo: "'Courier New', monospace",
    fuenteSubtitulo: "'Courier New', monospace",
  },
  flat_design_2d: {
    nombre: 'flat_design_2d',
    colorFondo: '#0f4c75',
    colorAcento: '#f72585',
    colorTexto: '#ffffff',
    colorSecundario: '#90e0ef',
    fuenteTitulo: "'Syne', 'Nunito', sans-serif",
    fuenteSubtitulo: "'Plus Jakarta Sans', sans-serif",
  },
  risografia_vintage: {
    nombre: 'risografia_vintage',
    colorFondo: '#f5f0e8',
    colorAcento: '#cc2200',
    colorTexto: '#111827',
    colorSecundario: '#003399',
    fuenteTitulo: "'Impact', 'Oswald', sans-serif",
    fuenteSubtitulo: "'Courier New', monospace",
  },
  diagrama_cientifico: {
    nombre: 'diagrama_cientifico',
    colorFondo: '#ffffff',
    colorAcento: '#2563eb',
    colorTexto: '#0f172a',
    colorSecundario: '#dc2626',
    fuenteTitulo: "'Syne', sans-serif",
    fuenteSubtitulo: "'Plus Jakarta Sans', sans-serif",
  },
  acuarela_grabado: {
    nombre: 'acuarela_grabado',
    colorFondo: '#1a1206',
    colorAcento: '#c9a227',
    colorTexto: '#f5e6c8',
    colorSecundario: '#8b7355',
    fuenteTitulo: "'Georgia', 'Palatino', serif",
    fuenteSubtitulo: "'Georgia', serif",
  },
};
