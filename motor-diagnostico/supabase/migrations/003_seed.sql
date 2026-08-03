-- ============================================================================
-- Seed de ejemplo — Motor de Autodiagnóstico VinkU
--
-- Suficiente para recorrer el vertical completo (propósito → CV → confirmación
-- → resultado) sin la ingesta DANE de 676 ocupaciones (esa llega en otra fase).
--
-- Incluye:
--   - Habilidades duras y blandas de origen CUOC (subconjunto de demostración)
--   - Las 15 competencias EntreComp como skills 'power'
--   - 3 trayectorias rol_cuoc de ejemplo (clúster administrativo, ventas, TI)
--   - Las 3 trayectorias objetivo_no_ocupacional (emprendimiento)
--
-- ADVERTENCIA sobre EntreComp: los nombres de las 15 competencias reflejan la
-- estructura general del marco (Bacigalupo et al., 2016) pero deben confirmarse
-- contra la guía oficial "EntreComp en acción" antes de fijarse como definitivos.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Habilidades de origen CUOC — DURAS (hard)
-- ---------------------------------------------------------------------------
insert into skills (name, skill_type, description, source_reference) values
  ('Manejo de inventarios',            'hard', 'Registro, control y rotación de existencias.',             'CUOC (demo)'),
  ('Contabilidad básica',              'hard', 'Registro de operaciones, causación y conciliaciones.',      'CUOC (demo)'),
  ('Manejo de Excel',                  'hard', 'Hojas de cálculo, fórmulas y tablas dinámicas.',            'CUOC (demo)'),
  ('Facturación electrónica',          'hard', 'Emisión y gestión de facturación conforme a normativa.',    'CUOC (demo)'),
  ('Atención al cliente',              'hard', 'Gestión de solicitudes, reclamos y postventa.',             'CUOC (demo)'),
  ('Técnicas de venta',                'hard', 'Prospección, cierre y manejo de objeciones.',               'CUOC (demo)'),
  ('Manejo de CRM',                    'hard', 'Registro y seguimiento de oportunidades comerciales.',      'CUOC (demo)'),
  ('Soporte técnico de hardware',      'hard', 'Diagnóstico y reparación de equipos.',                      'CUOC (demo)'),
  ('Administración de redes',          'hard', 'Configuración y mantenimiento de redes LAN/WAN.',           'CUOC (demo)'),
  ('Costeo de productos y servicios',  'hard', 'Estructura de costos, márgenes y punto de equilibrio.',     'CUOC (demo)');

-- ---------------------------------------------------------------------------
-- Habilidades transversales — BLANDAS (soft)
-- ---------------------------------------------------------------------------
insert into skills (name, skill_type, description, source_reference) values
  ('Trabajo en equipo',        'soft', 'Colaboración orientada a un objetivo común.',        'CUOC transversal (demo)'),
  ('Comunicación asertiva',    'soft', 'Expresar ideas con claridad y respeto.',             'CUOC transversal (demo)'),
  ('Orientación al servicio',  'soft', 'Disposición a resolver necesidades de otros.',       'CUOC transversal (demo)'),
  ('Trabajo bajo presión',     'soft', 'Desempeño sostenido ante exigencia o urgencia.',     'CUOC transversal (demo)'),
  ('Organización del tiempo',  'soft', 'Priorización y cumplimiento de plazos.',             'CUOC transversal (demo)');

-- ---------------------------------------------------------------------------
-- Habilidades POWER — potencialmente reclasificables desde 'soft' por VinkU
-- ---------------------------------------------------------------------------
insert into skills (name, skill_type, description, source_reference) values
  ('Liderazgo',                     'power', 'Guiar e influir en un equipo hacia un objetivo.',     'CUOC transversal → power (demo)'),
  ('Pensamiento crítico',           'power', 'Analizar información y decidir con criterio.',         'CUOC transversal → power (demo)');

-- ---------------------------------------------------------------------------
-- Las 15 competencias EntreComp (Comisión Europea, 2016) como skills 'power'.
-- source_reference exacto exigido por la regla de honestidad regulatoria.
-- ---------------------------------------------------------------------------
insert into skills (name, skill_type, description, source_reference) values
  ('Detectar oportunidades',                     'power', 'EntreComp · Ideas y oportunidades',   'EntreComp - Comisión Europea 2016, vía OIT/Cinterfor'),
  ('Creatividad',                                'power', 'EntreComp · Ideas y oportunidades',   'EntreComp - Comisión Europea 2016, vía OIT/Cinterfor'),
  ('Visión',                                     'power', 'EntreComp · Ideas y oportunidades',   'EntreComp - Comisión Europea 2016, vía OIT/Cinterfor'),
  ('Valorar ideas',                              'power', 'EntreComp · Ideas y oportunidades',   'EntreComp - Comisión Europea 2016, vía OIT/Cinterfor'),
  ('Pensamiento ético y sostenible',             'power', 'EntreComp · Ideas y oportunidades',   'EntreComp - Comisión Europea 2016, vía OIT/Cinterfor'),
  ('Autoconocimiento y autoeficacia',            'power', 'EntreComp · Recursos',                'EntreComp - Comisión Europea 2016, vía OIT/Cinterfor'),
  ('Motivación y perseverancia',                 'power', 'EntreComp · Recursos',                'EntreComp - Comisión Europea 2016, vía OIT/Cinterfor'),
  ('Movilización de recursos',                   'power', 'EntreComp · Recursos',                'EntreComp - Comisión Europea 2016, vía OIT/Cinterfor'),
  ('Educación financiera y económica',           'power', 'EntreComp · Recursos',                'EntreComp - Comisión Europea 2016, vía OIT/Cinterfor'),
  ('Movilizar a otros',                          'power', 'EntreComp · Recursos',                'EntreComp - Comisión Europea 2016, vía OIT/Cinterfor'),
  ('Tomar la iniciativa',                        'power', 'EntreComp · Pasar a la acción',       'EntreComp - Comisión Europea 2016, vía OIT/Cinterfor'),
  ('Planificación y gestión',                    'power', 'EntreComp · Pasar a la acción',       'EntreComp - Comisión Europea 2016, vía OIT/Cinterfor'),
  ('Manejo de la incertidumbre y el riesgo',     'power', 'EntreComp · Pasar a la acción',       'EntreComp - Comisión Europea 2016, vía OIT/Cinterfor'),
  ('Trabajar con otros',                         'power', 'EntreComp · Pasar a la acción',       'EntreComp - Comisión Europea 2016, vía OIT/Cinterfor'),
  ('Aprender de la experiencia',                 'power', 'EntreComp · Pasar a la acción',       'EntreComp - Comisión Europea 2016, vía OIT/Cinterfor');

