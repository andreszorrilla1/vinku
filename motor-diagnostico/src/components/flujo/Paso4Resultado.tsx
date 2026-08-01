// Paso 4 — El resultado. La pieza más importante de la interfaz (sección 9.2).
//  - "Estás aquí → puedes llegar a X → te faltan N → por qué te conviene".
//  - Prioriza por afinidad con el propósito (motorGrafo).
//  - Nunca muestra códigos CUOC/MNC a la persona (sección 9.2).
//  - Copy normativo SIEMPRE vía avalNormativo (regla 7.4).
//  - Salida DUAL: la ruta queda "esperando revisión humana", nunca definitiva (7.3).
import { useMemo } from 'react';
import { ArrowRight, CheckCircle2, Sparkles, Target, UserCheck } from 'lucide-react';
import type { PathwayGapAnalysis, Person, PersonSkillStatus, Skill } from '@/lib/types';
import { calcularDiagnostico } from '@/services/motorGrafo';
import { avalNormativo } from '@/lib/copyNormativo';
import type { Catalogo } from '@/data/catalogoRepo';
import { MARCA } from '@/lib/marca';
import { Card, Pill } from '@/components/ui/kit';
import { SkillBadge } from '@/components/ui/SkillBadge';

export function Paso4Resultado({
  persona,
  estados,
  catalogo,
}: {
  persona: Person;
  estados: PersonSkillStatus[];
  catalogo: Catalogo;
}) {
  const SKILL_BY_ID = catalogo.skillById;
  const analisis = useMemo(
    () =>
      calcularDiagnostico({
        persona,
        estados,
        skills: catalogo.skills,
        pathways: catalogo.pathways,
        requisitos: catalogo.requirements,
      }),
    [persona, estados, catalogo],
  );

  const [top, ...resto] = analisis;
  const misHabilidades = estados.map((e) => SKILL_BY_ID.get(e.skill_id)?.name).filter(Boolean) as string[];

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <Pill><Sparkles size={13} /> Tu diagnóstico</Pill>
        <h1 className="text-2xl font-extrabold sm:text-3xl">
          {persona.full_name ? `${persona.full_name}, esto` : 'Esto'} es lo que vimos y a dónde puedes llegar
        </h1>
        <p className="text-marca-gris">
          Ordenamos las rutas por lo que <strong>tú</strong> nos dijiste que buscas, no solo por cuál es más cercana.
        </p>
      </header>

      {/* Estás aquí */}
      <Card>
        <div className="flex items-center gap-2 text-sm font-semibold text-marca-gris">
          <Target size={16} /> Estás aquí hoy
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {estados.map((e) => {
            const sk = SKILL_BY_ID.get(e.skill_id);
            return sk ? <SkillBadge key={e.skill_id} nombre={sk.name} estado="autodeclarada" tipo={sk.skill_type} nivel={e.self_reported_level} /> : null;
          })}
        </div>
        <p className="mt-3 text-xs text-marca-gris">
          Todas están marcadas como <strong>autodeclaradas</strong>. Cuando quieras, SkillPass las valida con evidencia.
        </p>
      </Card>

      {/* Ruta principal — el momento central */}
      {top && <TarjetaRuta a={top} destacada skillById={SKILL_BY_ID} />}

      {/* Otras rutas */}
      {resto.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold">Otras rutas que te calzan</h2>
          {resto.slice(0, 4).map((a) => <TarjetaRuta key={a.pathway.id} a={a} skillById={SKILL_BY_ID} />)}
        </section>
      )}

      {/* Salida dual — revisión humana */}
      <Card className="!bg-marca-violeta-suave">
        <div className="flex items-start gap-3">
          <UserCheck size={22} style={{ color: MARCA.violeta }} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-display font-bold">Un asesor de VinkU va a revisar tu ruta</p>
            <p className="text-sm text-marca-gris">
              Esta es una propuesta generada con IA. Una persona del equipo la confirma o la ajusta contigo
              antes de que sea definitiva. Te contactaremos {persona.whatsapp ? 'por WhatsApp' : 'muy pronto'}.
            </p>
          </div>
        </div>
      </Card>

      {misHabilidades.length > 0 && (
        <p className="text-center text-sm text-marca-gris">La movilidad de habilidades es la movilidad de vida.</p>
      )}
    </div>
  );
}

