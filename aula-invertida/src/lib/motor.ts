// ============================================================
// Aula Invertida · Motor del encargo
// Leer → Interpretar → Crear (IA, 60 %) · Mesa → Probar (humano, 40 %)
// ============================================================

import type { Encargo } from "../data/encargos";
import { pedirJSON, type Msg } from "./ia";

export interface Caso { resumen: string; oficio: string; objetivo: string; restricciones: string }
export interface Capsula { id: string; titulo: string; porque: string; contenido: string; accion: string }
export interface Brief { resumen: string; decisiones: string[]; riesgos: string[]; preguntas: string[]; soloHumano: string }
export interface Evidencia { conQuien: string; quePaso: string; ajuste?: string; fecha: string }

export interface Progreso {
  encargoId: string;
  momento: number; // 0 Leer · 1 Interpretar · 2 Crear · 3 Mesa · 4 Probar · 5 Sellado
  chat: Msg[];
  caso?: Caso;
  capsulas?: Capsula[];
  vistas: string[];
  borrador?: Record<string, string>;
  brief?: Brief;
  mesaAgendada?: boolean;
  evidencias: Evidencia[];
  sello?: { consultor: string; nota: string; fecha: string };
  actualizado: string;
}

export const MOMENTOS = [
  { nombre: "Leer", quien: "IA", peso: 15, texto: "La IA lee tu caso con pocas preguntas." },
  { nombre: "Interpretar", quien: "IA", peso: 15, texto: "Te llega solo el contenido que tu caso necesita." },
  { nombre: "Crear", quien: "IA", peso: 30, texto: "Coproduces el borrador del entregable con la IA." },
  { nombre: "Mesa", quien: "Humano", peso: 25, texto: "Un consultor VinkU llega con el brief y decide contigo." },
  { nombre: "Probar", quien: "Humano", peso: 15, texto: "Lo pruebas con personas reales y se sella." },
];

/** Avance ponderado 0–100 (60 IA + 40 humano). */
export function avance(p?: Progreso): number {
  if (!p) return 0;
  return MOMENTOS.slice(0, Math.min(p.momento, 5)).reduce((a, m) => a + m.peso, 0);
}

const VOZ = `Eres la IA del Aula Invertida de VinkU edu, una plataforma de upskilling y reskilling justo a tiempo para profesionales de ciencias sociales y humanas en Colombia. No das clases ni examinas: trabajas sobre el caso real de la persona para que salga con un entregable real. Hablas en español de Colombia, cálido, directo y sin tecnicismos; tuteas. Nunca inventes datos sobre la persona.`;

const ctxEncargo = (e: Encargo) =>
  `ENCARGO: "${e.titulo}". Entregable: ${e.teLlevas} Para: ${e.paraQuien}`;

const ctxCaso = (c?: Caso) =>
  c ? `CASO DE LA PERSONA: ${c.resumen} | Oficio: ${c.oficio} | Objetivo: ${c.objetivo} | Restricciones: ${c.restricciones}` : "";

// ---------- 1. Leer ----------
export interface RespuestaLeer { mensaje: string; listo: boolean; caso?: Caso }

export function leer(e: Encargo, chat: Msg[]): Promise<RespuestaLeer> {
  const preguntasHechas = chat.filter((m) => m.role === "assistant").length;
  const system = `${VOZ}
${ctxEncargo(e)}
MOMENTO 1 · LEER. Entiende el caso de la persona con un máximo de 4 preguntas en total, una por turno, concretas y sobre hechos (qué hace, para quién, qué ha intentado, qué le falta). Ya hiciste ${preguntasHechas}. Cuando tengas suficiente (o al llegar a 4), cierra con una frase que resuma el caso y marca listo.
Responde SOLO con JSON: {"mensaje":"tu siguiente pregunta o tu cierre","listo":false|true,"caso":{"resumen":"","oficio":"","objetivo":"","restricciones":""}} (incluye "caso" solo cuando listo sea true).`;
  const msgs: Msg[] = [{ role: "user", content: "Hola, quiero empezar este encargo." }, ...chat];
  return pedirJSON<RespuestaLeer>(system, msgs, () => {
    const usuario = chat.filter((m) => m.role === "user").map((m) => m.content);
    const demoPreg = [
      `Cuéntame en dos líneas a qué te dedicas y qué quieres lograr con "${e.titulo.toLowerCase()}".`,
      "¿Para quién es esto? Piensa en una persona u organización concreta que tenga el problema.",
      "¿Qué has intentado hasta ahora y qué te ha frenado?",
    ];
    if (usuario.length < 3) return { mensaje: demoPreg[usuario.length], listo: false };
    return {
      mensaje: "Listo, ya tengo tu caso. Ahora te traigo solo lo que necesitas para resolverlo.",
      listo: true,
      caso: { resumen: usuario[0], oficio: usuario[0].slice(0, 60), objetivo: usuario[1], restricciones: usuario[2] },
    };
  });
}

