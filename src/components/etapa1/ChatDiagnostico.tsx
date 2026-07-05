// ============================================================
// Campus Pass — Chat de Diagnóstico con IA (Momento 2)
// Conversación breve (máx. 5 preguntas de la IA / 8 intercambios)
// que profundiza la brecha y produce el PerfilBrecha en JSON.
// ============================================================

import { useEffect, useRef, useState } from "react";
import type {
  DiagnosticoRespuestas,
  MensajeChat,
  PerfilBrecha,
} from "../../types/etapa1";
import { WHATSAPP_ASESOR } from "../../types/etapa1";
import { enviarMensajeDiagnostico } from "../../services/diagnosticoIA";

interface MensajeUI extends MensajeChat {
  oculto?: boolean; // mensajes semilla que no se muestran
}

interface Props {
  respuestas: DiagnosticoRespuestas;
  historialInicial?: MensajeChat[];
  onPerfilCompleto: (perfil: PerfilBrecha) => void;
  onDerivar: (motivo: string) => void;
}

const MAX_INTERCAMBIOS = 8;

export default function ChatDiagnostico({
  respuestas,
  historialInicial,
  onPerfilCompleto,
  onDerivar,
}: Props) {
  const [mensajes, setMensajes] = useState<MensajeUI[]>(
    historialInicial ?? []
  );
  const [input, setInput] = useState("");
  const [cargando, setCargando] = useState(false);
  const [errorRed, setErrorRed] = useState<string | null>(null);
  const arranco = useRef(false);
  const finRef = useRef<HTMLDivElement | null>(null);

  const intercambios = mensajes.filter((m) => m.role === "user" && !m.oculto).length;

  // Auto-scroll al último mensaje
  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes, cargando]);

  // Arranque: pedir a la IA la primera pregunta (mensaje semilla oculto)
  useEffect(() => {
    if (arranco.current || (historialInicial && historialInicial.length > 0)) return;
    arranco.current = true;
    const semilla: MensajeUI = {
      role: "user",
      content: "Hola, estoy listo para profundizar mi diagnóstico.",
      oculto: true,
    };
    void llamarIA([semilla]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function llamarIA(historial: MensajeUI[]) {
    setCargando(true);
    setErrorRed(null);
    const paraApi: MensajeChat[] = historial.map((m) => ({ role: m.role, content: m.content }));
    const res = await enviarMensajeDiagnostico(paraApi, respuestas);
    setCargando(false);

    if (res.error) {
      setErrorRed(res.error);
      return;
    }

    const nuevoAssistant: MensajeUI = { role: "assistant", content: res.mensaje };
    const actualizado = [...historial, nuevoAssistant];
    setMensajes(actualizado);

    // ¿La IA entregó el perfil de brecha?
    if (res.perfilBrecha) {
      const score = res.perfilBrecha.score_completitud ?? 0;
      if (score >= 70) {
        onPerfilCompleto(res.perfilBrecha);
      } else {
        onDerivar("El diagnóstico necesita más contexto. Un asesor te ayudará a completarlo.");
      }
    }
  }

  function enviar() {
    const texto = input.trim();
    if (!texto || cargando) return;
    const nuevoUser: MensajeUI = { role: "user", content: texto };
    const actualizado = [...mensajes, nuevoUser];
    setMensajes(actualizado);
    setInput("");

    if (intercambios + 1 >= MAX_INTERCAMBIOS) {
      onDerivar("Para afinar bien tu ruta, mejor te conecto con un asesor.");
      return;
    }
    void llamarIA(actualizado);
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[70vh] min-h-[420px] animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#6C47FF] flex items-center justify-center text-white font-display font-extrabold text-sm">V</div>
          <div>
            <p className="font-display font-extrabold text-sm text-[#1A1A1A] leading-none">Asesor Campus Pass</p>
            <p className="text-[10px] text-zinc-400">Diagnóstico guiado</p>
          </div>
        </div>
        <a
          href={WHATSAPP_ASESOR}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold text-[#1A1A1A] bg-white border-2 border-[#1A1A1A] px-3 py-1.5 rounded-full hover:bg-[#FFD000] transition-colors"
        >
          💬 Hablar con un asesor
        </a>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto bg-[#FAFAFA] border-2 border-[#1A1A1A] rounded-2xl p-4 space-y-3">
        {mensajes.filter((m) => !m.oculto).map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-[#6C47FF] text-white rounded-br-sm"
                  : "bg-white border-2 border-[#1A1A1A] text-[#1A1A1A] rounded-bl-sm"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {cargando && (
          <div className="flex justify-start">
            <div className="bg-white border-2 border-[#1A1A1A] rounded-2xl rounded-bl-sm px-4 py-3">
              <span className="inline-flex gap-1">
                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </span>
            </div>
          </div>
        )}
        {errorRed && (
          <div className="text-center">
            <p className="text-xs text-red-500 font-bold">{errorRed}</p>
            <a href={WHATSAPP_ASESOR} target="_blank" rel="noopener noreferrer" className="text-xs text-[#6C47FF] font-bold underline">
              Continuar con un asesor →
            </a>
          </div>
        )}
        <div ref={finRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 mt-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") enviar(); }}
          placeholder="Escribe tu respuesta..."
          disabled={cargando}
          className="flex-1 border-2 border-[#1A1A1A] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#6C47FF] disabled:bg-zinc-50"
        />
        <button
          onClick={enviar}
          disabled={cargando || !input.trim()}
          className="px-5 py-2.5 bg-[#1A1A1A] text-[#FFD000] font-display font-extrabold rounded-xl border-2 border-[#1A1A1A] shadow-[3px_3px_0px_0px_#FFD000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all disabled:opacity-40"
        >
          Enviar
        </button>
      </div>
      <p className="text-[10px] text-zinc-400 text-center mt-2">
        {intercambios}/{MAX_INTERCAMBIOS} respuestas · La IA arma tu perfil de brecha
      </p>
    </div>
  );
}