function TarjetaRuta({ a, destacada = false, skillById }: { a: PathwayGapAnalysis; destacada?: boolean; skillById: Map<string, Skill> }) {
  const aval = avalNormativo(a.pathway);
  const esEmprendimiento = a.pathway.pathway_type === 'objetivo_no_ocupacional';
  const faltan = a.missing_skill_ids.map((id) => skillById.get(id)).filter(Boolean);
  const fortalezas = a.domain_strength_skill_ids.map((id) => skillById.get(id)).filter(Boolean);

  const tonoAval =
    aval.tono === 'oficial' ? MARCA.violeta : aval.tono === 'alineado' ? MARCA.gris : '#8A6D00';

  return (
    <Card className={destacada ? 'ring-2' : ''}>
      <div style={destacada ? { boxShadow: `inset 0 0 0 9999px transparent` } : undefined}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            {destacada && <Pill><Sparkles size={12} /> Tu mejor ruta según tu meta</Pill>}
            <h3 className="mt-1 font-display text-xl font-bold">{a.pathway.name}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold" style={{ color: tonoAval }} title={aval.descripcion}>
                {aval.etiqueta}
              </span>
              {a.pathway.sector && <span className="text-xs text-marca-gris">· {a.pathway.sector}</span>}
            </div>
          </div>
          <div className="text-right">
            <div className="font-display text-3xl font-extrabold" style={{ color: a.steps_away === 0 ? '#1F6B3B' : MARCA.violeta }}>
              {a.steps_away}
            </div>
            <div className="text-xs text-marca-gris">{a.steps_away === 1 ? 'habilidad por desarrollar' : 'habilidades por desarrollar'}</div>
          </div>
        </div>

        {/* Fortalezas de dominio (solo emprendimiento) — se muestran como fortaleza, no brecha */}
        {esEmprendimiento && fortalezas.length > 0 && (
          <div className="mt-4">
            <p className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold" style={{ color: '#1F6B3B' }}>
              <CheckCircle2 size={15} /> Esto ya lo tienes para ofrecer
            </p>
            <div className="flex flex-wrap gap-2">
              {fortalezas.map((s) => s && <SkillBadge key={s.id} nombre={s.name} estado="autodeclarada" tipo={s.skill_type} />)}
            </div>
          </div>
        )}

        {/* Brecha */}
        {faltan.length > 0 && (
          <div className="mt-4">
            <p className="mb-1.5 text-sm font-semibold">
              {esEmprendimiento ? 'La capa de cómo emprender que te falta' : 'Lo que te separa de esta ruta'}
            </p>
            <div className="flex flex-wrap gap-2">
              {faltan.map((s) => s && <SkillBadge key={s.id} nombre={s.name} estado="brecha_identificada" tipo={s.skill_type} />)}
            </div>
          </div>
        )}

        {/* Por qué te conviene — conectado al propósito */}
        <div className="mt-4 rounded-xl p-3" style={{ background: MARCA.blancoHueso }}>
          <p className="text-sm">{a.ai_rationale}</p>
        </div>

        {/* Recomendación de servicio */}
        <div className="mt-3 flex items-center gap-2 text-sm">
          <ArrowRight size={15} style={{ color: MARCA.violeta }} />
          <span className="font-medium">
            {a.recommended_path === 'skillpass'
              ? 'Camino sugerido: SkillPass (brecha corta, validación y ajuste).'
              : 'Camino sugerido: UniVenture (acompañamiento profundo, ruta de varios cursos).'}
          </span>
        </div>
      </div>
    </Card>
  );
}
