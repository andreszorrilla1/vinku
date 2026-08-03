-- ============================================================
-- 020 — Endurecimiento financiero
--   [BE-06] Rechazar montos negativos / cero y poner topes.
--   [BE-18] Evitar double-spend con bloqueo de fila (FOR UPDATE).
--   [BE-07] RPC atómico para recarga de estudiante (sin read-modify-write
--           en cliente, que sufría el bug count===null de supabase-js v2).
-- Todas las funciones son CREATE OR REPLACE: reemplazan las versiones previas.
-- ============================================================

-- 1. recharge_student_wallet — NUEVO RPC atómico
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


-- 2. recharge_corporate_wallet — + guard de monto
CREATE OR REPLACE FUNCTION recharge_corporate_wallet(
  p_company_id uuid,
  p_amount     numeric
)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_company_id uuid;
  v_user_email      text;
  v_new_balance     numeric;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'El monto a recargar debe ser positivo.';
  END IF;
  IF p_amount > 1000000000 THEN
    RAISE EXCEPTION 'El monto máximo de recarga es 1.000.000.000 COP.';
  END IF;

  SELECT company_id, email INTO v_user_company_id, v_user_email
  FROM profiles WHERE id = auth.uid();

  IF v_user_company_id IS NULL THEN
    SELECT id INTO v_user_company_id
    FROM companies
    WHERE id = p_company_id AND contact_email = v_user_email;
  END IF;

  IF v_user_company_id IS NULL OR v_user_company_id <> p_company_id THEN
    RAISE EXCEPTION 'No tienes permisos para recargar esta billetera.';
  END IF;

  UPDATE companies
  SET wallet_balance = wallet_balance + p_amount
  WHERE id = p_company_id
  RETURNING wallet_balance INTO v_new_balance;

  INSERT INTO wallet_transactions (company_id, amount, type, description)
  VALUES (p_company_id, p_amount, 'recharge', 'Recarga de billetera corporativa');

  RETURN v_new_balance;
END;
$$;

GRANT EXECUTE ON FUNCTION recharge_corporate_wallet TO authenticated;


-- 3. assign_employee_budget — + guard de monto + bloqueo de fila + verificación
--    de que el empleado pertenece a la empresa antes de debitar [BE-13]
CREATE OR REPLACE FUNCTION assign_employee_budget(
  p_employee_id uuid,
  p_company_id  uuid,
  p_amount      numeric
)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_company_id uuid;
  v_user_email      text;
  v_company_balance numeric;
  v_profile_id      uuid;
  v_emp_company     uuid;
  v_new_balance     numeric;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'El monto a asignar debe ser positivo.';
  END IF;

  SELECT company_id, email INTO v_user_company_id, v_user_email
  FROM profiles WHERE id = auth.uid();

  IF v_user_company_id IS NULL THEN
    SELECT id INTO v_user_company_id
    FROM companies
    WHERE id = p_company_id AND contact_email = v_user_email;
  END IF;

  IF v_user_company_id IS NULL OR v_user_company_id <> p_company_id THEN
    RAISE EXCEPTION 'No tienes permisos para asignar presupuesto en esta empresa.';
  END IF;

  -- Verificar que el empleado pertenece a la empresa ANTES de debitar
  SELECT company_id, profile_id INTO v_emp_company, v_profile_id
  FROM employees WHERE id = p_employee_id;

  IF v_emp_company IS NULL OR v_emp_company <> p_company_id THEN
    RAISE EXCEPTION 'El colaborador no pertenece a esta empresa.';
  END IF;

  -- Bloqueo de fila para evitar double-spend concurrente
  SELECT wallet_balance INTO v_company_balance
  FROM companies WHERE id = p_company_id FOR UPDATE;

  IF v_company_balance IS NULL OR v_company_balance < p_amount THEN
    RAISE EXCEPTION 'Saldo insuficiente en billetera corporativa.';
  END IF;

  UPDATE companies
  SET wallet_balance = wallet_balance - p_amount
  WHERE id = p_company_id
  RETURNING wallet_balance INTO v_new_balance;

  UPDATE employees
  SET assigned_budget = assigned_budget + p_amount
  WHERE id = p_employee_id AND company_id = p_company_id;

  IF v_profile_id IS NOT NULL THEN
    UPDATE profiles
    SET wallet_balance = COALESCE(wallet_balance, 0) + p_amount
    WHERE id = v_profile_id;

    INSERT INTO wallet_transactions (profile_id, amount, type, description)
    VALUES (v_profile_id, p_amount, 'allocation', 'Créditos asignados por empresa');
  END IF;

  INSERT INTO wallet_transactions (company_id, amount, type, description)
  VALUES (p_company_id, -p_amount, 'allocation', 'Asignación de créditos a colaborador');

  RETURN v_new_balance;
END;
$$;

GRANT EXECUTE ON FUNCTION assign_employee_budget TO authenticated;


-- 4. enroll_course_rpc — + guard de monto + bloqueo de fila contra double-spend
CREATE OR REPLACE FUNCTION enroll_course_rpc(
  p_course_id     uuid,
  p_credits_spent numeric
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student_id    uuid;
  v_balance       numeric;
  v_enrollment_id uuid;
  v_university_id uuid;
  v_stamp_id      uuid;
BEGIN
  v_student_id := auth.uid();
  IF v_student_id IS NULL THEN
    RAISE EXCEPTION 'Sesión no válida.';
  END IF;

  IF p_credits_spent IS NULL OR p_credits_spent < 0 THEN
    RAISE EXCEPTION 'El costo del curso no es válido.';
  END IF;

  IF EXISTS (
    SELECT 1 FROM enrollments
    WHERE student_id = v_student_id AND course_id = p_course_id
  ) THEN
    RAISE EXCEPTION 'Ya estás matriculado en este curso.';
  END IF;

  -- Bloqueo de fila para evitar double-spend concurrente
  SELECT COALESCE(wallet_balance, 0) INTO v_balance
  FROM profiles WHERE id = v_student_id FOR UPDATE;

  IF v_balance < p_credits_spent THEN
    RAISE EXCEPTION 'Saldo insuficiente. Tienes % COP y el curso cuesta % COP.',
      v_balance::text, p_credits_spent::text;
  END IF;

  INSERT INTO enrollments (student_id, course_id, credits_spent)
  VALUES (v_student_id, p_course_id, p_credits_spent)
  RETURNING id INTO v_enrollment_id;

  UPDATE profiles
  SET wallet_balance = wallet_balance - p_credits_spent
  WHERE id = v_student_id;

  INSERT INTO wallet_transactions (profile_id, amount, type, description, reference_id)
  VALUES (v_student_id, -p_credits_spent, 'enrollment', 'Matrícula de curso', v_enrollment_id);

  SELECT university_id INTO v_university_id
  FROM courses WHERE id = p_course_id;

  IF v_university_id IS NOT NULL THEN
    SELECT id INTO v_stamp_id
    FROM passport_stamps
    WHERE student_id = v_student_id AND university_id = v_university_id;

    IF v_stamp_id IS NOT NULL THEN
      UPDATE passport_stamps
      SET enroll_count = enroll_count + 1
      WHERE id = v_stamp_id;
    ELSE
      INSERT INTO passport_stamps (student_id, university_id, enroll_count)
      VALUES (v_student_id, v_university_id, 1);
    END IF;
  END IF;

  RETURN v_enrollment_id;
END;
$$;

GRANT EXECUTE ON FUNCTION enroll_course_rpc TO authenticated;
