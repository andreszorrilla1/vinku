// ============================================================================
// ÚNICO lugar que decide el lenguaje regulatorio de una trayectoria.
// Regla 7.4 (no negociable):
//   - objetivo_no_ocupacional  → NUNCA lenguaje CUOC/MNC ni "certificación
//     colombiana". Solo se permite la fórmula EntreComp exacta.
//   - rol_cuoc sin cualificación sectoral → "alineado a", nunca "certificación".
//   - rol_cuoc con cualificación sectoral → puede usar lenguaje de cualificación.
//
// Cualquier interfaz que muestre el aval de una trayectoria DEBE pasar por aquí.
// El condicional de EntreComp vive en el mismo componente que el de
// has_sectoral_qualification (exigencia explícita de la sección 7.4 / 6).
// ============================================================================

import type { Pathway } from './types';

export interface AvalNormativo {
  /** Texto corto para mostrar como sello/etiqueta. */
  etiqueta: string;
  /** Frase completa de respaldo, honesta con la fuente. */
  descripcion: string;
  /** Tono visual sugerido para el sello. */
  tono: 'oficial' | 'alineado' | 'referencia';
}

const FORMULA_ENTRECOMP =
  'Alineado al marco europeo EntreComp, adoptado como referencia por organismos regionales como OIT/Cinterfor';

export function avalNormativo(pathway: Pathway): AvalNormativo {
  if (pathway.pathway_type === 'objetivo_no_ocupacional') {
    // Trayectoria curada por VinkU. NUNCA lenguaje normativo colombiano.
    return {
      etiqueta: 'Referencia: EntreComp (marco europeo)',
      descripcion: FORMULA_ENTRECOMP + '. No corresponde a una norma colombiana.',
      tono: 'referencia',
    };
  }

  // rol_cuoc
  if (pathway.has_sectoral_qualification) {
    return {
      etiqueta: 'Cualificación sectorial',
      descripcion: 'Corresponde a una cualificación formal del catálogo sectorial.',
      tono: 'oficial',
    };
  }

  return {
    etiqueta: 'Alineado al perfil ocupacional CUOC',
    descripcion:
      'Alineado al perfil ocupacional de la Clasificación Única de Ocupaciones para Colombia (CUOC). No constituye certificación oficial.',
    tono: 'alineado',
  };
}

/**
 * Guarda de desarrollo: detecta copy prohibido para una trayectoria dada.
 * Se usa en pruebas y como red de seguridad; devuelve el motivo si algo viola
 * la regla 7.4, o null si el texto es admisible.
 */
export function violaCopyNormativo(pathway: Pathway, texto: string): string | null {
  const t = texto.toLowerCase();
  if (pathway.pathway_type === 'objetivo_no_ocupacional') {
    if (/(cuoc|mnc|certificaci[oó]n colombiana|norma nacional|certificaci[oó]n oficial)/.test(t)) {
      return 'Trayectoria no ocupacional con lenguaje normativo colombiano prohibido.';
    }
  }
  if (pathway.pathway_type === 'rol_cuoc' && !pathway.has_sectoral_qualification) {
    if (/certificaci[oó]n oficial/.test(t)) {
      return 'Rol CUOC sin cualificación sectorial no puede decir "certificación oficial".';
    }
  }
  return null;
}
