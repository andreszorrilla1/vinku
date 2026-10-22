import { textos } from '@/textos/es'

export function Progreso({ actual, total }: { actual: number; total: number }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="tipo-etiqueta text-tinta-suave">{textos.bienvenida.paso(actual, total)}</p>
      <div
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={actual}
        aria-label={textos.bienvenida.paso(actual, total)}
        className="flex gap-2"
      >
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={`h-2 flex-1 rounded-full ${i < actual ? 'bg-verde' : 'bg-borde'}`} />
        ))}
      </div>
    </div>
  )
}
