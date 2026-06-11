-- ============================================================
-- insert_employee: SECURITY DEFINER function so corporate_admin
-- can always add employees regardless of RLS edge cases.
-- Validates that the calling user's company_id matches the
-- company_id being inserted.
-- ============================================================
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
  v_profile_id      uuid;
  v_employee_id     uuid;
BEGIN
  -- Verify the calling user actually owns this company
  SELECT company_id INTO v_user_company_id
  FROM profiles
  WHERE id = auth.uid();

  IF v_user_company_id IS NULL OR v_user_company_id <> p_company_id THEN
    RAISE EXCEPTION 'No tienes permisos para agregar colaboradores a esta empresa.';
  END IF;

  -- Try to find an existing profile with this email (for enrollment linking)
  SELECT id INTO v_profile_id
  FROM profiles
  WHERE email = p_email
  LIMIT 1;

  -- Insert employee (upsert on company_id + email to avoid duplicates)
  INSERT INTO employees (
    company_id, profile_id, name, email,
    role_title, department, diag_status,
    active_path, progress_pct, assigned_budget, suggested_route_cost
  )
  VALUES (
    p_company_id, v_profile_id, p_name, p_email,
    p_role_title, p_department, 'Pendiente',
    NULL, 0, p_budget, NULL
  )
  ON CONFLICT (company_id, email) DO NOTHING
  RETURNING id INTO v_employee_id;

  IF v_employee_id IS NULL THEN
    -- Already exists — return existing id
    SELECT id INTO v_employee_id
    FROM employees
    WHERE company_id = p_company_id AND email = p_email;
  END IF;

  RETURN v_employee_id;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION insert_employee TO authenticated;
