// Orquestador del flujo de la persona. Mantiene el estado entre pasos y el
// progreso siempre visible (sección 9.2).
import { useState } from 'react';
import type { CvExtractionResult, Person, PersonSkillStatus } from '@/lib/types';
import { ProgressStepper } from '@/components/ui/ProgressStepper';
import { Logo } from '@/components/ui/Logo';
import { Paso1Proposito, type DatosProposito } from './Paso1Proposito';
import { Paso2SubirCV } from './Paso2SubirCV';
import { Paso3ConfirmarHabilidades } from './Paso3ConfirmarHabilidades';
import { Paso4Resultado } from './Paso4Resultado';

const nuevoId = () =>
  (crypto.randomUUID?.() ?? `p-${Date.now()}-${Math.random().toString(36).slice(2)}`);

export function FlujoDiagnostico() {
  const [paso, setPaso] = useState(0);
  const [persona, setPersona] = useState<Person | null>(null);
  const [extraccion, setExtraccion] = useState<CvExtractionResult | null>(null);
  const [estados, setEstados] = useState<PersonSkillStatus[]>([]);

  function onProposito(d: DatosProposito) {
    setPersona({
      id: nuevoId(),
      full_name: d.nombre || null,
      purpose_macro: d.purpose_macro,
      purpose_subcategory: d.purpose_subcategory,
      purpose_notes: d.purpose_notes || null,
    });
    setPaso(1);
  }

  return (
    <div className="min-h-full">
      <header className="border-b bg-white/80 backdrop-blur" style={{ borderColor: '#E7E5EC' }}>
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Logo />
          <span className="text-sm font-medium text-marca-gris">Diagnóstico de habilidades</span>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="mb-8">
          <ProgressStepper actual={paso} />
        </div>

        {paso === 0 && <Paso1Proposito onListo={onProposito} />}
        {paso === 1 && (
          <Paso2SubirCV
            onExtraido={(r) => {
              setExtraccion(r);
              setPaso(2);
            }}
          />
        )}
        {paso === 2 && extraccion && (
          <Paso3ConfirmarHabilidades
            extraccion={extraccion}
            onListo={(e) => {
              setEstados(e);
              setPaso(3);
            }}
          />
        )}
        {paso === 3 && persona && <Paso4Resultado persona={persona} estados={estados} />}
      </div>
    </div>
  );
}
