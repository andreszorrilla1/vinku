// Paso 1 — Captura del propósito ANTES de cualquier cosa técnica (sección 5.1.1).
// Una pregunta por pantalla (sección 9.2). Guarda macro, subcategoría y notas.
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import type { PurposeMacro, PurposeSubcategory } from '@/lib/types';
import {
  MACRO_LABEL,
  SUBCATEGORIA_LABEL,
  SUBCATEGORIA_DESC,
  SUBCATEGORIAS_POR_MACRO,
  validarProposito,
} from '@/lib/proposito';
import { MARCA } from '@/lib/marca';
import { Boton, Card } from '@/components/ui/kit';

export interface DatosProposito {
  purpose_macro: PurposeMacro;
  purpose_subcategory: PurposeSubcategory;
  purpose_notes: string;
  nombre: string;
}

export function Paso1Proposito({ onListo }: { onListo: (d: DatosProposito) => void }) {
  const [macro, setMacro] = useState<PurposeMacro | null>(null);
  const [sub, setSub] = useState<PurposeSubcategory | null>(null);
  const [notas, setNotas] = useState('');
  const [nombre, setNombre] = useState('');

  const macros: PurposeMacro[] = ['empleabilidad', 'emprendimiento'];

  function continuar() {
    if (!macro || !sub) return;
    validarProposito(macro, sub); // regla de consistencia en aplicación
    onListo({ purpose_macro: macro, purpose_subcategory: sub, purpose_notes: notas.trim(), nombre: nombre.trim() });
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-extrabold sm:text-3xl">Antes de mirar tus habilidades, cuéntanos qué buscas</h1>
        <p className="text-marca-gris">Esto es lo que hace que tu resultado sea tuyo y no una lista genérica.</p>
      </header>

      <Card>
        <label className="mb-1 block text-sm font-semibold">¿Cómo te llamas? <span className="font-normal text-marca-gris">(opcional)</span></label>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Tu nombre"
          className="w-full rounded-xl border px-4 py-2.5 outline-none focus:ring-2"
          style={{ borderColor: MARCA.bordeSuave }}
        />
      </Card>

      <div>
        <p className="mb-3 font-display text-lg font-bold">1. ¿Sobre qué es tu meta?</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {macros.map((m) => (
            <button
              key={m}
              onClick={() => { setMacro(m); setSub(null); }}
              className="rounded-2xl border-2 p-5 text-left transition"
              style={{
                borderColor: macro === m ? MARCA.violeta : MARCA.bordeSuave,
                background: macro === m ? MARCA.violetaSuave : '#fff',
              }}
            >
              <span className="font-display text-lg font-bold">{MACRO_LABEL[m]}</span>
              <span className="mt-1 block text-sm text-marca-gris">
                {m === 'empleabilidad' ? 'Crecer, emplearme o cambiar de perfil.' : 'Montar un negocio, ser independiente o consultor.'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {macro && (
        <div>
          <p className="mb-3 font-display text-lg font-bold">2. ¿Qué específicamente?</p>
          <div className="grid gap-3">
            {SUBCATEGORIAS_POR_MACRO[macro].map((sc) => (
              <button
                key={sc}
                onClick={() => setSub(sc)}
                className="flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition"
                style={{
                  borderColor: sub === sc ? MARCA.violeta : MARCA.bordeSuave,
                  background: sub === sc ? MARCA.violetaSuave : '#fff',
                }}
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
                  style={{ borderColor: sub === sc ? MARCA.violeta : MARCA.bordeSuave }}>
                  {sub === sc && <span className="h-2.5 w-2.5 rounded-full" style={{ background: MARCA.violeta }} />}
                </span>
                <span>
                  <span className="font-semibold">{SUBCATEGORIA_LABEL[sc]}</span>
                  <span className="block text-sm text-marca-gris">{SUBCATEGORIA_DESC[sc]}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {sub && (
        <Card>
          <label className="mb-1 block text-sm font-semibold">Cuéntanos en tus palabras por qué (así conectamos tu resultado con tu meta real)</label>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={3}
            placeholder="Ej: llevo 3 años en contabilidad y quiero montar mi propia asesoría contable."
            className="w-full rounded-xl border px-4 py-2.5 outline-none focus:ring-2"
            style={{ borderColor: MARCA.bordeSuave }}
          />
        </Card>
      )}

      <div className="flex justify-end">
        <Boton onClick={continuar} disabled={!macro || !sub}>
          Continuar <ArrowRight size={16} />
        </Boton>
      </div>
    </div>
  );
}
