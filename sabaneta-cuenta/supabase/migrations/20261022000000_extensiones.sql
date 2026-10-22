-- Fase 0: extensiones base de Sabaneta Cuenta.
-- PostGIS para barrios, veredas y puntos en el mapa; pgcrypto para tokens y hashes.
-- Se instalan en el esquema `extensions` (convención de Supabase) para no ensuciar `public`.

create extension if not exists postgis with schema extensions;
create extension if not exists pgcrypto with schema extensions;

-- Por defecto nadie fuera del dueño crea objetos en public; las tablas llegan con sus propias migraciones y RLS.
revoke create on schema public from public;
