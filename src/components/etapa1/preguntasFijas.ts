// ============================================================
// Campus Pass — Banco de preguntas fijas del Diagnóstico DBR (Momento 1)
// Wizard estilo Typeform: una pregunta a la vez.
// ============================================================

import type {
  DiagnosticoRespuestasParticular,
  DiagnosticoRespuestasColaborador,
} from "../../types/etapa1";

export type CampoParticular = keyof Omit<DiagnosticoRespuestasParticular, "tipo_usuario">;
export type CampoColaborador = keyof Omit<DiagnosticoRespuestasColaborador, "tipo_usuario">;

export interface OpcionPregunta {
  value: string;
  label: string;
  emoji?: string;
}

export type TipoPregunta = "opcion_unica" | "multi" | "texto";

export interface Pregunta {
  campo: string;
  tipo: TipoPregunta;
  titulo: string;
  ayuda?: string;
  opciones?: OpcionPregunta[];
  minChars?: number; // para tipo texto
  placeholder?: string;
}

const NIVEL_EDUCATIVO: OpcionPregunta[] = [
  { value: "bachiller", label: "Bachiller", emoji: "🎒" },
  { value: "tecnico", label: "Técnico", emoji: "🔧" },
  { value: "tecnologo", label: "Tecnólogo", emoji: "⚙️" },
  { value: "universitario_incompleto", label: "Universitario (sin terminar)", emoji: "📚" },
  { value: "universitario_completo", label: "Universitario (terminado)", emoji: "🎓" },
  { value: "posgrado", label: "Posgrado", emoji: "🏅" },
];

const ANOS_EXPERIENCIA: OpcionPregunta[] = [
  { value: "0-1", label: "Menos de 1 año" },
  { value: "1-3", label: "1 a 3 años" },
  { value: "3-5", label: "3 a 5 años" },
  { value: "5-10", label: "5 a 10 años" },
  { value: "mas_de_10", label: "Más de 10 años" },
];

const HABILIDADES: OpcionPregunta[] = [
  { value: "tecnicas", label: "Técnicas del oficio", emoji: "🛠️" },
  { value: "liderazgo", label: "Liderazgo", emoji: "🧭" },
  { value: "comunicacion", label: "Comunicación", emoji: "💬" },
  { value: "datos", label: "Datos y análisis", emoji: "📊" },
  { value: "digitales", label: "Digitales", emoji: "💻" },
  { value: "idiomas", label: "Idiomas", emoji: "🌎" },
  { value: "otra", label: "Otra", emoji: "✨" },
];

const INTENTOS: OpcionPregunta[] = [
  { value: "si_exito", label: "Sí, y me fue bien" },
  { value: "si_no_termine", label: "Sí, pero no terminé" },
  { value: "no_empezado", label: "No he empezado" },
];

// --- Flujo PARTICULAR ---
export const PREGUNTAS_PARTICULAR: Pregunta[] = [
  { campo: "nivel_educativo", tipo: "opcion_unica", titulo: "¿Cuál es tu nivel educativo?", opciones: NIVEL_EDUCATIVO },
  { campo: "area_trabajo", tipo: "texto", titulo: "¿En qué área trabajas o estudias hoy?", placeholder: "Ej: ventas, sistemas, administración", minChars: 3 },
  { campo: "anos_experiencia", tipo: "opcion_unica", titulo: "¿Cuántos años de experiencia tienes?", opciones: ANOS_EXPERIENCIA },
  { campo: "ciudad", tipo: "texto", titulo: "¿En qué ciudad estás?", placeholder: "Ej: Medellín", minChars: 3 },
  { campo: "rol_deseado", tipo: "texto", titulo: "¿Qué rol quieres poder ejercer?", ayuda: "Sé concreto: el cargo o trabajo que buscas.", placeholder: "Ej: liderar un equipo de ventas", minChars: 10 },
  { campo: "proposito_vida", tipo: "texto", titulo: "¿Por qué te importa lograrlo?", ayuda: "Cuéntanos qué mueve esta decisión.", placeholder: "Ej: quiero crecer y darle estabilidad a mi familia", minChars: 20 },
  { campo: "tiempo_meta", tipo: "opcion_unica", titulo: "¿En cuánto tiempo quieres lograrlo?", opciones: [
    { value: "3_meses", label: "En 3 meses" },
    { value: "6_meses", label: "En 6 meses" },
    { value: "1_ano", label: "En 1 año" },
    { value: "mas_de_1_ano", label: "Más de 1 año" },
    { value: "no_se", label: "Aún no lo sé" },
  ] },
  { campo: "habilidades_brecha", tipo: "multi", titulo: "¿Qué te falta desarrollar?", ayuda: "Elige todas las que apliquen.", opciones: HABILIDADES },
  { campo: "intentos_previos", tipo: "opcion_unica", titulo: "¿Habías intentado formarte en esto antes?", opciones: INTENTOS },
  { campo: "presupuesto_mes", tipo: "opcion_unica", titulo: "¿Cuánto podrías invertir al mes?", opciones: [
    { value: "menos_100k", label: "Menos de $100.000" },
    { value: "100k_300k", label: "$100.000 – $300.000" },
    { value: "300k_600k", label: "$300.000 – $600.000" },
    { value: "mas_600k", label: "Más de $600.000" },
    { value: "no_se", label: "No estoy seguro" },
  ] },
];

// --- Flujo COLABORADOR ---
export const PREGUNTAS_COLABORADOR: Pregunta[] = [
  { campo: "nivel_educativo", tipo: "opcion_unica", titulo: "¿Cuál es tu nivel educativo?", opciones: NIVEL_EDUCATIVO },
  { campo: "area_trabajo", tipo: "texto", titulo: "¿En qué área trabajas?", placeholder: "Ej: operaciones, comercial", minChars: 3 },
  { campo: "anos_experiencia", tipo: "opcion_unica", titulo: "¿Cuántos años de experiencia tienes?", opciones: ANOS_EXPERIENCIA },
  { campo: "ciudad", tipo: "texto", titulo: "¿En qué ciudad estás?", placeholder: "Ej: Bogotá", minChars: 3 },
  { campo: "cargo_actual", tipo: "texto", titulo: "¿Cuál es tu cargo actual?", placeholder: "Ej: analista de operaciones", minChars: 3 },
  { campo: "proposito_estrategico_puesto", tipo: "texto", titulo: "¿Para qué existe tu puesto en la empresa?", ayuda: "El propósito estratégico de tu rol.", placeholder: "Ej: garantizar la calidad del servicio", minChars: 15 },
  { campo: "necesidad_empresa", tipo: "texto", titulo: "¿Qué necesita la empresa que tú resuelvas?", placeholder: "Ej: reducir errores en el proceso", minChars: 15 },
  { campo: "rol_objetivo_empresa", tipo: "texto", titulo: "¿Hacia qué rol te proyecta la empresa? (opcional)", ayuda: "Si no lo sabes, puedes dejarlo vacío y continuar.", placeholder: "Ej: coordinador de operaciones", minChars: 0 },
  { campo: "habilidades_brecha", tipo: "multi", titulo: "¿Qué habilidades debes desarrollar?", ayuda: "Elige todas las que apliquen.", opciones: HABILIDADES },
  { campo: "intentos_previos", tipo: "opcion_unica", titulo: "¿Habías intentado formarte en esto antes?", opciones: INTENTOS },
];
