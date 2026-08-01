// ============================================================================
// Paso 1 — Parsear el libro relacional DANE → ocupaciones.json + catalogo.json
//
//   npm run dane:inspeccionar   # diagnóstico, no escribe
//   npm run dane:parsear        # escribe los dos JSON
//
// Ensambla el PERFIL COMPLETO de cada ocupación (los 11 campos del CUOC — no se
// excluye ninguno) y dedup el catálogo de habilidades por ID de DANE.
// ============================================================================

import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { leerLibroCuoc, type FilaSkill } from './lib/leerExcel.ts';
import { clave, canonizar } from './lib/normalizar.ts';
import { CLUSTERES_PRIORITARIOS, RUTAS } from './config.ts';
import type {
  Catalogo, CodNombre, EntradaCatalogo, OcupacionNormalizada, SkillRef,
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

// agrupa filas largas por código de ocupación
function agruparPorCodigo<T, R>(filas: T[], codigoDe: (f: T) => string, map: (f: T) => R): Map<string, R[]> {
  const m = new Map<string, R[]>();
  for (const f of filas) {
    const cod = codigoDe(f);
    if (!cod) continue;
    const arr = m.get(cod) ?? [];
    arr.push(map(f));
    m.set(cod, arr);
  }
  return m;
}

// Dedup por ID de DANE: nombre canónico = variante más frecuente;
// frecuencia = nº de ocupaciones distintas donde aparece el ID.
function construirCatalogo(filas: FilaSkill[], origen: 'conocimientos' | 'destrezas') {
  const nombresPorId = new Map<string, Map<string, number>>();
  const ocupsPorId = new Map<string, Set<string>>();
  for (const f of filas) {
    if (!f.id || !f.nombre) continue;
    const nm = nombresPorId.get(f.id) ?? new Map<string, number>();
    const limpio = canonizar(f.nombre);
    nm.set(limpio, (nm.get(limpio) ?? 0) + 1);
    nombresPorId.set(f.id, nm);
    const oc = ocupsPorId.get(f.id) ?? new Set<string>();
    oc.add(f.codigo);
    ocupsPorId.set(f.id, oc);
  }
  const nombrePorId = new Map<string, string>();
  const entradas: EntradaCatalogo[] = [];
  for (const [id, nombres] of nombresPorId) {
    const canonico = [...nombres.entries()].sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)[0][0];
    nombrePorId.set(id, canonico);
    entradas.push({ dane_id: id, nombre_canonico: canonico, origen, frecuencia: ocupsPorId.get(id)!.size });
  }
  entradas.sort((a, b) => b.frecuencia - a.frecuencia || a.nombre_canonico.localeCompare(b.nombre_canonico));
  return { entradas, nombrePorId };
}

