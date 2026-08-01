// ============================================================================
// Paso 3 — Generar el SQL desde la propuesta YA REVISADA + los JSON del paso 1.
//
//   npm run dane:generar-sql
//     → supabase/migrations/010_dane_skills.sql
//     → supabase/migrations/011_dane_pathways.sql
//     → supabase/migrations/012_dane_cualificaciones.sql
//
// Único artefacto que inserta en `skills`, y solo con revisión humana de por
// medio (migración con service_role, no el flujo de IA). Requiere la columna
// is_priority_display (migración 004).
//
// requirement_type: el Excel no distingue core/deseable → todo 'core' por
// defecto. employability_rank y mnc_level quedan NULL (no están en el archivo;
// no se inventan). has_sectoral_qualification=false hasta ingresar el catálogo
// sectorial (regla 7.4: honestidad regulatoria).
// ============================================================================

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { desdeCSV } from './lib/normalizar.ts';
import { RUTAS } from './config.ts';
import type { Catalogo, OcupacionNormalizada, TipoSkillPropuesto } from './tipos.ts';

const APROBADO = /^(si|sí|s|yes|y|true|x|1)$/i;
const REQ_TYPE_DEFECTO = 'core';
const esc = (s: string) => (s ?? '').replace(/'/g, "''");

interface Aprobada { nombre: string; tipo: TipoSkillPropuesto; origen: string; dane_id: string }

function main() {
  for (const [ruta, hint] of [
    [RUTAS.propuestaRevisada, 'Revisa data/propuesta-skills.csv y guárdalo con ese nombre.'],
    [RUTAS.ocupaciones, 'Corre: npm run dane:parsear'],
    [RUTAS.catalogo, 'Corre: npm run dane:parsear'],
  ] as const) {
    if (!existsSync(ruta)) {
      console.error(`✗ Falta ${ruta}. ${hint}`);
      process.exit(1);
    }
  }

  const filas = desdeCSV(readFileSync(RUTAS.propuestaRevisada, 'utf8'));
  const ocupaciones: OcupacionNormalizada[] = JSON.parse(readFileSync(RUTAS.ocupaciones, 'utf8'));
  const catalogo: Catalogo = JSON.parse(readFileSync(RUTAS.catalogo, 'utf8'));

  // --- 1. Catálogo aprobado por ID de DANE (con fusiones) ---
  const tiposValidos = new Set<TipoSkillPropuesto>(['hard', 'soft', 'power']);
  const aprobadaPorId = new Map<string, Aprobada>();
  const fusionDe = new Map<string, string>(); // id → id destino

  for (const f of filas) {
    const id = (f.dane_id ?? '').trim();
    if (!id || !APROBADO.test((f.APROBAR ?? '').trim())) continue;
    const nombre = (f.nombre_canonico ?? '').trim();
    if (!nombre) continue;
    let tipo = (f.skill_type_final ?? f.tipo_sugerido ?? 'soft').trim() as TipoSkillPropuesto;
    if (!tiposValidos.has(tipo)) { console.warn(`⚠ Tipo inválido "${tipo}" en #${id} → 'soft'`); tipo = 'soft'; }
    const fusion = (f.fusionar_con ?? '').trim();
    if (fusion) fusionDe.set(id, fusion);
    else aprobadaPorId.set(id, { nombre, tipo, origen: (f.origen ?? '').trim(), dane_id: id });
  }

  const resolver = (id: string): string | null => {
    const destino = fusionDe.get(id) ?? id;
    if (aprobadaPorId.has(destino)) return destino;
    if (aprobadaPorId.has(id)) return id;
    return null;
  };
  const nombreDe = (id: string): string | null => {
    const r = resolver(id);
    return r ? aprobadaPorId.get(r)!.nombre : null;
  };

  // --- 2. SQL de skills ---
  const skills = [...aprobadaPorId.values()].sort((a, b) => a.nombre.localeCompare(b.nombre));
  const valoresSkills = skills
    .map((s) => {
      const etiqueta = s.origen === 'conocimientos' ? 'conocimiento' : 'destreza';
      const ref = `CUOC 2025 · DANE ${etiqueta} #${s.dane_id}`;
      return `  ('${esc(s.nombre)}', '${s.tipo}', '${esc(ref)}')`;
    })
    .join(',\n');
  writeFileSync(
    RUTAS.sqlSkills,
    `-- Generado por scripts/ingesta-dane/3-generar-sql.ts (propuesta REVISADA).\n` +
      `-- ${skills.length} habilidades aprobadas. ON CONFLICT (name) DO NOTHING.\n\n` +
      `insert into skills (name, skill_type, source_reference) values\n${valoresSkills}\non conflict (name) do nothing;\n`,
    'utf8',
  );

  // --- 3. SQL de pathways + requirements ---
  const valoresPathways = ocupaciones
    .filter((o) => o.codigo && o.nombre)
    .map((o) => {
      const nivel = o.nivel_competencia == null ? 'null' : String(o.nivel_competencia);
      const sector = o.area_cualificacion ? `'${esc(o.area_cualificacion)}'` : 'null';
      return `  ('rol_cuoc', '${esc(o.nombre)}', '${esc(o.codigo)}', ${sector}, ${nivel}, ${o.es_prioritaria})`;
    })
    .join(',\n');

  const reqValores: string[] = [];
  const vistos = new Set<string>();
  for (const o of ocupaciones) {
    if (!o.codigo) continue;
    for (const ref of [...o.conocimientos, ...o.destrezas]) {
      const rid = resolver(ref.id);
      const nombre = rid ? nombreDe(ref.id) : null;
      if (!rid || !nombre) continue;
      const k = `${o.codigo}::${rid}`;
      if (vistos.has(k)) continue;
      vistos.add(k);
      reqValores.push(`  ('${esc(o.codigo)}', '${esc(nombre)}', '${REQ_TYPE_DEFECTO}')`);
    }
  }

  writeFileSync(
    RUTAS.sqlPathways,
    `-- Generado por scripts/ingesta-dane/3-generar-sql.ts.\n` +
      `-- ${ocupaciones.length} ocupaciones CUOC como pathways rol_cuoc. Requiere migración 004.\n` +
      `-- employability_rank NULL (no está en el Excel; lo completa VinkU, 6.5).\n\n` +
      `insert into pathways (pathway_type, name, cuoc_code, sector, competence_level, is_priority_display) values\n` +
      `${valoresPathways}\non conflict (cuoc_code) do nothing;\n\n` +
      `-- Requisitos (todos 'core'; el Excel no distingue core/deseable).\n` +
      `insert into pathway_skill_requirements (pathway_id, skill_id, requirement_type)\n` +
      `select p.id, s.id, v.req_type\n` +
      `from (values\n${reqValores.join(',\n')}\n) as v(cuoc_code, skill_name, req_type)\n` +
      `join pathways p on p.cuoc_code = v.cuoc_code\n` +
      `join skills s on s.name = v.skill_name\n` +
      `on conflict (pathway_id, skill_id) do nothing;\n`,
    'utf8',
  );

  // --- 4. SQL de áreas de cualificación (puente al marco de cualificaciones) ---
  const valoresQual = catalogo.areas
    .map((a) => `  ('${esc(a.nombre)}', '${esc(a.nombre)}')`)
    .join(',\n');
  writeFileSync(
    RUTAS.sqlCualificaciones,
    `-- Generado por scripts/ingesta-dane/3-generar-sql.ts.\n` +
      `-- ${catalogo.areas.length} Áreas de Cualificación de la CUOC (puente al marco de cualificaciones).\n` +
      `-- mnc_level y sectoral_catalog_name quedan NULL: NO están en este archivo. Se completan\n` +
      `-- al ingresar el Marco Nacional de Cualificaciones y el catálogo sectorial (regla 7.4).\n\n` +
      `-- Idempotente (qualifications.name no es único): inserta solo lo que falta.\n` +
      `insert into qualifications (name, sector)\n` +
      `select v.name, v.sector from (values\n${valoresQual}\n) as v(name, sector)\n` +
      `where not exists (select 1 from qualifications q where q.name = v.name);\n\n` +
      `-- Vincula cada ocupación con su Área de Cualificación (por nombre de sector).\n` +
      `update pathways p set qualification_id = q.id\n` +
      `from qualifications q\n` +
      `where p.pathway_type = 'rol_cuoc' and p.sector = q.name and p.qualification_id is null;\n`,
    'utf8',
  );

  console.log(`✓ ${RUTAS.sqlSkills}          (${skills.length} skills)`);
  console.log(`✓ ${RUTAS.sqlPathways}       (${ocupaciones.length} pathways, ${reqValores.length} requisitos)`);
  console.log(`✓ ${RUTAS.sqlCualificaciones}  (${catalogo.areas.length} áreas de cualificación)`);
  console.log('\n  Aplicar con: supabase db reset  (o psql -f cada migración)');
}

main();
