-- ============================================================
-- Campus Pass by VinkU — Schema SQL
-- Supabase / PostgreSQL
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

create type course_level as enum ('Pregrado', 'Posgrado', 'Educación Continua');
create type enrollment_status as enum ('Cursando', 'Certificado', 'Abandonado');
create type diag_status as enum ('Pendiente', 'Ruta Generada', 'Matriculado');
create type achievement_status as enum ('Definido', 'En Progreso', 'Cumplido');
create type user_role as enum ('student', 'corporate_admin', 'university_admin', 'superadmin');
create type university_approval as enum ('Pendiente', 'En Revisión', 'Aprobada', 'Rechazada');

-- ============================================================
-- UNIVERSITIES
-- ============================================================

create table universities (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  logo_url text,
  email_domain text,                  -- ej: "uniandes.edu.co"
  approval_status university_approval not null default 'Pendiente',
  approved_at timestamptz,
  approved_by uuid,                   -- ref a auth.users (superadmin)
  legal_nit text,
  contact_email text not null,
  total_earnings numeric(14,2) not null default 0,
  liquid_balance numeric(14,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- COURSES
-- ============================================================

create table courses (
  id uuid primary key default uuid_generate_v4(),
  university_id uuid not null references universities(id) on delete cascade,
  title text not null,
  description text,
  level course_level not null,
  duration text not null,            -- ej: "6 Semanas"
  cost_credits numeric(10,2) not null,
  skills text[] not null default '{}',
  category text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index courses_university_id_idx on courses(university_id);
create index courses_level_idx on courses(level);
create index courses_category_idx on courses(category);

-- ============================================================
-- COMPANIES
-- ============================================================

create table companies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  nit text unique,
  industry text,
  size_employees int,
  contact_name text not null,
  contact_email text not null,
  wallet_balance numeric(14,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'student',
  full_name text,
  email text not null,
  avatar_url text,
  -- Student fields
  wallet_balance numeric(14,2) default 0,
  credit_approved numeric(14,2) default 0,
  diagnosed boolean default false,
  suggested_route uuid[],             -- course IDs
  -- Corporate fields
  company_id uuid references companies(id),
  -- University fields
  university_id uuid references universities(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- EMPLOYEES
-- ============================================================

create table employees (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references companies(id) on delete cascade,
  profile_id uuid references profiles(id),   -- si tienen cuenta Campus Pass
  name text not null,
  email text not null,
  role_title text,
  department text,
  diag_status diag_status not null default 'Pendiente',
  active_path text[],                         -- course names
  progress_pct int not null default 0 check (progress_pct between 0 and 100),
  assigned_budget numeric(14,2) not null default 0,
  suggested_route_cost numeric(14,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(company_id, email)
);

create index employees_company_id_idx on employees(company_id);

-- ============================================================
-- ENROLLMENTS
-- ============================================================

create table enrollments (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references profiles(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  status enrollment_status not null default 'Cursando',
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  certificate_url text,
  credits_spent numeric(10,2) not null default 0,
  unique(student_id, course_id)
);

create index enrollments_student_id_idx on enrollments(student_id);
create index enrollments_course_id_idx on enrollments(course_id);

-- ============================================================
-- PASSPORT STAMPS (sellos por universidad)
-- ============================================================

create table passport_stamps (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references profiles(id) on delete cascade,
  university_id uuid not null references universities(id),
  enroll_count int not null default 1,
  created_at timestamptz not null default now(),
  unique(student_id, university_id)
);

-- ============================================================
-- SKILL BADGES (insignias por habilidad)
-- ============================================================

create table skill_badges (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references profiles(id) on delete cascade,
  skill_name text not null,
  icon_name text,
  earned_at timestamptz not null default now(),
  unique(student_id, skill_name)
);

-- ============================================================
-- ACHIEVEMENTS / LOGROS
-- ============================================================

create table achievements (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references profiles(id) on delete cascade,
  goal text not null,
  associated_products text[],
  status achievement_status not null default 'Definido',
  evidence_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- MENTOR SESSIONS (Fellowship)
-- ============================================================

create table mentor_sessions (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references profiles(id) on delete cascade,
  mentor_name text not null,
  topic text not null,
  scheduled_at timestamptz not null,
  zoom_link text,
  created_at timestamptz not null default now()
);

create index mentor_sessions_student_id_idx on mentor_sessions(student_id);

-- ============================================================
-- LEADS (B2B prospects)
-- ============================================================

create table leads (
  id uuid primary key default uuid_generate_v4(),
  company_name text not null,
  contact_name text not null,
  contact_email text not null,
  contact_phone text,
  employee_count int,
  message text,
  source text default 'landing_b2b',
  created_at timestamptz not null default now()
);

-- ============================================================
-- WALLET TRANSACTIONS
-- ============================================================

create table wallet_transactions (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id),
  company_id uuid references companies(id),
  amount numeric(14,2) not null,
  type text not null,                 -- 'recharge', 'enrollment', 'assignment', 'withdrawal'
  description text,
  reference_id uuid,                  -- enrollment_id, etc.
  created_at timestamptz not null default now(),
  check (profile_id is not null or company_id is not null)
);

-- ============================================================
-- TRIGGERS: updated_at automático
-- ============================================================

create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger universities_updated_at before update on universities
  for each row execute function update_updated_at();
create trigger courses_updated_at before update on courses
  for each row execute function update_updated_at();
create trigger companies_updated_at before update on companies
  for each row execute function update_updated_at();
create trigger profiles_updated_at before update on profiles
  for each row execute function update_updated_at();
create trigger employees_updated_at before update on employees
  for each row execute function update_updated_at();
create trigger achievements_updated_at before update on achievements
  for each row execute function update_updated_at();

-- ============================================================
-- TRIGGER: crear profile automáticamente al registrarse
-- ============================================================

create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, email, role, full_name)
  values (
    new.id,
    new.email,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'student'),
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
