-- ============================================================
-- Campus Pass by VinkU — Seed Data
-- Universidades placeholder reales (sin datos ficticios)
-- ============================================================

-- IMPORTANTE: Ejecutar después de crear la primera cuenta superadmin
-- y actualizar su universidad_id según corresponda.

insert into universities (id, name, logo_url, email_domain, approval_status, contact_email) values
  ('10000000-0000-0000-0000-000000000001', 'Universidad de Los Andes',       null, 'uniandes.edu.co',    'Aprobada', 'alianzas@uniandes.edu.co'),
  ('10000000-0000-0000-0000-000000000002', 'Universidad Pontificia Bolivariana', null, 'upb.edu.co',     'Aprobada', 'alianzas@upb.edu.co'),
  ('10000000-0000-0000-0000-000000000003', 'EAFIT',                           null, 'eafit.edu.co',      'Aprobada', 'alianzas@eafit.edu.co'),
  ('10000000-0000-0000-0000-000000000004', 'Universidad de La Sabana',        null, 'unisabana.edu.co',  'Aprobada', 'alianzas@unisabana.edu.co'),
  ('10000000-0000-0000-0000-000000000005', 'Universidad Nacional de Colombia',null, 'unal.edu.co',       'Aprobada', 'alianzas@unal.edu.co')
on conflict (id) do nothing;

-- Cursos de ejemplo por universidad
insert into courses (university_id, title, description, level, duration, cost_credits, skills, category) values
  (
    '10000000-0000-0000-0000-000000000001',
    'Arquitectura e Integración de Sistemas en la Nube',
    'Aprende a diseñar e integrar soluciones cloud escalables con AWS, Azure y GCP.',
    'Educación Continua', '6 Semanas', 450000,
    array['Cloud Architecture', 'AWS', 'API Design'],
    'Tecnología'
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    'Liderazgo y Gestión de Equipos de Alto Rendimiento',
    'Desarrolla habilidades de liderazgo transformacional para equipos multiculturales.',
    'Educación Continua', '4 Semanas', 320000,
    array['Liderazgo', 'Gestión de Equipos', 'Comunicación Asertiva'],
    'Gestión'
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    'Finanzas Corporativas y Valoración de Empresas',
    'Modelos financieros, valoración DCF, M&A y análisis de riesgo.',
    'Posgrado', '8 Semanas', 580000,
    array['Finanzas', 'Modelado Financiero', 'Valoración DCF'],
    'Finanzas'
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    'Marketing Digital y Estrategia de Contenidos',
    'SEO, SEM, redes sociales y analítica para marcas que quieren crecer en Colombia.',
    'Educación Continua', '5 Semanas', 280000,
    array['SEO', 'Google Ads', 'Analítica Web', 'Copywriting'],
    'Marketing'
  ),
  (
    '10000000-0000-0000-0000-000000000005',
    'Ciencia de Datos con Python para Negocios',
    'Pandas, scikit-learn, visualización y casos de uso reales en industria colombiana.',
    'Educación Continua', '10 Semanas', 420000,
    array['Python', 'Machine Learning', 'Data Visualization'],
    'Datos'
  );
