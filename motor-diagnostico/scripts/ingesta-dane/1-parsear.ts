// ============================================================================
// Paso 1 — Parsear el libro relacional DANE → ocupaciones.json + catalogo.json
//
//   npm run dane:inspeccionar   # diagnóstico, no escribe
//   npm run dane:parsear        # escribe los dos JSON
//
// No toca la base de datos. Une las hojas por Código de la Ocupación y dedup el
// catálogo por ID de DANE (llave fiable; los nombres tienen variantes de grafía).
// ============================================================================

import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { leerLibroCuoc, type FilaSkill } from './lib/leerExcel.ts';
import { clave, canonizar } from './lib/normalizar.ts';
import { CLUSTERES_PRIORITARIOS, RUTAS } from './config.ts';
import type {
  Catalogo,
  EntradaCatalogo,
  OcupacionNormalizada,
  SkillRef,
} from './tipos.ts';

function nivelInt(texto: string | undefined): number | null {
  const m = (texto ?? '').match(/\d+/);
  return m ? parseInt(m[0], 10) : null;
}

function clusterDe(nombre: string): string | null {
  const plano = clave(nombre);
  for (const c of CLUSTERES_PRIORITARIOS) {
    if (c.patrones.some((p) => p.test(plano))) return c.nombre;
  }
  return null;
}

// Dedup por ID de DANE: nombre canónico = variante más frecuente;
// frecuencia = nº de ocupaciones distintas donde aparece el ID.
function construirCatalogo(
  filas: FilaSkill[],
  origen: 'conocimientos' | 'destrezas',
): { entradas: EntradaCatalogo[]; nombrePorId: Map<string, string> } {
  const nombresPorId = new Map<string, Map<string, number>>();
  const ocupsPorId = new Map<string, Set<string>>();

  for (const f of filas) {
    if (!f.id || !f.nombre) continue;
    const nm = nombresPorId.get(f.id) ?? new Map<string, number>();
    const nombreLimpio = canonizar(f.nombre);
    nm.set(nombreLimpio, (nm.get(nombreLimpio) ?? 0) + 1);
    nombresPorId.set(f.id, nm);

    const oc = ocupsPorId.get(f.id) ?? new Set<string>();
    oc.add(f.codigo);
    ocupsPorId.set(f.id, oc);
  }

  const nombrePorId = new Map<string, string>();
  const entradas: EntradaCatalogo[] = [];
  for (const [id, nombres] of nombresPorId) {
    const canonico = [...nombres.entries()].sort(
      (a, b) => b[1] - a[1] || b[0].length - a[0].length,
    )[0][0];
    nombrePorId.set(id, canonico);
    entradas.push({ dane_id: id, nombre_canonico: canonico, origen, frecuencia: ocupsPorId.get(id)!.size });
  }
  entradas.sort((a, b) => b.frecuencia - a.frecuencia || a.nombre_canonico.localeCompare(b.nombre_canonico));
  return { entradas, nombrePorId };
}

function agrupar(filas: FilaSkill[], nombrePorId: Map<string, string>): Map<string, SkillRef[]> {
  const porOcup = new Map<string, SkillRef[]>();
  const vistos = new Map<string, Set<string>>();
  for (const f of filas) {
    if (!f.id) continue;
    const set = vistos.get(f.codigo) ?? new Set<string>();
    if (set.has(f.id)) continue;
    set.add(f.id);
    vistos.set(f.codigo, set);
    const arr = porOcup.get(f.codigo) ?? [];
    arr.push({ id: f.id, nombre: nombrePorId.get(f.id) ?? canonizar(f.nombre) });
    porOcup.set(f.codigo, arr);
  }
  return porOcup;
}

