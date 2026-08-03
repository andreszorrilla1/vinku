-- ============================================================================
-- Áreas de conocimiento (conocimientos del CUOC).
--
-- Corrección de modelo: los "conocimientos" del CUOC NO son habilidades — son
-- las CATEGORÍAS MACRO (dominios) bajo las que se enmarcan las funciones de una
-- ocupación. Por eso son pocas (~104) y se repiten en cientos de ocupaciones.
-- Las habilidades DURAS se derivan de las FUNCIONES (ver ingesta DANE, paso 2).
--
-- Como el catálogo de skills, es un catálogo controlado: lectura para todos,
-- escritura solo por panel operativo / ingesta (service_role).
-- ============================================================================

create table if not exists knowledge_areas (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  source_reference text,             -- ej. "CUOC 2025 · Conocimiento DANE #66"
  created_at timestamptz default now()
);

-- Relación ocupación ↔ dominio de conocimiento (muchos a muchos).
create table if not exists pathway_knowledge_areas (
  id uuid primary key default gen_random_uuid(),
  pathway_id uuid references pathways(id) on delete cascade,
  knowledge_area_id uuid references knowledge_areas(id) on delete cascade,
  unique (pathway_id, knowledge_area_id)
);

create index if not exists idx_pka_pathway on pathway_knowledge_areas (pathway_id);
create index if not exists idx_pka_area on pathway_knowledge_areas (knowledge_area_id);

-- RLS: lectura pública, sin escritura para anon/authenticated (igual que skills).
alter table knowledge_areas         enable row level security;
alter table pathway_knowledge_areas enable row level security;

create policy "knowledge_areas: lectura"          on knowledge_areas         for select to anon, authenticated using (true);
create policy "pathway_knowledge_areas: lectura"  on pathway_knowledge_areas for select to anon, authenticated using (true);
