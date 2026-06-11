-- ============================================================
-- 1. Fix link_employee_profile trigger: when an employee profile
--    is linked, also sync assigned_budget → profiles.wallet_balance
--    so the student can immediately enroll in courses.
-- ============================================================
CREATE OR REPLACE FUNCTION link_employee_profile()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_budget numeric;
BEGIN
  -- Link profile_id on employees row
  UPDATE employees
  SET profile_id = NEW.id
  WHERE email = NEW.email
    AND profile_id IS NULL
  RETURNING assigned_budget INTO v_budget;

  -- If an employee was found and has budget, credit the student wallet
  IF v_budget IS NOT NULL AND v_budget > 0 THEN
    UPDATE profiles
    SET wallet_balance = COALESCE(wallet_balance, 0) + v_budget
    WHERE id = NEW.id;

    INSERT INTO wallet_transactions (profile_id, amount, type, description)
    VALUES (NEW.id, v_budget, 'allocation', 'Créditos asignados por empresa (sincronización automática)');
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_created_link_employee ON profiles;
CREATE TRIGGER on_profile_created_link_employee
  AFTER INSERT OR UPDATE OF email ON profiles
  FOR EACH ROW EXECUTE FUNCTION link_employee_profile();


-- ============================================================
-- 2. enroll_course_rpc: atomic enrollment + wallet deduction.
--    Replaces the broken client-side count===0 check pattern.
-- ============================================================
CREATE OR REPLACE FUNCTION enroll_course_rpc(
  p_course_id     uuid,
  p_credits_spent numeric
)
RETURNS uuid   -- returns new enrollment id
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

  -- Check existing enrollment
  IF EXISTS (
    SELECT 1 FROM enrollments
    WHERE student_id = v_student_id AND course_id = p_course_id
  ) THEN
    RAISE EXCEPTION 'Ya estás matriculado en este curso.';
  END IF;

  -- Check wallet balance
  SELECT COALESCE(wallet_balance, 0) INTO v_balance
  FROM profiles WHERE id = v_student_id;

  IF v_balance < p_credits_spent THEN
    RAISE EXCEPTION 'Saldo insuficiente. Tienes % COP y el curso cuesta % COP.',
      v_balance::text, p_credits_spent::text;
  END IF;

  -- Insert enrollment
  INSERT INTO enrollments (student_id, course_id, credits_spent)
  VALUES (v_student_id, p_course_id, p_credits_spent)
  RETURNING id INTO v_enrollment_id;

  -- Deduct wallet
  UPDATE profiles
  SET wallet_balance = wallet_balance - p_credits_spent
  WHERE id = v_student_id;

  -- Record transaction
  INSERT INTO wallet_transactions (profile_id, amount, type, description, reference_id)
  VALUES (v_student_id, -p_credits_spent, 'enrollment', 'Matrícula de curso', v_enrollment_id);

  -- Upsert passport stamp
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
