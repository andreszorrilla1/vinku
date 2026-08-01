// Progreso siempre visible (sección 9.2): propósito → CV → habilidades → resultado.
import { Check } from 'lucide-react';
import { MARCA } from '@/lib/marca';

export const PASOS = ['Tu propósito', 'Tu hoja de vida', 'Tus habilidades', 'Tu resultado'] as const;

export function ProgressStepper({ actual }: { actual: number }) {
  return (
    <ol className="flex items-center gap-2" aria-label="Progreso del diagnóstico">
      {PASOS.map((label, i) => {
        const completado = i < actual;
        const activo = i === actual;
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition"
              style={{
                background: completado ? MARCA.violeta : activo ? MARCA.violetaSuave : '#F0F0F3',
                color: completado ? '#fff' : activo ? MARCA.violeta : MARCA.gris,
                outline: activo ? `2px solid ${MARCA.violeta}` : 'none',
                outlineOffset: 2,
              }}
            >
              {completado ? <Check size={15} /> : i + 1}
            </span>
            <span
              className="hidden text-sm font-medium sm:inline"
              style={{ color: activo ? MARCA.oscuro : MARCA.gris }}
            >
              {label}
            </span>
            {i < PASOS.length - 1 && (
              <span
                className="mx-1 hidden h-px flex-1 sm:block"
                style={{ background: completado ? MARCA.violeta : MARCA.bordeSuave }}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
