// ============================================================================
// Chip de habilidad con distinción visual OBLIGATORIA (regla 7.2):
// autodeclarada, validada, ajustada y brecha se ven claramente distintas.
// La fuente de verdad de los estilos es lib/marca.ts (ESTADO_HABILIDAD).
// ============================================================================

import { ESTADO_HABILIDAD, type EstadoHabilidadKey } from '@/lib/marca';
import type { SkillType } from '@/lib/types';

const TIPO_ICONO: Record<SkillType, string> = {
  hard: '🛠️',
  soft: '🤝',
  power: '⚡',
};

export function SkillBadge({
  nombre,
  estado,
  tipo,
  nivel,
  inferida,
}: {
  nombre: string;
  estado: EstadoHabilidadKey;
  tipo?: SkillType;
  nivel?: string | null;
  inferida?: boolean;
}) {
  const e = ESTADO_HABILIDAD[estado];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium"
      style={{ background: e.bg, borderColor: e.borde, color: e.texto }}
      title={e.ayuda}
    >
      {tipo && <span aria-hidden>{TIPO_ICONO[tipo]}</span>}
      <span>{nombre}</span>
      {nivel && <span className="opacity-70">· {nivel}</span>}
      {inferida && <span className="opacity-70" title="Inferido de tu experiencia">· inferida</span>}
    </span>
  );
}

/** Leyenda que explica los estados a la persona (usabilidad, sección 9.2). */
export function LeyendaEstados() {
  const claves: EstadoHabilidadKey[] = ['autodeclarada', 'validada_skillpass'];
  return (
    <div className="flex flex-wrap gap-3 text-xs text-marca-gris">
      {claves.map((k) => {
        const e = ESTADO_HABILIDAD[k];
        return (
          <span key={k} className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-3 w-3 rounded-full border"
              style={{ background: e.bg, borderColor: e.borde }}
            />
            <strong style={{ color: e.texto }}>{e.label}:</strong> {e.ayuda}
          </span>
        );
      })}
    </div>
  );
}
