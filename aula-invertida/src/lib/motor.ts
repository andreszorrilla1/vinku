// ============================================================
// Aprendizaje Basado en Herramientas · Motor
// Descargar (toolset) → Cápsulas y Usar (skillset): IA, 60 %
// En vivo (mindset, masterclass semanal) → Lanzar: humano y mundo, 40 %
// ============================================================

import { HERRAMIENTAS, type Herramienta } from "../data/herramientas";
import { pedirJSON, type Msg } from "./ia";

export interface Instalacion { resumen: string; ajustes: { pieza: string; ajuste: string }[]; instrucciones: string; primerosPasos: string[] }
export interface Reto { tarea: string; pasos: string[]; criterio: string }
export interface Retro { retro: string; logradas: number[]; siguiente: string }
export interface Brief { resumen: string; pregunta: string; decisiones: string[]; preguntas: string[]; mindset: string; soloHumano: string }
export interface Evidencia { conQuien: string; quePaso: string; ajuste?: string; fecha: string }

export interface Progreso {
  herramientaId: string;
  momento: number; // 0 Descargar · 1 Cápsulas · 2 Usar · 3 En vivo · 4 Lanzar · 5 Sellado
  chat: Msg[];
  instalacion?: Instalacion;
  descargado?: boolean;
  capsulasVistas: number[];
  textos: Record<number, string>;
  reto?: Reto;
  intentos: { texto: string; retro: Retro }[];
  logradas: number[];
  brief?: Brief;
  mesaAgendada?: boolean;
  evidencias: Evidencia[];
  sello?: { consultor: string; nota: string; fecha: string };
  actualizado: string;
}

export const MOMENTOS = [
  { nombre: "Descargar", set: "Toolset", quien: "IA", peso: 20, texto: "La IA ajusta la herramienta a tu oficio y la descargas." },
  { nombre: "Cápsulas", set: "Skillset", quien: "IA", peso: 15, texto: "Video, infografía y texto: lo justo para usarla." },
  { nombre: "Usar", set: "Skillset", quien: "IA", peso: 25, texto: "La usas en un caso real; la IA te retroalimenta." },
  { nombre: "En vivo", set: "Mindset", quien: "Humano", peso: 25, texto: "Masterclass en vivo de la semana: llegas con tu pregunta y sales pensando como emprendedor." },
  { nombre: "Lanzar", set: "Mindset", quien: "Humano", peso: 15, texto: "La pruebas con el mundo y se sella." },
];
export const ESTACIONES = MOMENTOS.map((_, i) => MOMENTOS.slice(0, i + 1).reduce((a, m) => a + m.peso, 0) / 100);
export const ULTIMO = MOMENTOS.length - 1;

export const avance = (p?: Progreso) => (p ? MOMENTOS.slice(0, Math.min(p.momento, MOMENTOS.length)).reduce((a, m) => a + m.peso, 0) : 0);

const VOZ = `Eres la IA de VinkU edu y trabajas con su modelo de Aprendizaje Basado en Herramientas: cada experiencia de aprendizaje es una herramienta que la persona descarga, instala en su oficio y usa en un caso real, y así desarrolla toolset, skillset y mindset para pasar de profesional a emprendedor. Atiendes a profesionales de ciencias sociales y humanas en Colombia. Español de Colombia, cálido, directo, sin tecnicismos; tuteas. Nunca inventes datos de la persona.`;

const ctx = (h: Herramienta) =>
  `HERRAMIENTA: "${h.nombre}" para ${h.oficio}. Oportunidad: ${h.oportunidad} Piezas: ${h.toolset.map((t) => `${t.nombre} (${t.tipo}: ${t.detalle})`).join("; ")}. Habilidades: ${h.skillset.join("; ")}. Mindset: de "${h.mindset.de}" a "${h.mindset.a}".`;
const ctxCaso = (p: Progreso) =>
  `${p.instalacion ? `CASO: ${p.instalacion.resumen}` : ""}${p.chat.length ? ` CONVERSACIÓN DE INSTALACIÓN: ${p.chat.map((m) => `${m.role === "user" ? "Persona" : "IA"}: ${m.content}`).join(" / ")}` : ""}`;

// ---------- ¿Cuál es mi herramienta? ----------
export function recomendar(texto: string): Promise<{ id: string; porque: string }> {
  const system = `${VOZ}
CATÁLOGO: ${HERRAMIENTAS.map((h) => `${h.id}: ${h.nombre} — ${h.oficio}. ${h.oportunidad}`).join(" | ")}
La persona describe su oficio y lo que busca. Recomienda UNA herramienta del catálogo y explica en máximo 2 frases por qué es la suya.
Responde SOLO con JSON: {"id":"","porque":""}`;
  return pedirJSON(system, [{ role: "user", content: texto }], () => {
    const t = texto.toLowerCase();
    const id = /psic[oó]l/.test(t) && !/organiz/.test(t) ? "consultorio" : /abogad|norma|ley/.test(t) ? "radar" : /comunica|periodis|redes/.test(t) ? "contenido" : /soci[oó]l|antrop|investig/.test(t) ? "insights" : /trabaj.*social|ong|comunidad/.test(t) ? "proyectos" : /talento|organiz/.test(t) ? "clima" : "consultora";
    return { id, porque: "Recomendación demo según las palabras de tu oficio. Con la IA activa, la recomendación se razona sobre tu caso." };
  });
}

