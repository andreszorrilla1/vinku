// ============================================================================
// Render legible del PERFIL COMPLETO de una ocupación (verificación humana).
//
//   npm run dane:perfil -- 25120           # por código
//   npm run dane:perfil -- "desarrollador"  # por texto en el nombre
//
// Lee ocupaciones.json (npm run dane:parsear) y, si existe, derivacion.json
// (npm run dane:derivar) para mostrar las skills DURAS derivadas de funciones.
// ============================================================================

import { readFileSync, existsSync } from 'node:fs';
import { clave } from './lib/normalizar.ts';
import { RUTAS } from './config.ts';
import type { OcupacionNormalizada } from './tipos.ts';

interface Derivacion { por_ocupacion: Record<string, Array<{ consecutivo: number | null; texto: string; skills: string[]; descartada: boolean; es_blanda: boolean }>> }

function render(o: OcupacionNormalizada, deriv: Derivacion | null): string {
  const L: string[] = [];
  L.push('════════════════════════════════════════════════════════════');
  L.push(`Ocupación: ${o.nombre}  (CUOC ${o.codigo})`);
  L.push(`Nivel de competencia: ${o.nivel_competencia ?? '—'}`);
  L.push(`Área de cualificación: ${o.area_principal?.nombre ?? '—'}`);
  L.push(`Jerarquía: ${o.jerarquia.gran_grupo.nombre} › ${o.jerarquia.subgrupo_principal.nombre} › ${o.jerarquia.subgrupo.nombre} › ${o.jerarquia.grupo_primario.nombre}`);
  if (o.descripcion) L.push(`\nObjetivo:\n  ${o.descripcion}`);

  L.push(`\n▸ DOMINIOS DE CONOCIMIENTO (categorías macro):`);
  o.conocimientos.forEach((c) => L.push(`  · ${c.nombre}`));

  L.push(`\n▸ HABILIDADES DURAS (derivadas de las funciones):`);
  const filas = deriv?.por_ocupacion?.[o.codigo];
  if (filas) {
    const skills = new Set<string>();
    filas.forEach((f) => !f.descartada && !f.es_blanda && f.skills.forEach((s) => skills.add(s)));
    [...skills].sort().forEach((s) => L.push(`  ✔ ${s}`));
    if (skills.size === 0) L.push('  (ninguna derivada)');
  } else {
    L.push('  (corre "npm run dane:derivar" para derivarlas de las funciones)');
    L.push('  Funciones fuente:');
    o.funciones.slice(0, 6).forEach((f) => L.push(`    ${f.consecutivo}. ${f.texto.slice(0, 90)}…`));
  }

  L.push(`\n▸ HABILIDADES BLANDAS (destrezas):`);
  o.destrezas.forEach((d) => L.push(`  ✔ ${d.nombre}`));

  if (o.ocupaciones_afines.length)
    L.push(`\n▸ Ocupaciones afines: ${o.ocupaciones_afines.map((a) => `${a.nombre} (${a.codigo})`).join('; ')}`);
  if (o.equivalencias.length)
    L.push(`▸ Equivalencias: ${o.equivalencias.map((e) => `CIUO-08 ${e.ciuo08_codigo}, CNO ${e.cno_codigo}`).join(' | ')}`);
  return L.join('\n');
}

function main() {
  const termino = process.argv.slice(2).filter((a) => !a.startsWith('--')).join(' ').trim();
  if (!existsSync(RUTAS.ocupaciones)) {
    console.error(`✗ Falta ${RUTAS.ocupaciones}. Corre: npm run dane:parsear`);
    process.exit(1);
  }
  const ocupaciones: OcupacionNormalizada[] = JSON.parse(readFileSync(RUTAS.ocupaciones, 'utf8'));
  const deriv: Derivacion | null = existsSync(RUTAS.derivacion) ? JSON.parse(readFileSync(RUTAS.derivacion, 'utf8')) : null;

  if (!termino) {
    console.log('Uso: npm run dane:perfil -- <código o texto>');
    console.log(`Ejemplos: ${ocupaciones.slice(0, 3).map((o) => o.codigo).join(', ')}`);
    return;
  }
  const k = clave(termino);
  const hits = ocupaciones.filter((o) => o.codigo === termino || clave(o.nombre).includes(k));
  if (!hits.length) { console.log(`Sin coincidencias para "${termino}".`); return; }
  hits.slice(0, 5).forEach((o) => console.log(render(o, deriv) + '\n'));
  if (hits.length > 5) console.log(`… y ${hits.length - 5} más.`);
}

main();
