/**
 * Reglas de oro: no se pide el voto y no hay premios.
 * Estas raíces no pueden aparecer en la interfaz (pruebas unitarias y e2e las buscan).
 */
const raices = [
  'vot(?:a|as|e|en|o|os|ar|emos|ación|aciones|ante|antes)', // vota, voto, votar…
  'premi(?:o|os|a|ar|amos|ado|ados)',
  'gan(?:a|as|an|ar|ó|amos|ador|adora|adores|adoras|aste)',
  'sorteos?',
  'rifas?',
  'regal(?:o|os|a|ar|amos|ado|ados)',
]

const patron = new RegExp(`(?<![\\p{L}])(?:${raices.join('|')})(?![\\p{L}])`, 'giu')

/** Devuelve las palabras prohibidas encontradas en el texto (vacío si no hay). */
export function buscarPalabrasProhibidas(texto: string): string[] {
  return [...texto.matchAll(patron)].map((m) => m[0])
}