-- ---------------------------------------------------------------------------
-- Trayectorias rol_cuoc (ejemplo — priorizadas para exhibición inicial)
-- employability_rank queda NULL: no se inventa; lo completa VinkU (sección 6.5).
-- ---------------------------------------------------------------------------
insert into pathways (pathway_type, name, cuoc_code, sector, competence_level, employability_rank) values
  ('rol_cuoc', 'Auxiliar contable',            '43110', 'Administrativo y financiero', 2, null),
  ('rol_cuoc', 'Vendedor / auxiliar de ventas','52230', 'Comercio y ventas',           2, null),
  ('rol_cuoc', 'Soporte técnico de TI',        '35120', 'Tecnología',                  3, null);

-- ---------------------------------------------------------------------------
-- Trayectorias objetivo_no_ocupacional (emprendimiento) — curadas por VinkU
-- ---------------------------------------------------------------------------
insert into pathways (pathway_type, name, objective_category, curated_by) values
  ('objetivo_no_ocupacional', 'Crear una empresa',                        'crear_empresa',                        'Equipo VinkU'),
  ('objetivo_no_ocupacional', 'Prestar servicios como independiente',     'prestacion_servicios_independiente',   'Equipo VinkU'),
  ('objetivo_no_ocupacional', 'Ofrecer consultoría',                      'consultoria',                          'Equipo VinkU');

-- ---------------------------------------------------------------------------
-- Requisitos de habilidad por trayectoria (pathway_skill_requirements)
-- Se resuelven por nombre para legibilidad del seed.
-- ---------------------------------------------------------------------------
-- helper inline: inserta (pathway, skill, requirement_type) por nombres
do $$
declare
  reqs record;
begin
  for reqs in
    select * from (values
      -- Auxiliar contable
      ('Auxiliar contable', 'Contabilidad básica',       'core'),
      ('Auxiliar contable', 'Manejo de Excel',           'core'),
      ('Auxiliar contable', 'Facturación electrónica',   'core'),
      ('Auxiliar contable', 'Organización del tiempo',   'deseable'),
      ('Auxiliar contable', 'Comunicación asertiva',     'deseable'),
      -- Vendedor / auxiliar de ventas
      ('Vendedor / auxiliar de ventas', 'Técnicas de venta',       'core'),
      ('Vendedor / auxiliar de ventas', 'Atención al cliente',     'core'),
      ('Vendedor / auxiliar de ventas', 'Manejo de CRM',           'deseable'),
      ('Vendedor / auxiliar de ventas', 'Orientación al servicio', 'core'),
      ('Vendedor / auxiliar de ventas', 'Comunicación asertiva',   'deseable'),
      -- Soporte técnico de TI
      ('Soporte técnico de TI', 'Soporte técnico de hardware', 'core'),
      ('Soporte técnico de TI', 'Administración de redes',     'core'),
      ('Soporte técnico de TI', 'Atención al cliente',         'deseable'),
      ('Soporte técnico de TI', 'Pensamiento crítico',         'deseable'),
      -- Crear una empresa (EntreComp core, sección 6)
      ('Crear una empresa', 'Detectar oportunidades',                 'core'),
      ('Crear una empresa', 'Visión',                                 'core'),
      ('Crear una empresa', 'Movilización de recursos',               'core'),
      ('Crear una empresa', 'Planificación y gestión',                'core'),
      ('Crear una empresa', 'Manejo de la incertidumbre y el riesgo', 'core'),
      -- Prestar servicios como independiente
      ('Prestar servicios como independiente', 'Autoconocimiento y autoeficacia',   'core'),
      ('Prestar servicios como independiente', 'Educación financiera y económica',  'core'),
      ('Prestar servicios como independiente', 'Tomar la iniciativa',               'core'),
      ('Prestar servicios como independiente', 'Aprender de la experiencia',        'core'),
      -- Ofrecer consultoría
      ('Ofrecer consultoría', 'Valorar ideas',                    'core'),
      ('Ofrecer consultoría', 'Movilizar a otros',                'core'),
      ('Ofrecer consultoría', 'Planificación y gestión',          'core'),
      ('Ofrecer consultoría', 'Pensamiento ético y sostenible',   'core')
    ) as t(pathway_name, skill_name, req_type)
  loop
    insert into pathway_skill_requirements (pathway_id, skill_id, requirement_type)
    select p.id, s.id, reqs.req_type
    from pathways p, skills s
    where p.name = reqs.pathway_name and s.name = reqs.skill_name;
  end loop;
end $$;
