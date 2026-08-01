// Lectura del LIBRO RELACIONAL DANE (CUOC 2025).
// Cada campo es su propia hoja; se unen por "Código de la Ocupación".
import ExcelJS from 'exceljs';
import { HOJAS, type HojaConfig } from '../config.ts';
import { clave } from './normalizar.ts';

export interface OcupacionBase {
  codigo: string;
  nombre: string;
  gran_grupo_codigo: string;
  gran_grupo_nombre: string;
}
export interface FilaSkill { codigo: string; id: string; nombre: string }

export interface LibroCuoc {
  ocupaciones: OcupacionBase[];
  niveles: Map<string, string>;
  descripciones: Map<string, string>;
  areas: Map<string, { sigla: string; nombre: string }>;
  conocimientos: FilaSkill[];
  destrezas: FilaSkill[];
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

  // fila de encabezado: la que contenga "codigo de la ocupacion" (primeras 6)
  let filaEnc = -1;
  const limite = Math.min(6, ws.rowCount);
  for (let r = 1; r <= limite; r++) {
    const row = ws.getRow(r);
    let tiene = false;
    row.eachCell({ includeEmpty: true }, (c) => {
      if (clave(textoCelda(c.value)) === requerido) tiene = true;
    });
    if (tiene) { filaEnc = r; break; }
  }
  if (filaEnc < 0) filaEnc = 2; // por defecto, el DANE usa fila 2

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

  const hOcup = ubicarHoja(wb, HOJAS.ocupacion.clave_hoja);
  const hNivel = ubicarHoja(wb, HOJAS.nivel.clave_hoja);
  const hDesc = ubicarHoja(wb, HOJAS.descripcion.clave_hoja);
  const hArea = ubicarHoja(wb, HOJAS.area_principal.clave_hoja);
  const hCon = ubicarHoja(wb, HOJAS.conocimientos.clave_hoja);
  const hDes = ubicarHoja(wb, HOJAS.destrezas.clave_hoja);

  const ocupaciones = leerHoja(hOcup, HOJAS.ocupacion).map((o) => ({
    codigo: o.codigo,
    nombre: o.nombre,
    gran_grupo_codigo: o.gran_grupo_codigo,
    gran_grupo_nombre: o.gran_grupo_nombre,
  }));

  const niveles = new Map<string, string>();
  for (const f of leerHoja(hNivel, HOJAS.nivel)) niveles.set(f.codigo, f.nivel);

  const descripciones = new Map<string, string>();
  for (const f of leerHoja(hDesc, HOJAS.descripcion)) descripciones.set(f.codigo, f.descripcion);

  const areas = new Map<string, { sigla: string; nombre: string }>();
  for (const f of leerHoja(hArea, HOJAS.area_principal)) areas.set(f.codigo, { sigla: f.sigla, nombre: f.area });

  const conocimientos = leerHoja(hCon, HOJAS.conocimientos).map((f) => ({ codigo: f.codigo, id: f.id, nombre: f.nombre }));
  const destrezas = leerHoja(hDes, HOJAS.destrezas).map((f) => ({ codigo: f.codigo, id: f.id, nombre: f.nombre }));

  return { ocupaciones, niveles, descripciones, areas, conocimientos, destrezas };
}
