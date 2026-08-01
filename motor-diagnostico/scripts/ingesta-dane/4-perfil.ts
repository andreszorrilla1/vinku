// ============================================================================
// Render legible del PERFIL COMPLETO de una ocupación (verificación humana).
//
//   npm run dane:perfil -- 21440           # por código
//   npm run dane:perfil -- "desarrollador"  # por texto en el nombre
//
// Lee data/ocupaciones.json (corre antes: npm run dane:parsear).
// ============================================================================

import { readFileSync, existsSync } from 'node:fs';
import { clave } from './lib/normalizar.ts';
import { RUTAS } from './config.ts';
import type { OcupacionNormalizada } from './tipos.ts';

function render(o: OcupacionNormalizada): string {
  const L: string[] = [];
  L.push(`════════════════════════════════════════════════════════════`);
  L.push(`Ocupación: ${o.nombre}  (CUOC ${o.codigo})`);
  L.push(`Nivel de competencia: ${o.nivel_competencia ?? '—'}`);
  L.push(`Área de cualificación principal: ${o.area_principal?.nombre ?? '—'}`);
  if (o.areas_complementarias.length)
    L.push(`Áreas complementarias: ${o.areas_complementarias.map((a) => a.nombre).join('; ')}`);
  L.push(`Jerarquía: ${o.jerarquia.gran_grupo.nombre} › ${o.jerarquia.subgrupo_principal.nombre} › ${o.jerarquia.subgrupo.nombre} › ${o.jerarquia.grupo_primario.nombre}`);
  if (o.descripcion) L.push(`\nDescripción:\n  ${o.descripcion}`);

  if (o.funciones.length) {
    L.push(`\nFunciones:`);
    o.funciones.forEach((f) => L.push(`  ${f.consecutivo ?? '·'}. ${f.texto}`));
  }
  o.conocimientos.forEach((c) => L.push(`Habilidad Dura: ${c.nombre}.`));
  o.destrezas.forEach((d) => L.push(`Habilidad Blanda: ${d.nombre}.`));

  if (o.denominaciones.length) {
    L.push(`\nDenominaciones (${o.denominaciones.length}): ${o.denominaciones.slice(0, 8).map((d) => d.nombre).join('; ')}${o.denominaciones.length > 8 ? '; …' : ''}`);
  }
  if (o.ocupaciones_afines.length) {
    L.push(`Ocupaciones afines: ${o.ocupaciones_afines.map((a) => `${a.nombre} (${a.codigo})`).join('; ')}`);
  }
  if (o.equivalencias.length) {
    L.push(`Equivalencias: ${o.equivalencias.map((e) => `CIUO-08 ${e.ciuo08_codigo}, CNO ${e.cno_codigo}`).join(' | ')}`);
  }
  return L.join('\n');
}

function main() {
  const termino = process.argv.slice(2).filter((a) => !a.startsWith('--')).join(' ').trim();
  if (!existsSync(RUTAS.ocupaciones)) {
    console.error(`✗ Falta ${RUTAS.ocupaciones}. Corre: npm run dane:parsear`);
    process.exit(1);
  }
  const ocupaciones: OcupacionNormalizada[] = JSON.parse(readFileSync(RUTAS.ocupaciones, 'utf8'));
  if (!termino) {
    console.log('Uso: npm run dane:perfil -- <código o texto>');
    console.log(`Ejemplos: ${ocupaciones.slice(0, 3).map((o) => o.codigo).join(', ')}`);
    return;
  }
  const k = clave(termino);
  const coincidencias = ocupaciones.filter((o) => o.codigo === termino || clave(o.nombre).includes(k));
  if (!coincidencias.length) {
    console.log(`Sin coincidencias para "${termino}".`);
    return;
  }
  coincidencias.slice(0, 5).forEach((o) => console.log(render(o) + '\n'));
  if (coincidencias.length > 5) console.log(`… y ${coincidencias.length - 5} más.`);
}

main();
