/**
 * Celulares de Colombia: 10 números que empiezan por 3 (ej. 300 123 4567).
 * Se guardan en formato internacional E.164: +573001234567.
 */

/** Devuelve el celular en E.164 (+57…) o null si no es un celular colombiano válido. */
export function normalizarCelular(entrada: string): string | null {
  let digitos = entrada.replace(/\D/g, '')
  if (digitos.length === 12 && digitos.startsWith('57')) digitos = digitos.slice(2)
  if (digitos.length === 13 && digitos.startsWith('057')) digitos = digitos.slice(3)
  if (!/^3\d{9}$/.test(digitos)) return null
  return `+57${digitos}`
}

/** Para mostrar: +573001234567 → 300 123 4567 */
export function formatearCelular(e164: string): string {
  const d = e164.replace(/\D/g, '').replace(/^57/, '')
  if (d.length !== 10) return e164
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`
}

/** Formato mientras se escribe: 3001234 → 300 123 4 */
export function formatearMientrasEscribe(entrada: string): string {
  const d = entrada
    .replace(/\D/g, '')
    .replace(/^57(?=3)/, '')
    .slice(0, 10)
  return [d.slice(0, 3), d.slice(3, 6), d.slice(6)].filter(Boolean).join(' ')
}
