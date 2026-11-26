/**
 * Índice de todos los prefabs disponibles.
 * Importa desde aquí para acceder a cualquier prefab.
 */

// ── Personajes ───────────────────────────────────────────────────────────
export {
  crearHumanoide,
  crearMultitud,
  limpiarHumanoide,
} from './personajes/HumanoideArticulado';
export type {
  AnimacionHumanoide,
  OpcionesHumanoide,
} from './personajes/HumanoideArticulado';

// ── Entornos ─────────────────────────────────────────────────────────────
export {
  crearCiudadLowPoly,
} from './entornos/CiudadLowPoly';
export type {
  HoraCiudad,
  OpcionesCiudad,
} from './entornos/CiudadLowPoly';

export {
  crearEspacioCosmos,
  crearCampoEstelar,
  crearGloboTerraqueo,
  crearTierraPlana,
  crearSolOrbital,
  crearLunaOrbital,
  crearNebulosa,
} from './entornos/EspacioCosmos';
export type { OpcionesEspacio } from './entornos/EspacioCosmos';

export {
  crearEscenarioMontanaRusaEspacio,
  crearRieles3D,
  crearVagonEspacial,
  crearTrenMontanaRusa,
  crearLineasVelocidad,
  crearTierraFondo,
  CURVA_MONTANA_RUSA,
} from './entornos/MontanaRusaEspacio';
export type {
  EtapaMontanaRusa,
  OpcionesMontanaRusa,
} from './entornos/MontanaRusaEspacio';

export {
  crearEscenarioMicrobioma3D,
  crearBacteriaBacilo,
  crearRacimoCocos,
  crearGlobuloRojo,
  crearVellosidadesTejido,
  crearParticulasBioluminiscentes,
} from './entornos/MicrobiomaCelular';
export type {
  EtapaMicrobioma,
  OpcionesMicrobioma,
} from './entornos/MicrobiomaCelular';

// ── Efectos / HUD ────────────────────────────────────────────────────────
export { HUDDatos } from './efectos/HUDDatos';
export type {
  TipoHUD,
  DatoHUD,
  OpcionesHUD,
} from './efectos/HUDDatos';

export { HUDEditorialHolborn } from './efectos/HUDEditorialHolborn';
export type { PropsHUDEditorial } from './efectos/HUDEditorialHolborn';

export { crearEscaleraMetro } from './entornos/EscaleraMetro';
export type { OpcionesEscaleraMetro } from './entornos/EscaleraMetro';

export { crearBunkerBioseguridad } from './entornos/BunkerBioseguridad';
export type { OpcionesBunker } from './entornos/BunkerBioseguridad';

export { crearPiramideGenetica3D } from './entornos/PiramideGenetica3D';
export type { OpcionesPiramideGenetica } from './entornos/PiramideGenetica3D';

export { crearPerimetroMultitud } from './entornos/PerimetroMultitud';
export type { OpcionesPerimetroMultitud } from './entornos/PerimetroMultitud';

export { CATALOGO_PREFABS, buscarPrefabsPorTags } from './catalogo';
export type { FichaPrefab } from './catalogo';

// ── Cámaras ───────────────────────────────────────────────────────────────
export {
  CAMARAS,
  obtenerPoseCamara,
  aplicarPoseCamara,
  interpolarPoses,
  cam_orbital_espacio,
  cam_street_fps,
  cam_dron_aerial,
  cam_dutch_angle,
  cam_corkscrew_salida,
  cam_seguimiento_lateral,
  cam_zoom_in_rapido,
  cam_pan_paisaje,
  cam_dolly_acercamiento,
  cam_estatica_editorial,
  cam_over_shoulder,
  cam_corte_tecnico,
} from './camaras/camaras';
export type {
  TipoCamara,
  PoseCamara,
} from './camaras/camaras';
