-- ============================================================================
-- Exhibición prioritaria (sección 6.4).
-- Se cargan las 676 ocupaciones; esta marca decide cuáles se muestran PRIMERO
-- en el producto (clúster administrativo, TI, ventas, transporte). No afecta la
-- carga, solo el orden de exhibición. La llena el paso 3 de la ingesta DANE.
-- ============================================================================

alter table pathways
  add column if not exists is_priority_display boolean not null default false;

comment on column pathways.is_priority_display is
  'Trayectoria destacada para exhibición inicial en el producto (sección 6.4). No implica prioridad de carga.';
