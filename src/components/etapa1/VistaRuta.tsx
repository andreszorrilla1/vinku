// ============================================================
// Campus Pass — Vista de Ruta (Módulo 2 output)
// Muestra las 3 configuraciones (Express/Estándar/Completa),
// permite modificar cursos y seleccionar una ruta para cotizar.
// ============================================================

import { useMemo, useState } from "react";
import type {
  RutasGeneradas,
  Ruta,
  CursoEnRuta,
  Curso,
  ConfiguracionRuta,
  PerfilBrecha,
} from "../../types/etapa1";
import { formatCOP } from "../../lib/cotizacion";

interface Props {
  rutas: RutasGeneradas;
  perfil: PerfilBrecha["perfil_brecha"];
  catalogo: Curso[];
  onSeleccionar: (ruta: Ruta) => void;
}

function norm(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
}

// Recalcula cobertura y semanas para una lista de cursos personalizada.
function recomputar(cursos: CursoEnRuta[], perfil: PerfilBrecha["perfil_brecha"]) {
  const criticas = perfil.habilidades_criticas;
  const cubiertasSet = new Set<string>();
  for (const c of cursos) {
    for (const h of c.habilidades_que_desarrolla) {
      if (criticas.some((k) => norm(k).includes(norm(h)) || norm(h).includes(norm(k)))) {
        const match = criticas.find((k) => norm(k).includes(norm(h)) || norm(h).includes(norm(k)));
        if (match) cubiertasSet.add(norm(match));
      }
    }
  }
  const cobertura = criticas.length > 0
    ? Math.round((cubiertasSet.size / criticas.length) * 100)
    : 0;
  const semanas = cursos.reduce((s, c) => s + (c.duracion_semanas || 0), 0);
  return { cobertura, semanas };
}

const LABELS: Record<ConfiguracionRuta, string> = {
  express: "Express",
  estandar: "Estándar",
  completa: "Completa",
};

