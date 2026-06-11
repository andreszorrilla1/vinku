-- Migration 009: Course delivery fields + interoperability RLS fixes

-- 1. Campos de entrega en cursos
ALTER TABLE courses ADD COLUMN IF NOT EXISTS modality text DEFAULT 'Virtual' CHECK (modality IN ('Virtual', 'Presencial', 'Híbrido'));
ALTER TABLE courses ADD COLUMN IF NOT EXISTS start_date date;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS access_link text;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS classroom text;

-- 2. RLS: university_admin puede leer perfiles de estudiantes matriculados en sus cursos
--    (necesario para mostrar nombre/email en tab Matriculados)
DROP POLICY IF EXISTS "university sees enrolled student profiles" ON profiles;
CREATE POLICY "university sees enrolled student profiles"
  ON profiles FOR SELECT
  USING (
    id = auth.uid()
    OR (
      get_user_role() = 'university_admin'
      AND EXISTS (
        SELECT 1 FROM enrollments e
        JOIN courses c ON c.id = e.course_id
        WHERE e.student_id = profiles.id
          AND c.university_id = get_user_university_id()
      )
    )
  );

-- 3. RLS: corporate_admin puede leer perfiles de sus empleados (para drill-down)
DROP POLICY IF EXISTS "corporate sees employee profiles" ON profiles;
CREATE POLICY "corporate sees employee profiles"
  ON profiles FOR SELECT
  USING (
    id = auth.uid()
    OR (
      get_user_role() = 'corporate_admin'
      AND EXISTS (
        SELECT 1 FROM employees emp
        WHERE emp.profile_id = profiles.id
          AND emp.company_id = get_user_company_id()
      )
    )
  );

-- 4. Enrollments: university puede ver matrículas de sus cursos (para Matriculados tab)
DROP POLICY IF EXISTS "university sees own course enrollments" ON enrollments;
CREATE POLICY "university sees own course enrollments"
  ON enrollments FOR SELECT
  USING (
    student_id = auth.uid()
    OR (
      get_user_role() = 'university_admin'
      AND EXISTS (
        SELECT 1 FROM courses c
        WHERE c.id = enrollments.course_id
          AND c.university_id = get_user_university_id()
      )
    )
  );

-- 5. Corporate admin puede leer matrículas de sus empleados
DROP POLICY IF EXISTS "corporate sees employee enrollments" ON enrollments;
CREATE POLICY "corporate sees employee enrollments"
  ON enrollments FOR SELECT
  USING (
    student_id = auth.uid()
    OR (
      get_user_role() = 'corporate_admin'
      AND EXISTS (
        SELECT 1 FROM employees emp
        WHERE emp.profile_id = enrollments.student_id
          AND emp.company_id = get_user_company_id()
      )
    )
  );
