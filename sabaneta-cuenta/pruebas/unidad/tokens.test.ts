import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { colores, type NombreColor, type Tema } from '@/marca/tokens'

const css = readFileSync(path.resolve(import.meta.dirname, '../../src/app/globals.css'), 'utf-8').toLowerCase()

function luminancia(hex: string) {
  const canal = (i: number) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * canal(1) + 0.7152 * canal(3) + 0.0722 * canal(5)
}

function contraste(a: string, b: string) {
  const [la, lb] = [luminancia(a), luminancia(b)]
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

const c = (nombre: NombreColor, tema: Tema) => colores[nombre][tema]

describe('tokens de color', () => {
  it('globals.css repite exactamente los valores de tokens.ts', () => {
    for (const [nombre, valor] of Object.entries(colores)) {
      expect(css, `${nombre} claro`).toContain(`--${nombre}: ${valor.claro.toLowerCase()};`)
      expect(css, `${nombre} oscuro`).toContain(`--${nombre}: ${valor.oscuro.toLowerCase()};`)
    }
  })

  describe.each(['claro', 'oscuro'] as const)('contraste AA en tema %s', (tema) => {
    it.each(['tinta', 'tinta-suave', 'naranja-texto', 'dolor', 'deseo', 'proyecto', 'aviso', 'error'] as const)(
      '%s sobre crema y tarjeta ≥ 4.5',
      (nombre) => {
        expect(contraste(c(nombre, tema), c('crema', tema))).toBeGreaterThanOrEqual(4.5)
        expect(contraste(c(nombre, tema), c('tarjeta', tema))).toBeGreaterThanOrEqual(4.5)
      },
    )

    it('texto del botón principal sobre verde ≥ 4.5', () => {
      const sobreVerde = tema === 'claro' ? '#FFFFFF' : c('crema', 'oscuro')
      expect(contraste(sobreVerde, c('verde', tema))).toBeGreaterThanOrEqual(4.5)
    })

    it('tinta oscura sobre naranja (botón secundario) ≥ 4.5', () => {
      expect(contraste(c('tinta', 'claro'), c('naranja', tema))).toBeGreaterThanOrEqual(4.5)
    })

    it('borde de campos (tinta-suave) sobre fondo ≥ 3', () => {
      expect(contraste(c('tinta-suave', tema), c('crema', tema))).toBeGreaterThanOrEqual(3)
    })
  })
})
