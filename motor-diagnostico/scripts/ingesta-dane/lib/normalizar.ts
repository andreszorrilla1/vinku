// Normalización y deduplicación de texto para la ingesta.

/** Quita tildes, pasa a minúsculas y colapsa espacios. Para COMPARAR, no mostrar. */
export function clave(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** Forma canónica para MOSTRAR: recorta y capitaliza la primera letra. */
export function canonizar(texto: string): string {
  const t = texto.replace(/\s+/g, ' ').trim();
  if (!t) return t;
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/** Divide una celda multi-valor en ítems limpios, sin duplicados por clave. */
export function separarItems(
  celda: string,
  delimitador: RegExp,
  prefijoLista: RegExp,
): string[] {
  if (!celda) return [];
  const partes = celda
    .split(delimitador)
    .map((p) => (p ?? '').replace(prefijoLista, '').replace(/\s+/g, ' ').trim())
    .filter((p) => p.length >= 2 && !/^[-–—.]+$/.test(p));

  const vistos = new Set<string>();
  const out: string[] = [];
  for (const p of partes) {
    const k = clave(p);
    if (!vistos.has(k)) {
      vistos.add(k);
      out.push(canonizar(p));
    }
  }
  return out;
}

/**
 * Acumulador de deduplicación: junta variantes del mismo ítem por clave,
 * cuenta frecuencia y conserva ejemplos de las formas originales vistas.
 */
export class Deduplicador {
  private mapa = new Map<
    string,
    { canonico: string; frecuencia: number; variantes: Set<string> }
  >();

  agregar(item: string): void {
    const k = clave(item);
    if (!k) return;
    const existente = this.mapa.get(k);
    if (existente) {
      existente.frecuencia += 1;
      existente.variantes.add(item);
    } else {
      this.mapa.set(k, { canonico: canonizar(item), frecuencia: 1, variantes: new Set([item]) });
    }
  }

  entradas(): Array<{ clave: string; canonico: string; frecuencia: number; variantes: string[] }> {
    return [...this.mapa.entries()]
      .map(([k, v]) => ({ clave: k, canonico: v.canonico, frecuencia: v.frecuencia, variantes: [...v.variantes] }))
      .sort((a, b) => b.frecuencia - a.frecuencia || a.canonico.localeCompare(b.canonico));
  }
}

// --- CSV mínimo (sin dependencias) ---------------------------------------
export function csvEscapar(valor: string | number): string {
  const s = String(valor ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function aCSV(filas: Array<Record<string, string | number>>, columnas: string[]): string {
  const cabecera = columnas.map(csvEscapar).join(',');
  const cuerpo = filas.map((f) => columnas.map((c) => csvEscapar(f[c] ?? '')).join(',')).join('\n');
  return cabecera + '\n' + cuerpo + '\n';
}

/** Parser CSV simple con soporte de comillas (suficiente para la propuesta revisada). */
export function desdeCSV(texto: string): Array<Record<string, string>> {
  const filas: string[][] = [];
  let campo = '';
  let fila: string[] = [];
  let enComillas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (enComillas) {
      if (c === '"') {
        if (texto[i + 1] === '"') { campo += '"'; i++; }
        else enComillas = false;
      } else campo += c;
    } else if (c === '"') enComillas = true;
    else if (c === ',') { fila.push(campo); campo = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && texto[i + 1] === '\n') i++;
      fila.push(campo); campo = '';
      if (fila.some((x) => x !== '')) filas.push(fila);
      fila = [];
    } else campo += c;
  }
  if (campo !== '' || fila.length) { fila.push(campo); if (fila.some((x) => x !== '')) filas.push(fila); }

  if (filas.length === 0) return [];
  const cab = filas[0];
  return filas.slice(1).map((f) => Object.fromEntries(cab.map((c, i) => [c, f[i] ?? ''])));
}
