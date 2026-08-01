// ============================================================================
// Paso 4 — Generar el SQL desde la propuesta REVISADA + los JSON de los pasos 1–2.
//
//   npm run dane:generar-sql
//     → 010_dane_skills.sql            (duras derivadas + blandas/destrezas)
//     → 011_dane_pathways.sql          (680 pathways + perfil + requisitos)
//     → 012_dane_cualificaciones.sql   (26 áreas de cualificación)
//     → 013_dane_knowledge_areas.sql   (conocimientos como dominios + enlaces)
//
// Modelo: DURAS = derivadas de funciones (revisadas); BLANDAS = destrezas;
// CONOCIMIENTOS = knowledge_areas (dominios, carga directa desde DANE).
// Único artefacto que inserta en catálogos, con revisión humana de por medio.
// Requiere migraciones 004 (prioridad), 005 (cuoc_profile) y 006 (knowledge_areas).
// ============================================================================

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { desdeCSV, clave } from './lib/normalizar.ts';
import { RUTAS } from './config.ts';
import type { Catalogo, OcupacionNormalizada, TipoSkillPropuesto } from './tipos.ts';

const APROBADO = /^(si|sí|s|yes|y|true|x|1)$/i;
const REQ_TYPE_DEFECTO = 'core';
const esc = (s: string) => (s ?? '').replace(/'/g, "''");

interface Aprobada { nombre: string; tipo: TipoSkillPropuesto }
interface Derivacion { por_ocupacion: Record<string, Array<{ skills: string[]; descartada: boolean; es_blanda: boolean }>> }

function main() {
  for (const [ruta, hint] of [
    [RUTAS.propuestaRevisada, 'Revisa data/propuesta-skills.csv y guárdalo con ese nombre.'],
    [RUTAS.ocupaciones, 'Corre: npm run dane:parsear'],
    [RUTAS.catalogo, 'Corre: npm run dane:parsear'],
    [RUTAS.derivacion, 'Corre: npm run dane:derivar'],
  ] as const) {
    if (!existsSync(ruta)) { console.error(`✗ Falta ${ruta}. ${hint}`); process.exit(1); }
  }

  const filas = desdeCSV(readFileSync(RUTAS.propuestaRevisada, 'utf8'));
  const ocupaciones: OcupacionNormalizada[] = JSON.parse(readFileSync(RUTAS.ocupaciones, 'utf8'));
  const catalogo: Catalogo = JSON.parse(readFileSync(RUTAS.catalogo, 'utf8'));
  const derivacion: Derivacion = JSON.parse(readFileSync(RUTAS.derivacion, 'utf8'));

  // --- 1. Catálogo aprobado (llave = origen:clave; fusión dentro del origen) ---
  const llave = (origen: string, nombre: string) => `${origen}:${clave(nombre)}`;
  const tiposValidos = new Set<TipoSkillPropuesto>(['hard', 'soft', 'power']);
  const aprobada = new Map<string, Aprobada>();
  const fusionDe = new Map<string, string>();

  for (const f of filas) {
    const origen = (f.origen ?? '').trim();       // 'dura' | 'blanda'
    const nombre = (f.nombre_canonico ?? '').trim();
    if (!origen || !nombre || !APROBADO.test((f.APROBAR ?? '').trim())) continue;
    let tipo = (f.skill_type_final ?? '').trim() as TipoSkillPropuesto;
    if (!tiposValidos.has(tipo)) tipo = origen === 'dura' ? 'hard' : 'soft';
    const k = llave(origen, nombre);
    const fusion = (f.fusionar_con ?? '').trim();
    if (fusion) fusionDe.set(k, llave(origen, fusion));
    else aprobada.set(k, { nombre, tipo });
  }

  const resolver = (origen: string, nombre: string): string | null => {
    const k = llave(origen, nombre);
    const destino = fusionDe.get(k) ?? k;
    if (aprobada.has(destino)) return destino;
    if (aprobada.has(k)) return k;
    return null;
  };
  const nombreDe = (k: string | null) => (k ? aprobada.get(k)?.nombre ?? null : null);

  // --- 2. SQL de skills (duras + blandas aprobadas) ---
  const skills = [...aprobada.entries()]
    .map(([k, v]) => ({ ...v, origen: k.split(':')[0] }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
  const valoresSkills = skills.map((s) => {
    const ref = s.origen === 'dura' ? 'CUOC 2025 · derivada de funciones' : 'CUOC 2025 · destreza DANE';
    return `  ('${esc(s.nombre)}', '${s.tipo}', '${esc(ref)}')`;
  }).join(',\n');
  writeFileSync(RUTAS.sqlSkills,
    `-- Generado por 4-generar-sql.ts (propuesta REVISADA).\n` +
    `-- ${skills.length} skills aprobadas (duras derivadas de funciones + blandas/destrezas).\n\n` +
    `insert into skills (name, skill_type, source_reference) values\n${valoresSkills}\non conflict (name) do nothing;\n`,
    'utf8');

  // --- 3. Áreas de conocimiento (conocimientos = dominios; carga directa) ---
  const valoresKA = catalogo.conocimientos.map((c) =>
    `  ('${esc(c.nombre_canonico)}', 'CUOC 2025 · Conocimiento DANE #${esc(c.dane_id)}')`).join(',\n');
  const enlacesKA: string[] = [];
  const vistoKA = new Set<string>();
  for (const o of ocupaciones) {
    for (const c of o.conocimientos) {
      const k = `${o.codigo}::${clave(c.nombre)}`;
      if (vistoKA.has(k)) continue;
      vistoKA.add(k);
      enlacesKA.push(`  ('${esc(o.codigo)}', '${esc(c.nombre)}')`);
    }
  }
  writeFileSync(RUTAS.sqlKnowledge,
    `-- Generado por 4-generar-sql.ts. Conocimientos del CUOC como DOMINIOS (no skills).\n` +
    `-- Requiere migración 006 (knowledge_areas). Carga directa (categorías oficiales DANE).\n\n` +
    `insert into knowledge_areas (name, source_reference) values\n${valoresKA}\non conflict (name) do nothing;\n\n` +
    `-- Enlace ocupación ↔ dominio de conocimiento.\n` +
    `insert into pathway_knowledge_areas (pathway_id, knowledge_area_id)\n` +
    `select p.id, k.id from (values\n${enlacesKA.join(',\n')}\n) as v(cuoc_code, area_name)\n` +
    `join pathways p on p.cuoc_code = v.cuoc_code\n` +
    `join knowledge_areas k on k.name = v.area_name\n` +
    `on conflict (pathway_id, knowledge_area_id) do nothing;\n`,
    'utf8');

  // --- 4. Pathways + requisitos (duras de funciones + blandas de destrezas) ---
  const perfilJson = (o: OcupacionNormalizada) => JSON.stringify({
    codigo: o.codigo, nombre: o.nombre, descripcion: o.descripcion, nivel_competencia: o.nivel_competencia,
    jerarquia: o.jerarquia, funciones: o.funciones, denominaciones: o.denominaciones,
    conocimientos: o.conocimientos, destrezas: o.destrezas, ocupaciones_afines: o.ocupaciones_afines,
    area_principal: o.area_principal, areas_complementarias: o.areas_complementarias, equivalencias: o.equivalencias,
  });
  const valoresPathways = ocupaciones.filter((o) => o.codigo && o.nombre).map((o) => {
    const nivel = o.nivel_competencia == null ? 'null' : String(o.nivel_competencia);
    const sector = o.area_cualificacion ? `'${esc(o.area_cualificacion)}'` : 'null';
    return `  ('rol_cuoc', '${esc(o.nombre)}', '${esc(o.codigo)}', ${sector}, ${nivel}, ${o.es_prioritaria}, '${esc(perfilJson(o))}'::jsonb)`;
  }).join(',\n');

  const reqValores: string[] = [];
  const vistoReq = new Set<string>();
  const pushReq = (codigo: string, origen: string, nombre: string) => {
    const rk = resolver(origen, nombre);
    const nom = nombreDe(rk);
    if (!rk || !nom) return;
    const k = `${codigo}::${rk}`;
    if (vistoReq.has(k)) return;
    vistoReq.add(k);
    reqValores.push(`  ('${esc(codigo)}', '${esc(nom)}', '${REQ_TYPE_DEFECTO}')`);
  };
  for (const o of ocupaciones) {
    if (!o.codigo) continue;
    for (const f of derivacion.por_ocupacion[o.codigo] ?? []) {
      if (f.descartada || f.es_blanda) continue;
      for (const s of f.skills) pushReq(o.codigo, 'dura', s);
    }
    for (const d of o.destrezas) pushReq(o.codigo, 'blanda', d.nombre);
  }

  writeFileSync(RUTAS.sqlPathways,
    `-- Generado por 4-generar-sql.ts. ${ocupaciones.length} pathways rol_cuoc.\n` +
    `-- Requiere migraciones 004, 005 y 006. cuoc_profile (jsonb) = perfil CUOC completo.\n` +
    `-- Requisitos: DURAS derivadas de funciones + BLANDAS (destrezas). employability_rank NULL.\n\n` +
    `insert into pathways (pathway_type, name, cuoc_code, sector, competence_level, is_priority_display, cuoc_profile) values\n` +
    `${valoresPathways}\non conflict (cuoc_code) do nothing;\n\n` +
    `insert into pathway_skill_requirements (pathway_id, skill_id, requirement_type)\n` +
    `select p.id, s.id, v.req_type from (values\n${reqValores.join(',\n')}\n) as v(cuoc_code, skill_name, req_type)\n` +
    `join pathways p on p.cuoc_code = v.cuoc_code\n` +
    `join skills s on s.name = v.skill_name\n` +
    `on conflict (pathway_id, skill_id) do nothing;\n`,
    'utf8');

  // --- 5. Áreas de cualificación (puente al marco de cualificaciones) ---
  const valoresQual = catalogo.areas.map((a) => `  ('${esc(a.nombre)}', '${esc(a.nombre)}')`).join(',\n');
  writeFileSync(RUTAS.sqlCualificaciones,
    `-- Generado por 4-generar-sql.ts. ${catalogo.areas.length} Áreas de Cualificación (puente al marco).\n` +
    `-- mnc_level y sectoral_catalog_name NULL: no están en este archivo (regla 7.4).\n\n` +
    `insert into qualifications (name, sector)\nselect v.name, v.sector from (values\n${valoresQual}\n) as v(name, sector)\n` +
    `where not exists (select 1 from qualifications q where q.name = v.name);\n\n` +
    `update pathways p set qualification_id = q.id from qualifications q\n` +
    `where p.pathway_type = 'rol_cuoc' and p.sector = q.name and p.qualification_id is null;\n`,
    'utf8');

  const duras = skills.filter((s) => s.origen === 'dura').length;
  console.log(`✓ ${RUTAS.sqlSkills}          (${skills.length} skills: ${duras} duras + ${skills.length - duras} blandas)`);
  console.log(`✓ ${RUTAS.sqlPathways}       (${ocupaciones.length} pathways, ${reqValores.length} requisitos)`);
  console.log(`✓ ${RUTAS.sqlKnowledge}  (${catalogo.conocimientos.length} dominios, ${enlacesKA.length} enlaces)`);
  console.log(`✓ ${RUTAS.sqlCualificaciones}  (${catalogo.areas.length} áreas de cualificación)`);
}

main();
