// ============================================================
// Campus Pass by VinkU — Servicio de Diagnóstico con IA (Momento 2)
// Llama a la Edge Function `diagnostico-ia` (proxy seguro), NUNCA a
// Anthropic directamente: la API key vive en el servidor.
// ============================================================

import { supabase } from "../lib/supabase";
import type {
  DiagnosticoRespuestas,
  DiagnosticoRespuestasParticular,
  DiagnosticoRespuestasColaborador,
  MensajeChat,
  PerfilBrecha,
} from "../types/etapa1";

export interface RespuestaDiagnosticoIA {
  mensaje: string;
  perfilBrecha?: PerfilBrecha;
  error?: string;
}

// Construye el system prompt dinámico según el tipo de usuario y sus respuestas.
export function construirSystemPrompt(respuestas: DiagnosticoRespuestas): string {
  const esColaborador = respuestas.tipo_usuario === "colaborador_empresa";
  const p = respuestas as DiagnosticoRespuestasParticular;
  const c = respuestas as DiagnosticoRespuestasColaborador;

  const bloqueContexto = esColaborador
    ? `- Cargo actual: ${c.cargo_actual}
- Propósito estratégico del puesto: ${c.proposito_estrategico_puesto}
- Necesidad de la empresa: ${c.necesidad_empresa}
- Rol objetivo según empresa: ${c.rol_objetivo_empresa || "No especificado"}`
    : `- Rol deseado: ${p.rol_deseado}
- Propósito de vida: ${p.proposito_vida}
- Tiempo meta: ${p.tiempo_meta}
- Presupuesto mensual: ${p.presupuesto_mes}`;

  return `Eres un orientador experto en desarrollo de talento y educación continua en Colombia, con profundo conocimiento del mercado laboral colombiano y del sistema educativo (técnico, tecnológico, universitario, posgrado y educación continua).

Tu rol en este momento es profundizar el diagnóstico de brecha de esta persona para Campus Pass by VinkU — una plataforma que conecta personas con rutas de aprendizaje en universidades aliadas colombianas.

DATOS DEL USUARIO (formulario previo):
- Tipo: ${esColaborador ? "Colaborador de empresa" : "Persona particular"}
- Nivel educativo: ${respuestas.nivel_educativo}
- Área de trabajo: ${respuestas.area_trabajo}
- Años de experiencia: ${respuestas.anos_experiencia}
- Ciudad: ${respuestas.ciudad}
${bloqueContexto}
- Habilidades en brecha identificadas: ${respuestas.habilidades_brecha.join(", ")}

OBJETIVO DE ESTA CONVERSACIÓN:
1. Validar y profundizar la brecha real entre el estado actual y el rol deseado
2. Conectar el propósito ${esColaborador ? "empresarial con el desempeño del colaborador" : "de vida con la ruta de formación"}
3. Identificar 3-5 habilidades concretas (hard + soft) que debe desarrollar
4. Detectar restricciones reales: horas disponibles por semana, modalidad preferida (virtual/presencial/híbrida)

REGLAS:
- Máximo 5 preguntas en total en toda la conversación
- Empieza con una frase de reconocimiento de lo que ya sabes, luego pregunta
- Lenguaje cálido, cercano, colombiano — nada de tecnicismos
- Cuando tengas suficiente información (generalmente después de 3-4 intercambios), genera el perfil de brecha en JSON al final de tu respuesta con este formato exacto:

\`\`\`json
{
  "perfil_brecha": {
    "rol_objetivo": "",
    "habilidades_criticas": ["", "", ""],
    "habilidades_complementarias": ["", ""],
    "nivel_entrada": "basico|intermedio|avanzado",
    "modalidad_preferida": "virtual|presencial|hibrida",
    "horas_disponibles_semana": 0,
    "tiempo_meta_meses": 0,
    "proposito_vida": "",
    "proposito_empresa": "",
    "presupuesto_mes_cop": 0,
    "restricciones_especiales": ""
  },
  "score_completitud": 0
}
\`\`\`

No muestres el JSON al usuario — solo muestra el mensaje de cierre en lenguaje natural.`;
}

// Intenta extraer el bloque JSON de perfil de brecha de la respuesta de la IA.
function extraerPerfilBrecha(texto: string): { limpio: string; perfil?: PerfilBrecha } {
  const jsonMatch = texto.match(/```json\s*([\s\S]*?)\s*```/);
  if (!jsonMatch) return { limpio: texto };
  try {
    const parsed = JSON.parse(jsonMatch[1]) as PerfilBrecha;
    if (parsed && parsed.perfil_brecha) {
      return {
        limpio: texto.replace(/```json[\s\S]*?```/, "").trim(),
        perfil: parsed,
      };
    }
  } catch {
    // JSON malformado: se ignora y se devuelve el texto tal cual.
  }
  return { limpio: texto };
}

/**
 * Envía el historial de chat + las respuestas del formulario a la Edge Function
 * y devuelve el mensaje de la IA. Si la IA incluyó el perfil de brecha en JSON,
 * lo extrae y lo devuelve por separado.
 */
export async function enviarMensajeDiagnostico(
  historial: MensajeChat[],
  respuestasFormulario: DiagnosticoRespuestas
): Promise<RespuestaDiagnosticoIA> {
  const system = construirSystemPrompt(respuestasFormulario);

  try {
    const { data, error } = await supabase.functions.invoke("diagnostico-ia", {
      body: { system, messages: historial },
    });

    if (error) {
      return { mensaje: "", error: error.message };
    }
    const texto: string = typeof data?.mensaje === "string" ? data.mensaje : "";
    if (!texto) {
      return { mensaje: "", error: "La IA no devolvió respuesta." };
    }

    const { limpio, perfil } = extraerPerfilBrecha(texto);
    return { mensaje: limpio, perfilBrecha: perfil };
  } catch (e) {
    return { mensaje: "", error: e instanceof Error ? e.message : "Error de red." };
  }
}
