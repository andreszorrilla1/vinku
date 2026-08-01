// ============================================================================
// Paso 3 — Generar el SQL de inserción a partir de la propuesta YA REVISADA.
//
//   npm run dane:generar-sql
//     lee  data/propuesta-skills.revisada.csv  (aprobada por VinkU)
//     lee  data/ocupaciones.json
//     escribe supabase/migrations/010_dane_skills.sql
//             supabase/migrations/011_dane_pathways.sql
//
// Este es el ÚNICO artefacto que inserta en `skills`, y solo con revisión
// humana de por medio (migración aplicada con service_role, no el flujo de IA).
// Requiere la columna is_priority_display (migración 004).
//
// requirement_type: el Excel DANE no distingue core/deseable, así que todos los
// conocimientos/destrezas del perfil se cargan como 'core' por defecto. VinkU
// puede degradar algunos a 'deseable' luego desde el panel operativo.
// ============================================================================

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { desdeCSV, clave } from './lib/normalizar.ts';
import { RUTAS } from './config.ts';
import type { OcupacionNormalizada, TipoSkillPropuesto } from './tipos.ts';

const APROBADO = /^(si|sí|s|yes|y|true|x|1)$/i;
const REQ_TYPE_DEFECTO = 'core';

const esc = (s: string) => s.replace(/'/g, "''");

interface SkillAprobada {
  canonico: string;
  tipo: TipoSkillPropuesto;
  claveDestino: string; // clave del nombre final tras fusión
}

function main() {
  if (!existsSync(RUTAS.propuestaRevisada)) {
    console.error(
      `✗ Falta la propuesta revisada: ${RUTAS.propuestaRevisada}\n` +
        '  Revisa data/propuesta-skills.csv, guárdalo con ese nombre y vuelve a intentar.',
    );
    process.exit(1);
  }
  if (!existsSync(RUTAS.ocupaciones)) {
    console.error(`✗ Falta ${RUTAS.ocupaciones}. Corre: npm run dane:parsear`);
    process.exit(1);
  }

  const filas = desdeCSV(readFileSync(RUTAS.propuestaRevisada, 'utf8'));
  const ocupaciones: OcupacionNormalizada[] = JSON.parse(readFileSync(RUTAS.ocupaciones, 'utf8'));

  // --- 1. Resolver el catálogo aprobado (con fusiones) ---
  const tiposValidos = new Set<TipoSkillPropuesto>(['hard', 'soft', 'power']);
  const aprobadasPorClave = new Map<string, SkillAprobada>();
  const nombreOriginalAClaveFinal = new Map<string, string>();

  // primera pasada: registrar aprobadas (sin resolver fusiones aún)
  for (const f of filas) {
    if (!APROBADO.test((f.APROBAR ?? '').trim())) continue;
    const canonico = (f.nombre_canonico ?? '').trim();
    if (!canonico) continue;
    const tipo = (f.skill_type_final ?? f.tipo_sugerido ?? 'soft').trim() as TipoSkillPropuesto;
    if (!tiposValidos.has(tipo)) {
      console.warn(`⚠ Tipo inválido "${tipo}" en "${canonico}" → se usa 'soft'.`);
    }
    const k = clave(canonico);
    const fusion = (f.fusionar_con ?? '').trim();
    nombreOriginalAClaveFinal.set(k, fusion ? clave(fusion) : k);
    if (!fusion) {
      aprobadasPorClave.set(k, { canonico, tipo: tiposValidos.has(tipo) ? tipo : 'soft', claveDestino: k });
    }
  }

  // resolver fusiones (una sola indirección; suficiente para el caso común)
  function claveFinal(k: string): string {
    const destino = nombreOriginalAClaveFinal.get(k) ?? k;
    return aprobadasPorClave.has(destino) ? destino : (aprobadasPorClave.has(k) ? k : destino);
  }

  // nombre final mostrable a partir de una clave
  const nombreFinal = (k: string): string | null => aprobadasPorClave.get(k)?.canonico ?? null;

  // --- 2. SQL de skills ---
  const skillsOrden = [...aprobadasPorClave.values()].sort((a, b) => a.canonico.localeCompare(b.canonico));
  const valoresSkills = skillsOrden
    .map((s) => `  ('${esc(s.canonico)}', '${s.tipo}', 'CUOC 2025 - Perfiles Ocupacionales DANE')`)
    .join(',\n');

  const sqlSkills =
    `-- Generado por scripts/ingesta-dane/3-generar-sql.ts a partir de la propuesta REVISADA.\n` +
    `-- ${skillsOrden.length} habilidades aprobadas por el equipo VinkU.\n` +
    `-- ON CONFLICT (name) DO NOTHING: convive con el catálogo existente sin duplicar.\n\n` +
    `insert into skills (name, skill_type, source_reference) values\n${valoresSkills}\non conflict (name) do nothing;\n`;

  writeFileSync(RUTAS.sqlSkills, sqlSkills, 'utf8');

  // --- 3. SQL de pathways + requirements ---
  const valoresPathways = ocupaciones
    .filter((o) => o.codigo && o.nombre)
    .map((o) => {
      const nivel = o.nivel_competencia == null ? 'null' : String(o.nivel_competencia);
      const sector = o.area_cualificacion ? `'${esc(o.area_cualificacion)}'` : 'null';
      return `  ('rol_cuoc', '${esc(o.nombre)}', '${esc(o.codigo)}', ${sector}, ${nivel}, ${o.es_prioritaria})`;
    })
    .join(',\n');

  // requirements: (cuoc_code, skill_name, req_type)
  const reqValores: string[] = [];
  const vistos = new Set<string>();
  for (const o of ocupaciones) {
    if (!o.codigo) continue;
    const items = [...o.conocimientos, ...o.destrezas];
    for (const item of items) {
      const kFinal = claveFinal(clave(item));
      const nombre = nombreFinal(kFinal);
      if (!nombre) continue; // no aprobada / descartada
      const dedupKey = `${o.codigo}::${kFinal}`;
      if (vistos.has(dedupKey)) continue;
      vistos.add(dedupKey);
      reqValores.push(`  ('${esc(o.codigo)}', '${esc(nombre)}', '${REQ_TYPE_DEFECTO}')`);
    }
  }

  const sqlPathways =
    `-- Generado por scripts/ingesta-dane/3-generar-sql.ts.\n` +
    `-- ${ocupaciones.length} ocupaciones CUOC como pathways rol_cuoc.\n` +
    `-- Requiere la migración 004 (columna is_priority_display).\n` +
    `-- employability_rank queda NULL: no está en el Excel; lo completa VinkU (6.5).\n\n` +
    `insert into pathways (pathway_type, name, cuoc_code, sector, competence_level, is_priority_display) values\n` +
    `${valoresPathways}\non conflict (cuoc_code) do nothing;\n\n` +
    `-- Requisitos de habilidad (todos 'core' por defecto; el Excel no distingue core/deseable).\n` +
    `insert into pathway_skill_requirements (pathway_id, skill_id, requirement_type)\n` +
    `select p.id, s.id, v.req_type\n` +
    `from (values\n${reqValores.join(',\n')}\n) as v(cuoc_code, skill_name, req_type)\n` +
    `join pathways p on p.cuoc_code = v.cuoc_code\n` +
    `join skills s on s.name = v.skill_name\n` +
    `on conflict (pathway_id, skill_id) do nothing;\n`;

  writeFileSync(RUTAS.sqlPathways, sqlPathways, 'utf8');

  console.log(`✓ ${RUTAS.sqlSkills}      (${skillsOrden.length} skills)`);
  console.log(`✓ ${RUTAS.sqlPathways}   (${ocupaciones.length} pathways, ${reqValores.length} requisitos)`);
  console.log('\n  Aplicar con: supabase db reset  (o psql -f cada migración)');
}

main();
