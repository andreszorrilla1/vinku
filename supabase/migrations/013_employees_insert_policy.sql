-- Add an explicit INSERT policy for employees table.
-- The existing "FOR ALL" policy uses USING which PostgreSQL maps to WITH CHECK
-- for INSERT, but an explicit INSERT policy is clearer and avoids edge cases.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'employees' AND policyname = 'employees: corporate insert own'
  ) THEN
    CREATE POLICY "employees: corporate insert own" ON employees
      FOR INSERT WITH CHECK (
        get_user_role() = 'corporate_admin'
        AND company_id = get_user_company_id()
      );
  END IF;
END $$;
