// Lectura del LIBRO RELACIONAL DANE (CUOC 2025) — las 11 hojas.
// Cada campo es su propia hoja; se unen por "Código de la Ocupación".
import ExcelJS from 'exceljs';
import { HOJAS, type HojaConfig } from '../config.ts';
import { clave } from './normalizar.ts';

export interface OcupacionBase {
  codigo: string;
  nombre: string;
  gran_grupo_codigo: string;
  gran_grupo_nombre: string;
  subgrupo_principal_codigo: string;
  subgrupo_principal_nombre: string;
  subgrupo_codigo: string;
  subgrupo_nombre: string;
  grupo_primario_codigo: string;
  grupo_primario_nombre: string;
}
export interface FilaSkill { codigo: string; id: string; nombre: string }
export interface FilaFuncion { codigo: string; consecutivo: string; texto: string }
export interface FilaDenom { codigo: string; denom_codigo: string; denom_nombre: string }
export interface FilaAfin { codigo: string; afin_codigo: string; afin_nombre: string }
export interface FilaArea { codigo: string; sigla: string; area: string }
export interface FilaEquiv {
  codigo: string; ciuo_codigo: string; ciuo_obs: string; cno_codigo: string; cno_obs: string;
}

export interface LibroCuoc {
  ocupaciones: OcupacionBase[];
  niveles: Map<string, string>;
  descripciones: Map<string, string>;
  conocimientos: FilaSkill[];
  destrezas: FilaSkill[];
  funciones: FilaFuncion[];
  denominaciones: FilaDenom[];
  afines: FilaAfin[];
  areaPrincipal: FilaArea[];
  areaComplementaria: FilaArea[];
  equivalencias: FilaEquiv[];
}

function textoCelda(v: ExcelJS.CellValue): string {
  if (v == null) return '';
  if (typeof v === 'object') {
    const o = v as Record<string, unknown>;
    if ('richText' in o && Array.isArray(o.richText)) {
      return (o.richText as Array<{ text: string }>).map((r) => r.text).join('');
    }
    if ('text' in o) return String(o.text);
    if ('result' in o) return String(o.result);
    return '';
  }
  return String(v);
}

function ubicarHoja(wb: ExcelJS.Workbook, claves: readonly string[]): ExcelJS.Worksheet {
  const ws = wb.worksheets.find((w) => {
    const n = clave(w.name);
    return claves.some((c) => n.includes(clave(c)));
  });
  if (!ws) {
    throw new Error(
      `No encuentro una hoja que coincida con [${claves.join(', ')}].\n` +
        'Hojas disponibles: ' + wb.worksheets.map((w) => w.name).join(', '),
    );
  }
  return ws;
}

/** Lee una hoja: detecta la fila de encabezado y mapea columnas por candidatos. */
function leerHoja(ws: ExcelJS.Worksheet, cfg: HojaConfig): Array<Record<string, string>> {
  const campos = Object.keys(cfg.columnas);
  const requerido = clave('codigo de la ocupacion');

  let filaEnc = -1;
  const limite = Math.min(6, ws.rowCount);
  for (let r = 1; r <= limite; r++) {
    let tiene = false;
    ws.getRow(r).eachCell({ includeEmpty: true }, (c) => {
      if (clave(textoCelda(c.value)) === requerido) tiene = true;
    });
    if (tiene) { filaEnc = r; break; }
  }
  if (filaEnc < 0) filaEnc = 2;

  const encabezados: string[] = [];
  ws.getRow(filaEnc).eachCell({ includeEmpty: true }, (c) => encabezados.push(clave(textoCelda(c.value))));

  const idx: Record<string, number> = {};
  for (const campo of campos) {
    const candidatos = cfg.columnas[campo].map(clave);
    let i = encabezados.findIndex((h) => candidatos.includes(h));
    if (i < 0) i = encabezados.findIndex((h) => candidatos.some((c) => h.startsWith(c)));
    if (i < 0) {
      throw new Error(
        `En la hoja "${ws.name}" no encontré la columna "${campo}".\n` +
          `Encabezados (fila ${filaEnc}): ${encabezados.filter(Boolean).join(' | ')}\n` +
          'Ajusta HOJAS en scripts/ingesta-dane/config.ts.',
      );
    }
    idx[campo] = i;
  }

  const filas: Array<Record<string, string>> = [];
  for (let r = filaEnc + 1; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const obj: Record<string, string> = {};
    let vacia = true;
    for (const campo of campos) {
      const val = textoCelda(row.getCell(idx[campo] + 1).value).trim();
      obj[campo] = val;
      if (val) vacia = false;
    }
    if (!vacia) filas.push(obj);
  }
  return filas;
}

