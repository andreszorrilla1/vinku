-- SECURITY DEFINER function so any authenticated user can link their
-- own profile to a company or university without needing an explicit
-- UPDATE RLS policy (avoids the silent-failure race condition on first login).

CREATE OR REPLACE FUNCTION link_profile_company(p_company_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles
  SET company_id = p_company_id
  WHERE id = auth.uid()
    AND (company_id IS NULL OR company_id = p_company_id);
END;
$$;

GRANT EXECUTE ON FUNCTION link_profile_company TO authenticated;


CREATE OR REPLACE FUNCTION link_profile_university(p_university_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles
  SET university_id = p_university_id
  WHERE id = auth.uid()
    AND (university_id IS NULL OR university_id = p_university_id);
END;
$$;

GRANT EXECUTE ON FUNCTION link_profile_university TO authenticated;
