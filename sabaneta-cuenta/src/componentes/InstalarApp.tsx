'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'
import { textos } from '@/textos/es'

type EventoInstalar = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }

const CLAVE = 'sc-instalar-cerrado'

/** Tarjeta para instalar la PWA. Solo aparece si el navegador lo permite y el vecino no la cerró. */
export function InstalarApp() {
  const [evento, setEvento] = useState<EventoInstalar | null>(null)

  useEffect(() => {
    let cerrado = false
    try {
      cerrado = localStorage.getItem(CLAVE) === '1'
    } catch {}
    if (cerrado) return
    const guardar = (e: Event) => {
      e.preventDefault()
      setEvento(e as EventoInstalar)
    }
    window.addEventListener('beforeinstallprompt', guardar)
    return () => window.removeEventListener('beforeinstallprompt', guardar)
  }, [])

  if (!evento) return null

  function cerrar() {
    try {
      localStorage.setItem(CLAVE, '1')
    } catch {}
    setEvento(null)
  }

  async function instalar() {
    await evento?.prompt()
    await evento?.userChoice
    setEvento(null)
  }

  return (
    <aside className="flex animate-aparecer items-center gap-4 rounded-hoja border border-borde bg-tarjeta p-4 shadow-tarjeta">
      <Image src="/iconos/icono-192.png" alt="" width={48} height={48} className="size-12 shrink-0 rounded-tarjeta" />
      <div className="flex-1">
        <p className="tipo-etiqueta">{textos.instalar.titulo}</p>
        <p className="tipo-pequeno text-tinta-suave">{textos.instalar.texto}</p>
        <button
          type="button"
          onClick={instalar}
          className="mt-2 inline-flex min-h-12 items-center gap-2 rounded-full bg-verde px-4 tipo-etiqueta text-sobre-verde active:scale-[0.98]"
        >
          <Download aria-hidden="true" className="size-5" />
          {textos.instalar.boton}
        </button>
      </div>
      <button
        type="button"
        onClick={cerrar}
        aria-label={textos.instalar.cerrar}
        className="flex size-12 shrink-0 items-center justify-center self-start rounded-full text-tinta-suave"
      >
        <X aria-hidden="true" className="size-5" />
      </button>
    </aside>
  )
}
