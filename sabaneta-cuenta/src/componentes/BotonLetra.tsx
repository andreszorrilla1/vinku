'use client'

import { useSyncExternalStore } from 'react'
import { aplicarLetra } from '@/componentes/preferencias'
import { textos } from '@/textos/es'

function suscribir(avisar: () => void) {
  const observador = new MutationObserver(avisar)
  observador.observe(document.documentElement, { attributes: true, attributeFilter: ['data-letra'] })
  return () => observador.disconnect()
}

export function useLetraGrande() {
  return useSyncExternalStore(
    suscribir,
    () => document.documentElement.dataset.letra === 'grande',
    () => false,
  )
}

/** Botón «Aa» para agrandar la letra en cualquier pantalla. */
export function BotonLetra() {
  const grande = useLetraGrande()
  return (
    <button
      type="button"
      onClick={() => aplicarLetra(grande ? 'normal' : 'grande')}
      aria-pressed={grande}
      aria-label={grande ? textos.preferencias.letraNormal : textos.preferencias.letraGrande}
      title={grande ? textos.preferencias.letraNormal : textos.preferencias.letraGrande}
      className="flex size-14 items-center justify-center rounded-full border border-borde bg-tarjeta font-titulo text-lg font-extrabold text-titulo shadow-tarjeta transition active:scale-95 aria-pressed:border-verde aria-pressed:bg-verde aria-pressed:text-sobre-verde"
    >
      <span aria-hidden="true">
        A<span className="text-[1.3em]">a</span>
      </span>
    </button>
  )
}
