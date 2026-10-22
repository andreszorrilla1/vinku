import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { buscarPalabrasProhibidas } from '@/textos/prohibidas'
import { textos } from '@/textos/es'

function archivos(dir: string): string[] {
  return readdirSync(dir).flatMap((nombre) => {
    const ruta = path.join(dir, nombre)
    if (statSync(ruta).isDirectory()) return archivos(ruta)
    return /\.(ts|tsx)$/.test(nombre) && !nombre.endsWith('prohibidas.ts') ? [ruta] : []
  })
}

describe('palabras prohibidas', () => {
  it('detecta las palabras y sus formas', () => {
    for (const frase of [
      'Vota por nosotros',
      'tu voto cuenta',
      'Hay un premio',
      'gana un mercado',
      'Ganador del mes',
      'Gran sorteo',
      'una rifa',
      'un regalo para ti',
      'Te regalamos',
      'votar es fácil',
    ]) {
      expect(buscarPalabrasProhibidas(frase), frase).not.toHaveLength(0)
    }
  })

  it('no confunde palabras normales', () => {
    for (const frase of ['Organizar la cuadra', 'Devoto del barrio', 'Sabaneta Cuenta', 'Ganadería y campo', 'Rifle']) {
      expect(buscarPalabrasProhibidas(frase), frase).toHaveLength(0)
    }
  })

  it('los textos de la app no piden el voto ni prometen premios', () => {
    expect(buscarPalabrasProhibidas(JSON.stringify(textos))).toEqual([])
  })

  it('ningún archivo de la interfaz tiene palabras prohibidas', () => {
    const raiz = path.resolve(import.meta.dirname, '../../src')
    const hallazgos = archivos(raiz).flatMap((ruta) =>
      buscarPalabrasProhibidas(readFileSync(ruta, 'utf-8')).map((p) => `${path.relative(raiz, ruta)}: ${p}`),
    )
    expect(hallazgos).toEqual([])
  })
})
