-- ============================================================
-- Campus Pass by VinkU — Row Level Security (RLS)
-- ============================================================

-- Helper: obtener rol del usuario autenticado
create or replace function get_user_role()
returns user_role language sql security definer stable as $$
  select role from profiles where id = auth.uid();
$$;

-- Helper: obtener company_id del usuario autenticado
create or replace function get_user_company_id()
returns uuid language sql security definer stable as $$
  select company_id from profiles where id = auth.uid();
$$;

-- Helper: obtener university_id del usuario autenticado
create or replace function get_user_university_id()
returns uuid language sql security definer stable as $$
  select university_id from profiles where id = auth.uid();
$$;

-- ============================================================
-- PROFILES
-- ============================================================

alter table profiles enable row level security;

-- Cada usuario ve y edita solo su propio perfil
create policy "profiles: select own" on profiles
  for select using (auth.uid() = id);

create policy "profiles: update own" on profiles
  for update using (auth.uid() = id);

-- Superadmin ve todo
create policy "profiles: superadmin all" on profiles
  for all using (get_user_role() = 'superadmin');

-- Corporate admin ve perfiles de sus empleados
create policy "profiles: corporate sees employees" on profiles
  for select using (
    get_user_role() = 'corporate_admin'
    and id in (
      select profile_id from employees
      where company_id = get_user_company_id()
        and profile_id is not null
    )
  );

-- ============================================================
-- COURSES
-- ============================================================

alter table courses enable row level security;

-- Cualquier usuario autenticado puede ver cursos activos
create policy "courses: public read active" on courses
  for select using (is_active = true);

-- Universidad solo gestiona sus propios cursos
create policy "courses: university manages own" on courses
  for all using (
    get_user_role() = 'university_admin'
    and university_id = get_user_university_id()
  );

-- Superadmin ve todo
create policy "courses: superadmin all" on courses
  for all using (get_user_role() = 'superadmin');

-- ============================================================
-- UNIVERSITIES
-- ============================================================

alter table universities enable row level security;

-- Cualquier autenticado puede ver universidades aprobadas
create policy "universities: public read approved" on universities
  for select using (approval_status = 'Aprobada');

-- Universidad ve y edita sus propios datos
create policy "universities: admin manages own" on universities
  for all using (
    get_user_role() = 'university_admin'
    and id = get_user_university_id()
  );

-- Superadmin ve todo
create policy "universities: superadmin all" on universities
  for all using (get_user_role() = 'superadmin');

-- ============================================================
-- COMPANIES
-- ============================================================

alter table companies enable row level security;

-- Corporate admin ve solo su empresa
create policy "companies: admin sees own" on companies
  for select using (
    get_user_role() = 'corporate_admin'
    and id = get_user_company_id()
  );

create policy "companies: admin updates own" on companies
  for update using (
    get_user_role() = 'corporate_admin'
    and id = get_user_company_id()
  );

-- Superadmin ve todo
create policy "companies: superadmin all" on companies
  for all using (get_user_role() = 'superadmin');

-- ============================================================
-- EMPLOYEES
-- ============================================================

alter table employees enable row level security;

-- Corporate admin solo ve empleados de su empresa
create policy "employees: corporate sees own" on employees
  for all using (
    get_user_role() = 'corporate_admin'
    and company_id = get_user_company_id()
  );

-- Cada empleado con cuenta ve su propio registro
create policy "employees: student sees own" on employees
  for select using (profile_id = auth.uid());

-- Superadmin ve todo
create policy "employees: superadmin all" on employees
  for all using (get_user_role() = 'superadmin');

-- ============================================================
-- ENROLLMENTS
-- ============================================================

alter table enrollments enable row level security;

-- Estudiante ve sus propias matrículas
create policy "enrollments: student sees own" on enrollments
  for select using (student_id = auth.uid());

-- Estudiante puede matricularse
create policy "enrollments: student insert" on enrollments
  for insert with check (student_id = auth.uid());

-- Universidad ve matrículas de sus cursos
create policy "enrollments: university sees own courses" on enrollments
  for select using (
    get_user_role() = 'university_admin'
    and course_id in (
      select id from courses where university_id = get_user_university_id()
    )
  );

-- Universidad actualiza estado (certificar)
create policy "enrollments: university certify" on enrollments
  for update using (
    get_user_role() = 'university_admin'
    and course_id in (
      select id from courses where university_id = get_user_university_id()
    )
  );

-- Superadmin ve todo
create policy "enrollments: superadmin all" on enrollments
  for all using (get_user_role() = 'superadmin');

-- ============================================================
-- PASSPORT STAMPS
-- ============================================================

alter table passport_stamps enable row level security;

create policy "passport_stamps: student sees own" on passport_stamps
  for select using (student_id = auth.uid());

create policy "passport_stamps: superadmin all" on passport_stamps
  for all using (get_user_role() = 'superadmin');

-- ============================================================
-- SKILL BADGES
-- ============================================================

alter table skill_badges enable row level security;

create policy "skill_badges: student sees own" on skill_badges
  for select using (student_id = auth.uid());

create policy "skill_badges: superadmin all" on skill_badges
  for all using (get_user_role() = 'superadmin');

-- ============================================================
-- ACHIEVEMENTS
-- ============================================================

alter table achievements enable row level security;

create policy "achievements: student manages own" on achievements
  for all using (student_id = auth.uid());

create policy "achievements: superadmin all" on achievements
  for all using (get_user_role() = 'superadmin');

-- ============================================================
-- MENTOR SESSIONS
-- ============================================================

alter table mentor_sessions enable row level security;

create policy "mentor_sessions: student sees own" on mentor_sessions
  for all using (student_id = auth.uid());

create policy "mentor_sessions: superadmin all" on mentor_sessions
  for all using (get_user_role() = 'superadmin');

-- ============================================================
-- WALLET TRANSACTIONS
-- ============================================================

alter table wallet_transactions enable row level security;

create policy "wallet: student sees own" on wallet_transactions
  for select using (profile_id = auth.uid());

create policy "wallet: corporate sees own" on wallet_transactions
  for select using (
    get_user_role() = 'corporate_admin'
    and company_id = get_user_company_id()
  );

create policy "wallet: superadmin all" on wallet_transactions
  for all using (get_user_role() = 'superadmin');

-- ============================================================
-- LEADS (solo escritura pública, lectura solo superadmin)
-- ============================================================

alter table leads enable row level security;

create policy "leads: public insert" on leads
  for insert with check (true);

create policy "leads: superadmin all" on leads
  for all using (get_user_role() = 'superadmin');
