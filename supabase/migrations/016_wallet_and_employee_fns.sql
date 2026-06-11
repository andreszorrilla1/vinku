-- ============================================================
-- SECURITY DEFINER functions for wallet and employee operations.
-- These bypass RLS so writes always succeed when the calling
-- user passes the internal authorization checks.
-- ============================================================

-- 1. recharge_corporate_wallet
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
  v_new_balance     numeric;
BEGIN
  SELECT company_id INTO v_user_company_id
  FROM profiles WHERE id = auth.uid();

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


-- 2. assign_employee_budget
--    Deducts from company wallet, credits employee record AND
--    the employee's personal profile wallet (so they can enroll).
CREATE OR REPLACE FUNCTION assign_employee_budget(
  p_employee_id uuid,
  p_company_id  uuid,
  p_amount      numeric
)
RETURNS numeric   -- returns new company wallet balance
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_company_id uuid;
  v_company_balance numeric;
  v_profile_id      uuid;
  v_new_balance     numeric;
BEGIN
  SELECT company_id INTO v_user_company_id
  FROM profiles WHERE id = auth.uid();

  IF v_user_company_id IS NULL OR v_user_company_id <> p_company_id THEN
    RAISE EXCEPTION 'No tienes permisos para asignar presupuesto en esta empresa.';
  END IF;

  SELECT wallet_balance INTO v_company_balance
  FROM companies WHERE id = p_company_id;

  IF v_company_balance IS NULL OR v_company_balance < p_amount THEN
    RAISE EXCEPTION 'Saldo insuficiente en billetera corporativa.';
  END IF;

  -- Deduct from company wallet
  UPDATE companies
  SET wallet_balance = wallet_balance - p_amount
  WHERE id = p_company_id
  RETURNING wallet_balance INTO v_new_balance;

  -- Add to employee assigned_budget
  UPDATE employees
  SET assigned_budget = assigned_budget + p_amount
  WHERE id = p_employee_id AND company_id = p_company_id;

  -- Get linked profile_id
  SELECT profile_id INTO v_profile_id
  FROM employees WHERE id = p_employee_id;

  -- Credit employee's personal wallet so they can enroll in courses
  IF v_profile_id IS NOT NULL THEN
    UPDATE profiles
    SET wallet_balance = COALESCE(wallet_balance, 0) + p_amount
    WHERE id = v_profile_id;

    INSERT INTO wallet_transactions (profile_id, amount, type, description)
    VALUES (v_profile_id, p_amount, 'allocation', 'Créditos asignados por empresa');
  END IF;

  -- Record company transaction
  INSERT INTO wallet_transactions (company_id, amount, type, description)
  VALUES (p_company_id, -p_amount, 'allocation', 'Asignación de créditos a colaborador');

  RETURN v_new_balance;
END;
$$;

GRANT EXECUTE ON FUNCTION assign_employee_budget TO authenticated;
