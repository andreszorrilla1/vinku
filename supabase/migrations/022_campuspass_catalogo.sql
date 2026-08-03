-- ============================================================
-- 022 — Campus Pass: extensión del catálogo sobre la tabla `courses`
-- Agrega columnas cp_* nullable (no afectan el flujo actual de cursos
-- de universidades). Un curso es "Campus Pass" cuando cp_enabled = true.
-- ============================================================

ALTER TABLE courses ADD COLUMN IF NOT EXISTS cp_enabled            boolean NOT NULL DEFAULT false;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS cp_institucion        text;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS cp_tipo_institucion   text;   -- universidad | tecnologica | tecnica | IETDH
ALTER TABLE courses ADD COLUMN IF NOT EXISTS cp_nivel              text;   -- tecnico_laboral | ... | maestria | educacion_continua
ALTER TABLE courses ADD COLUMN IF NOT EXISTS cp_modalidad          text;   -- virtual | presencial | hibrida
ALTER TABLE courses ADD COLUMN IF NOT EXISTS cp_duracion_horas     integer;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS cp_duracion_semanas   integer;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS cp_precio_publico     numeric(12,2);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS cp_precio_vinku       numeric(12,2) DEFAULT 0;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS cp_descuento_disponible boolean DEFAULT false;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS cp_ciudad             text;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS cp_roles              text[] DEFAULT '{}';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS cp_palabras_clave     text[] DEFAULT '{}';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS cp_cupos              integer DEFAULT 0;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS cp_proxima_fecha      date;

-- Índice para el motor de curaduría (solo lee cursos Campus Pass activos con cupos).
CREATE INDEX IF NOT EXISTS courses_cp_enabled_idx
  ON courses(cp_enabled, is_active) WHERE cp_enabled = true;

-- Nota sobre reutilización de columnas existentes en el mapeo a `Curso`:
--   id                 → id_curso
--   title              → nombre_curso
--   category           → categoria
--   skills             → habilidades_que_desarrolla
--   prerequisites      → prerequisitos
--   is_active + cp_enabled → activo
