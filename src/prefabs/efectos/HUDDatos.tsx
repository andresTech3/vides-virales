/**
 * HUDDatos — Prefab de overlay de datos (React/DOM).
 * Dibuja paneles de HUD sobre el canvas 3D.
 * Estilos disponibles: fisica, biometrico, cientifico, temperatura, contador
 */

import React from 'react';

export type TipoHUD =
  | 'fisica'       // velocidad + aceleración (estilo speedometer)
  | 'biometrico'   // BPM + EKG (corredor)
  | 'cientifico'   // datos con símbolo y unidades
  | 'temperatura'  // termómetro con valor
  | 'contador'     // número gigante central
  | 'mision'       // badge superior tipo videojuego (RPG)
  | 'peso_escala'; // comparación de escala/peso científico

export interface DatoHUD {
  etiqueta: string;
  valor: string | number;
  unidad?: string;
  color?: string;
}

export interface OpcionesHUD {
  tipo: TipoHUD;
  datos: DatoHUD[];
  posicion?: 'inferior_izq' | 'inferior_der' | 'superior_izq' | 'superior_der' | 'centro';
  t?: number; // Para animaciones de entrada
}

// ── Estilos de tipografía ────────────────────────────────────────────────
const FUENTE_HUD = "'Syne', 'Courier New', monospace";
const FUENTE_NUMERO = "'Impact', 'Syne', sans-serif";

// ── Paleta de colores ────────────────────────────────────────────────────
const PALETA_HUD = {
  fondo: 'rgba(0, 0, 0, 0.55)',
  borde: 'rgba(255,255,255,0.15)',
  acento: '#faae33',
  texto: '#ffffff',
  verde: '#22d3ee',
  rojo: '#ef4444',
  azul: '#3b82f6',
};

// ── Helper para animar entrada ────────────────────────────────────────────
function useEntrada(t: number): number {
  return Math.min(1, (t ?? 0) * 4);
}

// ────────────────────────────────────────────────────────────────────────────
// COMPONENTES POR TIPO
// ────────────────────────────────────────────────────────────────────────────

