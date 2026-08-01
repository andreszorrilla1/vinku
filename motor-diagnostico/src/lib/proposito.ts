// ============================================================================
// Propósito de la persona: catálogo, validación de coherencia y mapeo al motor.
// Corresponde a la sección 4.3 del megaprompt.
//
// Regla de consistencia (7 / 4.3): purpose_subcategory debe validarse en
// APLICACIÓN (no solo en el check de SQL) contra su purpose_macro. Un registro
// con macro='empleabilidad' y subcategoría='crear_empresa' es inconsistente y
// se rechaza antes de tocar la base de datos.
// ============================================================================

import type {
  PurposeMacro,
  PurposeSubcategory,
  PathwayType,
} from './types';

export const SUBCATEGORIAS_POR_MACRO: Record<PurposeMacro, PurposeSubcategory[]> = {
  empleabilidad: ['ascender', 'emplearse', 'reconversion_perfil'],
  emprendimiento: ['crear_empresa', 'prestacion_servicios_independiente', 'consultoria'],
};

/** Lanza si la combinación macro/subcategoría es inconsistente. */
export function validarProposito(
  macro: PurposeMacro,
  sub: PurposeSubcategory,
): void {
  if (!SUBCATEGORIAS_POR_MACRO[macro].includes(sub)) {
    throw new Error(
      `Propósito inconsistente: la subcategoría "${sub}" no pertenece al macro "${macro}".`,
    );
  }
}

export function esPropositoValido(
  macro: PurposeMacro,
  sub: PurposeSubcategory,
): boolean {
  return SUBCATEGORIAS_POR_MACRO[macro].includes(sub);
}

/**
 * Tipo de trayectoria que PRIORIZA el motor según el propósito (tabla 4.3).
 * No es exclusión: el otro tipo no desaparece, solo no se muestra primero.
 */
export function tipoPrioritario(macro: PurposeMacro): PathwayType {
  return macro === 'emprendimiento' ? 'objetivo_no_ocupacional' : 'rol_cuoc';
}

// --- Copy amable para la persona (nunca jerga normativa) ------------------
export const MACRO_LABEL: Record<PurposeMacro, string> = {
  empleabilidad: 'Sobre mi empleo',
  emprendimiento: 'Crear algo propio',
};

export const MACRO_PREGUNTA: Record<PurposeMacro, string> = {
  empleabilidad: '¿Es sobre tu empleo actual o el que buscas?',
  emprendimiento: '¿Es sobre crear algo tuyo?',
};

export const SUBCATEGORIA_LABEL: Record<PurposeSubcategory, string> = {
  ascender: 'Ascender en lo que ya hago',
  emplearse: 'Conseguir empleo',
  reconversion_perfil: 'Cambiar de carrera o perfil',
  crear_empresa: 'Crear una empresa',
  prestacion_servicios_independiente: 'Trabajar por mi cuenta',
  consultoria: 'Ofrecer consultoría',
};

export const SUBCATEGORIA_DESC: Record<PurposeSubcategory, string> = {
  ascender: 'Quiero crecer hacia un rol de mayor nivel en mi mismo sector.',
  emplearse: 'Busco emplearme en algo que esté al alcance de lo que ya sé.',
  reconversion_perfil: 'Quiero moverme a un sector distinto aprovechando lo que ya tengo.',
  crear_empresa: 'Quiero montar un negocio propio.',
  prestacion_servicios_independiente: 'Quiero ofrecer mis servicios como independiente.',
  consultoria: 'Quiero asesorar a otros con mi conocimiento.',
};
