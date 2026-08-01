// ============================================================================
// Paso 3 — Proponer el catálogo de SKILLS para revisión humana.
//
//   npm run dane:proponer   →  data/propuesta-skills.csv
//
// Modelo corregido:
//   - DURAS  → derivadas de las FUNCIONES (paso 2, derivacion.json). GENERADAS
//     por IA/heurístico → requieren revisión humana (regla 7.1).
//   - BLANDAS → destrezas del CUOC (catalogo.json). Oficiales de DANE; se incluyen
//     para que VinkU pueda descartar/renombrar, pero su tipo es soft.
//   - Los CONOCIMIENTOS no entran aquí: son dominios (knowledge_areas), se cargan
//     directo en el paso 4.
// ============================================================================

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { aCSV, clave } from './lib/normalizar.ts';
import { RUTAS } from './config.ts';
import type { Catalogo } from './tipos.ts';

interface Derivacion {
  motor: string;
  catalogo_hard: Array<{ nombre_canonico: string; frecuencia: number }>;
}

function main() {
  if (!existsSync(RUTAS.derivacion)) {
    console.error(`✗ Falta ${RUTAS.derivacion}. Corre primero: npm run dane:derivar`);
    process.exit(1);
  }
  if (!existsSync(RUTAS.catalogo)) {
    console.error(`✗ Falta ${RUTAS.catalogo}. Corre primero: npm run dane:parsear`);
    process.exit(1);
  }
  const derivacion: Derivacion = JSON.parse(readFileSync(RUTAS.derivacion, 'utf8'));
  const catalogo: Catalogo = JSON.parse(readFileSync(RUTAS.catalogo, 'utf8'));

  const filas: Array<Record<string, string | number>> = [];

  // Duras derivadas de funciones (origen=dura). Requieren la revisión más fina.
  for (const h of derivacion.catalogo_hard) {
    filas.push({
      clave: clave(h.nombre_canonico),
      nombre_canonico: h.nombre_canonico,
      origen: 'dura',
      frecuencia: h.frecuencia,
      APROBAR: 'si',
      skill_type_final: 'hard',
      fusionar_con: '',
    });
  }
  // Blandas = destrezas del CUOC (origen=blanda).
  for (const d of catalogo.destrezas) {
    filas.push({
      clave: clave(d.nombre_canonico),
      nombre_canonico: d.nombre_canonico,
      origen: 'blanda',
      frecuencia: d.frecuencia,
      APROBAR: 'si',
      skill_type_final: 'soft',
      fusionar_con: '',
    });
  }

  const columnas = ['clave', 'nombre_canonico', 'origen', 'frecuencia', 'APROBAR', 'skill_type_final', 'fusionar_con'];
  writeFileSync(RUTAS.propuesta, aCSV(filas, columnas), 'utf8');

  console.log(`✓ Propuesta escrita: ${RUTAS.propuesta}  (motor de derivación: ${derivacion.motor})`);
  console.log(`  Skills DURAS (de funciones):  ${derivacion.catalogo_hard.length}  ← revisa estas con cuidado`);
  console.log(`  Skills BLANDAS (destrezas):   ${catalogo.destrezas.length}`);
  console.log(`  Áreas de conocimiento:        ${catalogo.conocimientos.length}  (dominios, se cargan directo)`);
  console.log('\n  REVISIÓN HUMANA (obligatoria antes de insertar):');
  console.log('   1. Revisa sobre todo las DURAS (son generadas): fusiona duplicados, descarta ruido.');
  console.log('   2. APROBAR=no para descartar; ajusta skill_type_final; fusionar_con=<nombre destino>.');
  console.log(`   3. Guarda como: ${RUTAS.propuestaRevisada}`);
  console.log('   4. Luego: npm run dane:generar-sql');
}

main();