function skillsPorOcup(filas: FilaSkill[], nombrePorId: Map<string, string>): Map<string, SkillRef[]> {
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
    console.error(`\n✗ No encuentro el Excel en: ${RUTAS.excel}\n` +
      '  https://www.dane.gov.co/files/sen/nomenclatura/cuoc/PerfilesOcupacionales-Excel-CUOC-2025.xlsx\n');
    process.exit(1);
  }

  const libro = await leerLibroCuoc(RUTAS.excel);

  const con = construirCatalogo(libro.conocimientos, 'conocimientos');
  const des = construirCatalogo(libro.destrezas, 'destrezas');
  const conocimientosOc = skillsPorOcup(libro.conocimientos, con.nombrePorId);
  const destrezasOc = skillsPorOcup(libro.destrezas, des.nombrePorId);

  const funcionesOc = agruparPorCodigo(libro.funciones, (f) => f.codigo, (f) => ({ consecutivo: nivelInt(f.consecutivo), texto: f.texto }));
  const denomOc = agruparPorCodigo(libro.denominaciones, (f) => f.codigo, (f) => ({ codigo: f.denom_codigo, nombre: f.denom_nombre }));
  const afinesOc = agruparPorCodigo(libro.afines, (f) => f.codigo, (f) => ({ codigo: f.afin_codigo, nombre: f.afin_nombre }));
  const areaPrincOc = new Map(libro.areaPrincipal.map((f) => [f.codigo, { sigla: f.sigla, nombre: f.area }]));
  const areaComplOc = agruparPorCodigo(libro.areaComplementaria, (f) => f.codigo, (f) => ({ sigla: f.sigla, nombre: f.area }));
  const equivOc = agruparPorCodigo(libro.equivalencias, (f) => f.codigo, (f) => ({
    ciuo08_codigo: f.ciuo_codigo, ciuo08_obs: f.ciuo_obs, cno_codigo: f.cno_codigo, cno_obs: f.cno_obs,
  }));

  // Áreas de cualificación (principal): dedup por SIGLA → nombre canónico.
  const nombresArea = new Map<string, Map<string, number>>();
  for (const { sigla, area } of libro.areaPrincipal) {
    if (!sigla) continue;
    const m = nombresArea.get(sigla) ?? new Map<string, number>();
    m.set(area, (m.get(area) ?? 0) + 1);
    nombresArea.set(sigla, m);
  }
  const areaCanonPorSigla = new Map<string, string>();
  for (const [sigla, m] of nombresArea) areaCanonPorSigla.set(sigla, [...m.entries()].sort((a, b) => b[1] - a[1])[0][0]);
  const canonArea = (a: { sigla: string; nombre: string }) => ({ sigla: a.sigla, nombre: areaCanonPorSigla.get(a.sigla) ?? a.nombre });

  const cn = (codigo: string, nombre: string): CodNombre => ({ codigo, nombre });

  const ocupaciones: OcupacionNormalizada[] = libro.ocupaciones
    .filter((o) => o.codigo && o.nombre)
    .map((o) => {
      const areaP = areaPrincOc.get(o.codigo) ?? null;
      const areaPCanon = areaP ? canonArea(areaP) : null;
      const cluster = clusterDe(o.nombre);
      return {
        codigo: o.codigo,
        nombre: o.nombre,
        descripcion: libro.descripciones.get(o.codigo) ?? '',
        nivel_competencia: nivelInt(libro.niveles.get(o.codigo)),
        jerarquia: {
          gran_grupo: cn(o.gran_grupo_codigo, o.gran_grupo_nombre),
          subgrupo_principal: cn(o.subgrupo_principal_codigo, o.subgrupo_principal_nombre),
          subgrupo: cn(o.subgrupo_codigo, o.subgrupo_nombre),
          grupo_primario: cn(o.grupo_primario_codigo, o.grupo_primario_nombre),
        },
        funciones: (funcionesOc.get(o.codigo) ?? []).sort((a, b) => (a.consecutivo ?? 0) - (b.consecutivo ?? 0)),
        denominaciones: denomOc.get(o.codigo) ?? [],
        conocimientos: conocimientosOc.get(o.codigo) ?? [],
        destrezas: destrezasOc.get(o.codigo) ?? [],
        ocupaciones_afines: afinesOc.get(o.codigo) ?? [],
        area_principal: areaPCanon,
        areas_complementarias: (areaComplOc.get(o.codigo) ?? []).map(canonArea),
        equivalencias: equivOc.get(o.codigo) ?? [],
        area_cualificacion: areaPCanon?.nombre ?? '',
        es_prioritaria: cluster != null,
        cluster,
      };
    });

  const catalogo: Catalogo = {
    conocimientos: con.entradas,
    destrezas: des.entradas,
    areas: [...areaCanonPorSigla.entries()].map(([sigla, nombre]) => ({ sigla, nombre })).sort((a, b) => a.nombre.localeCompare(b.nombre)),
  };

  const suma = (f: (o: OcupacionNormalizada) => number) => ocupaciones.reduce((n, o) => n + f(o), 0);
  console.log(`Ocupaciones:                ${ocupaciones.length}`);
  console.log(`Conocimientos (IDs):        ${catalogo.conocimientos.length}  → hard`);
  console.log(`Destrezas (IDs):            ${catalogo.destrezas.length}  → soft/power`);
  console.log(`Áreas de cualificación:     ${catalogo.areas.length}`);
  console.log(`Funciones (total):          ${suma((o) => o.funciones.length)}`);
  console.log(`Denominaciones (total):     ${suma((o) => o.denominaciones.length)}`);
  console.log(`Ocupaciones afines (total): ${suma((o) => o.ocupaciones_afines.length)}`);
  console.log(`Equivalencias (total):      ${suma((o) => o.equivalencias.length)}`);
  console.log(`Áreas complementarias:      ${suma((o) => o.areas_complementarias.length)}`);
  console.log(`Prioritarias (exhibición):  ${ocupaciones.filter((o) => o.es_prioritaria).length}`);

  if (inspeccionar) {
    const muestra = ocupaciones.find((o) => o.funciones.length && o.conocimientos.length > 2 && o.equivalencias.length) ?? ocupaciones[0];
    console.log('\n--- PERFIL COMPLETO DE MUESTRA ---');
    console.log(JSON.stringify(muestra, null, 2));
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

main().catch((e) => { console.error('\n✗ Error:', e.message ?? e); process.exit(1); });
