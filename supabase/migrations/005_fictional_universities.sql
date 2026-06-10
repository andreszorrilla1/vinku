-- Limpiar universidades y cursos reales de prueba
DELETE FROM courses WHERE university_id IN (
  '10000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000004',
  '10000000-0000-0000-0000-000000000005'
);
DELETE FROM universities WHERE id IN (
  '10000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000004',
  '10000000-0000-0000-0000-000000000005'
);

-- 5 universidades ficticias para pruebas
INSERT INTO universities (id, name, logo_url, email_domain, approval_status, contact_email, total_earnings, liquid_balance) VALUES
  ('20000000-0000-0000-0000-000000000001', 'Universidad Andina del Futuro',   null, 'uaf.edu.co',    'Aprobada', 'alianzas@uaf.edu.co',    3200000, 2560000),
  ('20000000-0000-0000-0000-000000000002', 'Instituto Colombo Digital',       null, 'icd.edu.co',    'Aprobada', 'alianzas@icd.edu.co',    1850000, 1480000),
  ('20000000-0000-0000-0000-000000000003', 'Politécnico Innovación Sur',      null, 'pis.edu.co',    'Aprobada', 'alianzas@pis.edu.co',    2100000, 1680000),
  ('20000000-0000-0000-0000-000000000004', 'Academia Nexus Colombia',         null, 'nexus.edu.co',  'Aprobada', 'alianzas@nexus.edu.co',  980000,  784000),
  ('20000000-0000-0000-0000-000000000005', 'Escuela Superior Vértice',        null, 'vertice.edu.co','Aprobada', 'alianzas@vertice.edu.co',1540000, 1232000)
ON CONFLICT (id) DO NOTHING;

-- Cursos variados por categoría (3 por universidad = 15 cursos total, amplia cobertura)

-- Universidad Andina del Futuro — Tecnología & Datos
INSERT INTO courses (university_id, title, description, level, duration, cost_credits, skills, category, is_active) VALUES
  ('20000000-0000-0000-0000-000000000001','Desarrollo Full Stack con React y Node.js','Construye aplicaciones web completas con React 19, Node, PostgreSQL y deploy en Vercel.','Educación Continua','8 Semanas',420000,ARRAY['React','Node.js','PostgreSQL','API REST'],'Tecnología',true),
  ('20000000-0000-0000-0000-000000000001','Arquitectura Cloud & DevOps','Diseña infraestructura escalable en AWS/GCP. CI/CD, Docker, Kubernetes y monitoreo.','Posgrado','10 Semanas',580000,ARRAY['AWS','Docker','Kubernetes','CI/CD','Terraform'],'Tecnología',true),
  ('20000000-0000-0000-0000-000000000001','Machine Learning Aplicado a Negocios','Modelos predictivos con Python, scikit-learn y casos reales de la industria colombiana.','Educación Continua','12 Semanas',520000,ARRAY['Python','scikit-learn','Pandas','Modelos Predictivos'],'Datos & IA',true);

-- Instituto Colombo Digital — Marketing & Negocios
INSERT INTO courses (university_id, title, description, level, duration, cost_credits, skills, category, is_active) VALUES
  ('20000000-0000-0000-0000-000000000002','Growth Marketing & Analítica Digital','Estrategias de crecimiento, Google Ads, Meta Ads, SEO técnico y dashboards de analítica.','Educación Continua','6 Semanas',310000,ARRAY['SEO','Google Ads','Meta Ads','Google Analytics','Growth Hacking'],'Marketing & Ventas',true),
  ('20000000-0000-0000-0000-000000000002','Diseño UX/UI y Product Design','Design Thinking, Figma, prototipado, investigación de usuarios y sistemas de diseño.','Educación Continua','8 Semanas',360000,ARRAY['Figma','Design Thinking','Prototipado','UX Research'],'Diseño & Creatividad',true),
  ('20000000-0000-0000-0000-000000000002','Comunicación Estratégica y Marca Personal','Storytelling, presentaciones ejecutivas, LinkedIn y construcción de autoridad profesional.','Educación Continua','4 Semanas',220000,ARRAY['Storytelling','LinkedIn','Personal Branding','Comunicación Ejecutiva'],'Habilidades Blandas',true);

-- Politécnico Innovación Sur — Finanzas & Gestión
INSERT INTO courses (university_id, title, description, level, duration, cost_credits, skills, category, is_active) VALUES
  ('20000000-0000-0000-0000-000000000003','Finanzas para No Financieros','Lectura de estados financieros, presupuestación, flujo de caja y valoración de proyectos.','Educación Continua','5 Semanas',290000,ARRAY['Análisis Financiero','Presupuestación','Valoración DCF','Excel Financiero'],'Finanzas & Inversión',true),
  ('20000000-0000-0000-0000-000000000003','Gestión de Proyectos Ágiles (PMP + Scrum)','Metodologías ágiles, gestión de stakeholders, planificación y entrega de proyectos.','Educación Continua','6 Semanas',340000,ARRAY['Scrum','Kanban','PMP','Gestión del Riesgo','Jira'],'Gestión & Liderazgo',true),
  ('20000000-0000-0000-0000-000000000003','Emprendimiento e Innovación Corporativa','Lean Startup, validación de ideas, pitch deck, modelos de negocio y acceso a capital.','Educación Continua','7 Semanas',380000,ARRAY['Lean Startup','Business Model Canvas','Pitch','Innovación'],'Emprendimiento',true);

