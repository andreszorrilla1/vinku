-- ============================================================================
-- Row Level Security — Motor de Autodiagnóstico VinkU
--
-- Regla 7.1 (no negociable): `skills` es de escritura restringida. Ningún flujo
-- de IA en producción (chat, extracción de CV vía navegador con la anon key)
-- puede hacer INSERT/UPDATE/DELETE ahí. Se bloquea con RLS, no solo con código.
--
-- Modelo de roles:
--   - anon / authenticated  → rol del navegador y del flujo de IA. Solo LECTURA
--                             del catálogo. Sin política de escritura = denegado.
--   - service_role          → rol del panel operativo y del script de ingesta
--                             (revisión humana). Bypassa RLS por diseño de
--                             Supabase; es el ÚNICO camino de escritura a skills.
--
-- La Edge Function `extraer-cv` corre con service_role pero está escrita para
-- NUNCA insertar en `skills` (solo lee el catálogo y escribe cv_skill_matches /
-- unmatched_mentions). La barrera de RLS protege el camino del navegador.
-- ============================================================================

alter table skills                     enable row level security;
alter table qualifications             enable row level security;
alter table pathways                   enable row level security;
alter table pathway_skill_requirements enable row level security;
alter table people                     enable row level security;
alter table cv_uploads                 enable row level security;
alter table cv_skill_matches           enable row level security;
alter table unmatched_mentions         enable row level security;
alter table person_skill_status        enable row level security;
alter table diagnostic_sessions        enable row level security;
alter table pathway_gap_analysis       enable row level security;
alter table route_recommendations      enable row level security;

-- ----------------------------------------------------------------------------
-- CATÁLOGO: lectura pública, CERO escritura para anon/authenticated.
-- NO se crea ninguna policy de INSERT/UPDATE/DELETE para estos roles: con RLS
-- activo y sin policy, la operación se deniega. Ese es el candado de la regla 7.1.
-- ----------------------------------------------------------------------------
create policy "skills: lectura del catálogo"
  on skills for select
  to anon, authenticated
  using (true);

create policy "pathways: lectura de trayectorias"
  on pathways for select
  to anon, authenticated
  using (true);

create policy "pathway_skill_requirements: lectura"
  on pathway_skill_requirements for select
  to anon, authenticated
  using (true);

create policy "qualifications: lectura"
  on qualifications for select
  to anon, authenticated
  using (true);

-- ----------------------------------------------------------------------------
-- DATOS DE LA PERSONA Y DEL DIAGNÓSTICO
-- Para esta fase (portal público sin login todavío) el flujo de la persona
-- necesita crear su propio registro y el de su diagnóstico. Estas tablas NO son
-- el catálogo, así que sí admiten inserción desde anon — pero con RLS activo para
-- poder endurecer por owner cuando se agregue Auth (fuera de alcance de esta fase).
-- ----------------------------------------------------------------------------
create policy "people: alta desde el portal"        on people                for insert to anon, authenticated with check (true);
create policy "people: lectura"                      on people                for select to anon, authenticated using (true);
create policy "cv_uploads: alta"                     on cv_uploads            for insert to anon, authenticated with check (true);
create policy "cv_uploads: lectura"                  on cv_uploads            for select to anon, authenticated using (true);
create policy "cv_skill_matches: alta"               on cv_skill_matches      for insert to anon, authenticated with check (true);
create policy "cv_skill_matches: lectura"            on cv_skill_matches      for select to anon, authenticated using (true);
create policy "cv_skill_matches: actualizar estado"  on cv_skill_matches      for update to anon, authenticated using (true) with check (true);
create policy "unmatched_mentions: alta"             on unmatched_mentions    for insert to anon, authenticated with check (true);
create policy "unmatched_mentions: lectura"          on unmatched_mentions    for select to anon, authenticated using (true);
create policy "person_skill_status: alta"            on person_skill_status   for insert to anon, authenticated with check (true);
create policy "person_skill_status: lectura"         on person_skill_status   for select to anon, authenticated using (true);
create policy "person_skill_status: actualizar"      on person_skill_status   for update to anon, authenticated using (true) with check (true);
create policy "diagnostic_sessions: alta"            on diagnostic_sessions   for insert to anon, authenticated with check (true);
create policy "diagnostic_sessions: lectura"         on diagnostic_sessions   for select to anon, authenticated using (true);
create policy "pathway_gap_analysis: alta"           on pathway_gap_analysis  for insert to anon, authenticated with check (true);
create policy "pathway_gap_analysis: lectura"        on pathway_gap_analysis  for select to anon, authenticated using (true);
create policy "route_recommendations: alta"          on route_recommendations for insert to anon, authenticated with check (true);
create policy "route_recommendations: lectura"       on route_recommendations for select to anon, authenticated using (true);

-- NOTA: route_recommendations NO tiene policy de UPDATE para anon/authenticated.
-- El paso a 'confirmada' (regla 7.3) solo ocurre desde el panel operativo con
-- service_role. Un intento de confirmar una ruta desde el navegador es denegado.

-- ----------------------------------------------------------------------------
-- Verificación de la regla 7.1 (criterio de aceptación).
-- Ejecutar como rol anon para comprobar que el INSERT en skills falla:
--
--   set role anon;
--   insert into skills (name, skill_type) values ('inyectada por IA', 'hard');
--   -- ERROR:  new row violates row-level security policy for table "skills"
--   reset role;
--
-- El test automatizado equivalente vive en supabase/tests/rls_skills.test.sql
-- ----------------------------------------------------------------------------
