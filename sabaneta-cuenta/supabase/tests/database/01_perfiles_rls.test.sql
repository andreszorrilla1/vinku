-- Pruebas de Fase 1: territorios, perfiles, consentimientos y RLS por rol.
begin;
create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(37);

-- ---------------------------------------------------------------------------
-- Preparación (como dueño, sin RLS)
-- ---------------------------------------------------------------------------
create function pg_temp.usuario(telefono text) returns uuid language sql as $$
  insert into auth.users (id, instance_id, aud, role, phone, phone_confirmed_at, created_at, updated_at)
  values (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', telefono, now(), now(), now())
  returning id
$$;

create function pg_temp.como(uid uuid) returns void language plpgsql as $$
begin
  if uid is null then
    perform set_config('request.jwt.claims', '{"role":"anon"}', true);
    set local role anon;
  else
    perform set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, true);
    set local role authenticated;
  end if;
end $$;

create temp table ids as
select
  pg_temp.usuario('573000000001') as ana,
  pg_temp.usuario('573000000002') as beto,
  pg_temp.usuario('573000000003') as admin,
  pg_temp.usuario('573000000004') as moderador,
  pg_temp.usuario('573000000005') as analista,
  pg_temp.usuario('573000000006') as coordinador;
grant select on ids to anon, authenticated;

-- Beto y el equipo ya tienen consentimiento y perfil
insert into consentimientos (perfil_id, version_politica, acepta_tratamiento, acepta_mostrar_nombre, acepta_whatsapp)
select u, 'prueba', true, false, false from ids, unnest(array[beto, admin, moderador, analista, coordinador]) u;
insert into perfiles (id, nombre_mostrar, territorio_id) select beto, 'Beto', 1 from ids;
insert into perfiles (id, nombre_mostrar, territorio_id) select admin, 'Admin', 1 from ids;
insert into perfiles (id, nombre_mostrar, territorio_id) select moderador, 'Moderadora', 1 from ids;
insert into perfiles (id, nombre_mostrar, territorio_id) select analista, 'Analista', 1 from ids;
insert into perfiles (id, nombre_mostrar, territorio_id) select coordinador, 'Coordinador', 2 from ids;
update perfiles set rol = 'admin' where id = (select admin from ids);
update perfiles set rol = 'moderador' where id = (select moderador from ids);
update perfiles set rol = 'analista' where id = (select analista from ids);
update perfiles set rol = 'coordinador' where id = (select coordinador from ids);

-- ---------------------------------------------------------------------------
-- Estructura
-- ---------------------------------------------------------------------------
select is(
  (select count(*)::int from pg_tables where schemaname = 'public' and not rowsecurity), 0,
  'RLS activo en todas las tablas de public');
select hasnt_column('public', 'perfiles', 'telefono', 'perfiles no guarda el celular');
select hasnt_column('public', 'perfiles', 'phone', 'perfiles no guarda el celular (phone)');

-- ---------------------------------------------------------------------------
-- Anónimo
-- ---------------------------------------------------------------------------
select pg_temp.como(null);
select is((select count(*)::int from territorios), 3, 'anónimo lee los territorios');
select throws_ok('select * from perfiles', '42501', null, 'anónimo no lee perfiles');
select throws_ok('select * from consentimientos', '42501', null, 'anónimo no lee consentimientos');
select is((select slug from territorio_en_punto(6.150, -75.615)), 'demo-centro', 'anónimo puede ubicar un punto');
select is((select count(*)::int from territorio_en_punto(4.60, -74.08)), 0, 'Bogotá no cae en ningún territorio');
select throws_ok($$select id_por_codigo_referido('ABCDEF')$$, '42501', null, 'anónimo no resuelve códigos de referido');
select throws_ok(
  $$insert into territorios (nombre, slug, tipo, geom) values ('X', 'x', 'barrio', st_multi(st_makeenvelope(0,0,1,1,4326)))$$,
  '42501', null, 'anónimo no crea territorios');
reset role;

-- ---------------------------------------------------------------------------
-- Vecina nueva (Ana)
-- ---------------------------------------------------------------------------
select pg_temp.como((select ana from ids));
select throws_ok(
  format('insert into perfiles (id, nombre_mostrar, territorio_id) values (%L, %L, 1)', (select ana from ids), 'Ana'),
  'P0001', 'Primero acepta el tratamiento de tus datos.', 'sin consentimiento no hay perfil');
select throws_ok(
  format($$insert into consentimientos (perfil_id, version_politica, acepta_tratamiento, acepta_mostrar_nombre, acepta_whatsapp)
           values (%L, 'v1', true, false, false)$$, (select beto from ids)),
  '42501', null, 'no puede registrar consentimiento por otra persona');
