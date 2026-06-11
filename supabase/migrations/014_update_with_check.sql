-- Ensure UPDATE policies have explicit WITH CHECK so writes are not
-- silently discarded when the row filter matches but the check doesn't.

-- profiles: student/corporate_admin can update their own row
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles' AND policyname = 'profiles: update own with check'
  ) THEN
    CREATE POLICY "profiles: update own with check" ON profiles
      FOR UPDATE
      USING (id = auth.uid())
      WITH CHECK (id = auth.uid());
  END IF;
END $$;

-- companies: corporate_admin can update their own company's data
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'companies' AND policyname = 'companies: admin update with check'
  ) THEN
    CREATE POLICY "companies: admin update with check" ON companies
      FOR UPDATE
      USING (
        get_user_role() = 'corporate_admin'
        AND id = get_user_company_id()
      )
      WITH CHECK (
        get_user_role() = 'corporate_admin'
        AND id = get_user_company_id()
      );
  END IF;
END $$;

-- universities: university_admin can update their own university
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'universities' AND policyname = 'universities: admin update with check'
  ) THEN
    CREATE POLICY "universities: admin update with check" ON universities
      FOR UPDATE
      USING (
        get_user_role() = 'university_admin'
        AND id = get_user_university_id()
      )
      WITH CHECK (
        get_user_role() = 'university_admin'
        AND id = get_user_university_id()
      );
  END IF;
END $$;

-- employees: corporate_admin can update employees in their company
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'employees' AND policyname = 'employees: corporate update with check'
  ) THEN
    CREATE POLICY "employees: corporate update with check" ON employees
      FOR UPDATE
      USING (
        get_user_role() = 'corporate_admin'
        AND company_id = get_user_company_id()
      )
      WITH CHECK (
        get_user_role() = 'corporate_admin'
        AND company_id = get_user_company_id()
      );
  END IF;
END $$;
