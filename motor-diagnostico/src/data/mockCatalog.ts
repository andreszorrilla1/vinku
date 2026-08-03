// ============================================================================
// Catálogo mock en memoria — espejo de supabase/migrations/003_seed.sql.
// Permite recorrer el vertical completo sin Supabase conectado. Los IDs son
// slugs legibles (en producción son uuid). El repositorio (data/repo.ts) usa
// este catálogo cuando HAY_SUPABASE es false.
// ============================================================================

import type { Pathway, PathwaySkillRequirement, Skill } from '@/lib/types';

// slug id helper para legibilidad
const s = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

function skill(
  name: string,
  skill_type: Skill['skill_type'],
  source_reference: string,
  description?: string,
): Skill {
  return { id: s(name), name, skill_type, source_reference, description };
}

export const SKILLS: Skill[] = [
  // --- Duras (hard) de origen CUOC ---
  skill('Manejo de inventarios', 'hard', 'CUOC (demo)'),
  skill('Contabilidad básica', 'hard', 'CUOC (demo)'),
  skill('Manejo de Excel', 'hard', 'CUOC (demo)'),
  skill('Facturación electrónica', 'hard', 'CUOC (demo)'),
  skill('Atención al cliente', 'hard', 'CUOC (demo)'),
  skill('Técnicas de venta', 'hard', 'CUOC (demo)'),
  skill('Manejo de CRM', 'hard', 'CUOC (demo)'),
  skill('Soporte técnico de hardware', 'hard', 'CUOC (demo)'),
  skill('Administración de redes', 'hard', 'CUOC (demo)'),
  skill('Costeo de productos y servicios', 'hard', 'CUOC (demo)'),
  // --- Transversales (soft) ---
  skill('Trabajo en equipo', 'soft', 'CUOC transversal (demo)'),
  skill('Comunicación asertiva', 'soft', 'CUOC transversal (demo)'),
  skill('Orientación al servicio', 'soft', 'CUOC transversal (demo)'),
  skill('Trabajo bajo presión', 'soft', 'CUOC transversal (demo)'),
  skill('Organización del tiempo', 'soft', 'CUOC transversal (demo)'),
  // --- Power (reclasificadas por VinkU) ---
  skill('Liderazgo', 'power', 'CUOC transversal → power (demo)'),
  skill('Pensamiento crítico', 'power', 'CUOC transversal → power (demo)'),
  // --- 15 competencias EntreComp (source_reference exacto, regla de honestidad) ---
  ...([
    'Detectar oportunidades',
    'Creatividad',
    'Visión',
    'Valorar ideas',
    'Pensamiento ético y sostenible',
    'Autoconocimiento y autoeficacia',
    'Motivación y perseverancia',
    'Movilización de recursos',
    'Educación financiera y económica',
    'Movilizar a otros',
    'Tomar la iniciativa',
    'Planificación y gestión',
    'Manejo de la incertidumbre y el riesgo',
    'Trabajar con otros',
    'Aprender de la experiencia',
  ].map((n) =>
    skill(n, 'power', 'EntreComp - Comisión Europea 2016, vía OIT/Cinterfor'),
  )),
];

export const SKILL_BY_ID = new Map(SKILLS.map((sk) => [sk.id, sk]));

function pathway(p: Omit<Pathway, 'id'> & { id?: string }): Pathway {
  return { id: p.id ?? s(p.name), ...p } as Pathway;
}

