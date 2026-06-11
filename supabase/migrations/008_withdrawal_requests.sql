-- Migration 008: Withdrawal Requests
-- Tabla para solicitudes de retiro de universidades

CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id uuid NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  amount        integer NOT NULL CHECK (amount >= 50000),
  bank_name     text NOT NULL,
  account_number text NOT NULL,
  account_holder text NOT NULL,
  account_type  text NOT NULL DEFAULT 'Ahorros',
  status        text NOT NULL DEFAULT 'Pendiente' CHECK (status IN ('Pendiente', 'En Proceso', 'Pagado', 'Rechazado')),
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  processed_at  timestamptz
);

-- RLS
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Universidad puede ver y crear sus propias solicitudes
CREATE POLICY "university sees own withdrawals"
  ON withdrawal_requests FOR SELECT
  USING (university_id = get_user_university_id());

CREATE POLICY "university inserts own withdrawal"
  ON withdrawal_requests FOR INSERT
  WITH CHECK (university_id = get_user_university_id());

-- Índice para búsquedas por universidad
CREATE INDEX IF NOT EXISTS withdrawal_requests_university_id_idx
  ON withdrawal_requests (university_id, created_at DESC);
