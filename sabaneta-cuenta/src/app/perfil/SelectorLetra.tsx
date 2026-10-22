'use client'

import { useEffect, useTransition } from 'react'
import { useLetraGrande } from '@/componentes/BotonLetra'
import { aplicarLetra } from '@/componentes/preferencias'
import { textos } from '@/textos/es'
import { guardarTamanoLetra } from './acciones'

const t = textos.perfil

/** Control segmentado Normal / Grande. Aplica al instante y lo guarda en el perfil. */
export function SelectorLetra({ guardado }: { guardado: 'normal' | 'grande' }) {
  const grande = useLetraGrande()
  const [, iniciar] = useTransition()

  // Si en este celular no había preferencia, toma la del perfil.
  useEffect(() => {
    try {
      if (!localStorage.getItem('sc-letra')) aplicarLetra(guardado)
    } catch {}
  }, [guardado])

  function elegir(tamano: 'normal' | 'grande') {
    aplicarLetra(tamano)
    iniciar(async () => {
      await guardarTamanoLetra(tamano)
    })
  }

  return (
    <div role="radiogroup" aria-label={t.letra} className="grid grid-cols-2 gap-1 rounded-full bg-crema p-1">
      {(['normal', 'grande'] as const).map((tamano) => {
        const activo = (tamano === 'grande') === grande
        return (
          <button
            key={tamano}
            type="button"
            role="radio"
            aria-checked={activo}
            onClick={() => elegir(tamano)}
            className={`min-h-12 rounded-full tipo-etiqueta transition-colors ${activo ? 'bg-verde text-sobre-verde shadow-tarjeta' : 'text-tinta-suave'} ${tamano === 'grande' ? 'text-xl' : ''}`}
          >
            {tamano === 'grande' ? t.letraGrande : t.letraNormal}
          </button>
        )
      })}
    </div>
  )
}
