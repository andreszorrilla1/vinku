// ============================================================================
// Carga del catálogo (skills, pathways, requisitos) desde Supabase, con
// respaldo automático al catálogo mock en memoria.
//
// - Si HAY_SUPABASE y la lectura funciona → usa los datos reales (680 ocupaciones).
// - Si no hay Supabase configurado, o falla la lectura → cae al mock, sin romper.
//
// La lectura pagina pathway_skill_requirements (Supabase corta en 1000 filas).
// ============================================================================

import { supabase, HAY_SUPABASE } from '@/lib/supabase';
import { SKILLS, PATHWAYS, REQUIREMENTS } from './mockCatalog';
import type { Pathway, PathwaySkillRequirement, Skill } from '@/lib/types';

export interface Catalogo {
  skills: Skill[];
  pathways: Pathway[];
  requirements: PathwaySkillRequirement[];
  skillById: Map<string, Skill>;
  fuente: 'supabase' | 'mock';
}

function armar(
  skills: Skill[],
  pathways: Pathway[],
  requirements: PathwaySkillRequirement[],
  fuente: Catalogo['fuente'],
): Catalogo {
  return { skills, pathways, requirements, skillById: new Map(skills.map((s) => [s.id, s])), fuente };
}

const mock = () => armar(SKILLS, PATHWAYS, REQUIREMENTS, 'mock');

// Lee todas las filas de una tabla en páginas de 1000.
async function leerTodo<T>(tabla: string, columnas: string): Promise<T[]> {
  const paso = 1000;
  let desde = 0;
  const filas: T[] = [];
  for (;;) {
    const { data, error } = await supabase!
      .from(tabla)
      .select(columnas)
      .range(desde, desde + paso - 1);
    if (error) throw error;
    filas.push(...((data ?? []) as T[]));
    if (!data || data.length < paso) break;
    desde += paso;
  }
  return filas;
}

export async function cargarCatalogo(): Promise<Catalogo> {
  if (!HAY_SUPABASE || !supabase) return mock();
  try {
    const [skills, pathways, requirements] = await Promise.all([
      leerTodo<Skill>('skills', 'id, name, skill_type, description, source_reference'),
      leerTodo<Pathway>(
        'pathways',
        'id, pathway_type, name, cuoc_code, sector, competence_level, employability_rank, objective_category, has_sectoral_qualification',
      ),
      leerTodo<PathwaySkillRequirement>('pathway_skill_requirements', 'pathway_id, skill_id, requirement_type'),
    ]);
    if (!skills.length || !pathways.length) return mock(); // base vacía → mock
    return armar(skills, pathways, requirements, 'supabase');
  } catch (e) {
    console.warn('No pude leer el catálogo de Supabase, uso el de ejemplo:', e);
    return mock();
  }
}
