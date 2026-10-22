import { describe, expect, it } from 'vitest'
import { esquemaCelular, esquemaCodigo, esquemaConsentimiento, esquemaPerfil, esquemaSiguiente } from '@/lib/esquemas'
import { cuadraH3 } from '@/lib/cuadra'

describe('esquemas de entrada', () => {
  it('celular válido e inválido', () => {
    expect(esquemaCelular.parse('300 111 2233')).toBe('+573001112233')
    expect(esquemaCelular.safeParse('604 111 2233').success).toBe(false)
  })

  it('código de 6 números', () => {
    expect(esquemaCodigo.parse('12 34 56')).toBe('123456')
    expect(esquemaCodigo.safeParse('12345').success).toBe(false)
  })

  it('siguiente solo acepta rutas internas', () => {
    expect(esquemaSiguiente.parse('/contar')).toBe('/contar')
    expect(esquemaSiguiente.parse('/contar?tipo=dolor')).toBe('/contar?tipo=dolor')
    expect(esquemaSiguiente.parse('//malo.com')).toBe('')
    expect(esquemaSiguiente.parse('https://malo.com')).toBe('')
    expect(esquemaSiguiente.parse('/\\malo.com')).toBe('')
  })

  it('consentimiento exige el tratamiento y deja lo demás opcional', () => {
    expect(esquemaConsentimiento.safeParse({ acepta_tratamiento: null }).success).toBe(false)
    expect(esquemaConsentimiento.parse({ acepta_tratamiento: 'on' })).toEqual({
      acepta_tratamiento: true,
      acepta_mostrar_nombre: false,
      acepta_whatsapp: false,
    })
  })

  it('perfil limpia el nombre y arma el punto', () => {
    const perfil = esquemaPerfil.parse({
      nombre_mostrar: '  Doña   Marta ',
      territorio_id: '2',
      rango_edad: 'mas_60',
      lat: '6.15',
      lng: '-75.615',
    })
    expect(perfil).toEqual({
      nombre_mostrar: 'Doña Marta',
      territorio_id: 2,
      rango_edad: 'mas_60',
      punto: { lat: 6.15, lng: -75.615 },
    })
  })

  it('perfil sin punto ni edad', () => {
    const perfil = esquemaPerfil.parse({ nombre_mostrar: 'Ana', territorio_id: '1', rango_edad: '', lat: '', lng: '' })
    expect(perfil.punto).toBeNull()
    expect(perfil.rango_edad).toBeNull()
  })

  it('perfil rechaza nombre corto y barrio vacío', () => {
    expect(esquemaPerfil.safeParse({ nombre_mostrar: 'A', territorio_id: '1' }).success).toBe(false)
    for (const territorio_id of ['', undefined, 'abc']) {
      const r = esquemaPerfil.safeParse({ nombre_mostrar: 'Ana', territorio_id })
      expect(r.success).toBe(false)
      expect(r.error?.issues[0]?.message).toBe('Elige tu barrio o vereda.')
    }
  })

  it('la cuadra es una celda H3 de resolución 10', () => {
    expect(cuadraH3(6.15, -75.615)).toMatch(/^8a[0-9a-f]{13}$/)
  })
})
