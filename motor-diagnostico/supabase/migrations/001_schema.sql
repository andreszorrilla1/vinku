-- ============================================================================
-- Motor de Autodiagnóstico SkillPass/UniVenture — Esquema base
-- VinkU Education Partnership S.A.S.
--
-- Proyecto INDEPENDIENTE de Campus Pass. No comparte tablas con ese prototipo.
-- Corresponde a la sección 4 del megaprompt de producto.
-- ============================================================================

-- pgvector para matching semántico del catálogo de habilidades.
create extension if not exists vector;

-- ----------------------------------------------------------------------------
-- 4.1 Catálogo controlado de habilidades
-- Catálogo CERRADO. Solo el panel operativo de VinkU o el script de ingesta
-- (con revisión humana) pueden insertar aquí. Ningún flujo de IA hace INSERT.
-- El bloqueo real vive en 002_rls.sql (RLS), no solo en convención de código.
-- ----------------------------------------------------------------------------
create table skills (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  skill_type text not null check (skill_type in ('hard', 'soft', 'power')),
  description text,
  embedding vector(1536),                -- matching semántico (pgvector)
  source_reference text,                 -- ej. "CUOC 43110", "EntreComp - CE 2016"
  created_at timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- 4.2 Cualificaciones sectoriales (referenciadas por pathways)
-- ----------------------------------------------------------------------------
create table qualifications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sector text,
  mnc_level int,
  sectoral_catalog_name text,
  created_at timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- 4.2 Trayectorias (roles ocupacionales CUOC Y objetivos no ocupacionales)
-- Ambos tipos usan el mismo mecanismo de grafo; el tipo determina el lenguaje
-- regulatorio permitido (ver regla de copy en sección 7.4).
-- ----------------------------------------------------------------------------
create table pathways (
  id uuid primary key default gen_random_uuid(),
  pathway_type text not null check (pathway_type in ('rol_cuoc', 'objetivo_no_ocupacional')),
  name text not null,

  -- Solo aplican si pathway_type = 'rol_cuoc':
  cuoc_code text unique,
  sector text,
  competence_level int,
  employability_rank int,                -- puesto de empleabilidad de 676, si se conoce
  mnc_level int,
  has_sectoral_qualification boolean default false,
  qualification_id uuid references qualifications(id),

  -- Solo aplican si pathway_type = 'objetivo_no_ocupacional':
  objective_category text check (
    objective_category in ('crear_empresa', 'prestacion_servicios_independiente', 'consultoria')
  ),
  curated_by text,                       -- quién de VinkU diseñó la trayectoria

  created_at timestamptz default now(),

  -- Coherencia estructural: los campos de un tipo no deben poblarse en el otro.
  constraint pathway_tipo_coherente check (
    (pathway_type = 'rol_cuoc' and objective_category is null)
    or
    (pathway_type = 'objetivo_no_ocupacional' and cuoc_code is null
      and competence_level is null and has_sectoral_qualification is not true)
  )
);

create table pathway_skill_requirements (
  id uuid primary key default gen_random_uuid(),
  pathway_id uuid references pathways(id) on delete cascade,
  skill_id uuid references skills(id) on delete cascade,
  requirement_type text not null check (requirement_type in ('core', 'deseable')),
  unique (pathway_id, skill_id)
);

-- ----------------------------------------------------------------------------
-- 4.3 Personas y su estado sobre el grafo
-- ----------------------------------------------------------------------------
create table people (
  id uuid primary key default gen_random_uuid(),
  full_name text,
  email text,
  whatsapp text,
  current_role_freetext text,
  current_pathway_id uuid references pathways(id),

  purpose_macro text not null check (purpose_macro in ('empleabilidad', 'emprendimiento')),
  purpose_subcategory text not null check (
    purpose_subcategory in (
      -- bajo 'empleabilidad':
      'ascender', 'emplearse', 'reconversion_perfil',
      -- bajo 'emprendimiento':
      'crear_empresa', 'prestacion_servicios_independiente', 'consultoria'
    )
  ),
  purpose_notes text,                    -- lo que la persona dijo con sus palabras

  created_at timestamptz default now(),

  -- Regla de consistencia (además del check): macro y subcategoría deben calzar.
  -- Se valida también en aplicación (lib/proposito.ts) antes de llegar aquí.
  constraint proposito_coherente check (
    (purpose_macro = 'empleabilidad'
      and purpose_subcategory in ('ascender', 'emplearse', 'reconversion_perfil'))
    or
    (purpose_macro = 'emprendimiento'
      and purpose_subcategory in ('crear_empresa', 'prestacion_servicios_independiente', 'consultoria'))
  )
);

create table cv_uploads (
  id uuid primary key default gen_random_uuid(),
  person_id uuid references people(id) on delete cascade,
  file_path text not null,
  raw_extracted_text text,
  processed_at timestamptz,
  created_at timestamptz default now()
);

-- Habilidades detectadas en el CV. El matching puede ser semántico, pero SIEMPRE
-- resuelve a un skill_id existente del catálogo — nunca a texto libre.
create table cv_skill_matches (
  id uuid primary key default gen_random_uuid(),
  cv_upload_id uuid references cv_uploads(id) on delete cascade,
  skill_id uuid references skills(id),
  match_type text not null check (match_type in ('literal', 'semantico_inferido')),
  match_confidence numeric,
  source_snippet text,                   -- fragmento del CV que originó la coincidencia
  status text default 'sugerida' check (status in ('sugerida', 'confirmada', 'descartada')),
  created_at timestamptz default now()
);

-- Menciones del CV que la IA no pudo resolver contra el catálogo.
-- Nunca se convierten en skill nueva automáticamente.
create table unmatched_mentions (
  id uuid primary key default gen_random_uuid(),
  cv_upload_id uuid references cv_uploads(id) on delete cascade,
  raw_text text not null,
  reviewed boolean default false,
  reviewer_action text check (reviewer_action in ('mapear_a_existente', 'crear_nueva_skill', 'descartar')),
  created_at timestamptz default now()
);

-- Estado de cada habilidad para una persona.
-- 'autodeclarada' (dato de la persona) es DISTINTO de 'validada_skillpass'
-- (evidencia). Deben verse visualmente distintos en toda interfaz (regla 7.2).
-- Nota: 'evidence_source' deja el gancho para CampusLife a futuro sin abrir
-- ese flujo todavía (sección 5.1 4.2).
create table person_skill_status (
  id uuid primary key default gen_random_uuid(),
  person_id uuid references people(id) on delete cascade,
  skill_id uuid references skills(id),
  status text not null check (
    status in ('autodeclarada', 'validada_skillpass', 'ajustada_skillpass', 'brecha_identificada')
  ),
  self_reported_level text check (self_reported_level in ('básico', 'intermedio', 'avanzado')),
  evidence_source text check (evidence_source in ('skillpass', 'campuslife')),  -- gancho futuro; null si autodeclarada
  declared_at timestamptz default now(),
  validated_at timestamptz,
  unique (person_id, skill_id)
);

-- ----------------------------------------------------------------------------
-- 4.4 Diagnóstico y rutas
-- ----------------------------------------------------------------------------
create table diagnostic_sessions (
  id uuid primary key default gen_random_uuid(),
  person_id uuid references people(id) on delete cascade,
  cv_upload_id uuid references cv_uploads(id),
  chat_transcript jsonb,
  status text default 'en_curso' check (
    status in ('en_curso', 'esperando_revision_humana', 'confirmada', 'descartada')
  ),
  created_at timestamptz default now(),
  reviewed_by uuid,
  reviewed_at timestamptz
);

-- Se calcula para pathways de AMBOS tipos. La priorización de exhibición depende
-- de people.purpose_macro/purpose_subcategory, no solo de steps_away.
create table pathway_gap_analysis (
  id uuid primary key default gen_random_uuid(),
  diagnostic_session_id uuid references diagnostic_sessions(id) on delete cascade,
  pathway_id uuid references pathways(id),
  missing_skill_ids uuid[],              -- para objetivo_no_ocupacional: solo brechas EntreComp 'core'
  domain_strength_skill_ids uuid[],      -- solo objetivo_no_ocupacional: habilidades CUOC que YA tiene (fortaleza, no brecha)
  steps_away int not null,
  employability_delta int,               -- null si pathway_type = 'objetivo_no_ocupacional'
  purpose_alignment_score numeric,       -- afinidad con el propósito declarado
  recommended_path text check (recommended_path in ('skillpass', 'univenture')),
  ai_rationale text,                     -- debe mencionar el propósito, no solo cifras
  created_at timestamptz default now()
);

create table route_recommendations (
  id uuid primary key default gen_random_uuid(),
  diagnostic_session_id uuid references diagnostic_sessions(id) on delete cascade,
  target_pathway_id uuid references pathways(id),
  proposed_by text not null check (proposed_by in ('ia', 'humano')),
  status text default 'propuesta' check (status in ('propuesta', 'ajustada_humano', 'confirmada')),
  skill_ids uuid[],
  human_notes text,
  created_at timestamptz default now()
);

-- Índices de apoyo al motor de grafo y a las colas del panel operativo.
create index on pathway_skill_requirements (pathway_id);
create index on pathway_skill_requirements (skill_id);
create index on person_skill_status (person_id);
create index on cv_skill_matches (cv_upload_id);
create index on pathway_gap_analysis (diagnostic_session_id);
create index on diagnostic_sessions (status);
