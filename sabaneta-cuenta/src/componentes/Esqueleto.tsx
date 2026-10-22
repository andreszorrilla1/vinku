import { textos } from '@/textos/es'

/** Marcador mientras carga: bloques suaves con la forma de la pantalla (respeta «reducir movimiento»). */
export function Esqueleto({ bloques = 3 }: { bloques?: number }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-4">
      <span className="sr-only">{textos.cargando}</span>
      <div aria-hidden="true" className="h-9 w-3/4 animate-pulse rounded-campo bg-borde/70" />
      <div aria-hidden="true" className="h-5 w-full animate-pulse rounded-campo bg-borde/50" />
      {Array.from({ length: bloques }, (_, i) => (
        <div key={i} aria-hidden="true" className="h-20 animate-pulse rounded-hoja bg-borde/40" />
      ))}
    </div>
  )
}
