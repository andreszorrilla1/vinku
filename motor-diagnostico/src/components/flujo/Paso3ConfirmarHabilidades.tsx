// Paso 3 — Confirmación de habilidades.
//  - La persona confirma/descarta cada sugerencia del CV y declara nivel.
//  - Puede agregar habilidades DEL CATÁLOGO vía autocomplete (nunca texto libre).
//  - Sondeo conversacional de soft/power skills (5.1.4.1): preguntas situacionales
//    que generan sugerencias inferidas adicionales, nunca autoconfirmadas.
//  - Nota de techo de confianza + gancho CampusLife (5.1.4.2).
import { useMemo, useState } from 'react';
import { ArrowRight, Plus, Search, Sparkles } from 'lucide-react';
import type {
  CvExtractionResult,
  PersonSkillStatus,
  SelfReportedLevel,
  Skill,
} from '@/lib/types';
import { SKILLS, SKILL_BY_ID } from '@/data/mockCatalog';
import { extraerHabilidadesDeCV } from '@/services/extraccionCV';
import { MARCA } from '@/lib/marca';
import { Boton, Card, Pill } from '@/components/ui/kit';
import { SkillBadge, LeyendaEstados } from '@/components/ui/SkillBadge';

const NIVELES: SelfReportedLevel[] = ['básico', 'intermedio', 'avanzado'];

interface Fila {
  skill: Skill;
  inferida: boolean;
  confianza: number;
  snippet: string;
  confirmada: boolean;
  nivel: SelfReportedLevel;
}

