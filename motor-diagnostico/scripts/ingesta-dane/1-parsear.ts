// ============================================================================
// Paso 1 — Parsear el Excel oficial DANE → data/ocupaciones.json (normalizado).
//
//   npm run dane:inspeccionar   # solo diagnóstico, no escribe nada
//   npm run dane:parsear        # escribe data/ocupaciones.json
//
// No toca la base de datos. Solo lee el Excel y normaliza.
// ============================================================================

import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { leerExcel } from './lib/leerExcel.ts';
import { separarItems, clave } from './lib/normalizar.ts';
import { CLUSTERES_PRIORITARIOS, DELIMITADORES, PREFIJOS_LISTA, RUTAS } from './config.ts';
import type { OcupacionNormalizada } from './tipos.ts';

function nivelInt(texto: string): number | null {
  const m = texto.match(/\d+/);
  return m ? parseInt(m[0], 10) : null;
}

function clusterDe(nombre: string): string | null {
  // Se compara contra el nombre SIN tildes (los patrones están sin tildes), para
  // que "informático", "estadístico", etc. calcen igual que sus formas planas.
  const plano = clave(nombre);
  for (const c of CLUSTERES_PRIORITARIOS) {
    if (c.patrones.some((p) => p.test(plano))) return c.nombre;
  }
  return null;
}

async function main() {
  const inspeccionar = process.argv.includes('--inspeccionar');

  if (!existsSync(RUTAS.excel)) {
    console.error(
      `\n✗ No encuentro el Excel en: ${RUTAS.excel}\n\n` +
        'Descárgalo (necesitas acceso a dane.gov.co) y guárdalo ahí:\n' +
        '  https://www.dane.gov.co/files/sen/nomenclatura/cuoc/PerfilesOcupacionales-Excel-CUOC-2025.xlsx\n',
    );
    process.exit(1);
  }

  const r = await leerExcel(RUTAS.excel);

  console.log(`Hoja:               ${r.hoja}`);
  console.log(`Fila de encabezado: ${r.filaEncabezado}`);
  console.log(`Columnas mapeadas:  ${JSON.stringify(r.mapeo)}`);
  console.log(`Ocupaciones leídas: ${r.ocupaciones.length}`);

  const faltantes = (['nivel_competencia', 'area_cualificacion', 'conocimientos', 'destrezas'] as const).filter(
    (c) => r.mapeo[c] == null,
  );
  if (faltantes.length) {
    console.warn(`⚠ Columnas opcionales no detectadas: ${faltantes.join(', ')}`);
    console.warn('  Revisa los encabezados y ajusta config.ts (COLUMNAS) si hace falta:');
    console.warn('   - ' + r.encabezados.join('\n   - '));
  }

  const ocupaciones: OcupacionNormalizada[] = r.ocupaciones.map((o) => {
    const cluster = clusterDe(o.nombre);
    return {
      codigo: o.codigo,
      nombre: o.nombre,
      descripcion: o.descripcion,
      nivel_competencia: nivelInt(o.nivel_competencia),
      area_cualificacion: o.area_cualificacion,
      conocimientos: separarItems(o.conocimientos, DELIMITADORES, PREFIJOS_LISTA),
      destrezas: separarItems(o.destrezas, DELIMITADORES, PREFIJOS_LISTA),
      es_prioritaria: cluster != null,
      cluster,
    };
  });

  const prioritarias = ocupaciones.filter((o) => o.es_prioritaria).length;
  console.log(`Marcadas prioritarias (exhibición inicial): ${prioritarias}`);

  if (inspeccionar) {
    console.log('\n--- MUESTRA (2 ocupaciones) ---');
    console.log(JSON.stringify(ocupaciones.slice(0, 2), null, 2));
    console.log('\n(Modo inspección: no se escribió nada.)');
    return;
  }

  mkdirSync(dirname(RUTAS.ocupaciones), { recursive: true });
  writeFileSync(RUTAS.ocupaciones, JSON.stringify(ocupaciones, null, 2), 'utf8');
  console.log(`\n✓ Escrito: ${RUTAS.ocupaciones}`);
  console.log('  Siguiente: npm run dane:proponer');
}

main().catch((e) => {
  console.error('\n✗ Error:', e.message ?? e);
  process.exit(1);
});
