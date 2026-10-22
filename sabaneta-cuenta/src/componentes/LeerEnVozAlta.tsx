'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { Square, Volume2 } from 'lucide-react'
import { textos } from '@/textos/es'

const soportado = () => typeof window !== 'undefined' && 'speechSynthesis' in window

/** Lee un texto en voz alta con la voz del celular (es-CO si existe). */
export function LeerEnVozAlta({ texto, className = '' }: { texto: string; className?: string }) {
  const disponible = useSyncExternalStore(
    () => () => {},
    soportado,
    () => false,
  )
  const [leyendo, setLeyendo] = useState(false)

  useEffect(() => () => window.speechSynthesis?.cancel(), [])

  if (!disponible) return null

  function alternar() {
    const voz = window.speechSynthesis
    if (leyendo) {
      voz.cancel()
      setLeyendo(false)
      return
    }
    voz.cancel()
    const frase = new SpeechSynthesisUtterance(texto)
    frase.lang = 'es-CO'
    frase.rate = 0.95
    const voces = voz.getVoices()
    frase.voice = voces.find((v) => v.lang === 'es-CO') ?? voces.find((v) => v.lang.startsWith('es')) ?? null
    frase.onend = () => setLeyendo(false)
    frase.onerror = () => setLeyendo(false)
    setLeyendo(true)
    voz.speak(frase)
  }

  return (
    <button
      type="button"
      onClick={alternar}
      aria-pressed={leyendo}
      className={`inline-flex min-h-tocable items-center gap-2 rounded-full border border-borde bg-tarjeta px-4 tipo-etiqueta text-titulo transition active:scale-[0.98] aria-pressed:border-verde ${className}`}
    >
      {leyendo ? (
        <Square aria-hidden="true" className="size-5 fill-current" />
      ) : (
        <Volume2 aria-hidden="true" className="size-5" />
      )}
      {leyendo ? textos.voz.detener : textos.voz.leer}
    </button>
  )
}
