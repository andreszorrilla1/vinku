// ============================================================
// Campus Pass — Orquestador de la Etapa 1
// Máquina de estados: Diagnóstico → Curaduría → Cotización.
// Persiste el avance en localStorage para reanudar el flujo.
// ============================================================

import { useEffect, useMemo, useRef, useState } from "react";
import type {
  EstadoEtapa1,
  DiagnosticoRespuestas,
  MensajeChat,
  PerfilBrecha,
  RutasGeneradas,
  Ruta,
  ConfiguracionRuta,
  Cotizacion,
  Curso,
} from "../../types/etapa1";
import { WHATSAPP_ASESOR } from "../../types/etapa1";
import { CATALOGO_MOCK } from "../../lib/catalogoMock";
import { curarRutas } from "../../lib/curaduria";
import { cotizarRuta, formatCOP } from "../../lib/cotizacion";
import DiagnosticoDBR from "./DiagnosticoDBR";
import ChatDiagnostico from "./ChatDiagnostico";
import VistaRuta from "./VistaRuta";
import VistaCotizacion from "./VistaCotizacion";

const LS_KEY = "vinku_etapa1_v1";

interface Snapshot {
  estado: EstadoEtapa1;
  respuestas: DiagnosticoRespuestas | null;
  historialChat: MensajeChat[];
  perfilBrecha: PerfilBrecha | null;
  rutaSeleccionadaConfig: ConfiguracionRuta | null;
  actualizado: string;
}

interface Props {
  usuarioId?: string;
  clienteNombre?: string;
  onSalir?: () => void;
}

function cargarSnapshot(): Snapshot | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Snapshot;
  } catch {
    return null;
  }
}

// Catálogo Campus Pass. Por ahora usa el mock; cuando la tabla `courses`
// tenga cursos Campus Pass cargados, este loader los mapeará desde Supabase.
function useCatalogo(): Curso[] {
  return useMemo(() => CATALOGO_MOCK, []);
}

