// ============================================================================
// Paso 2 — Proponer el catálogo de habilidades a partir de las ocupaciones.
//
//   npm run dane:proponer   →  data/propuesta-skills.csv
//
// REGLA 7.1 / sección 6.2: NO inserta en `skills`. Produce una PROPUESTA
// deduplicada para revisión humana del equipo VinkU. Clasifica:
//   - conocimientos → hard
//   - destrezas     → soft  (con pista de reclasificación a 'power' cuando aplica)
// El revisor edita el CSV, lo guarda como propuesta-skills.revisada.csv y
// recién ahí el paso 3 genera el SQL de inserción.
// ============================================================================

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { Deduplicador, aCSV, clave } from './lib/normalizar.ts';
import { RUTAS } from './config.ts';
import type { OcupacionNormalizada, TipoSkillPropuesto } from './tipos.ts';

// Destrezas que suelen encajar mejor como POWER que como soft genérica
// (sección 6.2). Solo es una PISTA para el revisor; él decide.
const PISTAS_POWER = [
  'pensamiento critico',
  'liderazgo',
  'toma de decisiones',
  'criterio',
  'resolucion de problemas',
  'pensamiento analitico',
  'pensamiento estrategico',
  'creatividad',
  'innovacion',
];

function tipoDestreza(nombre: string): TipoSkillPropuesto {
  const k = clave(nombre);
  return PISTAS_POWER.some((p) => k.includes(p)) ? 'power' : 'soft';
}

function main() {
  if (!existsSync(RUTAS.ocupaciones)) {
    console.error(`✗ Falta ${RUTAS.ocupaciones}. Corre primero: npm run dane:parsear`);
    process.exit(1);
  }
  const ocupaciones: OcupacionNormalizada[] = JSON.parse(readFileSync(RUTAS.ocupaciones, 'utf8'));

  const dedupHard = new Deduplicador();
  const dedupTrans = new Deduplicador();
  for (const o of ocupaciones) {
    o.conocimientos.forEach((c) => dedupHard.agregar(c));
    o.destrezas.forEach((d) => dedupTrans.agregar(d));
  }

  const filas: Array<Record<string, string | number>> = [];

  for (const e of dedupHard.entradas()) {
    filas.push({
      nombre_canonico: e.canonico,
      origen: 'conocimientos',
      tipo_sugerido: 'hard',
      frecuencia: e.frecuencia,
      ejemplos_variantes: e.variantes.slice(0, 3).join(' | '),
      // columnas para el revisor:
      APROBAR: 'si',
      skill_type_final: 'hard',
      fusionar_con: '',
    });
  }
  for (const e of dedupTrans.entradas()) {
    const tipo = tipoDestreza(e.canonico);
    filas.push({
      nombre_canonico: e.canonico,
      origen: 'destrezas',
      tipo_sugerido: tipo,
      frecuencia: e.frecuencia,
      ejemplos_variantes: e.variantes.slice(0, 3).join(' | '),
      APROBAR: 'si',
      skill_type_final: tipo,
      fusionar_con: '',
    });
  }

  const columnas = [
    'nombre_canonico',
    'origen',
    'tipo_sugerido',
    'frecuencia',
    'ejemplos_variantes',
    'APROBAR',
    'skill_type_final',
    'fusionar_con',
  ];
  writeFileSync(RUTAS.propuesta, aCSV(filas, columnas), 'utf8');

  console.log(`✓ Propuesta escrita: ${RUTAS.propuesta}`);
  console.log(`  Habilidades duras (conocimientos):        ${dedupHard.entradas().length}`);
  console.log(`  Habilidades transversales (destrezas):    ${dedupTrans.entradas().length}`);
  console.log('\n  REVISIÓN HUMANA (obligatoria antes de insertar):');
  console.log('   1. Abre el CSV y revisa cada fila.');
  console.log("   2. Pon APROBAR=no para descartar; ajusta skill_type_final (hard/soft/power);");
  console.log('      usa fusionar_con=<nombre_canonico> para unir duplicados semánticos.');
  console.log(`   3. Guarda como: ${RUTAS.propuestaRevisada}`);
  console.log('   4. Luego: npm run dane:generar-sql');
}

main();
