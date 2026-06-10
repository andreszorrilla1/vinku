-- Políticas RLS faltantes detectadas en auditoría
-- Ejecutar en Supabase SQL Editor si no se han aplicado aún

-- passport_stamps: estudiantes pueden insertar sus propios sellos
CREATE POLICY IF NOT EXISTS "passport_stamps: student insert own" ON passport_stamps
  FOR INSERT WITH CHECK (student_id = auth.uid());

-- passport_stamps: estudiantes pueden actualizar sus propios sellos (incremento de count)
CREATE POLICY IF NOT EXISTS "passport_stamps: student update own" ON passport_stamps
  FOR UPDATE USING (student_id = auth.uid());

-- wallet_transactions: insertar propias transacciones o como admin corporativo
CREATE POLICY IF NOT EXISTS "wallet: insert own" ON wallet_transactions
  FOR INSERT WITH CHECK (
    profile_id = auth.uid() OR
    (get_user_role() = 'corporate_admin' AND company_id = get_user_company_id())
  );

-- companies: cualquier usuario autenticado puede crear empresa (al registrarse como corporativo)
CREATE POLICY IF NOT EXISTS "companies: admin insert" ON companies
  FOR INSERT WITH CHECK (true);
