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

  // --- 1. Catálogo aprobado (con fusiones) ---
  // IMPORTANTE: los IDs de Conocimientos y Destrezas se SOLAPAN (ambos parten de
  // 1). La llave debe incluir el origen para no perder habilidades por colisión.
  const llave = (origen: string, id: string) => `${origen}:${id}`;
  const tiposValidos = new Set<TipoSkillPropuesto>(['hard', 'soft', 'power']);
  const aprobadaPorId = new Map<string, Aprobada>();
  const fusionDe = new Map<string, string>(); // llave → llave destino (mismo origen)

  for (const f of filas) {
    const id = (f.dane_id ?? '').trim();
    const origen = (f.origen ?? '').trim();
    if (!id || !origen || !APROBADO.test((f.APROBAR ?? '').trim())) continue;
    const nombre = (f.nombre_canonico ?? '').trim();
    if (!nombre) continue;
    let tipo = (f.skill_type_final ?? f.tipo_sugerido ?? 'soft').trim() as TipoSkillPropuesto;
    if (!tiposValidos.has(tipo)) { console.warn(`⚠ Tipo inválido "${tipo}" en #${id} → 'soft'`); tipo = 'soft'; }
    const k = llave(origen, id);
    const fusion = (f.fusionar_con ?? '').trim();
    if (fusion) fusionDe.set(k, llave(origen, fusion)); // se fusiona dentro del mismo origen
    else aprobadaPorId.set(k, { nombre, tipo, origen, dane_id: id });
  }

  const resolver = (origen: string, id: string): string | null => {
    const k = llave(origen, id);
    const destino = fusionDe.get(k) ?? k;
    if (aprobadaPorId.has(destino)) return destino;
    if (aprobadaPorId.has(k)) return k;
    return null;
  };
  const nombrePorLlave = (k: string | null): string | null => (k ? aprobadaPorId.get(k)?.nombre ?? null : null);

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
  // Perfil COMPLETO del CUOC como JSONB (los 11 componentes; nada se excluye).
  const perfilJson = (o: OcupacionNormalizada) =>
    JSON.stringify({
      codigo: o.codigo,
      nombre: o.nombre,
      descripcion: o.descripcion,
      nivel_competencia: o.nivel_competencia,
      jerarquia: o.jerarquia,
      funciones: o.funciones,
      denominaciones: o.denominaciones,
      conocimientos: o.conocimientos,
      destrezas: o.destrezas,
      ocupaciones_afines: o.ocupaciones_afines,
      area_principal: o.area_principal,
      areas_complementarias: o.areas_complementarias,
      equivalencias: o.equivalencias,
    });

  const valoresPathways = ocupaciones
    .filter((o) => o.codigo && o.nombre)
    .map((o) => {
      const nivel = o.nivel_competencia == null ? 'null' : String(o.nivel_competencia);
      const sector = o.area_cualificacion ? `'${esc(o.area_cualificacion)}'` : 'null';
      const perfil = `'${esc(perfilJson(o))}'::jsonb`;
      return `  ('rol_cuoc', '${esc(o.nombre)}', '${esc(o.codigo)}', ${sector}, ${nivel}, ${o.es_prioritaria}, ${perfil})`;
    })
    .join(',\n');

  const reqValores: string[] = [];
  const vistos = new Set<string>();
  const refsConOrigen = (o: OcupacionNormalizada) => [
    ...o.conocimientos.map((r) => ['conocimientos', r] as const),
    ...o.destrezas.map((r) => ['destrezas', r] as const),
  ];
  for (const o of ocupaciones) {
    if (!o.codigo) continue;
    for (const [origen, ref] of refsConOrigen(o)) {
      const rk = resolver(origen, ref.id);
      const nombre = nombrePorLlave(rk);
      if (!rk || !nombre) continue;
      const k = `${o.codigo}::${rk}`;
      if (vistos.has(k)) continue;
      vistos.add(k);
      reqValores.push(`  ('${esc(o.codigo)}', '${esc(nombre)}', '${REQ_TYPE_DEFECTO}')`);
    }
  }

  writeFileSync(
    RUTAS.sqlPathways,
    `-- Generado por scripts/ingesta-dane/3-generar-sql.ts.\n` +
      `-- ${ocupaciones.length} ocupaciones CUOC como pathways rol_cuoc. Requiere migraciones 004 y 005.\n` +
      `-- cuoc_profile (jsonb) trae el perfil COMPLETO: jerarquía, funciones, denominaciones,\n` +
      `-- conocimientos, destrezas, ocupaciones afines, áreas y equivalencias CIUO-08/CNO.\n` +
      `-- employability_rank NULL (no está en el Excel; lo completa VinkU, 6.5).\n\n` +
      `insert into pathways (pathway_type, name, cuoc_code, sector, competence_level, is_priority_display, cuoc_profile) values\n` +
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