// ---------- 2. Interpretar (cápsulas justo a tiempo) ----------
export async function interpretar(e: Encargo, caso?: Caso): Promise<Capsula[]> {
  const system = `${VOZ}
${ctxEncargo(e)}
${ctxCaso(caso)}
MOMENTO 2 · INTERPRETAR. De esta biblioteca de cápsulas elige las 3 que este caso necesita AHORA para hacer el entregable (no las más generales): ${e.capsulas.map((c) => `${c.id}: ${c.titulo} (${c.idea})`).join(" | ")}.
Escribe cada cápsula sobre el caso de la persona: "porque" (una frase: por qué le llega ahora), "contenido" (máximo 110 palabras, con un ejemplo de su oficio) y "accion" (una tarea de 5 minutos que alimente el entregable).
Responde SOLO con JSON: {"capsulas":[{"id":"","titulo":"","porque":"","contenido":"","accion":""}]}`;
  const r = await pedirJSON<{ capsulas: Capsula[] }>(system, [{ role: "user", content: "Tráeme las cápsulas." }], () => ({
    capsulas: e.capsulas.slice(0, 3).map((c) => ({
      id: c.id, titulo: c.titulo,
      porque: "Tu caso lo necesita antes de escribir el borrador.",
      contenido: `${c.idea} Modo demo: con la IA activa, esta cápsula se escribe con un ejemplo de tu propio oficio y tu cliente.`,
      accion: "Anota en una línea cómo aplica esto a tu caso.",
    })),
  }));
  return (r.capsulas || []).slice(0, 3);
}

// ---------- 3. Crear (borrador del entregable) ----------
export async function crear(e: Encargo, caso: Caso | undefined, notas: string): Promise<Record<string, string>> {
  const system = `${VOZ}
${ctxEncargo(e)}
${ctxCaso(caso)}
${notas ? `NOTAS DE LA PERSONA EN LAS CÁPSULAS: ${notas}` : ""}
MOMENTO 3 · CREAR. Redacta el primer borrador del entregable, concreto y usable, por secciones: ${e.secciones.map((s) => `${s.id} = ${s.titulo} (${s.guia})`).join(" | ")}. Máximo 90 palabras por sección. Usa el caso; si falta un dato, escribe una suposición explícita entre corchetes para que la persona la confirme.
Responde SOLO con JSON: {"secciones":{${e.secciones.map((s) => `"${s.id}":""`).join(",")}}}`;
  const r = await pedirJSON<{ secciones: Record<string, string> }>(system, [{ role: "user", content: "Escribe el borrador." }], () => ({
    secciones: Object.fromEntries(e.secciones.map((s) => [s.id, `[Borrador demo] ${s.guia} Aplicado a: ${caso?.resumen || "tu caso"}.`])),
  }));
  return r.secciones || {};
}

export async function mejorarSeccion(e: Encargo, caso: Caso | undefined, titulo: string, texto: string, pedido: string): Promise<string> {
  const system = `${VOZ}
${ctxEncargo(e)}
${ctxCaso(caso)}
Mejora la sección "${titulo}" del entregable según el pedido de la persona. Máximo 90 palabras.
Responde SOLO con JSON: {"texto":""}`;
  const r = await pedirJSON<{ texto: string }>(system, [{ role: "user", content: `Texto actual: ${texto}\nPedido: ${pedido || "hazlo más claro y concreto"}` }], () => ({
    texto: `${texto} (Versión demo ajustada: ${pedido || "más clara y concreta"}.)`,
  }));
  return r.texto || texto;
}

// ---------- 4. Mesa (brief para el consultor humano) ----------
export function prepararMesa(e: Encargo, caso: Caso | undefined, borrador: Record<string, string>): Promise<Brief> {
  const system = `${VOZ}
${ctxEncargo(e)}
${ctxCaso(caso)}
BORRADOR: ${e.secciones.map((s) => `${s.titulo}: ${borrador[s.id] || ""}`).join(" || ")}
MOMENTO 4 · MESA. Prepara el brief para el consultor humanista de VinkU que tendrá la sesión con esta persona, para que la Mesa empiece en el minuto 60 y no en el cero. Sé honesto sobre los límites de la IA.
Responde SOLO con JSON: {"resumen":"2 frases del caso y del borrador","decisiones":["3 decisiones que la persona debe tomar con el consultor"],"riesgos":["2 o 3 riesgos o vacíos del borrador"],"preguntas":["3 preguntas que el consultor debería hacer"],"soloHumano":"lo que la IA no puede juzgar aquí (sector, ética, red, criterio), en una frase"}`;
  return pedirJSON<Brief>(system, [{ role: "user", content: "Prepara el brief." }], () => ({
    resumen: `${caso?.resumen || "Caso en demo"}. El borrador de "${e.titulo}" está completo en todas sus secciones.`,
    decisiones: ["Confirmar el cliente ideal", "Elegir qué se deja por fuera", "Definir con quién se prueba primero"],
    riesgos: ["Suposiciones entre corchetes sin confirmar", "Lenguaje todavía académico"],
    preguntas: ["¿Quién te pagaría esto la próxima semana?", "¿Qué te da miedo de esta versión?", "¿Qué dirías si te piden descuento?"],
    soloHumano: "Si esto funciona en el sector real y cómo abrir las primeras puertas.",
  }));
}

// ---------- 5. Probar (evidencia con el mundo) ----------
export async function ajustarConEvidencia(e: Encargo, ev: Evidencia): Promise<string> {
  const system = `${VOZ}
${ctxEncargo(e)}
MOMENTO 5 · PROBAR. La persona llevó su entregable al mundo real. A partir de lo que pasó, sugiere UN ajuste concreto al entregable en máximo 45 palabras.
Responde SOLO con JSON: {"ajuste":""}`;
  const r = await pedirJSON<{ ajuste: string }>(system, [{ role: "user", content: `Con quién: ${ev.conQuien}. Qué pasó: ${ev.quePaso}` }], () => ({
    ajuste: "Ajuste demo: usa las palabras exactas que usó esta persona para describir su problema en la primera línea de tu entregable.",
  }));
  return r.ajuste || "";
}

export function nuevoProgreso(encargoId: string): Progreso {
  return { encargoId, momento: 0, chat: [], vistas: [], evidencias: [], actualizado: new Date().toISOString() };
}