export default function FlujoEtapa1({ usuarioId = "anon", clienteNombre = "Interesado Campus Pass", onSalir }: Props) {
  const inicial = useRef<Snapshot | null>(cargarSnapshot());
  const [estado, setEstado] = useState<EstadoEtapa1>(inicial.current?.estado ?? "seleccion_tipo");
  const [respuestas, setRespuestas] = useState<DiagnosticoRespuestas | null>(inicial.current?.respuestas ?? null);
  const [historialChat, setHistorialChat] = useState<MensajeChat[]>(inicial.current?.historialChat ?? []);
  const [perfilBrecha, setPerfilBrecha] = useState<PerfilBrecha | null>(inicial.current?.perfilBrecha ?? null);
  const [rutas, setRutas] = useState<RutasGeneradas | null>(null);
  const [rutaSeleccionada, setRutaSeleccionada] = useState<Ruta | null>(null);
  const [cotizacion, setCotizacion] = useState<Cotizacion | null>(null);
  const [configPrevia] = useState<ConfiguracionRuta | null>(inicial.current?.rutaSeleccionadaConfig ?? null);

  const catalogo = useCatalogo();

  // Persistencia
  useEffect(() => {
    const snap: Snapshot = {
      estado,
      respuestas,
      historialChat,
      perfilBrecha,
      rutaSeleccionadaConfig: rutaSeleccionada?.configuracion ?? configPrevia,
      actualizado: new Date().toISOString(),
    };
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(snap));
    } catch {
      // almacenamiento no disponible: se ignora
    }
  }, [estado, respuestas, historialChat, perfilBrecha, rutaSeleccionada, configPrevia]);

  // Curaduría: al entrar en curaduria_cargando (o al reanudar con perfil), computa rutas.
  useEffect(() => {
    if (!perfilBrecha) return;
    if (estado === "curaduria_cargando" || (estado === "ruta_generada" && !rutas)) {
      const fecha = new Date().toISOString();
      const generadas = curarRutas(perfilBrecha.perfil_brecha, catalogo, usuarioId, fecha);
      setRutas(generadas);
      if (estado === "curaduria_cargando") setEstado("ruta_generada");
    }
  }, [estado, perfilBrecha, catalogo, usuarioId, rutas]);

  function reiniciar() {
    try { localStorage.removeItem(LS_KEY); } catch { /* noop */ }
    setEstado("seleccion_tipo");
    setRespuestas(null);
    setHistorialChat([]);
    setPerfilBrecha(null);
    setRutas(null);
    setRutaSeleccionada(null);
    setCotizacion(null);
  }

  function seleccionarRuta(ruta: Ruta) {
    setRutaSeleccionada(ruta);
    const tipoCliente = respuestas?.tipo_usuario === "colaborador_empresa" ? "empresa" : "particular";
    const now = new Date();
    const timestampCorto = now.getTime().toString(36).slice(-5).toUpperCase();
    const cot = cotizarRuta({
      ruta,
      clienteNombre,
      tipoCliente,
      fechaEmision: now,
      timestampCorto,
    });
    setCotizacion(cot);
    setEstado("cotizacion_generada");
  }

  // ---------------------------------------------------------
  // Render por estado
  // ---------------------------------------------------------
  const barraSalir = onSalir && (
    <div className="max-w-3xl mx-auto mb-4 flex justify-between items-center">
      <button onClick={onSalir} className="text-xs font-bold text-zinc-400 hover:text-[#1A1A1A]">← Salir</button>
      {estado !== "seleccion_tipo" && (
        <button onClick={reiniciar} className="text-xs font-bold text-zinc-400 hover:text-red-500">Reiniciar diagnóstico</button>
      )}
    </div>
  );

  return (
    <div className="py-4">
      {barraSalir}

      {(estado === "seleccion_tipo" || estado === "preguntas_fijas") && (
        <DiagnosticoDBR
          onCompletar={(r) => {
            setRespuestas(r);
            setHistorialChat([]);
            setEstado("chat_ia");
          }}
        />
      )}

      {estado === "chat_ia" && respuestas && (
        <ChatDiagnostico
          respuestas={respuestas}
          historialInicial={historialChat.length > 0 ? historialChat : undefined}
          onPerfilCompleto={(p) => {
            setPerfilBrecha(p);
            setEstado("perfil_completo");
          }}
          onDerivar={() => setEstado("derivacion_asesor")}
        />
      )}

      {estado === "derivacion_asesor" && (
        <div className="max-w-md mx-auto text-center bg-white border-4 border-[#1A1A1A] rounded-2xl p-8 shadow-[6px_6px_0px_0px_#FFD000] animate-fade-in">
          <span className="text-4xl">🤝</span>
          <h2 className="font-display font-extrabold text-xl text-[#1A1A1A] mt-3">Sigamos con un asesor</h2>
          <p className="text-sm text-zinc-500 mt-2">Tu caso merece atención personalizada. Un asesor de Campus Pass te ayuda a completar tu ruta.</p>
          <a href={WHATSAPP_ASESOR} target="_blank" rel="noopener noreferrer" className="inline-block mt-5 px-6 py-3 bg-[#1A1A1A] text-[#FFD000] font-display font-extrabold rounded-xl border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#FFD000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
            Hablar por WhatsApp →
          </a>
          <button onClick={reiniciar} className="block mx-auto mt-4 text-xs font-bold text-zinc-400 hover:text-[#1A1A1A]">Volver a empezar</button>
        </div>
      )}

      {estado === "perfil_completo" && perfilBrecha && (
        <TarjetaPerfil
          perfil={perfilBrecha}
          onEditar={() => setEstado("chat_ia")}
          onVerRuta={() => setEstado("curaduria_cargando")}
        />
      )}

      {estado === "curaduria_cargando" && (
        <div className="max-w-md mx-auto text-center py-16 animate-fade-in">
          <div className="w-12 h-12 border-4 border-[#6C47FF] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-display font-bold text-[#1A1A1A] mt-4">Armando tu ruta...</p>
          <p className="text-xs text-zinc-400 mt-1">Cruzamos tu perfil con el catálogo de universidades aliadas.</p>
        </div>
      )}

      {estado === "ruta_generada" && rutas && perfilBrecha && (
        <VistaRuta
          rutas={rutas}
          perfil={perfilBrecha.perfil_brecha}
          catalogo={catalogo}
          onSeleccionar={seleccionarRuta}
        />
      )}

      {estado === "cotizacion_generada" && cotizacion && (
        <VistaCotizacion cotizacion={cotizacion} onAprobar={() => setEstado("cotizacion_aprobada")} />
      )}

      {estado === "cotizacion_aprobada" && (
        <div className="max-w-md mx-auto text-center bg-white border-4 border-[#1A1A1A] rounded-2xl p-8 shadow-[6px_6px_0px_0px_#10B981] animate-fade-in">
          <span className="text-5xl">🎉</span>
          <h2 className="font-display font-extrabold text-xl text-[#1A1A1A] mt-3">¡Vamos por tu rol!</h2>
          <p className="text-sm text-zinc-500 mt-2">Te escribimos por WhatsApp para coordinar los siguientes pasos con las instituciones.</p>
          {cotizacion && <p className="text-xs font-mono text-zinc-400 mt-3">Cotización {cotizacion.numero}</p>}
          <button onClick={reiniciar} className="block mx-auto mt-5 text-xs font-bold text-zinc-400 hover:text-[#1A1A1A]">Hacer otro diagnóstico</button>
        </div>
      )}
    </div>
  );
}

