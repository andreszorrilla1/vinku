// ============================================================================
// Motor de grafo habilidad ↔ trayectoria ("modelo Lego"). Sección 5.5 y 6.
//
// Calcula, contra el perfil autodeclarado + el propósito, dónde está la persona
// y a qué trayectorias puede llegar — roles CUOC Y objetivos no ocupacionales.
//
// Reglas clave:
//   - Priorización por AFINIDAD con el propósito primero, luego steps_away (4.3).
//   - Para objetivo_no_ocupacional: solo la capa EntreComp 'core' faltante cuenta
//     como missing_skill_ids / steps_away. Las habilidades de dominio (CUOC) que
//     la persona ya tiene son FORTALEZA (domain_strength_skill_ids), no brecha.
//   - El catálogo de skills es UNO SOLO: una habilidad CUOC ya validada sirve
//     igual para emprender (sección 6, corrección de arquitectura).
// ============================================================================

import type {
  Pathway,
  PathwayGapAnalysis,
  PathwaySkillRequirement,
  PersonSkillStatus,
  Person,
  Skill,
} from '@/lib/types';
import { generarRationale } from './rationale';

export interface EntradaMotor {
  persona: Person;
  estados: PersonSkillStatus[];
  skills: Skill[];
  pathways: Pathway[];
  requisitos: PathwaySkillRequirement[];
}

const TIENE = new Set(['autodeclarada', 'validada_skillpass', 'ajustada_skillpass']);

const esDominioCUOC = (sk: Skill) => (sk.source_reference ?? '').includes('CUOC');

export function calcularDiagnostico(e: EntradaMotor): PathwayGapAnalysis[] {
  const skillById = new Map(e.skills.map((s) => [s.id, s]));
  const poseidas = new Set(
    e.estados.filter((st) => TIENE.has(st.status)).map((st) => st.skill_id),
  );

  const reqsPorPathway = new Map<string, PathwaySkillRequirement[]>();
  for (const r of e.requisitos) {
    const arr = reqsPorPathway.get(r.pathway_id) ?? [];
    arr.push(r);
    reqsPorPathway.set(r.pathway_id, arr);
  }

  const analisis = e.pathways.map((pathway) =>
    analizarPathway(pathway, reqsPorPathway.get(pathway.id) ?? [], poseidas, skillById, e.persona),
  );

  // Orden: primero afinidad con el propósito (desc), luego cercanía (asc).
  return analisis.sort((a, b) => {
    if (b.purpose_alignment_score !== a.purpose_alignment_score) {
      return b.purpose_alignment_score - a.purpose_alignment_score;
    }
    return a.steps_away - b.steps_away;
  });
}

function analizarPathway(
  pathway: Pathway,
  reqs: PathwaySkillRequirement[],
  poseidas: Set<string>,
  skillById: Map<string, Skill>,
  persona: Person,
): PathwayGapAnalysis {
  const core = reqs.filter((r) => r.requirement_type === 'core');

  let missing: string[] = [];
  let domainStrength: string[] = [];

  if (pathway.pathway_type === 'objetivo_no_ocupacional') {
    // Solo la capa EntreComp 'core' faltante cuenta como brecha.
    missing = core.map((r) => r.skill_id).filter((id) => !poseidas.has(id));
    // Segunda dimensión, en tiempo de ejecución: habilidades de DOMINIO (CUOC)
    // que la persona YA tiene → fortaleza a mostrar, no brecha.
    domainStrength = [...poseidas].filter((id) => {
      const sk = skillById.get(id);
      return sk && esDominioCUOC(sk);
    });
  } else {
    // rol_cuoc: la brecha son los 'core' que no tiene.
    missing = core.map((r) => r.skill_id).filter((id) => !poseidas.has(id));
  }

  const steps_away = missing.length;
  const purpose_alignment_score = afinidad(pathway, persona, steps_away, domainStrength.length);

  // employability_delta: null para no ocupacional o si no hay ranking conocido.
  const employability_delta =
    pathway.pathway_type === 'rol_cuoc' && pathway.employability_rank != null
      ? -(pathway.employability_rank) // placeholder: mejor ranking = mejor; VinkU completa el dato base
      : null;

  const recommended_path = steps_away <= 2 ? 'skillpass' : 'univenture';

  const ai_rationale = generarRationale({
    pathway,
    persona,
    missing,
    domainStrength,
    steps_away,
    skillById,
  });

  return {
    pathway,
    missing_skill_ids: missing,
    domain_strength_skill_ids: domainStrength,
    steps_away,
    employability_delta,
    purpose_alignment_score,
    recommended_path,
    ai_rationale,
  };
}

/**
 * Afinidad 0..1 entre una trayectoria y el propósito declarado (tabla 4.3).
 * No es exclusión: un tipo no prioritario baja de puntaje pero no se descarta.
 */
function afinidad(
  pathway: Pathway,
  persona: Person,
  steps_away: number,
  fortalezasDominio: number,
): number {
  let score = 0;

  if (persona.purpose_macro === 'emprendimiento') {
    if (pathway.pathway_type === 'objetivo_no_ocupacional') {
      score += 0.6;
      // calce fino con la subcategoría exacta
      if (pathway.objective_category === persona.purpose_subcategory) score += 0.25;
      // tener fortalezas de dominio hace el emprendimiento más viable
      if (fortalezasDominio > 0) score += 0.1;
    } else {
      score += 0.15; // los roles no desaparecen, pero no van primero
    }
  } else {
    // empleabilidad
    if (pathway.pathway_type === 'rol_cuoc') {
      score += 0.6;
      // matices por subcategoría (heurística de demo)
      if (persona.purpose_subcategory === 'ascender' && (pathway.competence_level ?? 0) >= 3) score += 0.15;
      if (persona.purpose_subcategory === 'emplearse' && steps_away <= 2) score += 0.2;
      if (persona.purpose_subcategory === 'reconversion_perfil') score += 0.1;
    } else {
      score += 0.15;
    }
  }

  // cercanía aporta un poco (pero nunca por encima de la afinidad de tipo)
  score += Math.max(0, 0.15 - steps_away * 0.03);

  return Math.min(1, Number(score.toFixed(3)));
}
