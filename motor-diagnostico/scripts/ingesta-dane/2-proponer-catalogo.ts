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
import { aCSV } from './lib/normalizar.ts';
import { RUTAS } from './config.ts';
import type { Catalogo } from './tipos.ts';

// Regla de VinkU: en el CUOC, las DESTREZAS son las habilidades BLANDAS (soft).
// Las 40, sin excepción. El tipo 'power' NO se deriva del CUOC: queda reservado
// para las 15 competencias EntreComp (la capa transversal de emprendimiento).
// El revisor siempre puede subir alguna a 'power' en el CSV si lo decide.
const TIPO_DESTREZA = 'soft' as const;

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
    filas.push({
      dane_id: d.dane_id,
      nombre_canonico: d.nombre_canonico,
      origen: 'destrezas',
      tipo_sugerido: TIPO_DESTREZA,
      frecuencia: d.frecuencia,
      APROBAR: 'si',
      skill_type_final: TIPO_DESTREZA,
      fusionar_con: '',
    });
  }

  const columnas = ['dane_id', 'nombre_canonico', 'origen', 'tipo_sugerido', 'frecuencia', 'APROBAR', 'skill_type_final', 'fusionar_con'];
  writeFileSync(RUTAS.propuesta, aCSV(filas, columnas), 'utf8');

  console.log(`✓ Propuesta escrita: ${RUTAS.propuesta}`);
  console.log(`  Conocimientos → hard:     ${catalogo.conocimientos.length}`);
  console.log(`  Destrezas → soft:         ${catalogo.destrezas.length}  (todas blandas; power = EntreComp)`);
  console.log('\n  REVISIÓN HUMANA (obligatoria antes de insertar):');
  console.log('   1. Abre el CSV y revisa cada fila.');
  console.log('   2. APROBAR=no para descartar; ajusta skill_type_final si hiciera falta;');
  console.log('      fusionar_con=<dane_id> para unir dos entradas en una sola habilidad.');
  console.log(`   3. Guarda como: ${RUTAS.propuestaRevisada}`);
  console.log('   4. Luego: npm run dane:generar-sql');
}

main();