export async function leerLibroCuoc(ruta: string): Promise<LibroCuoc> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(ruta);

  const hoja = (k: keyof typeof HOJAS) => ubicarHoja(wb, HOJAS[k].clave_hoja);

  const ocupaciones = leerHoja(hoja('ocupacion'), HOJAS.ocupacion).map((o) => ({
    codigo: o.codigo,
    nombre: o.nombre,
    gran_grupo_codigo: o.gran_grupo_codigo,
    gran_grupo_nombre: o.gran_grupo_nombre,
    subgrupo_principal_codigo: o.subgrupo_principal_codigo,
    subgrupo_principal_nombre: o.subgrupo_principal_nombre,
    subgrupo_codigo: o.subgrupo_codigo,
    subgrupo_nombre: o.subgrupo_nombre,
    grupo_primario_codigo: o.grupo_primario_codigo,
    grupo_primario_nombre: o.grupo_primario_nombre,
  }));

  const niveles = new Map<string, string>();
  for (const f of leerHoja(hoja('nivel'), HOJAS.nivel)) niveles.set(f.codigo, f.nivel);

  const descripciones = new Map<string, string>();
  for (const f of leerHoja(hoja('descripcion'), HOJAS.descripcion)) descripciones.set(f.codigo, f.descripcion);

  const conocimientos = leerHoja(hoja('conocimientos'), HOJAS.conocimientos).map((f) => ({ codigo: f.codigo, id: f.id, nombre: f.nombre }));
  const destrezas = leerHoja(hoja('destrezas'), HOJAS.destrezas).map((f) => ({ codigo: f.codigo, id: f.id, nombre: f.nombre }));
  const funciones = leerHoja(hoja('funciones'), HOJAS.funciones).map((f) => ({ codigo: f.codigo, consecutivo: f.consecutivo, texto: f.texto }));
  const denominaciones = leerHoja(hoja('denominaciones'), HOJAS.denominaciones).map((f) => ({ codigo: f.codigo, denom_codigo: f.denom_codigo, denom_nombre: f.denom_nombre }));
  const afines = leerHoja(hoja('afines'), HOJAS.afines).map((f) => ({ codigo: f.codigo, afin_codigo: f.afin_codigo, afin_nombre: f.afin_nombre }));
  const areaPrincipal = leerHoja(hoja('area_principal'), HOJAS.area_principal).map((f) => ({ codigo: f.codigo, sigla: f.sigla, area: f.area }));
  const areaComplementaria = leerHoja(hoja('area_complementaria'), HOJAS.area_complementaria).map((f) => ({ codigo: f.codigo, sigla: f.sigla, area: f.area }));
  const equivalencias = leerHoja(hoja('equivalencias'), HOJAS.equivalencias).map((f) => ({
    codigo: f.codigo, ciuo_codigo: f.ciuo_codigo, ciuo_obs: f.ciuo_obs, cno_codigo: f.cno_codigo, cno_obs: f.cno_obs,
  }));

  return {
    ocupaciones, niveles, descripciones, conocimientos, destrezas,
    funciones, denominaciones, afines, areaPrincipal, areaComplementaria, equivalencias,
  };
}
