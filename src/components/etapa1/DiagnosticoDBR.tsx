// ============================================================
// Campus Pass — Diagnóstico DBR (Momento 1)
// Bifurcación de tipo de usuario + wizard de preguntas fijas
// estilo Typeform (una a la vez). Mobile-first.
// ============================================================

import { useState } from "react";
import type {
  TipoUsuario,
  DiagnosticoRespuestas,
  HabilidadBrecha,
} from "../../types/etapa1";
import { WHATSAPP_ASESOR } from "../../types/etapa1";
import {
  PREGUNTAS_PARTICULAR,
  PREGUNTAS_COLABORADOR,
  type Pregunta,
} from "./preguntasFijas";

interface Props {
  onCompletar: (respuestas: DiagnosticoRespuestas) => void;
}

type ValorRespuesta = string | string[];

function BotonWhatsApp() {
  return (
    <a
      href={WHATSAPP_ASESOR}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1A1A1A] bg-white border-2 border-[#1A1A1A] px-3 py-1.5 rounded-full hover:bg-[#FFD000] transition-colors"
    >
      💬 Hablar con un asesor
    </a>
  );
}

export default function DiagnosticoDBR({ onCompletar }: Props) {
  const [tipo, setTipo] = useState<TipoUsuario | null>(null);
  const [paso, setPaso] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, ValorRespuesta>>({});
  const [textoActual, setTextoActual] = useState("");

  const preguntas: Pregunta[] =
    tipo === "colaborador_empresa" ? PREGUNTAS_COLABORADOR : PREGUNTAS_PARTICULAR;

  // ---- Bifurcación inicial ----
  if (!tipo) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-extrabold text-2xl text-[#1A1A1A]">
            Empecemos tu diagnóstico
          </h2>
          <BotonWhatsApp />
        </div>
        <p className="text-sm text-zinc-500 mb-6">¿Cómo llegas a Campus Pass?</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setTipo("particular")}
            className="text-left bg-white border-4 border-[#1A1A1A] rounded-2xl p-6 shadow-[6px_6px_0px_0px_#6C47FF] hover:shadow-[8px_8px_0px_0px_#6C47FF] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
          >
            <span className="text-4xl">🙋</span>
            <p className="font-display font-extrabold text-lg text-[#1A1A1A] mt-3">Por mi cuenta</p>
            <p className="text-sm text-zinc-500 mt-1">Busco crecer y habilitar un rol por mi propia decisión.</p>
          </button>
          <button
            onClick={() => setTipo("colaborador_empresa")}
            className="text-left bg-white border-4 border-[#1A1A1A] rounded-2xl p-6 shadow-[6px_6px_0px_0px_#FFD000] hover:shadow-[8px_8px_0px_0px_#FFD000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
          >
            <span className="text-4xl">🏢</span>
            <p className="font-display font-extrabold text-lg text-[#1A1A1A] mt-3">Mi empresa me inscribió</p>
            <p className="text-sm text-zinc-500 mt-1">Vengo de parte de mi empresa a desarrollar mi rol.</p>
          </button>
        </div>
      </div>
    );
  }

  const pregunta = preguntas[paso];
  const progreso = Math.round(((paso + 1) / preguntas.length) * 100);

  // ---- Navegación ----
  function avanzar(valor: ValorRespuesta) {
    const nuevas = { ...respuestas, [pregunta.campo]: valor };
    setRespuestas(nuevas);
    if (paso + 1 >= preguntas.length) {
      finalizar(nuevas);
    } else {
      setPaso(paso + 1);
      // pre-cargar texto si la siguiente ya tiene respuesta (al volver)
      const sig = preguntas[paso + 1];
      const prev = nuevas[sig.campo];
      setTextoActual(sig.tipo === "texto" && typeof prev === "string" ? prev : "");
    }
  }

  function atras() {
    if (paso === 0) {
      setTipo(null);
      setPaso(0);
      return;
    }
    const anterior = preguntas[paso - 1];
    setPaso(paso - 1);
    const prev = respuestas[anterior.campo];
    setTextoActual(anterior.tipo === "texto" && typeof prev === "string" ? prev : "");
  }

  function finalizar(nuevas: Record<string, ValorRespuesta>) {
    // Construir el objeto tipado según el tipo de usuario.
    const base = { ...nuevas, tipo_usuario: tipo } as unknown;
    onCompletar(base as DiagnosticoRespuestas);
  }

  // ---- Multi-select ----
  const seleccionMulti = Array.isArray(respuestas[pregunta.campo])
    ? (respuestas[pregunta.campo] as string[])
    : [];

  function toggleMulti(value: string) {
    const actual = seleccionMulti;
    const nueva = actual.includes(value)
      ? actual.filter((v) => v !== value)
      : [...actual, value];
    setRespuestas({ ...respuestas, [pregunta.campo]: nueva });
  }

  const minChars = pregunta.minChars ?? 0;
  const textoValido = textoActual.trim().length >= minChars;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Barra de progreso */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={atras}
          className="text-xs font-bold text-zinc-500 hover:text-[#1A1A1A] shrink-0"
          aria-label="Volver a la pregunta anterior"
        >
          ← Atrás
        </button>
        <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
          <div className="h-full bg-[#6C47FF] transition-all" style={{ width: `${progreso}%` }} />
        </div>
        <span className="text-xs font-mono text-zinc-400 shrink-0">{paso + 1}/{preguntas.length}</span>
      </div>

      <div className="flex items-start justify-between gap-3 mb-1">
        <h2 className="font-display font-extrabold text-xl sm:text-2xl text-[#1A1A1A] leading-tight">
          {pregunta.titulo}
        </h2>
      </div>
      {pregunta.ayuda && <p className="text-sm text-zinc-500 mb-5">{pregunta.ayuda}</p>}
      {!pregunta.ayuda && <div className="mb-5" />}

      {/* Opción única */}
      {pregunta.tipo === "opcion_unica" && pregunta.opciones && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {pregunta.opciones.map((op) => (
            <button
              key={op.value}
              onClick={() => avanzar(op.value)}
              className="text-left bg-white border-2 border-[#1A1A1A] rounded-xl px-4 py-3 shadow-[3px_3px_0px_0px_#1A1A1A] hover:bg-[#FFD000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#1A1A1A] transition-all font-bold text-sm text-[#1A1A1A]"
            >
              {op.emoji && <span className="mr-2">{op.emoji}</span>}
              {op.label}
            </button>
          ))}
        </div>
      )}

      {/* Multi-select */}
      {pregunta.tipo === "multi" && pregunta.opciones && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pregunta.opciones.map((op) => {
              const activo = seleccionMulti.includes(op.value);
              return (
                <button
                  key={op.value}
                  onClick={() => toggleMulti(op.value)}
                  aria-pressed={activo}
                  className={`text-left border-2 rounded-xl px-4 py-3 font-bold text-sm transition-all ${
                    activo
                      ? "bg-[#6C47FF] text-white border-[#1A1A1A] shadow-[3px_3px_0px_0px_#1A1A1A]"
                      : "bg-white text-[#1A1A1A] border-zinc-200 hover:border-[#1A1A1A]"
                  }`}
                >
                  {op.emoji && <span className="mr-2">{op.emoji}</span>}
                  {op.label}
                  {activo && <span className="float-right">✓</span>}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => avanzar(seleccionMulti)}
            disabled={seleccionMulti.length === 0}
            className="mt-5 w-full sm:w-auto px-6 py-3 bg-[#1A1A1A] text-[#FFD000] font-display font-extrabold rounded-xl border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#FFD000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Siguiente →
          </button>
        </>
      )}

      {/* Texto libre */}
      {pregunta.tipo === "texto" && (
        <>
          <textarea
            value={textoActual}
            onChange={(e) => setTextoActual(e.target.value)}
            placeholder={pregunta.placeholder}
            rows={minChars > 15 ? 3 : 1}
            className="w-full border-2 border-[#1A1A1A] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#6C47FF] resize-none shadow-[3px_3px_0px_0px_#1A1A1A]"
            autoFocus
          />
          <div className="flex items-center justify-between mt-2">
            <span className={`text-[11px] ${textoValido ? "text-zinc-400" : "text-amber-600"}`}>
              {minChars > 0 ? `Mínimo ${minChars} caracteres (${textoActual.trim().length})` : "Opcional"}
            </span>
          </div>
          <button
            onClick={() => avanzar(textoActual.trim())}
            disabled={!textoValido}
            className="mt-4 w-full sm:w-auto px-6 py-3 bg-[#1A1A1A] text-[#FFD000] font-display font-extrabold rounded-xl border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#FFD000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Siguiente →
          </button>
        </>
      )}

      <div className="mt-8 flex justify-center">
        <BotonWhatsApp />
      </div>
    </div>
  );
}
