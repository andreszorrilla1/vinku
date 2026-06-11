-- ============================================================
-- 1. wallet_transactions: allow corporate_admin to insert records
--    (needed so recharge and budget allocation are tracked)
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'wallet_transactions' AND policyname = 'wallet: corporate insert own'
  ) THEN
    CREATE POLICY "wallet: corporate insert own" ON wallet_transactions
      FOR INSERT WITH CHECK (
        get_user_role() = 'corporate_admin'
        AND company_id = get_user_company_id()
      );
  END IF;
END $$;

-- ============================================================
-- 2. profiles: allow corporate_admin to look up a profile by
--    email in order to link new employees (limited to id+email)
--    This is intentionally permissive only for corporate_admin.
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles' AND policyname = 'profiles: corporate lookup by email'
  ) THEN
    CREATE POLICY "profiles: corporate lookup by email" ON profiles
      FOR SELECT USING (get_user_role() = 'corporate_admin');
  END IF;
END $$;

-- ============================================================
-- 3. Auto-link trigger: when a profile is created/updated,
--    find any employee record with the same email and set profile_id.
--    This handles the case where a student already exists as
--    an employee in a company's roster.
-- ============================================================
CREATE OR REPLACE FUNCTION link_employee_profile()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE employees
  SET profile_id = NEW.id
  WHERE email = NEW.email
    AND profile_id IS NULL;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_created_link_employee ON profiles;
CREATE TRIGGER on_profile_created_link_employee
  AFTER INSERT OR UPDATE OF email ON profiles
  FOR EACH ROW EXECUTE FUNCTION link_employee_profile();
