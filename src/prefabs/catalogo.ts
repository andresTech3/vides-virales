/**
 * catalogo.ts — Registro Central de Prefabs 3D y Efectos Virales.
 * 
 * Permite catalogar, buscar por tags y reutilizar prefabs en cualquier video
 * con cero sobrepeso de almacenamiento (código paramétrico puro, < 15 KB).
 */

export type CategoriaPrefab = 'entorno' | 'personaje' | 'efecto' | 'hud' | 'camara';

export interface FichaPrefab {
  id: string;
  nombre: string;
  categoria: CategoriaPrefab;
  descripcion: string;
  tags: string[];
  complejidadPoligonal: 'ultra_baja' | 'baja' | 'media';
  pesoEstimadoRAM_MB: number;
  creadoEn: string;
  rutaArchivo: string;
}

export const CATALOGO_PREFABS: Record<string, FichaPrefab> = {
  // ── Personajes ──
  'maniqui_minimalista': {
    id: 'maniqui_minimalista',
    nombre: 'Maniquí Minimalista Cerámico',
    categoria: 'personaje',
    descripcion: 'Maniquí estilizado de vinilo/cerámica mate con cabeza ovoide y cinemática sinusoidal de caminata.',
    tags: ['humano', 'minimalista', 'multitud', 'holborn', 'viral'],
    complejidadPoligonal: 'ultra_baja',
    pesoEstimadoRAM_MB: 2.5,
    creadoEn: '2026-10-29',
    rutaArchivo: 'src/prefabs/personajes/ManiquiMinimalista.ts',
  },
  'humanoide_articulado': {
    id: 'humanoide_articulado',
    nombre: 'Humanoide Articulado y Multitud',
    categoria: 'personaje',
    descripcion: 'Personaje con extremidades articuladas y generador de multitudes instanciadas.',
    tags: ['humano', 'articulado', 'multitud', 'ciudad'],
    complejidadPoligonal: 'baja',
    pesoEstimadoRAM_MB: 8.0,
    creadoEn: '2026-10-28',
    rutaArchivo: 'src/prefabs/personajes/HumanoideArticulado.tsx',
  },

  // ── Entornos ──
  'metro_holborn': {
    id: 'metro_holborn',
    nombre: 'Escalera Mecánica Metro Holborn',
    categoria: 'entorno',
    descripcion: 'Túnel abovedado a 30° con escalones móviles infinitos, barandillas de acero y señalética.',
    tags: ['metro', 'transporte', 'holborn', 'escalera', 'londres', 'what_if'],
    complejidadPoligonal: 'media',
    pesoEstimadoRAM_MB: 12.0,
    creadoEn: '2026-10-29',
    rutaArchivo: 'src/prefabs/entornos/EscaleraMetro.tsx',
  },
  'bunker_bioseguridad': {
    id: 'bunker_bioseguridad',
    nombre: 'Cápsula Búnker de Bioseguridad Nivel 4',
    categoria: 'entorno',
    descripcion: 'Búnker hexagonal de aislamiento médico extremo con cápsula criogénica, láseres UV y monitores.',
    tags: ['bunker', 'bioseguridad', 'medico', 'ultimo_hombre', 'aislamiento', 'scifi'],
    complejidadPoligonal: 'baja',
    pesoEstimadoRAM_MB: 6.5,
    creadoEn: '2026-10-29',
    rutaArchivo: 'src/prefabs/entornos/BunkerBioseguridad.tsx',
  },
  'piramide_genetica_3d': {
    id: 'piramide_genetica_3d',
    nombre: 'Pirámide Poblacional & ADN 3D',
    categoria: 'entorno',
    descripcion: 'Visualización 3D del colapso demográfico con doble hélice de ADN y gráficos de barras extruidos.',
    tags: ['genetica', 'adn', 'demografia', 'datos', 'piramide', 'ultimo_hombre'],
    complejidadPoligonal: 'baja',
    pesoEstimadoRAM_MB: 5.0,
    creadoEn: '2026-10-29',
    rutaArchivo: 'src/prefabs/entornos/PiramideGenetica3D.tsx',
  },
  'perimetro_multitud': {
    id: 'perimetro_multitud',
    nombre: 'Perímetro de Exclusión Médica y Multitud',
    categoria: 'entorno',
    descripcion: 'Zona de exclusión central con vallas biomédicas rodeada de multitudes instanciadas.',
    tags: ['multitud', 'perimetro', 'cuarentena', 'seguridad', 'ultimo_hombre'],
    complejidadPoligonal: 'media',
    pesoEstimadoRAM_MB: 10.0,
    creadoEn: '2026-10-29',
    rutaArchivo: 'src/prefabs/entornos/PerimetroMultitud.tsx',
  },
  'montana_rusa_espacio': {
    id: 'montana_rusa_espacio',
    nombre: 'Montaña Rusa Espacial',
    categoria: 'entorno',
    descripcion: 'Rieles 3D orbitales, vagones espaciales y trayectoria en gravedad cero.',
    tags: ['espacio', 'montana_rusa', 'velocidad', 'cosmos'],
    complejidadPoligonal: 'media',
    pesoEstimadoRAM_MB: 14.0,
    creadoEn: '2026-10-28',
    rutaArchivo: 'src/prefabs/entornos/MontanaRusaEspacio.tsx',
  },
  'microbioma_celular': {
    id: 'microbioma_celular',
    nombre: 'Microbioma Celular & Bacterias',
    categoria: 'entorno',
    descripcion: 'Bacilos, cocos y glóbulos rojos bioluminiscentes en tejido orgánico.',
    tags: ['microbio', 'bacterias', 'biologia', 'celular'],
    complejidadPoligonal: 'baja',
    pesoEstimadoRAM_MB: 8.0,
    creadoEn: '2026-10-28',
    rutaArchivo: 'src/prefabs/entornos/MicrobiomaCelular.tsx',
  },
  'choque_luna_tierra': {
    id: 'choque_luna_tierra',
    nombre: 'Colisión Cósmica Tierra-Luna & Límite de Roche',
    categoria: 'entorno',
    descripcion: 'Simulación astrofísica de aproximación lunar, desgarro a 18.470 km, bombardeo magmático y anillos de acreción.',
    tags: ['luna', 'tierra', 'espacio', 'cosmos', 'choque', 'what_if', 'apocalipsis', 'roche'],
    complejidadPoligonal: 'media',
    pesoEstimadoRAM_MB: 11.5,
    creadoEn: '2026-10-30',
    rutaArchivo: 'src/prefabs/entornos/ChoqueLunaTierra.ts',
  },

  // ── HUDs ──
  'hud_editorial_holborn': {
    id: 'hud_editorial_holborn',
    nombre: 'HUD Editorial Holborn & Reloj Militar',
    categoria: 'hud',
    descripcion: 'Header en vivo con dot verde, reloj militar frame a frame y badges métricos.',
    tags: ['editorial', 'reloj', 'telemetria', 'holborn', 'metricas'],
    complejidadPoligonal: 'ultra_baja',
    pesoEstimadoRAM_MB: 0.5,
    creadoEn: '2026-10-29',
    rutaArchivo: 'src/prefabs/efectos/HUDEditorialHolborn.tsx',
  },
};

/**
 * Busca prefabs disponibles por etiquetas temáticas
 */
export function buscarPrefabsPorTags(tags: string[]): FichaPrefab[] {
  const normalizados = tags.map((t) => t.toLowerCase());
  return Object.values(CATALOGO_PREFABS).filter((p) =>
    p.tags.some((pt) => normalizados.includes(pt.toLowerCase()))
  );
}

/**
 * Registra dinámicamente un nuevo prefab en tiempo de ejecución
 */
export function registrarPrefab(ficha: FichaPrefab): void {
  CATALOGO_PREFABS[ficha.id] = ficha;
}