// ---------- 1. Instalar (toolset) ----------
export interface RespuestaInstalar { mensaje: string; listo: boolean; instalacion?: Instalacion }

export function instalar(h: Herramienta, chat: Msg[]): Promise<RespuestaInstalar> {
  const hechas = chat.filter((m) => m.role === "assistant").length;
  const system = `${VOZ}
${ctx(h)}
MOMENTO 1 · DESCARGAR E INSTALAR (toolset). Ajusta la herramienta a la realidad de la persona. Haz máximo 3 preguntas, una por turno, inspiradas en: ${h.preguntas.join(" | ")}. Ya hiciste ${hechas}. Cuando tengas suficiente, cierra con una frase y entrega la instalación.
Responde SOLO con JSON: {"mensaje":"","listo":false|true,"instalacion":{"resumen":"el caso en 1 frase","ajustes":[{"pieza":"nombre de una pieza del toolset","ajuste":"cómo queda configurada para esta persona, 1-2 frases"}],"instrucciones":"instrucciones personalizadas para pegar en Claude como instrucciones del proyecto, máximo 140 palabras, en segunda persona dirigidas a Claude","primerosPasos":["3 pasos concretos para dejarla funcionando hoy"]}} (incluye "instalacion" solo cuando listo sea true).`;
  const msgs: Msg[] = [{ role: "user", content: `Quiero instalar la herramienta ${h.nombre}.` }, ...chat];
  return pedirJSON(system, msgs, () => {
    const r = chat.filter((m) => m.role === "user").map((m) => m.content);
    if (r.length < h.preguntas.length) return { mensaje: h.preguntas[r.length], listo: false };
    return {
      mensaje: "Listo: tu herramienta quedó ajustada a tu oficio. Descárgala y vamos a usarla.",
      listo: true,
      instalacion: {
        resumen: r[0],
        ajustes: h.toolset.map((t) => ({ pieza: t.nombre, ajuste: `Configurada para: ${r[0]}. (Ajuste demo; con la IA activa se escribe sobre tus respuestas.)` })),
        instrucciones: `Trabajas como asistente de ${h.nombre} para una persona que dice: "${r[0]}". Su mayor necesidad: ${r[r.length - 1]}. Ayúdale con borradores claros y deja siempre la decisión final en sus manos.`,
        primerosPasos: ["Descarga el kit y léelo completo", "Crea un proyecto en Claude y pega las instrucciones", `Haz el primer uso: ${h.primerUso}`],
      },
    };
  });
}

export function kitMarkdown(h: Herramienta, i: Instalacion, nombre: string): string {
  return `# ${h.nombre} · kit personalizado
VinkU edu · Aprendizaje Basado en Herramientas
Para: ${nombre || "ti"} · ${i.resumen}

## La oportunidad
${h.oportunidad}

## Toolset: lo que te llevas
${h.toolset.map((t) => `- **${t.nombre}** (${t.tipo}): ${t.detalle}`).join("\n")}

## Cómo quedó ajustada para ti
${i.ajustes.map((a) => `- **${a.pieza}:** ${a.ajuste}`).join("\n")}

## Instrucciones para tu proyecto en Claude
Copia este texto en las instrucciones de un proyecto nuevo de Claude:

> ${i.instrucciones.replace(/\n/g, "\n> ")}

## Primeros pasos
${i.primerosPasos.map((p, n) => `${n + 1}. ${p}`).join("\n")}

## Skillset: lo que vas a aprender a hacer
${h.skillset.map((s) => `- ${s}`).join("\n")}

## Mindset
De "${h.mindset.de}" a "${h.mindset.a}".

## Tu primer uso
${h.primerUso}

## Cómo se convierte en negocio
${h.negocio}
${h.estado === "Disponible" ? "\nLas piezas completas (plantilla de Notion y skill) te las entrega VinkU edu al instalar. Escríbenos: WhatsApp +57 320 662 1546 · Instagram @vinkuedu.\n" : "\nEsta herramienta está en diseño: este kit es la versión de prueba. VinkU edu te avisa cuando estén listas las piezas completas.\n"}`;
}

// ---------- 2. Cápsulas (skillset) ----------
export async function capsulaTexto(h: Herramienta, p: Progreso, n: number): Promise<string> {
  const c = h.capsulas[n];
  const system = `${VOZ}
${ctx(h)}
${ctxCaso(p)}
Escribe la cápsula de texto "${c.titulo}" (${c.idea}) aplicada al caso de la persona: máximo 160 palabras, con un ejemplo de su oficio y una idea por párrafo corto.
Responde SOLO con JSON: {"texto":""}`;
  const r = await pedirJSON<{ texto: string }>(system, [{ role: "user", content: "Escribe la cápsula." }], () => ({
    texto: `${c.idea}\n\nVersión demo: con la IA activa, esta cápsula se escribe con un ejemplo de tu oficio y de tu caso.`,
  }));
  return r.texto || c.idea;
}