export default function VistaRuta({ rutas, perfil, catalogo, onSeleccionar }: Props) {
  const [config, setConfig] = useState<ConfiguracionRuta>(rutas.recomendada);
  const [modificando, setModificando] = useState(false);
  // ids de cursos excluidos + añadidos manualmente sobre la config base
  const [excluidos, setExcluidos] = useState<Set<string>>(new Set());
  const [añadidos, setAñadidos] = useState<Set<string>>(new Set());

  const rutaBase = rutas.rutas[config];

  // Ruta efectiva tras modificaciones
  const cursosEfectivos: CursoEnRuta[] = useMemo(() => {
    const base = rutaBase.cursos.filter((c) => !excluidos.has(c.id_curso));
    const extra = catalogo
      .filter((c) => añadidos.has(c.id_curso) && !base.some((b) => b.id_curso === c.id_curso))
      .map((c, i): CursoEnRuta => {
        const casoA = c.descuento_disponible && c.precio_vinku_cop > 0;
        const precioCliente = casoA ? Math.round(c.precio_publico_cop * 0.8) : Math.round(c.precio_publico_cop * 1.1);
        return {
          ...c,
          orden: base.length + i + 1,
          caso_comercial: casoA ? "A" : "B",
          precio_cliente_cop: precioCliente,
          margen_vinku_cop: casoA ? precioCliente - c.precio_vinku_cop : Math.round(c.precio_publico_cop * 0.1),
        };
      });
    return [...base, ...extra].map((c, i) => ({ ...c, orden: i + 1 }));
  }, [rutaBase, excluidos, añadidos, catalogo]);

  const { cobertura, semanas } = useMemo(
    () => recomputar(cursosEfectivos, perfil),
    [cursosEfectivos, perfil]
  );
  const totalCliente = cursosEfectivos.reduce((s, c) => s + c.precio_cliente_cop, 0);

  function seleccionar() {
    const ruta: Ruta = {
      ...rutaBase,
      cursos: cursosEfectivos,
      duracion_total_semanas: semanas,
      cobertura_brecha_porcentaje: cobertura,
    };
    onSeleccionar(ruta);
  }

  const cursosDisponibles = catalogo.filter(
    (c) => c.activo && c.cupos_disponibles > 0 && !cursosEfectivos.some((e) => e.id_curso === c.id_curso)
  );

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <h2 className="font-display font-extrabold text-2xl text-[#1A1A1A] mb-1">Tu ruta de aprendizaje</h2>
      <p className="text-sm text-zinc-500 mb-5">
        Rol objetivo: <span className="font-bold text-[#6C47FF]">{perfil.rol_objetivo}</span>
      </p>

      {/* Tabs de configuración */}
      <div className="flex gap-2 mb-5">
        {(["express", "estandar", "completa"] as const).map((k) => (
          <button
            key={k}
            onClick={() => { setConfig(k); setExcluidos(new Set()); setAñadidos(new Set()); }}
            className={`flex-1 px-3 py-2.5 rounded-xl border-2 font-bold text-sm transition-all ${
              config === k
                ? "bg-[#FFD000] text-[#1A1A1A] border-[#1A1A1A] shadow-[3px_3px_0px_0px_#1A1A1A]"
                : "bg-white text-zinc-500 border-zinc-200 hover:border-[#1A1A1A]"
            }`}
          >
            {LABELS[k]}
            <span className="block text-[10px] font-mono font-normal mt-0.5">{rutas.rutas[k].cursos.length} cursos</span>
            {rutas.recomendada === k && (
              <span className="block text-[9px] font-bold text-[#6C47FF] mt-0.5">★ Recomendada</span>
            )}
          </button>
        ))}
      </div>

      {/* Cobertura */}
      <div className="bg-white border-2 border-[#1A1A1A] rounded-xl p-4 mb-4 shadow-[4px_4px_0px_0px_#6C47FF]">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold text-zinc-600 uppercase tracking-wider">Cobertura de tu brecha</p>
          <span className="font-display font-extrabold text-lg text-[#1A1A1A]">{cobertura}%</span>
        </div>
        <div className="w-full h-3 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
          <div className="h-full rounded-full transition-all" style={{ width: `${cobertura}%`, background: cobertura >= 80 ? "#10B981" : cobertura >= 50 ? "#FFD000" : "#F97316" }} />
        </div>
        <p className="text-[11px] text-zinc-400 mt-2">
          {cursosEfectivos.length} curso{cursosEfectivos.length !== 1 ? "s" : ""} · {semanas} semanas · Total estimado <span className="font-bold text-[#1A1A1A]">{formatCOP(totalCliente)}</span>
        </p>
      </div>

      {/* Lista de cursos */}
      <div className="space-y-3 mb-5">
        {cursosEfectivos.map((c) => (
          <div key={c.id_curso} className="bg-white border-2 border-[#1A1A1A] rounded-xl p-4 flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-[#6C47FF] text-white font-display font-extrabold text-xs flex items-center justify-center shrink-0">{c.orden}</div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-[#1A1A1A] leading-tight">{c.nombre_curso}</p>
              <p className="text-xs text-zinc-500">{c.institucion} · {c.modalidad} · {c.duracion_semanas} sem</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${c.caso_comercial === "A" ? "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30" : "bg-zinc-100 text-zinc-500 border-zinc-300"}`}>
                  {c.caso_comercial === "A" ? "Con descuento VinkU" : "Precio institución"}
                </span>
                <span className="text-sm font-bold text-[#6C47FF]">{formatCOP(c.precio_cliente_cop)}</span>
              </div>
            </div>
            {modificando && (
              <button
                onClick={() => setExcluidos((prev) => new Set(prev).add(c.id_curso))}
                className="text-[10px] font-bold text-red-500 border-2 border-red-300 rounded-lg px-2 py-1 hover:bg-red-50 shrink-0"
              >
                Quitar
              </button>
            )}
          </div>
        ))}
        {cursosEfectivos.length === 0 && (
          <p className="text-center text-sm text-zinc-400 py-6">No hay cursos en esta ruta. Agrega alguno o cambia de configuración.</p>
        )}
      </div>

      {/* Modo modificar: catálogo para añadir */}
      {modificando && cursosDisponibles.length > 0 && (
        <div className="bg-[#FAFAFA] border-2 border-dashed border-zinc-300 rounded-xl p-4 mb-5">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Agregar del catálogo</p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {cursosDisponibles.map((c) => (
              <div key={c.id_curso} className="flex items-center justify-between gap-2 bg-white border border-zinc-200 rounded-lg p-2.5">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#1A1A1A] truncate">{c.nombre_curso}</p>
                  <p className="text-[10px] text-zinc-400">{c.institucion} · {formatCOP(c.precio_publico_cop)}</p>
                </div>
                <button
                  onClick={() => { setAñadidos((prev) => new Set(prev).add(c.id_curso)); setExcluidos((prev) => { const n = new Set(prev); n.delete(c.id_curso); return n; }); }}
                  className="text-[10px] font-bold text-[#6C47FF] border-2 border-[#6C47FF] rounded-lg px-2 py-1 hover:bg-[#6C47FF]/10 shrink-0"
                >
                  + Agregar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={seleccionar}
          disabled={cursosEfectivos.length === 0}
          className="flex-1 px-6 py-3.5 bg-[#1A1A1A] text-[#FFD000] font-display font-extrabold rounded-xl border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#FFD000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all disabled:opacity-40"
        >
          Seleccionar esta ruta →
        </button>
        <button
          onClick={() => setModificando((v) => !v)}
          className="px-6 py-3.5 bg-white text-[#1A1A1A] font-bold rounded-xl border-2 border-[#1A1A1A] hover:bg-zinc-50 transition-all"
        >
          {modificando ? "Listo" : "Modificar ruta"}
        </button>
      </div>
    </div>
  );
}
