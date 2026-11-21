// ============================================================
// Certificación de habilidades y Red de profesionales verificados
// Las herramientas son abiertas (se comparten); el valor está en
// demostrar la habilidad y en ser encontrado por quien la necesita.
// ============================================================
import { HERRAMIENTAS, type Herramienta } from "./herramientas";

export interface Certificacion {
  herramientaId: string;
  habilidad: string;             // nombre de la habilidad verificada
  caso: string;                  // prueba práctica con caso
  rubrica: string[];             // criterios que se evalúan
  requisitoRed?: string;         // requisito adicional para ofrecer servicios en la Red
  servicioRed: string;           // qué puede ofrecer en la Red
}

const ESPECIFICAS: Record<string, Omit<Certificacion, "herramientaId">> = {
  consultorio: {
    habilidad: "Gestión de consulta psicológica con IA",
    caso: "Te enviamos la transcripción ficticia de una sesión de seguimiento. Con Consultorio genera el registro de la sesión, el cobro y un mensaje de recordatorio para la consultante. Pega aquí lo que entregaste y explica tus decisiones, sobre todo las de riesgo y privacidad.",
    rubrica: ["Registro fiel a lo dicho, sin información inventada", "Riesgo y datos sensibles bien manejados", "Cobro y seguimiento correctos", "Mensaje a la consultante sin información clínica"],
    requisitoRed: "Tarjeta profesional de psicología vigente (se verifica antes de publicar servicios clínicos).",
    servicioRed: "Consulta psicológica independiente con procesos documentados",
  },
  consultora: {
    habilidad: "Diseño y venta de servicios de consultoría",
    caso: "Te damos el caso de una fundación que necesita evaluar un programa. Arma la oferta en una página, el precio en tres niveles y la propuesta.",
    rubrica: ["Oferta clara: cliente, problema y alcance", "Precio con piso calculado y tres niveles", "Propuesta coherente y verificable"],
    servicioRed: "Consultoría por proyecto",
  },
};

export function certDe(h: Herramienta): Certificacion {
  const e = ESPECIFICAS[h.id];
  if (e) return { herramientaId: h.id, ...e };
  return {
    herramientaId: h.id,
    habilidad: h.promesa.replace(/\.$/, ""),
    caso: `Prueba práctica: ${h.reto.tarea} Usa un caso que te asignamos y explica tus decisiones.`,
    rubrica: h.skillset,
    servicioRed: h.promesa.replace(/\.$/, ""),
  };
}

export const REQUISITOS = [
  { id: "evidencia", nombre: "Evidencia real", detalle: "Tu victoria temprana con datos, registrada en el laboratorio." },
  { id: "prueba", nombre: "Prueba práctica", detalle: "Resuelves un caso con la herramienta. La IA hace una primera lectura con la rúbrica." },
  { id: "validacion", nombre: "Validación humana", detalle: "Un evaluador de VinkU revisa tu prueba y conversa contigo 15 minutos." },
] as const;

// Perfiles de ejemplo para el prototipo de la Red (no son personas reales).
export interface PerfilRed {
  codigo: string; nombre: string; oficio: string; ciudad: string; modalidad: string;
  habilidades: string[]; servicios: { nombre: string; desde: string }[]; victoria: string; ejemplo?: boolean; fecha: string;
}
export const EJEMPLOS_RED: PerfilRed[] = [
  { codigo: "VKU-CONS-0001", nombre: "María Restrepo", oficio: "Psicóloga clínica", ciudad: "Medellín", modalidad: "Presencial y virtual",
    habilidades: ["Gestión de consulta psicológica con IA"], servicios: [{ nombre: "Sesión individual adultos", desde: "$130.000" }, { nombre: "Taller de manejo de ansiedad para empresas", desde: "$900.000" }],
    victoria: "Cerró 3 semanas seguidas sin borradores pendientes", ejemplo: true, fecha: "2026-12-16" },
  { codigo: "VKU-CONS-0002", nombre: "Julián Ospina", oficio: "Psicólogo sistémico", ciudad: "Bogotá", modalidad: "Virtual",
    habilidades: ["Gestión de consulta psicológica con IA"], servicios: [{ nombre: "Terapia de pareja", desde: "$160.000" }],
    victoria: "Recuperó 4 horas por semana de documentación", ejemplo: true, fecha: "2026-12-16" },
  { codigo: "VKU-CNSL-0001", nombre: "Laura Gómez", oficio: "Socióloga y consultora", ciudad: "Cali", modalidad: "Virtual",
    habilidades: ["Diseño y venta de servicios de consultoría"], servicios: [{ nombre: "Evaluación de programas sociales", desde: "$3.500.000" }],
    victoria: "Envió su primera propuesta con precio por resultado", ejemplo: true, fecha: "2027-01-10" },
];

export const codigoNuevo = (h: Herramienta) => {
  const pref = { consultorio: "CONS", consultora: "CNSL" }[h.id as "consultorio" | "consultora"] || h.id.slice(0, 4).toUpperCase();
  return `VKU-${pref}-${String(Math.floor(1000 + Math.random() * 9000))}`;
};

export const herramientaDeHabilidad = (hab: string) => HERRAMIENTAS.find((h) => certDe(h).habilidad === hab);
