// ============================================================================
// Paso 2 — Derivar skills DURAS atómicas desde las FUNCIONES de cada ocupación.
//
//   npm run dane:derivar                 # IA si hay ANTHROPIC_API_KEY, si no heurístico
//   npm run dane:derivar -- --heuristico # fuerza el motor heurístico (sin key)
//   npm run dane:derivar -- --limit 10   # solo las primeras 10 ocupaciones (pruebas)
//
// Lee ocupaciones.json y escribe derivacion.json:
//   { motor, por_ocupacion: {codigo: DerivacionFuncion[]}, catalogo_hard: [...] }
//
// Las skills duras son GENERADAS (IA/heurístico) → pasan por revisión humana en
// el paso 3 antes de insertarse (regla 7.1). Las destrezas (blandas) y los
// conocimientos (dominios) NO pasan por aquí: vienen tal cual de DANE.
// ============================================================================

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { derivarHeuristico, derivarConIA, type DerivacionFuncion } from './lib/derivarSkills.ts';
import { clave } from './lib/normalizar.ts';
import { RUTAS } from './config.ts';
import type { OcupacionNormalizada } from './tipos.ts';

async function main() {
  const args = process.argv.slice(2);
  const forzarHeuristico = args.includes('--heuristico');
  const limIdx = args.indexOf('--limit');
  const limite = limIdx >= 0 ? parseInt(args[limIdx + 1], 10) : Infinity;

  if (!existsSync(RUTAS.ocupaciones)) {
    console.error(`✗ Falta ${RUTAS.ocupaciones}. Corre: npm run dane:parsear`);
    process.exit(1);
  }
  let ocupaciones: OcupacionNormalizada[] = JSON.parse(readFileSync(RUTAS.ocupaciones, 'utf8'));
  if (Number.isFinite(limite)) ocupaciones = ocupaciones.slice(0, limite);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const usarIA = !forzarHeuristico && Boolean(apiKey);
  const motor = usarIA ? 'ia' : 'heuristico';
  console.log(`Motor: ${motor}${!usarIA && !forzarHeuristico ? '  (sin ANTHROPIC_API_KEY → heurístico)' : ''}`);
  console.log(`Ocupaciones a procesar: ${ocupaciones.length}`);

  const porOcupacion: Record<string, DerivacionFuncion[]> = {};

  for (let i = 0; i < ocupaciones.length; i++) {
    const o = ocupaciones[i];
    if (!o.funciones?.length) { porOcupacion[o.codigo] = []; continue; }
    try {
      porOcupacion[o.codigo] = usarIA
        ? await derivarConIA(o.nombre, o.funciones, {
            apiKey: apiKey!,
            baseUrl: process.env.ANTHROPIC_BASE_URL,
            model: process.env.DANE_MODELO,
          })
        : o.funciones.map((f) => derivarHeuristico(f.texto, f.consecutivo));
    } catch (e) {
      console.error(`  ⚠ ${o.codigo} ${o.nombre}: ${(e as Error).message} → heurístico`);
      porOcupacion[o.codigo] = o.funciones.map((f) => derivarHeuristico(f.texto, f.consecutivo));
    }
    if (usarIA && (i + 1) % 25 === 0) console.log(`  … ${i + 1}/${ocupaciones.length}`);
  }

  // Catálogo de duras: dedup por nombre canónico; frecuencia = nº de ocupaciones.
  const ocupsPorSkill = new Map<string, { nombre: string; ocups: Set<string> }>();
  let descartadas = 0, blandas = 0;
  for (const [codigo, filas] of Object.entries(porOcupacion)) {
    for (const f of filas) {
      if (f.descartada) { descartadas++; continue; }
      if (f.es_blanda) { blandas++; continue; }
      for (const s of f.skills) {
        const k = clave(s);
        const e = ocupsPorSkill.get(k) ?? { nombre: s, ocups: new Set<string>() };
        e.ocups.add(codigo);
        ocupsPorSkill.set(k, e);
      }
    }
  }
  const catalogo_hard = [...ocupsPorSkill.values()]
    .map((e) => ({ nombre_canonico: e.nombre, frecuencia: e.ocups.size }))
    .sort((a, b) => b.frecuencia - a.frecuencia || a.nombre_canonico.localeCompare(b.nombre_canonico));

  mkdirSync(dirname(RUTAS.derivacion), { recursive: true });
  writeFileSync(RUTAS.derivacion, JSON.stringify({ motor, por_ocupacion: porOcupacion, catalogo_hard }, null, 2), 'utf8');

  console.log(`\n✓ Escrito: ${RUTAS.derivacion}`);
  console.log(`  Skills duras únicas (derivadas):  ${catalogo_hard.length}`);
  console.log(`  Funciones descartadas (ruido):    ${descartadas}`);
  console.log(`  Funciones detectadas como blandas: ${blandas}`);
  console.log('  Siguiente: npm run dane:proponer');
}

main().catch((e) => { console.error('\n✗ Error:', e.message ?? e); process.exit(1); });
