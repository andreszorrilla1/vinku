// Lectura del Excel DANE con detección resiliente de encabezados.
import ExcelJS from 'exceljs';
import { COLUMNAS, type MapeoColumnas } from '../config.ts';
import { clave } from './normalizar.ts';

type CampoLogico = keyof MapeoColumnas;

export interface OcupacionCruda {
  codigo: string;
  nombre: string;
  descripcion: string;
  nivel_competencia: string;
  area_cualificacion: string;
  conocimientos: string;
  destrezas: string;
}

export interface ResultadoLectura {
  hoja: string;
  filaEncabezado: number;
  encabezados: string[];
  mapeo: Partial<Record<CampoLogico, number>>;
  ocupaciones: OcupacionCruda[];
}

function celdaTexto(v: ExcelJS.CellValue): string {
  if (v == null) return '';
  if (typeof v === 'object') {
    // rich text / hyperlink / formula result
    const anyV = v as Record<string, unknown>;
    if ('richText' in anyV && Array.isArray(anyV.richText)) {
      return (anyV.richText as Array<{ text: string }>).map((r) => r.text).join('');
    }
    if ('text' in anyV) return String(anyV.text);
    if ('result' in anyV) return String(anyV.result);
    return '';
  }
  return String(v);
}

/** Detecta la fila de encabezado (primeras 15 filas) por mejor coincidencia. */
function detectarEncabezado(ws: ExcelJS.Worksheet): { fila: number; encabezados: string[] } {
  const todos = [...COLUMNAS.codigo, ...COLUMNAS.nombre, ...COLUMNAS.conocimientos, ...COLUMNAS.destrezas].map(clave);
  let mejor = { fila: 1, puntaje: -1, encabezados: [] as string[] };
  const limite = Math.min(15, ws.rowCount || 15);
  for (let r = 1; r <= limite; r++) {
    const row = ws.getRow(r);
    const encabezados: string[] = [];
    row.eachCell({ includeEmpty: true }, (cell) => encabezados.push(celdaTexto(cell.value)));
    const puntaje = encabezados.filter((h) => todos.includes(clave(h))).length;
    if (puntaje > mejor.puntaje) mejor = { fila: r, puntaje, encabezados };
  }
  return { fila: mejor.fila, encabezados: mejor.encabezados };
}

function mapearColumnas(encabezados: string[]): Partial<Record<CampoLogico, number>> {
  const mapeo: Partial<Record<CampoLogico, number>> = {};
  const normalizados = encabezados.map(clave);
  (Object.keys(COLUMNAS) as CampoLogico[]).forEach((campo) => {
    const candidatos = COLUMNAS[campo].map(clave);
    // 1) coincidencia exacta; 2) el encabezado empieza por un candidato
    let idx = normalizados.findIndex((h) => candidatos.includes(h));
    if (idx < 0) idx = normalizados.findIndex((h) => candidatos.some((c) => h.startsWith(c)));
    if (idx >= 0) mapeo[campo] = idx;
  });
  return mapeo;
}

export async function leerExcel(ruta: string): Promise<ResultadoLectura> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(ruta);
  const ws = wb.worksheets[0];
  if (!ws) throw new Error('El archivo no tiene hojas.');

  const { fila, encabezados } = detectarEncabezado(ws);
  const mapeo = mapearColumnas(encabezados);

  if (mapeo.codigo == null || mapeo.nombre == null) {
    throw new Error(
      'No pude identificar las columnas obligatorias (código y nombre).\n' +
        `Fila de encabezado detectada: ${fila}\n` +
        'Encabezados encontrados:\n  - ' + encabezados.filter(Boolean).join('\n  - ') +
        '\n\nAjusta los nombres candidatos en scripts/ingesta-dane/config.ts (COLUMNAS).',
    );
  }

  const ocupaciones: OcupacionCruda[] = [];
  for (let r = fila + 1; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const val = (campo: CampoLogico): string => {
      const idx = mapeo[campo];
      if (idx == null) return '';
      return celdaTexto(row.getCell(idx + 1).value).trim();
    };
    const codigo = val('codigo');
    const nombre = val('nombre');
    if (!codigo && !nombre) continue; // fila vacía
    ocupaciones.push({
      codigo,
      nombre,
      descripcion: val('descripcion'),
      nivel_competencia: val('nivel_competencia'),
      area_cualificacion: val('area_cualificacion'),
      conocimientos: val('conocimientos'),
      destrezas: val('destrezas'),
    });
  }

  return { hoja: ws.name, filaEncabezado: fila, encabezados: encabezados.filter(Boolean), mapeo, ocupaciones };
}
