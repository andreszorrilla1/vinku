-- ============================================================================
-- Perfil ocupacional COMPLETO del CUOC como JSONB en cada pathway.
-- Guarda los 11 componentes del perfil DANE sin excluir ninguno: jerarquía,
-- descripción, funciones, denominaciones, conocimientos, destrezas, ocupaciones
-- afines, área de cualificación principal y complementaria, y equivalencias
-- (CIUO-08 / CNO). Es dato de referencia de la ocupación (fuente DANE), distinto
-- del catálogo controlado de `skills`.
-- La llena el paso 3 de la ingesta DANE.
-- ============================================================================

alter table pathways
  add column if not exists cuoc_profile jsonb;

comment on column pathways.cuoc_profile is
  'Perfil ocupacional completo del CUOC 2025 (fuente DANE): jerarquía, funciones, denominaciones, conocimientos, destrezas, ocupaciones afines, áreas de cualificación y equivalencias CIUO-08/CNO.';

-- Índice GIN para consultar dentro del perfil (ej. buscar por función o denominación).
create index if not exists idx_pathways_cuoc_profile on pathways using gin (cuoc_profile);