export const PATHWAYS: Pathway[] = [
  pathway({ name: 'Auxiliar contable', pathway_type: 'rol_cuoc', cuoc_code: '43110', sector: 'Administrativo y financiero', competence_level: 2, employability_rank: null, has_sectoral_qualification: false }),
  pathway({ name: 'Vendedor / auxiliar de ventas', pathway_type: 'rol_cuoc', cuoc_code: '52230', sector: 'Comercio y ventas', competence_level: 2, employability_rank: null, has_sectoral_qualification: false }),
  pathway({ name: 'Soporte técnico de TI', pathway_type: 'rol_cuoc', cuoc_code: '35120', sector: 'Tecnología', competence_level: 3, employability_rank: null, has_sectoral_qualification: false }),
  pathway({ name: 'Crear una empresa', pathway_type: 'objetivo_no_ocupacional', objective_category: 'crear_empresa', curated_by: 'Equipo VinkU' }),
  pathway({ name: 'Prestar servicios como independiente', pathway_type: 'objetivo_no_ocupacional', objective_category: 'prestacion_servicios_independiente', curated_by: 'Equipo VinkU' }),
  pathway({ name: 'Ofrecer consultoría', pathway_type: 'objetivo_no_ocupacional', objective_category: 'consultoria', curated_by: 'Equipo VinkU' }),
];

export const PATHWAY_BY_ID = new Map(PATHWAYS.map((p) => [p.id, p]));

const R = (pathwayName: string, skillName: string, requirement_type: 'core' | 'deseable'): PathwaySkillRequirement => ({
  pathway_id: s(pathwayName),
  skill_id: s(skillName),
  requirement_type,
});

export const REQUIREMENTS: PathwaySkillRequirement[] = [
  // Auxiliar contable
  R('Auxiliar contable', 'Contabilidad básica', 'core'),
  R('Auxiliar contable', 'Manejo de Excel', 'core'),
  R('Auxiliar contable', 'Facturación electrónica', 'core'),
  R('Auxiliar contable', 'Organización del tiempo', 'deseable'),
  R('Auxiliar contable', 'Comunicación asertiva', 'deseable'),
  // Vendedor / auxiliar de ventas
  R('Vendedor / auxiliar de ventas', 'Técnicas de venta', 'core'),
  R('Vendedor / auxiliar de ventas', 'Atención al cliente', 'core'),
  R('Vendedor / auxiliar de ventas', 'Orientación al servicio', 'core'),
  R('Vendedor / auxiliar de ventas', 'Manejo de CRM', 'deseable'),
  R('Vendedor / auxiliar de ventas', 'Comunicación asertiva', 'deseable'),
  // Soporte técnico de TI
  R('Soporte técnico de TI', 'Soporte técnico de hardware', 'core'),
  R('Soporte técnico de TI', 'Administración de redes', 'core'),
  R('Soporte técnico de TI', 'Atención al cliente', 'deseable'),
  R('Soporte técnico de TI', 'Pensamiento crítico', 'deseable'),
  // Crear una empresa (EntreComp core)
  R('Crear una empresa', 'Detectar oportunidades', 'core'),
  R('Crear una empresa', 'Visión', 'core'),
  R('Crear una empresa', 'Movilización de recursos', 'core'),
  R('Crear una empresa', 'Planificación y gestión', 'core'),
  R('Crear una empresa', 'Manejo de la incertidumbre y el riesgo', 'core'),
  // Prestar servicios como independiente
  R('Prestar servicios como independiente', 'Autoconocimiento y autoeficacia', 'core'),
  R('Prestar servicios como independiente', 'Educación financiera y económica', 'core'),
  R('Prestar servicios como independiente', 'Tomar la iniciativa', 'core'),
  R('Prestar servicios como independiente', 'Aprender de la experiencia', 'core'),
  // Ofrecer consultoría
  R('Ofrecer consultoría', 'Valorar ideas', 'core'),
  R('Ofrecer consultoría', 'Movilizar a otros', 'core'),
  R('Ofrecer consultoría', 'Planificación y gestión', 'core'),
  R('Ofrecer consultoría', 'Pensamiento ético y sostenible', 'core'),
];

export function requisitosDe(pathwayId: string): PathwaySkillRequirement[] {
  return REQUIREMENTS.filter((r) => r.pathway_id === pathwayId);
}
