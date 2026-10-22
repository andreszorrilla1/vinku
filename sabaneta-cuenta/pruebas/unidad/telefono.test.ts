import { describe, expect, it } from 'vitest'
import { formatearCelular, formatearMientrasEscribe, normalizarCelular } from '@/lib/telefono'

describe('celulares de Colombia', () => {
  it.each([
    ['3001234567', '+573001234567'],
    ['300 123 4567', '+573001234567'],
    ['300-123-4567', '+573001234567'],
    ['+57 300 123 4567', '+573001234567'],
    ['573001234567', '+573001234567'],
    ['(321) 765 4321', '+573217654321'],
  ])('%s → %s', (entrada, esperado) => {
    expect(normalizarCelular(entrada)).toBe(esperado)
  })

  it.each(['', '123', '6041234567', '30012345', '30012345678', '+1 300 123 4567', 'hola'])('rechaza %s', (entrada) => {
    expect(normalizarCelular(entrada)).toBeNull()
  })

  it('formatea para mostrar', () => {
    expect(formatearCelular('+573001234567')).toBe('300 123 4567')
  })

  it('formatea mientras se escribe', () => {
    expect(formatearMientrasEscribe('3')).toBe('3')
    expect(formatearMientrasEscribe('3001')).toBe('300 1')
    expect(formatearMientrasEscribe('3001234567999')).toBe('300 123 4567')
    expect(formatearMientrasEscribe('+57 3001234567')).toBe('300 123 4567')
  })
})
