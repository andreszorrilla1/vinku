// ============================================================================
// Generación de la narrativa `ai_rationale` (sección 3 y regla 7.5).
//
// Reglas:
//   - SIEMPRE conecta con el propósito (macro/subcategoría/notas). Un rationale
//     que solo cita cifras se considera incompleto.
//   - Para emprendimiento: nombra explícitamente las fortalezas de dominio (CUOC)
//     como algo aprovechable, no como brecha.
//   - Respeta el copy normativo: para objetivo_no_ocupacional nunca usa lenguaje
//     CUOC/MNC (se apoya en avalNormativo, el único emisor de ese lenguaje).
//
// En esta fase es un generador por plantilla (determinista, sin llamar a IA).
// En producción, la Edge Function de narrativa puede sustituir esta función
// manteniendo el mismo contrato de entrada/salida.
// ============================================================================

import type { Pathway, Person, Skill } from '@/lib/types';
import { SUBCATEGORIA_LABEL } from '@/lib/proposito';

export interface EntradaRationale {
  pathway: Pathway;
  persona: Person;
  missing: string[];
  domainStrength: string[];
  steps_away: number;
  skillById: Map<string, Skill>;
}

const nombres = (ids: string[], m: Map<string, Skill>) =>
  ids.map((id) => m.get(id)?.name).filter(Boolean) as string[];

function listar(xs: string[]): string {
  if (xs.length === 0) return '';
  if (xs.length === 1) return xs[0];
  return xs.slice(0, -1).join(', ') + ' y ' + xs[xs.length - 1];
}

export function generarRationale(e: EntradaRationale): string {
  const objetivo = SUBCATEGORIA_LABEL[e.persona.purpose_subcategory].toLowerCase();
  const faltan = nombres(e.missing, e.skillById);
  const fuerte = nombres(e.domainStrength, e.skillById);

  if (e.pathway.pathway_type === 'objetivo_no_ocupacional') {
    // Debe nombrar fortalezas de dominio + capa EntreComp faltante.
    const partes: string[] = [];
    if (fuerte.length > 0) {
      partes.push(
        `Con tus habilidades ya declaradas en ${listar(fuerte)}, ya tienes el "en qué" de tu ${objetivo}`,
      );
    } else {
      partes.push(
        `Tu meta de ${objetivo} se apoya en tus habilidades de dominio; a medida que valides más, este camino se vuelve más concreto`,
      );
    }
    if (faltan.length > 0) {
      partes.push(
        `lo que falta es la capa de cómo emprender: ${listar(faltan)}. Son ${e.steps_away} competencia(s) EntreComp que te acercan a sostener tu proyecto`,
      );
    } else {
      partes.push('ya cuentas con la capa emprendedora clave para dar el paso');
    }
    return partes.join('. ') + '.';
  }

  // rol_cuoc — conectar con la subcategoría de empleabilidad, sin códigos CUOC.
  const gancho: Record<string, string> = {
    ascender: `Este rol es un paso de mayor nivel hacia donde quieres crecer`,
    emplearse: `Este rol está al alcance de lo que ya sabes y te ayuda a emplearte`,
    reconversion_perfil: `Este rol aprovecha lo que ya traes para moverte a un nuevo sector`,
  };
  const base =
    gancho[e.persona.purpose_subcategory] ??
    `Este rol conecta con tu objetivo de ${objetivo}`;

  if (faltan.length === 0) {
    return `${base}: hoy ya cumples las habilidades clave. Con una validación de SkillPass puedes demostrarlo con evidencia.`;
  }
  return `${base}. Te separan ${e.steps_away} habilidad(es) de tu meta: ${listar(faltan)}.`;
}
