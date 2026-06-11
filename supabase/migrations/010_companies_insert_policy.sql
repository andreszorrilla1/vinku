-- Allow any authenticated user to insert a company on sign-up.
-- Uses IF NOT EXISTS so it's safe to run even if migration 006 already added it.
CREATE POLICY IF NOT EXISTS "companies: admin insert"
  ON companies FOR INSERT
  WITH CHECK (true);

-- Allow university_admin users to create their own university record on sign-up.
CREATE POLICY IF NOT EXISTS "universities: admin insert own"
  ON universities FOR INSERT
  WITH CHECK (true);

-- Allow corporate_admin to update their own profile's company_id linkage.
-- (profiles update policy may already cover this, but be explicit)
CREATE POLICY IF NOT EXISTS "profiles: link company on register"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());
