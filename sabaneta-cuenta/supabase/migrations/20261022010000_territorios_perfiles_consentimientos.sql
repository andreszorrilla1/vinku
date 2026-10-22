-- Fase 1: territorios (barrios y veredas), perfiles y consentimientos.
--
-- Principios:
-- * El celular vive solo en auth.users. Ninguna tabla pública lo copia, así nadie lo ve por la API.
-- * Antes de guardar un perfil tiene que existir un consentimiento (Ley 1581).
-- * El vecino no puede cambiar su rol, su bloqueo ni su código de referido: se controla con permisos por columna.
-- * Funciones security definer con search_path vacío y nombres totalmente calificados.

-- ---------------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------------

create type public.rol_persona as enum ('vecino', 'moderador', 'coordinador', 'analista', 'admin');
create type public.tipo_territorio as enum ('barrio', 'vereda');
create type public.rango_edad as enum ('menos_30', 'de_30_a_59', 'mas_60');
create type public.tamano_letra as enum ('normal', 'grande');

-- ---------------------------------------------------------------------------
-- Utilidades
-- ---------------------------------------------------------------------------

create or replace function public.tocar_actualizado_en()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.actualizado_en := now();
  return new;
end;
$$;

-- Código corto para «Sumar un vecino»: 6 caracteres sin letras ni números que se confunden (0/O, 1/I/L).
create or replace function public.generar_codigo_referido()
returns text
language plpgsql
volatile
set search_path = ''
as $$
declare
  alfabeto constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  bytes bytea;
  codigo text;
begin
  loop
    bytes := extensions.gen_random_bytes(6);
    codigo := '';
    for i in 0..5 loop
      codigo := codigo || substr(alfabeto, (get_byte(bytes, i) % length(alfabeto)) + 1, 1);
    end loop;
    exit when not exists (select 1 from public.perfiles p where p.codigo_referido = codigo);
  end loop;
  return codigo;
end;
$$;

-- ---------------------------------------------------------------------------
-- Territorios
-- ---------------------------------------------------------------------------

