// ============================================================================
// Paso 2 — Proponer el catálogo de habilidades → data/propuesta-skills.csv
//
// REGLA 7.1 / sección 6.2: NO inserta en `skills`. El catálogo ya viene
// deduplicado por ID de DANE (paso 1); aquí solo se clasifica y se deja para
// REVISIÓN HUMANA:
//   - conocimientos → hard
//   - destrezas     → soft (con pista de 'power' cuando aplica)
// ============================================================================

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { aCSV, clave } from './lib/normalizar.ts';
import { RUTAS } from './config.ts';
import type { Catalogo, TipoSkillPropuesto } from './tipos.ts';

// Destrezas que suelen encajar mejor como POWER (sección 6.2). Solo es PISTA.
const PISTAS_POWER = [
  'pensamiento critico', 'liderazgo', 'toma de decisiones', 'criterio',
  'resolucion de problemas', 'pensamiento analitico', 'pensamiento estrategico',
  'creatividad', 'innovacion', 'negociacion',
];

function tipoDestreza(nombre: string): TipoSkillPropuesto {
  const k = clave(nombre);
  return PISTAS_POWER.some((p) => k.includes(p)) ? 'power' : 'soft';
}

function main() {
  if (!existsSync(RUTAS.catalogo)) {
    console.error(`✗ Falta ${RUTAS.catalogo}. Corre primero: npm run dane:parsear`);
    process.exit(1);
  }
  const catalogo: Catalogo = JSON.parse(readFileSync(RUTAS.catalogo, 'utf8'));

  const filas: Array<Record<string, string | number>> = [];

  for (const c of catalogo.conocimientos) {
    filas.push({
      dane_id: c.dane_id,
      nombre_canonico: c.nombre_canonico,
      origen: 'conocimientos',
      tipo_sugerido: 'hard',
      frecuencia: c.frecuencia,
      APROBAR: 'si',
      skill_type_final: 'hard',
      fusionar_con: '',
    });
  }
  for (const d of catalogo.destrezas) {
    const tipo = tipoDestreza(d.nombre_canonico);
    filas.push({
      dane_id: d.dane_id,
      nombre_canonico: d.nombre_canonico,
      origen: 'destrezas',
      tipo_sugerido: tipo,
      frecuencia: d.frecuencia,
      APROBAR: 'si',
      skill_type_final: tipo,
      fusionar_con: '',
    });
  }

  const columnas = ['dane_id', 'nombre_canonico', 'origen', 'tipo_sugerido', 'frecuencia', 'APROBAR', 'skill_type_final', 'fusionar_con'];
  writeFileSync(RUTAS.propuesta, aCSV(filas, columnas), 'utf8');

  console.log(`✓ Propuesta escrita: ${RUTAS.propuesta}`);
  console.log(`  Conocimientos (hard):     ${catalogo.conocimientos.length}`);
  console.log(`  Destrezas (soft/power):   ${catalogo.destrezas.length}`);
  console.log('\n  REVISIÓN HUMANA (obligatoria antes de insertar):');
  console.log('   1. Abre el CSV y revisa cada fila.');
  console.log('   2. APROBAR=no para descartar; ajusta skill_type_final (hard/soft/power);');
  console.log('      fusionar_con=<dane_id> para unir dos entradas en una sola habilidad.');
  console.log(`   3. Guarda como: ${RUTAS.propuestaRevisada}`);
  console.log('   4. Luego: npm run dane:generar-sql');
}

main();
