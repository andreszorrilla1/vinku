-- Allow any authenticated user to insert a company on sign-up.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'companies' AND policyname = 'companies: admin insert'
  ) THEN
    CREATE POLICY "companies: admin insert" ON companies FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Allow university_admin users to create their own university record on sign-up.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'universities' AND policyname = 'universities: admin insert own'
  ) THEN
    CREATE POLICY "universities: admin insert own" ON universities FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Allow users to update their own profile (links company_id / university_id after registration).
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles: link company on register'
  ) THEN
    CREATE POLICY "profiles: link company on register" ON profiles FOR UPDATE
      USING (id = auth.uid()) WITH CHECK (id = auth.uid());
  END IF;
END $$;