// ---------- 3. Usar (skillset) ----------
export function retoDeUso(h: Herramienta, p: Progreso): Promise<Reto> {
  const system = `${VOZ}
${ctx(h)}
${ctxCaso(p)}
MOMENTO 3 · USAR (skillset). Convierte el primer uso ("${h.primerUso}") en un reto concreto sobre el caso de la persona: la tarea, 3 o 4 pasos usando las piezas de la herramienta, y el criterio para saber que quedó bien.
Responde SOLO con JSON: {"tarea":"","pasos":["",""],"criterio":""}`;
  return pedirJSON(system, [{ role: "user", content: "Dame mi reto de primer uso." }], () => ({
    tarea: h.primerUso,
    pasos: h.toolset.map((t) => `Usa ${t.nombre}: ${t.detalle}`),
    criterio: "Lo que produjiste lo podrías mostrar a un cliente sin vergüenza.",
  }));
}

export function retroalimentar(h: Herramienta, p: Progreso, texto: string): Promise<Retro> {
  const system = `${VOZ}
${ctx(h)}
${ctxCaso(p)}
RETO: ${p.reto?.tarea} · Criterio: ${p.reto?.criterio}
La persona cuenta lo que hizo con la herramienta. Dale retroalimentación honesta y concreta (máximo 80 palabras), indica qué habilidades del skillset ya demostró (por índice, empezando en 0: ${h.skillset.map((s, n) => `${n}=${s}`).join(", ")}) y qué hacer a continuación en una frase.
Responde SOLO con JSON: {"retro":"","logradas":[0],"siguiente":""}`;
  return pedirJSON(system, [{ role: "user", content: texto }], () => ({
    retro: "Retroalimentación demo: buen primer uso. Con la IA activa, aquí recibes comentarios sobre lo que de verdad hiciste.",
    logradas: [0, 1].filter((n) => n < h.skillset.length),
    siguiente: "Llévalo a la Mesa para convertirlo en negocio.",
  }));
}

// ---------- 4. En vivo (mindset) ----------
export function prepararEnVivo(h: Herramienta, p: Progreso): Promise<Brief> {
  const system = `${VOZ}
${ctx(h)}
${ctxCaso(p)}
USO REAL: ${p.intentos.map((x) => x.texto).join(" / ")}
MOMENTO 4 · EN VIVO (mindset). Esta semana hay una masterclass en vivo de "${h.nombre}" con un consultor humanista de VinkU. Prepara a la persona y deja un brief para quien dicta la sesión. El foco es el cambio de mentalidad y el modelo de negocio: ${h.negocio}
Responde SOLO con JSON: {"resumen":"2 frases","pregunta":"la pregunta que esta persona debería llevar a la masterclass, en primera persona, 1 frase","decisiones":["3 decisiones de negocio que tomar en la Mesa"],"preguntas":["3 preguntas para el consultor"],"mindset":"dónde está hoy la persona entre \\"${h.mindset.de}\\" y \\"${h.mindset.a}\\", en 1 frase","soloHumano":"lo que la IA no puede juzgar aquí, en 1 frase"}`;
  return pedirJSON(system, [{ role: "user", content: "Prepara el brief." }], () => ({
    resumen: `${p.instalacion?.resumen || "Caso demo"}. Ya instaló ${h.nombre} y la usó en un caso.`,
    pregunta: `¿Cómo le cobro a mi primer cliente por lo que hago con ${h.nombre}?`,
    decisiones: ["A quién le ofrece primero", "Cuánto cobra y cómo", "Qué deja por fuera"],
    preguntas: ["¿Qué cambió en tu forma de ver tu oficio?", "¿Quién te pagaría esto este mes?", "¿Qué te frena para cobrarlo?"],
    mindset: `Empieza a moverse de "${h.mindset.de}" hacia "${h.mindset.a}".`,
    soloHumano: "La lectura del sector, la ética del oficio y las puertas que abre la red.",
  }));
}

// ---------- 5. Lanzar ----------
export async function ajustarConEvidencia(h: Herramienta, ev: Evidencia): Promise<string> {
  const system = `${VOZ}
${ctx(h)}
MOMENTO 5 · LANZAR. La persona probó la herramienta o su oferta con el mundo real. Sugiere UN ajuste concreto en máximo 45 palabras.
Responde SOLO con JSON: {"ajuste":""}`;
  const r = await pedirJSON<{ ajuste: string }>(system, [{ role: "user", content: `Con quién: ${ev.conQuien}. Qué pasó: ${ev.quePaso}` }], () => ({
    ajuste: "Ajuste demo: usa las palabras exactas de esta persona para explicar qué resuelve tu herramienta.",
  }));
  return r.ajuste || "";
}

export const nuevoProgreso = (herramientaId: string): Progreso => ({
  herramientaId, momento: 0, chat: [], capsulasVistas: [], textos: {}, intentos: [], logradas: [], evidencias: [], actualizado: new Date().toISOString(),
});