// ---- Tarjeta de perfil de brecha ----
function TarjetaPerfil({
  perfil,
  onEditar,
  onVerRuta,
}: {
  perfil: PerfilBrecha;
  onEditar: () => void;
  onVerRuta: () => void;
}) {
  const p = perfil.perfil_brecha;
  return (
    <div className="max-w-lg mx-auto animate-fade-in">
      <div className="bg-white border-4 border-[#1A1A1A] rounded-2xl p-6 shadow-[6px_6px_0px_0px_#6C47FF]">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🎯</span>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">Tu perfil de brecha</p>
            <h2 className="font-display font-extrabold text-xl text-[#1A1A1A] leading-none">{p.rol_objetivo}</h2>
          </div>
          <span className="ml-auto text-xs font-bold bg-[#10B981]/10 text-[#10B981] px-2 py-1 rounded-full border border-[#10B981]/30">
            {perfil.score_completitud}% listo
          </span>
        </div>

        <div className="space-y-3 text-sm">
          <div>
            <p className="text-[10px] font-mono uppercase text-zinc-400 mb-1">Habilidades críticas</p>
            <div className="flex flex-wrap gap-1.5">
              {p.habilidades_criticas.map((h, i) => (
                <span key={i} className="text-xs font-bold bg-[#6C47FF]/10 text-[#6C47FF] border border-[#6C47FF]/30 px-2 py-0.5 rounded-full">{h}</span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <Dato label="Nivel de entrada" valor={p.nivel_entrada} />
            <Dato label="Modalidad" valor={p.modalidad_preferida} />
            <Dato label="Horas/semana" valor={String(p.horas_disponibles_semana)} />
            <Dato label="Meta" valor={`${p.tiempo_meta_meses} meses`} />
            {p.presupuesto_mes_cop > 0 && <Dato label="Presupuesto/mes" valor={formatCOP(p.presupuesto_mes_cop)} />}
          </div>
          {(p.proposito_vida || p.proposito_empresa) && (
            <div>
              <p className="text-[10px] font-mono uppercase text-zinc-400 mb-1">Propósito</p>
              <p className="text-xs text-zinc-600 italic">"{p.proposito_vida || p.proposito_empresa}"</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        <button onClick={onVerRuta} className="flex-1 px-6 py-3.5 bg-[#1A1A1A] text-[#FFD000] font-display font-extrabold rounded-xl border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#FFD000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
          Ver mi ruta →
        </button>
        <button onClick={onEditar} className="px-6 py-3.5 bg-white text-[#1A1A1A] font-bold rounded-xl border-2 border-[#1A1A1A] hover:bg-zinc-50 transition-all">
          Editar algo
        </button>
      </div>
    </div>
  );
}

function Dato({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="bg-[#FAFAFA] border border-zinc-200 rounded-lg px-2.5 py-1.5">
      <p className="text-[9px] font-mono uppercase text-zinc-400">{label}</p>
      <p className="font-bold text-[#1A1A1A] capitalize">{valor}</p>
    </div>
  );
}
