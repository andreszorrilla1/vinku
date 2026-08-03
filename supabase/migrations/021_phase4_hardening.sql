-- ============================================================
-- 021 — Phase 4 hardening
--   [SEC-1]  FOR UPDATE lock en recharge_student_wallet (previene double-spend).
--   [SEC-2]  FOR UPDATE en employees dentro de assign_employee_budget.
--   [SEC-3]  INSERT policy de companies restringida a contact_email = auth.email().
--   [SEC-4]  SELECT policy de profiles para corporate_admin limitada a empleados propios.
--   [PERF-1] Índices en passport_stamps, skill_badges, achievements, wallet_transactions,
--            enrollments.
-- ============================================================

-- ============================================================
-- [SEC-1] recharge_student_wallet — añadir SELECT … FOR UPDATE
-- ============================================================
CREATE OR REPLACE FUNCTION recharge_student_wallet(p_amount numeric)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id     uuid;
  v_new_balance numeric;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Sesión no válida.';
  END IF;

  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'El monto a recargar debe ser positivo.';
  END IF;
  IF p_amount > 50000000 THEN
    RAISE EXCEPTION 'El monto máximo de recarga es 50.000.000 COP.';
  END IF;

  -- Bloqueo de fila para prevenir double-spend concurrente
  PERFORM id FROM profiles WHERE id = v_user_id FOR UPDATE;

  UPDATE profiles
  SET wallet_balance = COALESCE(wallet_balance, 0) + p_amount
  WHERE id = v_user_id
  RETURNING wallet_balance INTO v_new_balance;

  IF v_new_balance IS NULL THEN
    RAISE EXCEPTION 'No se pudo actualizar el saldo.';
  END IF;

  INSERT INTO wallet_transactions (profile_id, amount, type, description)
  VALUES (v_user_id, p_amount, 'recharge', 'Recarga de billetera');

  RETURN v_new_balance;
END;
$$;

GRANT EXECUTE ON FUNCTION recharge_student_wallet TO authenticated;


-- ============================================================
-- [SEC-2] assign_employee_budget — bloquear también la fila del empleado
-- ============================================================
CREATE OR REPLACE FUNCTION assign_employee_budget(
  p_employee_id uuid,
  p_amount      numeric
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id  uuid;
  v_company_id uuid;
  v_balance   numeric;
BEGIN
  v_admin_id := auth.uid();
  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'Sesión no válida.';
  END IF;

  IF p_amount IS NULL OR p_amount < 0 THEN
    RAISE EXCEPTION 'El monto de presupuesto debe ser positivo o cero.';
  END IF;
  IF p_amount > 500000000 THEN
    RAISE EXCEPTION 'El monto máximo de asignación es 500.000.000 COP.';
  END IF;

  SELECT company_id INTO v_company_id
    FROM profiles WHERE id = v_admin_id;

  IF v_company_id IS NULL THEN
    RAISE EXCEPTION 'No tienes empresa vinculada.';
  END IF;

  -- Verificar que el empleado pertenece a la empresa del admin
  IF NOT EXISTS (
    SELECT 1 FROM employees WHERE id = p_employee_id AND company_id = v_company_id
  ) THEN
    RAISE EXCEPTION 'Empleado no encontrado en tu empresa.';
  END IF;

  -- Bloquear empresa primero, luego empleado (orden consistente previene deadlocks)
  SELECT wallet_balance INTO v_balance FROM companies WHERE id = v_company_id FOR UPDATE;
  PERFORM id FROM employees WHERE id = p_employee_id FOR UPDATE;

  IF v_balance IS NULL OR v_balance < p_amount THEN
    RAISE EXCEPTION 'Saldo insuficiente en la billetera empresarial.';
  END IF;

  UPDATE companies
  SET wallet_balance = wallet_balance - p_amount
  WHERE id = v_company_id;

  UPDATE employees
  SET assigned_budget = p_amount
  WHERE id = p_employee_id;
END;
$$;

GRANT EXECUTE ON FUNCTION assign_employee_budget TO authenticated;


-- ============================================================
-- [SEC-3] INSERT en companies — restringir a contact_email = auth.email()
-- ============================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "companies: admin insert" ON companies;
END $$;

CREATE POLICY "companies: admin insert" ON companies
  FOR INSERT WITH CHECK (
    contact_email = auth.email()
    AND get_user_role() = 'corporate_admin'
  );


-- ============================================================
-- [SEC-4] SELECT de profiles para corporate_admin — limitar a empleados propios
-- ============================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "profiles: corporate lookup by email" ON profiles;
END $$;

CREATE POLICY "profiles: corporate lookup employees" ON profiles
  FOR SELECT USING (
    -- Cada usuario puede ver su propio perfil
    id = auth.uid()
    OR get_user_role() = 'superadmin'
    -- University admin puede ver perfiles de estudiantes inscritos en sus cursos
    OR (
      get_user_role() = 'university_admin'
      AND EXISTS (
        SELECT 1 FROM enrollments e
        JOIN courses c ON c.id = e.course_id
        JOIN universities u ON u.id = c.university_id
        WHERE e.student_id = profiles.id
          AND u.admin_id = auth.uid()
      )
    )
    -- Corporate admin solo ve perfiles de sus propios empleados
    OR (
      get_user_role() = 'corporate_admin'
      AND EXISTS (
        SELECT 1 FROM employees emp
        JOIN companies co ON co.id = emp.company_id
        WHERE emp.profile_id = profiles.id
          AND co.contact_email = auth.email()
      )
    )
  );


-- ============================================================
-- [PERF-1] Índices en columnas de filtro frecuente
-- ============================================================
CREATE INDEX IF NOT EXISTS passport_stamps_student_id_idx
  ON passport_stamps(student_id);

CREATE INDEX IF NOT EXISTS skill_badges_student_id_idx
  ON skill_badges(student_id);

CREATE INDEX IF NOT EXISTS achievements_student_id_idx
  ON achievements(student_id);

CREATE INDEX IF NOT EXISTS wallet_transactions_profile_id_created_idx
  ON wallet_transactions(profile_id, created_at DESC);

CREATE INDEX IF NOT EXISTS enrollments_student_status_idx
  ON enrollments(student_id, status);

CREATE INDEX IF NOT EXISTS enrollments_course_id_idx
  ON enrollments(course_id);