export function Paso3ConfirmarHabilidades({
  extraccion,
  onListo,
}: {
  extraccion: CvExtractionResult;
  onListo: (estados: PersonSkillStatus[]) => void;
}) {
  const iniciales: Fila[] = useMemo(
    () =>
      extraccion.matches.map((m) => ({
        skill: SKILL_BY_ID.get(m.skill_id)!,
        inferida: m.match_type === 'semantico_inferido',
        confianza: m.match_confidence,
        snippet: m.source_snippet,
        confirmada: !m.match_type.startsWith('semantico'), // inferidas NO autoconfirmadas
        nivel: 'intermedio' as SelfReportedLevel,
      })).filter((f) => f.skill),
    [extraccion],
  );

  const [filas, setFilas] = useState<Fila[]>(iniciales);
  const [busqueda, setBusqueda] = useState('');
  const [sondeo, setSondeo] = useState('');
  const [sugerenciasSondeo, setSugerenciasSondeo] = useState<Fila[]>([]);

  const idsEnLista = new Set(filas.map((f) => f.skill.id));

  const resultadosBusqueda =
    busqueda.trim().length >= 2
      ? SKILLS.filter(
          (s) => !idsEnLista.has(s.id) && s.name.toLowerCase().includes(busqueda.toLowerCase()),
        ).slice(0, 6)
      : [];

  function toggle(id: string) {
    setFilas((fs) => fs.map((f) => (f.skill.id === id ? { ...f, confirmada: !f.confirmada } : f)));
  }
  function setNivel(id: string, nivel: SelfReportedLevel) {
    setFilas((fs) => fs.map((f) => (f.skill.id === id ? { ...f, nivel } : f)));
  }
  function agregar(skill: Skill) {
    setFilas((fs) => [...fs, { skill, inferida: false, confianza: 1, snippet: '', confirmada: true, nivel: 'intermedio' }]);
    setBusqueda('');
  }

  async function correrSondeo() {
    if (!sondeo.trim()) return;
    const r = await extraerHabilidadesDeCV(sondeo.trim());
    const nuevas = r.matches
      .map((m) => SKILL_BY_ID.get(m.skill_id))
      .filter((s): s is Skill => Boolean(s) && (s!.skill_type === 'soft' || s!.skill_type === 'power'))
      .filter((s) => !idsEnLista.has(s.id) && !sugerenciasSondeo.some((x) => x.skill.id === s.id))
      .map((s) => ({ skill: s, inferida: true, confianza: 0.5, snippet: '', confirmada: false, nivel: 'básico' as SelfReportedLevel }));
    setSugerenciasSondeo((prev) => [...prev, ...nuevas]);
  }

  function aceptarSugerenciaSondeo(id: string) {
    const s = sugerenciasSondeo.find((x) => x.skill.id === id);
    if (!s) return;
    setFilas((fs) => [...fs, { ...s, confirmada: true }]);
    setSugerenciasSondeo((prev) => prev.filter((x) => x.skill.id !== id));
  }

  function continuar() {
    const estados: PersonSkillStatus[] = filas
      .filter((f) => f.confirmada)
      .map((f) => ({
        skill_id: f.skill.id,
        status: 'autodeclarada',
        self_reported_level: f.nivel,
        evidence_source: null,
      }));
    onListo(estados);
  }

  const duras = filas.filter((f) => f.skill.skill_type === 'hard');
  const blandas = filas.filter((f) => f.skill.skill_type !== 'hard');

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-extrabold sm:text-3xl">Confirma tus habilidades</h1>
        <p className="text-marca-gris">
          Esto es lo que detectamos en tu hoja de vida. Confirma lo que sí aplica y ajusta tu nivel.
          Lo que marques queda como <strong>autodeclarado</strong> — tú nos lo cuentas.
        </p>
        <LeyendaEstados />
      </header>

      {[{ t: 'Habilidades técnicas', lista: duras }, { t: 'Habilidades blandas y de poder', lista: blandas }].map(
        ({ t, lista }) =>
          lista.length > 0 && (
            <section key={t} className="space-y-3">
              <h2 className="font-display text-lg font-bold">{t}</h2>
              {lista.map((f) => (
                <Card key={f.skill.id} className={f.confirmada ? '' : 'opacity-60'}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <SkillBadge nombre={f.skill.name} estado="autodeclarada" tipo={f.skill.skill_type} inferida={f.inferida} />
                        {f.inferida && <Pill color={MARCA.gris}>confianza {Math.round(f.confianza * 100)}%</Pill>}
                      </div>
                      {f.inferida && (
                        <p className="text-xs text-marca-gris">
                          Esto lo inferimos de tu experiencia{f.snippet ? `: ${f.snippet}` : ''}. Confírmanos si aplica.
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={f.nivel}
                        onChange={(e) => setNivel(f.skill.id, e.target.value as SelfReportedLevel)}
                        disabled={!f.confirmada}
                        className="rounded-lg border px-2 py-1.5 text-sm"
                        style={{ borderColor: MARCA.bordeSuave }}
                      >
                        {NIVELES.map((n) => <option key={n} value={n}>{n}</option>)}
                      </select>
                      <Boton variante={f.confirmada ? 'secundario' : 'primario'} onClick={() => toggle(f.skill.id)}>
                        {f.confirmada ? 'Quitar' : 'Sí, la tengo'}
                      </Boton>
                    </div>
                  </div>
                </Card>
              ))}
            </section>
          ),
      )}

      {/* Agregar del catálogo — autocomplete, nunca texto libre */}
      <section className="space-y-2">
        <h2 className="font-display text-lg font-bold">¿Te faltó alguna? Agrégala</h2>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-3.5 text-marca-gris" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Busca en nuestro catálogo de habilidades…"
            className="w-full rounded-xl border py-2.5 pl-9 pr-4 outline-none focus:ring-2"
            style={{ borderColor: MARCA.bordeSuave }}
          />
          {resultadosBusqueda.length > 0 && (
            <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border bg-white shadow-lg" style={{ borderColor: MARCA.bordeSuave }}>
              {resultadosBusqueda.map((s) => (
                <button key={s.id} onClick={() => agregar(s)} className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-marca-hueso">
                  <span>{s.name}</span>
                  <Plus size={15} style={{ color: MARCA.violeta }} />
                </button>
              ))}
            </div>
          )}
        </div>
        <p className="text-xs text-marca-gris">Solo puedes agregar habilidades de nuestro catálogo — así todo el sistema habla el mismo idioma.</p>
      </section>

      {/* Sondeo conversacional de soft/power skills */}
      <Card className="border-dashed">
        <div className="flex items-center gap-2">
          <Sparkles size={18} style={{ color: MARCA.violeta }} />
          <h2 className="font-display text-lg font-bold">Hablemos de lo que un CV no captura</h2>
        </div>
        <p className="mt-1 text-sm text-marca-gris">
          Cuéntanos de una vez que tuviste que resolver un conflicto en equipo, coordinar personas o manejar una situación difícil.
        </p>
        <textarea
          value={sondeo}
          onChange={(e) => setSondeo(e.target.value)}
          rows={3}
          placeholder="Ej: cuando coordiné al equipo para cumplir un cierre bajo presión…"
          className="mt-3 w-full rounded-xl border px-4 py-2.5 outline-none focus:ring-2"
          style={{ borderColor: MARCA.bordeSuave }}
        />
        <div className="mt-2">
          <Boton variante="secundario" onClick={correrSondeo} disabled={!sondeo.trim()}>Analizar mi respuesta</Boton>
        </div>
        {sugerenciasSondeo.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-semibold">De lo que contaste, inferimos (confírmanos si aplica):</p>
            <div className="flex flex-wrap gap-2">
              {sugerenciasSondeo.map((s) => (
                <button key={s.skill.id} onClick={() => aceptarSugerenciaSondeo(s.skill.id)} className="transition hover:scale-[1.03]">
                  <SkillBadge nombre={`+ ${s.skill.name}`} estado="autodeclarada" tipo={s.skill.skill_type} inferida />
                </button>
              ))}
            </div>
          </div>
        )}
        <p className="mt-4 rounded-lg bg-marca-hueso p-3 text-xs text-marca-gris">
          💡 Una habilidad blanda que tú declaras tiene un techo de confianza más bajo que una técnica.
          Con <strong>CampusLife</strong> (retos en vivo, voluntariado) podrás respaldarla con evidencia real
          antes de validarla formalmente con SkillPass.
        </p>
      </Card>

      <div className="flex justify-end">
        <Boton onClick={continuar} disabled={!filas.some((f) => f.confirmada)}>
          Ver mi resultado <ArrowRight size={16} />
        </Boton>
      </div>
    </div>
  );
}
