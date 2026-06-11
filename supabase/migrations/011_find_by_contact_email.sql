-- Allow a user to find their own company by contact_email, even before
-- profile.company_id is linked (needed for auto-link on first login).
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'companies' AND policyname = 'companies: find by contact email'
  ) THEN
    CREATE POLICY "companies: find by contact email" ON companies
      FOR SELECT USING (contact_email = auth.email());
  END IF;
END $$;

-- Same for universities: allow finding own university by contact_email.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'universities' AND policyname = 'universities: find by contact email'
  ) THEN
    CREATE POLICY "universities: find by contact email" ON universities
      FOR SELECT USING (contact_email = auth.email());
  END IF;
END $$;
