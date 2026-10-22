'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

export function BotonCopiar({ valor, etiqueta, hecho }: { valor: string; etiqueta: string; hecho: string }) {
  const [copiado, setCopiado] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(valor)
          setCopiado(true)
          setTimeout(() => setCopiado(false), 2000)
        } catch {}
      }}
      className="inline-flex min-h-12 items-center gap-2 rounded-full border border-borde px-4 tipo-etiqueta text-titulo active:scale-[0.98]"
    >
      {copiado ? <Check aria-hidden="true" className="size-5" /> : <Copy aria-hidden="true" className="size-5" />}
      <span aria-live="polite">{copiado ? hecho : etiqueta}</span>
    </button>
  )
}
