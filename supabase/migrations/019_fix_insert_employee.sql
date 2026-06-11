-- Fix insert_employee: also accept ownership via contact_email
-- in case profiles.company_id is not yet set for the admin.
CREATE OR REPLACE FUNCTION insert_employee(
  p_company_id   uuid,
  p_name         text,
  p_email        text,
  p_role_title   text DEFAULT NULL,
  p_department   text DEFAULT NULL,
  p_budget       numeric DEFAULT 0
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_company_id uuid;
  v_user_email      text;
  v_profile_id      uuid;
  v_employee_id     uuid;
BEGIN
  -- Check ownership via profiles.company_id
  SELECT company_id, email INTO v_user_company_id, v_user_email
  FROM profiles
  WHERE id = auth.uid();

  -- Fallback: check via companies.contact_email
  IF v_user_company_id IS NULL THEN
    SELECT id INTO v_user_company_id
    FROM companies
    WHERE id = p_company_id
      AND contact_email = v_user_email;
  END IF;

  IF v_user_company_id IS NULL OR v_user_company_id <> p_company_id THEN
    RAISE EXCEPTION 'No tienes permisos para agregar colaboradores a esta empresa.';
  END IF;

  -- Also update profile link while we're here
  UPDATE profiles
  SET company_id = p_company_id
  WHERE id = auth.uid() AND company_id IS NULL;

  -- Find existing profile for this email
  SELECT id INTO v_profile_id
  FROM profiles
  WHERE email = p_email
  LIMIT 1;

  INSERT INTO employees (
    company_id, profile_id, name, email,
    role_title, department, diag_status,
    active_path, progress_pct, assigned_budget, suggested_route_cost
  )
  VALUES (
    p_company_id, v_profile_id, p_name, p_email,
    p_role_title, p_department, 'Pendiente',
    NULL, 0, 0, NULL
  )
  ON CONFLICT (company_id, email) DO NOTHING
  RETURNING id INTO v_employee_id;

  IF v_employee_id IS NULL THEN
    SELECT id INTO v_employee_id
    FROM employees
    WHERE company_id = p_company_id AND email = p_email;
  END IF;

  RETURN v_employee_id;
END;
$$;

GRANT EXECUTE ON FUNCTION insert_employee TO authenticated;


-- Fix assign_employee_budget: same fallback via contact_email
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
  v_new_balance     numeric;
BEGIN
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

  SELECT wallet_balance INTO v_company_balance
  FROM companies WHERE id = p_company_id;

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

  SELECT profile_id INTO v_profile_id
  FROM employees WHERE id = p_employee_id;

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


-- Fix recharge_corporate_wallet: same fallback
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
