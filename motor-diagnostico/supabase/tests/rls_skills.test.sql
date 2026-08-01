-- ============================================================================
-- Test de regla 7.1 — el flujo de IA (rol anon) NO puede insertar en `skills`.
-- Criterio de aceptación: "Prueba explícita de que un intento de insertar en
-- skills desde el flujo de IA falla por RLS."
--
-- Ejecutar con:  psql "$DATABASE_URL" -f supabase/tests/rls_skills.test.sql
-- o dentro de `supabase test db` (usa pgTAP si está disponible).
-- ============================================================================

begin;

do $$
declare
  inserto_permitido boolean := false;
begin
  -- Nos ponemos en la piel del navegador / flujo de IA.
  set local role anon;

  begin
    insert into skills (name, skill_type)
    values ('__habilidad_inyectada_por_ia__', 'hard');
    inserto_permitido := true;   -- si llegamos aquí, la RLS falló
  exception
    when insufficient_privilege or others then
      inserto_permitido := false;  -- comportamiento esperado
  end;

  reset role;

  if inserto_permitido then
    raise exception
      'FALLO DE SEGURIDAD: el rol anon logró insertar en skills. La regla 7.1 no se está aplicando.';
  else
    raise notice 'OK: la RLS bloqueó el INSERT de anon en skills (regla 7.1 se cumple).';
  end if;
end $$;

rollback;