const HUDFisica: React.FC<{ datos: DatoHUD[]; t: number }> = ({ datos, t }) => {
  const entrada = useEntrada(t);
  const velocidad = datos[0];
  const estado = datos[1];
  const bpm = datos[2];

  return (
    <div style={{
      fontFamily: FUENTE_HUD,
      color: PALETA_HUD.texto,
      opacity: entrada,
      transform: `translateY(${(1 - entrada) * 20}px)`,
      transition: 'none',
    }}>
      {/* Panel principal de velocidad */}
      <div style={{
        background: PALETA_HUD.fondo,
        backdropFilter: 'blur(8px)',
        border: `1px solid ${PALETA_HUD.borde}`,
        borderRadius: '8px',
        padding: '12px 16px',
        marginBottom: '8px',
        minWidth: '160px',
      }}>
        <div style={{ fontSize: '10px', letterSpacing: '2px', color: '#aaa', textTransform: 'uppercase', marginBottom: '2px' }}>
          YOUR SPEED
        </div>
        <div style={{ fontSize: '32px', fontFamily: FUENTE_NUMERO, fontWeight: 900, lineHeight: 1, color: PALETA_HUD.acento }}>
          {velocidad?.valor}<span style={{ fontSize: '14px', marginLeft: '4px', color: '#ccc' }}>{velocidad?.unidad}</span>
        </div>
        {estado && (
          <div style={{ fontSize: '10px', letterSpacing: '1px', color: '#22d3ee', textTransform: 'uppercase', marginTop: '4px' }}>
            {estado.etiqueta}
          </div>
        )}
      </div>
      {/* BPM con EKG */}
      {bpm && (
        <div style={{
          background: PALETA_HUD.fondo,
          backdropFilter: 'blur(8px)',
          border: `1px solid ${PALETA_HUD.borde}`,
          borderRadius: '6px',
          padding: '6px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{ fontSize: '10px', color: PALETA_HUD.rojo }}>♥</span>
          <span style={{ fontSize: '18px', fontFamily: FUENTE_NUMERO, color: PALETA_HUD.rojo }}>{bpm.valor}</span>
          <span style={{ fontSize: '9px', color: '#777' }}>BPM</span>
          {/* Línea EKG simplificada */}
          <svg width="50" height="18" viewBox="0 0 50 18">
            <polyline
              points="0,9 8,9 12,2 16,16 20,9 24,9 28,4 32,14 36,9 50,9"
              fill="none"
              stroke={PALETA_HUD.rojo}
              strokeWidth="1.5"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

const HUDCientifico: React.FC<{ datos: DatoHUD[]; t: number }> = ({ datos, t }) => {
  const entrada = useEntrada(t);
  return (
    <div style={{
      fontFamily: FUENTE_HUD,
      opacity: entrada,
      transform: `translateX(${(1 - entrada) * -20}px)`,
    }}>
      {datos.map((dato, i) => (
        <div key={i} style={{
          background: PALETA_HUD.fondo,
          backdropFilter: 'blur(8px)',
          border: `1px solid ${dato.color ?? PALETA_HUD.borde}`,
          borderLeft: `3px solid ${dato.color ?? PALETA_HUD.acento}`,
          borderRadius: '6px',
          padding: '8px 14px',
          marginBottom: '6px',
        }}>
          <div style={{ fontSize: '9px', letterSpacing: '2px', color: '#aaa', textTransform: 'uppercase' }}>
            {dato.etiqueta}
          </div>
          <div style={{ fontSize: '26px', fontFamily: FUENTE_NUMERO, fontWeight: 900, color: dato.color ?? PALETA_HUD.verde }}>
            {dato.valor}
            {dato.unidad && <span style={{ fontSize: '12px', color: '#aaa', marginLeft: '4px' }}>{dato.unidad}</span>}
          </div>
        </div>
      ))}
    </div>
  );
};

const HUDContador: React.FC<{ datos: DatoHUD[]; t: number }> = ({ datos, t }) => {
  const entrada = useEntrada(t);
  const dato = datos[0];
  return (
    <div style={{
      textAlign: 'center',
      opacity: entrada,
      transform: `scale(${0.5 + entrada * 0.5})`,
    }}>
      <div style={{
        fontSize: '72px',
        fontFamily: FUENTE_NUMERO,
        fontWeight: 900,
        color: '#ffffff',
        textShadow: `0 0 30px ${PALETA_HUD.acento}, 0 0 60px ${PALETA_HUD.acento}`,
        lineHeight: 1,
      }}>
        {dato?.valor}
      </div>
      {dato?.unidad && (
        <div style={{
          fontSize: '18px',
          fontFamily: FUENTE_HUD,
          letterSpacing: '3px',
          color: PALETA_HUD.acento,
          textTransform: 'uppercase',
          marginTop: '4px',
        }}>
          {dato.unidad}
        </div>
      )}
      {dato?.etiqueta && (
        <div style={{
          fontSize: '14px',
          color: '#ccc',
          marginTop: '8px',
          fontFamily: FUENTE_HUD,
        }}>
          {dato.etiqueta}
        </div>
      )}
    </div>
  );
};

const HUDMision: React.FC<{ datos: DatoHUD[]; t: number }> = ({ datos, t }) => {
  const entrada = useEntrada(t);
  const dato = datos[0];
  return (
    <div style={{
      background: 'rgba(10,10,30,0.85)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '10px',
      padding: '8px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      opacity: entrada,
      transform: `translateY(${(1 - entrada) * -15}px)`,
    }}>
      <div style={{
        width: '32px',
        height: '32px',
        background: PALETA_HUD.acento,
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        flexShrink: 0,
      }}>
        {dato?.unidad ?? '⚡'}
      </div>
      <div>
        <div style={{ fontSize: '9px', color: PALETA_HUD.acento, letterSpacing: '2px', textTransform: 'uppercase' }}>
          {dato?.etiqueta}
        </div>
        <div style={{ fontSize: '14px', color: '#fff', fontFamily: FUENTE_HUD, fontWeight: 700 }}>
          {dato?.valor}
        </div>
      </div>
    </div>
  );
};

const HUDTemperatura: React.FC<{ datos: DatoHUD[]; t: number }> = ({ datos, t }) => {
  const entrada = useEntrada(t);
  return (
    <div style={{
      fontFamily: FUENTE_HUD,
      opacity: entrada,
    }}>
      {datos.map((dato, i) => (
        <div key={i} style={{
          background: PALETA_HUD.fondo,
          backdropFilter: 'blur(8px)',
          border: `1px solid ${PALETA_HUD.borde}`,
          borderRadius: '8px',
          padding: '10px 16px',
          marginBottom: '6px',
          display: 'flex',
          alignItems: 'baseline',
          gap: '6px',
        }}>
          <span style={{ fontSize: '9px', color: '#aaa', letterSpacing: '1px', textTransform: 'uppercase', width: '40px' }}>
            {dato.etiqueta}
          </span>
          <span style={{ fontSize: '36px', fontFamily: FUENTE_NUMERO, fontWeight: 900, color: dato.color ?? PALETA_HUD.acento }}>
            {dato.valor}
          </span>
          <span style={{ fontSize: '14px', color: '#aaa' }}>{dato.unidad ?? '°C'}</span>
        </div>
      ))}
    </div>
  );
};

const HUDPesoEscala: React.FC<{ datos: DatoHUD[]; t: number }> = ({ datos, t }) => {
  const entrada = useEntrada(t);
  const dato = datos[0];
  const formula = datos[1];
  return (
    <div style={{
      fontFamily: FUENTE_HUD,
      opacity: entrada,
      transform: `translateX(${(1 - entrada) * 30}px)`,
    }}>
      <div style={{
        background: PALETA_HUD.fondo,
        backdropFilter: 'blur(8px)',
        border: `1px solid ${PALETA_HUD.borde}`,
        borderRadius: '8px',
        padding: '12px 18px',
        marginBottom: '8px',
      }}>
        <div style={{ fontSize: '9px', color: '#aaa', letterSpacing: '2px', textTransform: 'uppercase' }}>
          {dato?.etiqueta}
        </div>
        <div style={{ fontSize: '38px', fontFamily: FUENTE_NUMERO, fontWeight: 900, color: PALETA_HUD.acento }}>
          {dato?.valor} <span style={{ fontSize: '14px', color: '#aaa' }}>{dato?.unidad}</span>
        </div>
      </div>
      {formula && (
        <div style={{
          background: PALETA_HUD.fondo,
          backdropFilter: 'blur(8px)',
          border: `1px solid ${PALETA_HUD.borde}`,
          borderRadius: '8px',
          padding: '8px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
        }}>
          <div style={{ fontSize: '18px', fontFamily: FUENTE_NUMERO, color: PALETA_HUD.verde }}>
            {formula.etiqueta}
          </div>
          <div style={{ fontSize: '12px', color: '#aaa' }}>
            {formula.valor}
          </div>
        </div>
      )}
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ────────────────────────────────────────────────────────────────────────────

const POSICION_STYLES: Record<NonNullable<OpcionesHUD['posicion']>, React.CSSProperties> = {
  inferior_izq: { bottom: '140px', left: '20px' },
  inferior_der: { bottom: '140px', right: '20px' },
  superior_izq: { top: '80px', left: '20px' },
  superior_der: { top: '80px', right: '20px' },
  centro: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
};

export const HUDDatos: React.FC<OpcionesHUD> = ({ tipo, datos, posicion = 'inferior_izq', t = 0 }) => {
  const posStyle = POSICION_STYLES[posicion];

  const renderContenido = () => {
    switch (tipo) {
      case 'fisica':     return <HUDFisica datos={datos} t={t} />;
      case 'biometrico': return <HUDFisica datos={datos} t={t} />;
      case 'cientifico': return <HUDCientifico datos={datos} t={t} />;
      case 'temperatura':return <HUDTemperatura datos={datos} t={t} />;
      case 'contador':   return <HUDContador datos={datos} t={t} />;
      case 'mision':     return <HUDMision datos={datos} t={t} />;
      case 'peso_escala':return <HUDPesoEscala datos={datos} t={t} />;
      default:           return null;
    }
  };

  return (
    <div style={{
      position: 'absolute',
      zIndex: 40,
      pointerEvents: 'none',
      fontFamily: FUENTE_HUD,
      color: PALETA_HUD.texto,
      ...posStyle,
    }}>
      {renderContenido()}
    </div>
  );
};

export default HUDDatos;
