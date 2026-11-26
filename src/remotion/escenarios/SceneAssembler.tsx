/**
 * SceneAssembler — Motor de ensamblaje de escenas con prefabs.
 * Permite definir un video completo como un array de EscenaConfig.
 * El assembler calcula offsets de frames y renderiza la escena correcta.
 */

import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { TipoCamara } from '../../prefabs/camaras/camaras';
import type { AnimacionHumanoide } from '../../prefabs/personajes/HumanoideArticulado';
import type { TipoHUD, DatoHUD } from '../../prefabs/efectos/HUDDatos';
import type { HoraCiudad } from '../../prefabs/entornos/CiudadLowPoly';
import { EscenarioCiudad } from './EscenarioCiudad';
import { EscenarioEspacio } from './EscenarioEspacio';
import { EscenarioMontanaRusa } from './EscenarioMontanaRusa';
import type { EtapaMontanaRusa } from '../../prefabs/entornos/MontanaRusaEspacio';
import { EscenarioEscaleraMetro } from './EscenarioEscaleraMetro';

// ─── Tipos de escenario disponibles ─────────────────────────────────────

export type TipoEscenario =
  | 'ciudad'
  | 'ciudad_multitud'
  | 'metro_escalera'
  | 'espacio_globo'
  | 'espacio_tierra_plana'
  | 'espacio_jupiter'
  | 'fps_calle'
  | 'montana_rusa_espacio'
  | 'montana_rusa_hook'
  | 'montana_rusa_caida'
  | 'montana_rusa_loop'
  | 'montana_rusa_fuga'
  | 'montana_rusa_eterna';


// ─── Configuración de una escena ─────────────────────────────────────────

export interface EscenaConfig {
  /** Tipo de escenario 3D */
  escenario: TipoEscenario;
  /** Duración en segundos */
  duracionSegundos: number;
  /** Movimiento de cámara */
  camara?: TipoCamara;
  /** Hora del día (para escenas de ciudad) */
  hora?: HoraCiudad;
  /** Animación del personaje */
  animacionPersonaje?: AnimacionHumanoide;
  /** Color de la camisa/ropa del personaje protagonista */
  colorPersonaje?: string;
  /** HUD de datos sobreimpreso */
  hud?: {
    tipo: TipoHUD;
    datos: DatoHUD[];
    posicion?: 'inferior_izq' | 'superior_izq' | 'inferior_der';
  };
  /** Metadata para debug/logging */
  nombre?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────

function calcularOffsets(escenas: EscenaConfig[], fps: number): number[] {
  const offsets: number[] = [];
  let acum = 0;
  for (const esc of escenas) {
    offsets.push(acum);
    acum += Math.round(esc.duracionSegundos * fps);
  }
  return offsets;
}

function calcularDuracionTotal(escenas: EscenaConfig[], fps: number): number {
  return escenas.reduce((acc, e) => acc + Math.round(e.duracionSegundos * fps), 0);
}

// ─── SceneAssembler ───────────────────────────────────────────────────────

interface PropsAssembler {
  escenas: EscenaConfig[];
  fps?: number;
}

export const SceneAssembler: React.FC<PropsAssembler> = ({ escenas, fps = 30 }) => {
  const frame = useCurrentFrame();
  const offsets = calcularOffsets(escenas, fps);

  // Encuentra la escena activa
  let escenaActual: EscenaConfig | null = null;
  let offsetActual = 0;
  let duracionFrames = 0;

  for (let i = escenas.length - 1; i >= 0; i--) {
    if (frame >= offsets[i]) {
      escenaActual = escenas[i];
      offsetActual = offsets[i];
      duracionFrames = Math.round(escenas[i].duracionSegundos * fps);
      break;
    }
  }

  if (!escenaActual) return null;

  const props = {
    frameInicio: offsetActual,
    duracionFrames,
    tipoCamara: escenaActual.camara ?? 'dolly_acercamiento',
    hud: escenaActual.hud,
  };

  switch (escenaActual.escenario) {
    case 'ciudad':
      return (
        <EscenarioCiudad
          {...props}
          hora={escenaActual.hora ?? 'dia'}
          animacionPersonaje={escenaActual.animacionPersonaje ?? 'idle_mirar'}
          colorPersonaje={escenaActual.colorPersonaje ?? '#e63946'}
          modoMultitud={false}
        />
      );

    case 'ciudad_multitud':
      return (
        <EscenarioCiudad
          {...props}
          hora={escenaActual.hora ?? 'dia'}
          animacionPersonaje={escenaActual.animacionPersonaje ?? 'caminar'}
          colorPersonaje={escenaActual.colorPersonaje ?? '#f59e0b'}
          modoMultitud={true}
          cantidadMultitud={25}
        />
      );

    case 'metro_escalera':
      return (
        <EscenarioEscaleraMetro
          duracionFrames={props.duracionFrames}
          frameInicio={props.frameInicio}
          colorProtagonista={escenaActual.colorPersonaje ?? '#f97316'}
          textoEditorial={escenaActual.nombre}
        />
      );

    case 'espacio_globo':

      return <EscenarioEspacio {...props} modo="globo" tipoCamara={props.tipoCamara} />;

    case 'espacio_tierra_plana':
      return <EscenarioEspacio {...props} modo="tierra_plana" tipoCamara={props.tipoCamara} />;

    case 'espacio_jupiter':
      return <EscenarioEspacio {...props} modo="jupiter" tipoCamara={props.tipoCamara} />;

    case 'fps_calle':
      return (
        <EscenarioCiudad
          {...props}
          hora={escenaActual.hora ?? 'dia'}
          animacionPersonaje="caminar"
          colorPersonaje={escenaActual.colorPersonaje ?? '#e63946'}
          modoMultitud={true}
          cantidadMultitud={12}
          tipoCamara="street_fps"
        />
      );

    case 'montana_rusa_hook':
      return <EscenarioMontanaRusa {...props} etapa="hook_cima" />;

    case 'montana_rusa_caida':
      return <EscenarioMontanaRusa {...props} etapa="caida_aceleracion" />;

    case 'montana_rusa_loop':
      return <EscenarioMontanaRusa {...props} etapa="loop_gravedad_cero" />;

    case 'montana_rusa_fuga':
      return <EscenarioMontanaRusa {...props} etapa="fuga_frenos_fallo" />;

    case 'montana_rusa_eterna':
    case 'montana_rusa_espacio':
      return <EscenarioMontanaRusa {...props} etapa="deriva_eterna" />;

    default:
      return null;
  }
};

// ─── Helper para calcular duración total del video ────────────────────────

export function calcularDuracionVideo(escenas: EscenaConfig[], fps = 30): number {
  return calcularDuracionTotal(escenas, fps);
}

export default SceneAssembler;