create table public.territorios (
  id integer generated always as identity primary key,
  nombre text not null check (char_length(btrim(nombre)) between 2 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  tipo public.tipo_territorio not null,
  geom extensions.geometry(MultiPolygon, 4326) not null check (extensions.st_isvalid(geom)),
  poblacion integer check (poblacion > 0),
  es_demo boolean not null default false,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

comment on table public.territorios is 'Barrios y veredas de Sabaneta. Los marcados es_demo son de prueba [DEMO].';

create index territorios_geom_idx on public.territorios using gist (geom);

create trigger territorios_actualizado_en
  before update on public.territorios
  for each row execute function public.tocar_actualizado_en();

-- ---------------------------------------------------------------------------
-- Perfiles
-- ---------------------------------------------------------------------------

create table public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre_mostrar text not null check (char_length(btrim(nombre_mostrar)) between 2 and 40),
  territorio_id integer not null references public.territorios (id),
  cuadra_h3 text check (cuadra_h3 ~ '^[0-9a-f]{15}$'),
  punto_cuadra extensions.geometry(Point, 4326),
  rango_edad public.rango_edad,
  codigo_referido text not null unique,
  referido_por uuid references public.perfiles (id) on delete set null,
  rol public.rol_persona not null default 'vecino',
  tamano_letra public.tamano_letra not null default 'normal',
  bloqueado boolean not null default false,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  constraint perfiles_no_autorreferido check (referido_por is distinct from id),
  constraint perfiles_cuadra_con_punto check ((cuadra_h3 is null) = (punto_cuadra is null))
);

comment on table public.perfiles is 'Datos mínimos del vecino. El celular NO se guarda aquí (solo en auth.users).';

create index perfiles_territorio_idx on public.perfiles (territorio_id);
create index perfiles_referido_por_idx on public.perfiles (referido_por);

create trigger perfiles_actualizado_en
  before update on public.perfiles
  for each row execute function public.tocar_actualizado_en();

-- Si hay punto de cuadra, el barrio sale del mapa (no de lo que diga el cliente).
-- Si el punto queda fuera de Sabaneta, se rechaza con un mensaje simple.
create or replace function public.asignar_territorio()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  encontrado integer;
begin
  if new.punto_cuadra is null then
    return new;
  end if;

  select t.id into encontrado
  from public.territorios t
  where extensions.st_contains(t.geom, new.punto_cuadra)
  order by t.es_demo, t.id
  limit 1;

  if encontrado is null then
    raise exception 'Ese punto queda fuera de Sabaneta.' using errcode = 'P0001', hint = 'fuera_de_sabaneta';
  end if;

  new.territorio_id := encontrado;
  return new;
end;
$$;

create trigger perfiles_asignar_territorio
  before insert or update of punto_cuadra on public.perfiles
  for each row execute function public.asignar_territorio();

-- ---------------------------------------------------------------------------
-- Consentimientos (historial: una fila nueva por cada cambio, nunca se edita)
-- ---------------------------------------------------------------------------

create table public.consentimientos (
  id bigint generated always as identity primary key,
  -- Mismo id que auth.users y perfiles. Apunta a auth.users porque se acepta ANTES de crear el perfil.
  perfil_id uuid not null references auth.users (id) on delete cascade,
  version_politica text not null check (char_length(version_politica) between 1 and 40),
  acepta_tratamiento boolean not null check (acepta_tratamiento),
  acepta_mostrar_nombre boolean not null,
  acepta_whatsapp boolean not null,
  fecha timestamptz not null default now(),
  ip_hash text check (ip_hash ~ '^[0-9a-f]{64}$'),
  user_agent text check (char_length(user_agent) <= 400)
);

comment on table public.consentimientos is 'Registro de autorizaciones (Ley 1581). Solo inserción.';

create index consentimientos_perfil_fecha_idx on public.consentimientos (perfil_id, fecha desc);

-- Último consentimiento de cada persona.
create view public.consentimiento_vigente
with (security_invoker = true)
as
select distinct on (c.perfil_id)
  c.perfil_id, c.version_politica, c.acepta_tratamiento, c.acepta_mostrar_nombre, c.acepta_whatsapp, c.fecha
from public.consentimientos c
order by c.perfil_id, c.fecha desc, c.id desc;

-- ---------------------------------------------------------------------------
-- Reglas sobre perfiles
-- ---------------------------------------------------------------------------

-- No se puede crear un perfil sin consentimiento previo, ni referirse a un perfil inexistente o bloqueado.
-- El código de referido lo pone siempre la base.
create or replace function public.validar_perfil_nuevo()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (select 1 from public.consentimientos c where c.perfil_id = new.id) then
    raise exception 'Primero acepta el tratamiento de tus datos.' using errcode = 'P0001', hint = 'sin_consentimiento';
  end if;
  if new.referido_por is not null
     and not exists (select 1 from public.perfiles p where p.id = new.referido_por and not p.bloqueado) then
    new.referido_por := null;
  end if;
  new.codigo_referido := public.generar_codigo_referido();
  return new;
end;
$$;

create trigger perfiles_validar_nuevo
  before insert on public.perfiles
  for each row execute function public.validar_perfil_nuevo();

-- ---------------------------------------------------------------------------
-- Roles
-- ---------------------------------------------------------------------------

-- Rol de quien hace la consulta (null si no tiene perfil o está bloqueado).
create or replace function public.mi_rol()
returns public.rol_persona
language sql
stable
security definer
set search_path = ''
as $$
  select p.rol from public.perfiles p where p.id = (select auth.uid()) and not p.bloqueado
$$;

create or replace function public.tengo_rol(roles public.rol_persona[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select public.mi_rol()) = any (roles), false)
$$;

-- ¿En qué territorio cae este punto? Lo usa «ubícame en el mapa» sin guardar nada.
create or replace function public.territorio_en_punto(lat double precision, lng double precision)
returns table (id integer, nombre text, slug text, tipo public.tipo_territorio)
language sql
stable
set search_path = ''
as $$
  select t.id, t.nombre, t.slug, t.tipo
  from public.territorios t
  where lat between -90 and 90 and lng between -180 and 180
    and extensions.st_contains(t.geom, extensions.st_setsrid(extensions.st_makepoint(lng, lat), 4326))
  order by t.es_demo, t.id
  limit 1
$$;

-- Id del vecino dueño de un código de «Sumar un vecino». Solo devuelve el id, nada más.
create or replace function public.id_por_codigo_referido(codigo text)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select p.id from public.perfiles p
  where p.codigo_referido = upper(btrim(codigo)) and not p.bloqueado
$$;

-- ---------------------------------------------------------------------------
-- RLS y permisos
-- ---------------------------------------------------------------------------

alter table public.territorios enable row level security;
alter table public.perfiles enable row level security;
alter table public.consentimientos enable row level security;

-- Territorios: lectura pública; escritura solo admin.
revoke all on public.territorios from anon, authenticated;
grant select on public.territorios to anon, authenticated;
grant insert, update, delete on public.territorios to authenticated;

create policy territorios_leer on public.territorios
  for select to anon, authenticated using (true);
create policy territorios_admin_insertar on public.territorios
  for insert to authenticated with check ((select public.tengo_rol('{admin}')));
create policy territorios_admin_editar on public.territorios
  for update to authenticated using ((select public.tengo_rol('{admin}'))) with check ((select public.tengo_rol('{admin}')));
create policy territorios_admin_borrar on public.territorios
  for delete to authenticated using ((select public.tengo_rol('{admin}')));

-- Perfiles: cada quien lee y edita el suyo; el equipo (no coordinador por ahora) puede leer.
-- Columnas sensibles (rol, bloqueado, codigo_referido, referido_por en edición) no se pueden escribir desde la API.
revoke all on public.perfiles from anon, authenticated;
grant select on public.perfiles to authenticated;
grant insert (id, nombre_mostrar, territorio_id, cuadra_h3, punto_cuadra, rango_edad, referido_por, tamano_letra)
  on public.perfiles to authenticated;
grant update (nombre_mostrar, territorio_id, cuadra_h3, punto_cuadra, rango_edad, tamano_letra)
  on public.perfiles to authenticated;

create policy perfiles_leer_propio on public.perfiles
  for select to authenticated using (id = (select auth.uid()));
create policy perfiles_leer_equipo on public.perfiles
  for select to authenticated using ((select public.tengo_rol('{admin,moderador,analista}')));
create policy perfiles_crear_propio on public.perfiles
  for insert to authenticated with check (id = (select auth.uid()));
create policy perfiles_editar_propio on public.perfiles
  for update to authenticated
  using (id = (select auth.uid()) and not bloqueado)
  with check (id = (select auth.uid()));

-- Consentimientos: cada quien crea y lee los suyos. Nunca se editan ni se borran desde la API.
revoke all on public.consentimientos from anon, authenticated;
grant select on public.consentimientos to authenticated;
grant insert (perfil_id, version_politica, acepta_tratamiento, acepta_mostrar_nombre, acepta_whatsapp, ip_hash, user_agent)
  on public.consentimientos to authenticated;

create policy consentimientos_leer_propio on public.consentimientos
  for select to authenticated using (perfil_id = (select auth.uid()));
create policy consentimientos_crear_propio on public.consentimientos
  for insert to authenticated with check (perfil_id = (select auth.uid()));

revoke all on public.consentimiento_vigente from anon, authenticated;
grant select on public.consentimiento_vigente to authenticated;

-- Funciones: solo las que la app necesita, con los roles justos.
revoke execute on function public.generar_codigo_referido() from public, anon, authenticated;
revoke execute on function public.asignar_territorio() from public, anon, authenticated;
revoke execute on function public.validar_perfil_nuevo() from public, anon, authenticated;
revoke execute on function public.tocar_actualizado_en() from public, anon, authenticated;
revoke execute on function public.mi_rol() from public, anon;
revoke execute on function public.tengo_rol(public.rol_persona[]) from public, anon;
grant execute on function public.mi_rol() to authenticated;
grant execute on function public.tengo_rol(public.rol_persona[]) to authenticated;
grant execute on function public.territorio_en_punto(double precision, double precision) to anon, authenticated;
revoke execute on function public.id_por_codigo_referido(text) from public, anon;
grant execute on function public.id_por_codigo_referido(text) to authenticated;
