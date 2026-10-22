/**
 * Tokens de color de Sabaneta Cuenta (sección 4 del prompt).
 * `src/app/globals.css` debe repetir exactamente estos valores:
 * la prueba `pruebas/unidad/tokens.test.ts` lo verifica, junto con el contraste AA.
 */
export const colores = {
  naranja: { claro: '#F28C1E', oscuro: '#F28C1E' },
  'naranja-texto': { claro: '#B45309', oscuro: '#F5A04A' },
  verde: { claro: '#1E7A3C', oscuro: '#4CB872' },
  'verde-profundo': { claro: '#14532D', oscuro: '#0B1D13' },
  crema: { claro: '#FBF6EC', oscuro: '#11251A' },
  tarjeta: { claro: '#FFFFFF', oscuro: '#183223' },
  tinta: { claro: '#1C2B22', oscuro: '#F3EFE6' },
  'tinta-suave': { claro: '#4A5A50', oscuro: '#B9C2BA' },
  borde: { claro: '#E3DBCB', oscuro: '#2C4A37' },
  dolor: { claro: '#C2410C', oscuro: '#FB8B4E' },
  deseo: { claro: '#1D6FB8', oscuro: '#6AA8E8' },
  proyecto: { claro: '#1E7A3C', oscuro: '#4CB872' },
  aviso: { claro: '#A16207', oscuro: '#E8B04A' },
  error: { claro: '#B91C1C', oscuro: '#F87171' },
} as const

export type NombreColor = keyof typeof colores
export type Tema = 'claro' | 'oscuro'