-- Academia Nexus Colombia — Ciberseguridad & Legal
INSERT INTO courses (university_id, title, description, level, duration, cost_credits, skills, category, is_active) VALUES
  ('20000000-0000-0000-0000-000000000004','Ciberseguridad Esencial para Empresas','Ethical hacking, gestión de riesgos, SIEM y cumplimiento normativo colombiano.','Educación Continua','8 Semanas',460000,ARRAY['Ethical Hacking','SIEM','ISO 27001','Gestión de Riesgos'],'Ciberseguridad',true),
  ('20000000-0000-0000-0000-000000000004','Derecho Digital y Protección de Datos','Habeas Data, GDPR aplicado a Colombia, contratos digitales y propiedad intelectual.','Educación Continua','4 Semanas',250000,ARRAY['Habeas Data','GDPR','Contratos Digitales','Propiedad Intelectual'],'Derecho & Cumplimiento',true),
  ('20000000-0000-0000-0000-000000000004','Inteligencia Artificial Generativa','Prompt engineering, LLMs, automatización con IA y aplicaciones para productividad empresarial.','Educación Continua','5 Semanas',390000,ARRAY['Prompt Engineering','LLMs','ChatGPT','Automatización IA'],'Datos & IA',true);

-- Escuela Superior Vértice — Salud & Sostenibilidad
INSERT INTO courses (university_id, title, description, level, duration, cost_credits, skills, category, is_active) VALUES
  ('20000000-0000-0000-0000-000000000005','Gestión en Salud y Transformación Digital','Sistemas de información en salud, telemedicina, IPS/EPS digitales y normativa colombiana.','Posgrado','10 Semanas',520000,ARRAY['Sistemas de Salud','Telemedicina','Historia Clínica Digital','Normativa IPS'],'Salud & Bienestar',true),
  ('20000000-0000-0000-0000-000000000005','Sostenibilidad y ESG para Empresas','Medición de huella de carbono, reportes GRI, estrategia ESG y financiamiento verde.','Educación Continua','6 Semanas',310000,ARRAY['ESG','Huella de Carbono','GRI','Finanzas Verdes'],'Sostenibilidad',true),
  ('20000000-0000-0000-0000-000000000005','Liderazgo Femenino y Diversidad Organizacional','Liderazgo inclusivo, brechas de género, negociación y construcción de equipos diversos.','Educación Continua','5 Semanas',280000,ARRAY['Liderazgo','Diversidad','Negociación','Inclusión'],'Gestión & Liderazgo',true);

-- 5 usuarios de prueba para admins universitarios
-- INSTRUCCIONES: Crear estos usuarios en Supabase Auth Dashboard > Users > Add User
-- Email verification: OFF para pruebas
-- Luego actualizar el university_id en profiles manualmente
--
-- Usuario 1: admin.uaf@demo.vinkupass.com       | Contraseña: Demo2024! | Universidad: Andina del Futuro (20000000-...-001)
-- Usuario 2: admin.icd@demo.vinkupass.com       | Contraseña: Demo2024! | Universidad: Colombo Digital (20000000-...-002)
-- Usuario 3: admin.pis@demo.vinkupass.com       | Contraseña: Demo2024! | Universidad: Politécnico Innovación Sur (20000000-...-003)
-- Usuario 4: admin.nexus@demo.vinkupass.com     | Contraseña: Demo2024! | Universidad: Academia Nexus (20000000-...-004)
-- Usuario 5: admin.vertice@demo.vinkupass.com   | Contraseña: Demo2024! | Universidad: Escuela Superior Vértice (20000000-...-005)
--
-- Después de crear los usuarios, ejecutar:
-- UPDATE profiles SET university_id = '20000000-0000-0000-0000-000000000001', role = 'university_admin' WHERE email = 'admin.uaf@demo.vinkupass.com';
-- UPDATE profiles SET university_id = '20000000-0000-0000-0000-000000000002', role = 'university_admin' WHERE email = 'admin.icd@demo.vinkupass.com';
-- UPDATE profiles SET university_id = '20000000-0000-0000-0000-000000000003', role = 'university_admin' WHERE email = 'admin.pis@demo.vinkupass.com';
-- UPDATE profiles SET university_id = '20000000-0000-0000-0000-000000000004', role = 'university_admin' WHERE email = 'admin.nexus@demo.vinkupass.com';
-- UPDATE profiles SET university_id = '20000000-0000-0000-0000-000000000005', role = 'university_admin' WHERE email = 'admin.vertice@demo.vinkupass.com';