select throws_ok(
  format($$insert into consentimientos (perfil_id, version_politica, acepta_tratamiento, acepta_mostrar_nombre, acepta_whatsapp)
           values (%L, 'v1', false, false, false)$$, (select ana from ids)),
  '23514', null, 'el tratamiento de datos debe aceptarse');
select lives_ok(
  format($$insert into consentimientos (perfil_id, version_politica, acepta_tratamiento, acepta_mostrar_nombre, acepta_whatsapp)
           values (%L, 'v1', true, true, false)$$, (select ana from ids)),
  'registra su consentimiento');
select is((select acepta_mostrar_nombre from consentimiento_vigente), true, 've su consentimiento vigente');
select throws_ok('update consentimientos set acepta_whatsapp = true', '42501', null, 'el consentimiento no se edita');
select throws_ok('delete from consentimientos', '42501', null, 'el consentimiento no se borra');

select throws_ok(
  format($$insert into perfiles (id, nombre_mostrar, territorio_id, punto_cuadra, cuadra_h3)
           values (%L, 'Ana', 1, st_setsrid(st_makepoint(-74.08, 4.60), 4326), '8a2a1072b59ffff')$$, (select ana from ids)),
  'P0001', 'Ese punto queda fuera de Sabaneta.', 'un punto fuera de Sabaneta se rechaza');
select throws_ok(
  format($$insert into perfiles (id, nombre_mostrar, territorio_id, rol) values (%L, 'Ana', 1, 'admin')$$, (select ana from ids)),
  '42501', null, 'no puede darse un rol al crear su perfil');
select throws_ok(
  format($$insert into perfiles (id, nombre_mostrar, territorio_id) values (%L, 'Ana', 1)$$, (select beto from ids)),
  '42501', null, 'no puede crear el perfil de otra persona');
select lives_ok(
  format($$insert into perfiles (id, nombre_mostrar, territorio_id, punto_cuadra, cuadra_h3, referido_por)
           values (%L, 'Ana', 1, st_setsrid(st_makepoint(-75.615, 6.150), 4326), '8a66e0d5a6dffff', %L)$$,
         (select ana from ids), (select beto from ids)),
  'crea su perfil con punto de cuadra y quien la invitó');

select is((select territorio_id from perfiles where id = (select ana from ids)), 2, 'el barrio sale del punto, no de lo que manda el cliente');
select is((select rol::text from perfiles where id = (select ana from ids)), 'vecino', 'queda como vecina');
select matches((select codigo_referido from perfiles where id = (select ana from ids)), '^[A-HJ-NP-Z2-9]{6}$', 'recibe un código de referido corto');
select is((select referido_por from perfiles where id = (select ana from ids)), (select beto from ids), 'guarda quién la invitó');
select is(
  id_por_codigo_referido(lower((select codigo_referido from perfiles where id = (select ana from ids)))),
  (select ana from ids), 'el código de referido se resuelve sin importar mayúsculas');
select is((select count(*)::int from perfiles), 1, 'solo ve su propio perfil');
select throws_ok($$update perfiles set rol = 'admin'$$, '42501', null, 'no puede cambiar su rol');
select throws_ok($$update perfiles set bloqueado = false$$, '42501', null, 'no puede quitarse un bloqueo');
select lives_ok($$update perfiles set nombre_mostrar = 'Ana María', tamano_letra = 'grande'$$, 'edita su nombre y tamaño de letra');
select lives_ok(
  format($$update perfiles set nombre_mostrar = 'Hackeado' where id = %L$$, (select beto from ids)),
  'intentar editar a Beto no da error, pero no toca nada');
select is(
  (select count(*)::int from (select 1 from perfiles where id = (select beto from ids)) x), 0,
  'no ve el perfil de Beto');
reset role;
select is((select nombre_mostrar from perfiles where id = (select beto from ids)), 'Beto', 'intentar editar a Beto no cambia nada');

-- ---------------------------------------------------------------------------
-- Equipo
-- ---------------------------------------------------------------------------
select pg_temp.como((select admin from ids));
select is((select count(*)::int from perfiles), 6, 'admin lee todos los perfiles');
reset role;
select pg_temp.como((select moderador from ids));
select is((select count(*)::int from perfiles), 6, 'moderador lee todos los perfiles');
reset role;
select pg_temp.como((select coordinador from ids));
select is((select count(*)::int from perfiles), 1, 'coordinador (por ahora) solo ve su perfil');
select throws_ok(
  $$insert into territorios (nombre, slug, tipo, geom) values ('X', 'x', 'barrio', st_multi(st_makeenvelope(0,0,1,1,4326)))$$,
  '42501', null, 'coordinador no crea territorios');
reset role;

select * from finish();
rollback;
