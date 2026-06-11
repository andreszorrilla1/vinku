-- ============================================================
-- Campus Pass by VinkU — Migración 007: Flujo Universitario
-- Personalización, prerrequisitos, documentos, cupos,
-- seguimiento de matrículas y certificación con ingresos.
-- Idempotente: se puede ejecutar varias veces sin error.
-- ============================================================

-- ------------------------------------------------------------
-- 1. COURSES: prerrequisitos, documentos requeridos y cupos
-- ------------------------------------------------------------

-- Prerrequisitos: array de IDs de otros cursos de la misma universidad
alter table courses add column if not exists prerequisites uuid[] default '{}';

-- Documentos que el estudiante debe presentar a la universidad
alter table courses add column if not exists required_docs text[] default '{}';

-- Cupos disponibles (null = ilimitado)
alter table courses add column if not exists max_seats integer;

-- ------------------------------------------------------------
-- 2. ENROLLMENTS: hito de inicio del curso
-- ------------------------------------------------------------

-- Fecha en que la universidad marca que el estudiante inició el curso
alter table enrollments add column if not exists started_at timestamptz;

-- ------------------------------------------------------------
-- 3. RLS: la universidad puede actualizar su propio registro
--    (editar perfil: nombre, logo, email de contacto; y sumar
--    ingresos al certificar: total_earnings / liquid_balance)
-- ------------------------------------------------------------

drop policy if exists "universities: admin update own" on universities;
create policy "universities: admin update own" on universities
  for update using (
    get_user_role() = 'university_admin'
    and id = get_user_university_id()
  );

-- La universidad debe poder LEER su propio registro aunque su
-- approval_status no sea 'Aprobada' (para el header del portal)
drop policy if exists "universities: admin select own" on universities;
create policy "universities: admin select own" on universities
  for select using (
    get_user_role() = 'university_admin'
    and id = get_user_university_id()
  );

-- ------------------------------------------------------------
-- 4. RLS de enrollments (verificación):
--    Las políticas "enrollments: university sees own courses" y
--    "enrollments: university certify" ya existen en 002_rls.sql
--    y cubren SELECT y UPDATE (marcar iniciado / completado /
--    certificar). Se recrean aquí de forma idempotente por si la
--    base se restauró sin ellas.
-- ------------------------------------------------------------

drop policy if exists "enrollments: university sees own courses" on enrollments;
create policy "enrollments: university sees own courses" on enrollments
  for select using (
    get_user_role() = 'university_admin'
    and course_id in (
      select id from courses where university_id = get_user_university_id()
    )
  );

drop policy if exists "enrollments: university certify" on enrollments;
create policy "enrollments: university certify" on enrollments
  for update using (
    get_user_role() = 'university_admin'
    and course_id in (
      select id from courses where university_id = get_user_university_id()
    )
  );