async function main() {
  const inspeccionar = process.argv.includes('--inspeccionar');

  if (!existsSync(RUTAS.excel)) {
    console.error(
      `\n✗ No encuentro el Excel en: ${RUTAS.excel}\n\n` +
        'Descárgalo (acceso a dane.gov.co) y guárdalo ahí:\n' +
        '  https://www.dane.gov.co/files/sen/nomenclatura/cuoc/PerfilesOcupacionales-Excel-CUOC-2025.xlsx\n',
    );
    process.exit(1);
  }

  const libro = await leerLibroCuoc(RUTAS.excel);

  const con = construirCatalogo(libro.conocimientos, 'conocimientos');
  const des = construirCatalogo(libro.destrezas, 'destrezas');
  const conPorOcup = agrupar(libro.conocimientos, con.nombrePorId);
  const desPorOcup = agrupar(libro.destrezas, des.nombrePorId);

  // Áreas de cualificación: dedup por SIGLA, nombre canónico más frecuente.
  const nombresArea = new Map<string, Map<string, number>>();
  for (const { sigla, nombre } of libro.areas.values()) {
    if (!sigla) continue;
    const m = nombresArea.get(sigla) ?? new Map<string, number>();
    m.set(nombre, (m.get(nombre) ?? 0) + 1);
    nombresArea.set(sigla, m);
  }
  const areaCanonPorSigla = new Map<string, string>();
  for (const [sigla, m] of nombresArea) {
    areaCanonPorSigla.set(sigla, [...m.entries()].sort((a, b) => b[1] - a[1])[0][0]);
  }

  const ocupaciones: OcupacionNormalizada[] = libro.ocupaciones
    .filter((o) => o.codigo && o.nombre)
    .map((o) => {
      const area = libro.areas.get(o.codigo);
      const sigla = area?.sigla ?? '';
      const cluster = clusterDe(o.nombre);
      return {
        codigo: o.codigo,
        nombre: o.nombre,
        descripcion: libro.descripciones.get(o.codigo) ?? '',
        nivel_competencia: nivelInt(libro.niveles.get(o.codigo)),
        gran_grupo_codigo: o.gran_grupo_codigo,
        gran_grupo_nombre: o.gran_grupo_nombre,
        area_cualificacion: sigla ? (areaCanonPorSigla.get(sigla) ?? area?.nombre ?? '') : (area?.nombre ?? ''),
        area_sigla: sigla,
        conocimientos: conPorOcup.get(o.codigo) ?? [],
        destrezas: desPorOcup.get(o.codigo) ?? [],
        es_prioritaria: cluster != null,
        cluster,
      };
    });

  const catalogo: Catalogo = {
    conocimientos: con.entradas,
    destrezas: des.entradas,
    areas: [...areaCanonPorSigla.entries()].map(([sigla, nombre]) => ({ sigla, nombre })).sort((a, b) => a.nombre.localeCompare(b.nombre)),
  };

  console.log(`Ocupaciones:               ${ocupaciones.length}`);
  console.log(`Conocimientos (IDs únicos): ${catalogo.conocimientos.length}  → hard`);
  console.log(`Destrezas (IDs únicos):     ${catalogo.destrezas.length}  → soft/power`);
  console.log(`Áreas de cualificación:     ${catalogo.areas.length}`);
  console.log(`Prioritarias (exhibición):  ${ocupaciones.filter((o) => o.es_prioritaria).length}`);

  if (inspeccionar) {
    console.log('\n--- MUESTRA: 1 ocupación ---');
    console.log(JSON.stringify(ocupaciones.find((o) => o.conocimientos.length > 2) ?? ocupaciones[0], null, 2));
    console.log('\n--- Áreas de cualificación ---');
    console.log(catalogo.areas.map((a) => `${a.sigla} · ${a.nombre}`).join('\n'));
    console.log('\n(Modo inspección: no se escribió nada.)');
    return;
  }

  mkdirSync(dirname(RUTAS.ocupaciones), { recursive: true });
  writeFileSync(RUTAS.ocupaciones, JSON.stringify(ocupaciones, null, 2), 'utf8');
  writeFileSync(RUTAS.catalogo, JSON.stringify(catalogo, null, 2), 'utf8');
  console.log(`\n✓ Escrito: ${RUTAS.ocupaciones}`);
  console.log(`✓ Escrito: ${RUTAS.catalogo}`);
  console.log('  Siguiente: npm run dane:proponer');
}

main().catch((e) => {
  console.error('\n✗ Error:', e.message ?? e);
  process.exit(1);
});
