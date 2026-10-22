-- Datos semilla de Sabaneta Cuenta (solo desarrollo y staging).
-- Nunca se cargan aquí datos reales de personas.
--
-- Territorios [DEMO]: rectángulos aproximados dentro del casco urbano de Sabaneta.
-- NO son barrios reales. Los oficiales se cargan con scripts/importar-territorios.mts
-- desde el GeoJSON de Planeación.

insert into public.territorios (nombre, slug, tipo, geom, es_demo)
values
  ('Barrio Demo Norte [DEMO]', 'demo-norte', 'barrio',
    extensions.st_multi(extensions.st_makeenvelope(-75.625, 6.155, -75.605, 6.165, 4326)), true),
  ('Barrio Demo Centro [DEMO]', 'demo-centro', 'barrio',
    extensions.st_multi(extensions.st_makeenvelope(-75.625, 6.145, -75.605, 6.155, 4326)), true),
  ('Vereda Demo Sur [DEMO]', 'demo-sur', 'vereda',
    extensions.st_multi(extensions.st_makeenvelope(-75.625, 6.130, -75.605, 6.145, 4326)), true)
on conflict (slug) do nothing;
