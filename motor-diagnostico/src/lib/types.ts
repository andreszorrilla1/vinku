// ============================================================================
// Tipos de dominio del Motor de Autodiagnóstico VinkU.
// Reflejan el esquema de supabase/migrations/001_schema.sql.
// ============================================================================

export type SkillType = 'hard' | 'soft' | 'power';

export interface Skill {
  id: string;
  name: string;
  skill_type: SkillType;
  description?: string | null;
  source_reference?: string | null;
}

export type PathwayType = 'rol_cuoc' | 'objetivo_no_ocupacional';

export type ObjectiveCategory =
  | 'crear_empresa'
  | 'prestacion_servicios_independiente'
  | 'consultoria';

export interface Pathway {
  id: string;
  pathway_type: PathwayType;
  name: string;
  // rol_cuoc
  cuoc_code?: string | null;
  sector?: string | null;
  competence_level?: number | null;
  employability_rank?: number | null;
  has_sectoral_qualification?: boolean;
  // objetivo_no_ocupacional
  objective_category?: ObjectiveCategory | null;
  curated_by?: string | null;
}

export type RequirementType = 'core' | 'deseable';

export interface PathwaySkillRequirement {
  pathway_id: string;
  skill_id: string;
  requirement_type: RequirementType;
}

// --- Propósito de la persona ---------------------------------------------
export type PurposeMacro = 'empleabilidad' | 'emprendimiento';

export type PurposeSubcategory =
  // empleabilidad
  | 'ascender'
  | 'emplearse'
  | 'reconversion_perfil'
  // emprendimiento
  | 'crear_empresa'
  | 'prestacion_servicios_independiente'
  | 'consultoria';

export interface Person {
  id: string;
  full_name?: string | null;
  email?: string | null;
  whatsapp?: string | null;
  current_role_freetext?: string | null;
  current_pathway_id?: string | null;
  purpose_macro: PurposeMacro;
  purpose_subcategory: PurposeSubcategory;
  purpose_notes?: string | null;
}

// --- Estado de habilidad de la persona -----------------------------------
export type PersonSkillStatusValue =
  | 'autodeclarada'
  | 'validada_skillpass'
  | 'ajustada_skillpass'
  | 'brecha_identificada';

export type SelfReportedLevel = 'básico' | 'intermedio' | 'avanzado';

export interface PersonSkillStatus {
  skill_id: string;
  status: PersonSkillStatusValue;
  self_reported_level?: SelfReportedLevel | null;
  evidence_source?: 'skillpass' | 'campuslife' | null;
}

// --- Extracción de CV -----------------------------------------------------
export type MatchType = 'literal' | 'semantico_inferido';
export type CvMatchStatus = 'sugerida' | 'confirmada' | 'descartada';

export interface CvSkillMatch {
  id: string;
  skill_id: string;
  match_type: MatchType;
  match_confidence: number;
  source_snippet: string;
  status: CvMatchStatus;
}

export interface UnmatchedMention {
  id: string;
  raw_text: string;
}

export interface CvExtractionResult {
  matches: CvSkillMatch[];
  unmatched: UnmatchedMention[];
  raw_text: string;
}

// --- Diagnóstico y análisis de brecha ------------------------------------
export type RecommendedPath = 'skillpass' | 'univenture';

export interface PathwayGapAnalysis {
  pathway: Pathway;
  missing_skill_ids: string[];
  domain_strength_skill_ids: string[];
  steps_away: number;
  employability_delta: number | null;
  purpose_alignment_score: number;
  recommended_path: RecommendedPath;
  ai_rationale: string;
}

export type RouteStatus = 'propuesta' | 'ajustada_humano' | 'confirmada';

export interface RouteRecommendation {
  target_pathway_id: string;
  proposed_by: 'ia' | 'humano';
  status: RouteStatus;
  skill_ids: string[];
}
