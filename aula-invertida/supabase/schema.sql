-- ============================================================
-- Aula Invertida · Esquema propuesto (Supabase / PostgreSQL)
-- Persiste lo que hoy el prototipo guarda en el navegador.
-- Aplicar como nueva migración del proyecto Supabase de VinkU.
-- ============================================================

create table aula_encargos_progreso (
  id uuid primary key default gen_random_uuid(),
  participante_id uuid not null references auth.users(id) on delete cascade,
  encargo_id text not null,                 -- id del catálogo (oferta, precio, reto-lab…)
  servicio_id text,                          -- acomp, programa, bootcamps, lab, upskilling…
  organizacion_id uuid,                      -- si lo patrocina una empresa o universidad
  momento smallint not null default 0 check (momento between 0 and 5),
  chat jsonb not null default '[]',
  caso jsonb,
  capsulas jsonb,
  borrador jsonb,
  brief jsonb,
  creado timestamptz not null default now(),
  actualizado timestamptz not null default now(),
  unique (participante_id, encargo_id)
);

create table aula_mesas (
  id uuid primary key default gen_random_uuid(),
  progreso_id uuid not null references aula_encargos_progreso(id) on delete cascade,
  consultor_id uuid references auth.users(id),
  agendada_para timestamptz,
  realizada boolean not null default false,
  notas text
);

create table aula_evidencias (
  id uuid primary key default gen_random_uuid(),
  progreso_id uuid not null references aula_encargos_progreso(id) on delete cascade,
  con_quien text not null,
  que_paso text not null,
  ajuste_ia text,
  creado timestamptz not null default now()
);

create table aula_sellos (
  progreso_id uuid primary key references aula_encargos_progreso(id) on delete cascade,
  consultor_id uuid not null references auth.users(id),
  nota text,
  fecha timestamptz not null default now()
);

alter table aula_encargos_progreso enable row level security;
alter table aula_mesas enable row level security;
alter table aula_evidencias enable row level security;
alter table aula_sellos enable row level security;

-- El participante ve y edita solo lo suyo. (Políticas de consultor y organización: siguiente fase.)
create policy "participante_progreso" on aula_encargos_progreso
  for all using (participante_id = auth.uid()) with check (participante_id = auth.uid());
create policy "participante_evidencias" on aula_evidencias
  for all using (exists (select 1 from aula_encargos_progreso p where p.id = progreso_id and p.participante_id = auth.uid()));
create policy "participante_ve_mesas" on aula_mesas
  for select using (exists (select 1 from aula_encargos_progreso p where p.id = progreso_id and p.participante_id = auth.uid()));
create policy "participante_ve_sellos" on aula_sellos
  for select using (exists (select 1 from aula_encargos_progreso p where p.id = progreso_id and p.participante_id = auth.uid()));
