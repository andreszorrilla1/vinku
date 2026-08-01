-- Generado por scripts/ingesta-dane/3-generar-sql.ts.
-- 26 Áreas de Cualificación de la CUOC (puente al marco de cualificaciones).
-- mnc_level y sectoral_catalog_name quedan NULL: NO están en este archivo. Se completan
-- al ingresar el Marco Nacional de Cualificaciones y el catálogo sectorial (regla 7.4).

-- Idempotente (qualifications.name no es único): inserta solo lo que falta.
insert into qualifications (name, sector)
select v.name, v.sector from (values
  ('Actividades físicas, deportivas y recreativas', 'Actividades físicas, deportivas y recreativas'),
  ('Administración, finanzas y derecho', 'Administración, finanzas y derecho'),
  ('Agropecuario, silvicultura, pesca, acuicultura y veterinaria', 'Agropecuario, silvicultura, pesca, acuicultura y veterinaria'),
  ('Artes visuales, plásticas y del patrimonio cultural', 'Artes visuales, plásticas y del patrimonio cultural'),
  ('Audiovisuales, Artes Escénicas y Música', 'Audiovisuales, Artes Escénicas y Música'),
  ('Ciencias naturales, matemáticas y estadística', 'Ciencias naturales, matemáticas y estadística'),
  ('Ciencias sociales y humanidades', 'Ciencias sociales y humanidades'),
  ('Comercio, mercadeo y publicidad', 'Comercio, mercadeo y publicidad'),
  ('Conservación, protección y saneamiento ambiental', 'Conservación, protección y saneamiento ambiental'),
  ('Construcción e infraestructura', 'Construcción e infraestructura'),
  ('Educación y formación', 'Educación y formación'),
  ('Elaboración y transformación de alimentos', 'Elaboración y transformación de alimentos'),
  ('Electrónica y automatización', 'Electrónica y automatización'),
  ('Exploración y extracción de minas, canteras, petróleo y gas', 'Exploración y extracción de minas, canteras, petróleo y gas'),
  ('Fabricación, transformación de materiales, instalación, mantenimiento y reparación', 'Fabricación, transformación de materiales, instalación, mantenimiento y reparación'),
  ('Industria química', 'Industria química'),
  ('Literatura y artes gráficas', 'Literatura y artes gráficas'),
  ('Logística y transporte', 'Logística y transporte'),
  ('Producción de energía y electricidad', 'Producción de energía y electricidad'),
  ('Salud y bienestar', 'Salud y bienestar'),
  ('Seguridad', 'Seguridad'),
  ('Servicios Personales y a la Comunidad', 'Servicios Personales y a la Comunidad'),
  ('Tecnologías de la información y las comunicaciones', 'Tecnologías de la información y las comunicaciones'),
  ('Textil, cuero, confección y diseño de modas', 'Textil, cuero, confección y diseño de modas'),
  ('Transformación de la madera y fabricación de muebles', 'Transformación de la madera y fabricación de muebles'),
  ('Turismo, hotelería y gastronomía', 'Turismo, hotelería y gastronomía')
) as v(name, sector)
where not exists (select 1 from qualifications q where q.name = v.name);

-- Vincula cada ocupación con su Área de Cualificación (por nombre de sector).
update pathways p set qualification_id = q.id
from qualifications q
where p.pathway_type = 'rol_cuoc' and p.sector = q.name and p.qualification_id is null;
