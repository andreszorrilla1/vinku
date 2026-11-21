// ============================================================
// Aprendizaje Basado en Herramientas · Motor de la ruta
// A tu ritmo, con IA (60 %): Descargar → Personalizar → Cápsulas → Usar
// En vivo y en el mundo (40 %): Masterclass → Laboratorio (victoria temprana)
// ============================================================

import { HERRAMIENTAS, type Herramienta, type Objetivo } from "../data/herramientas";
import { pedirJSON, type Msg } from "./ia";
import type { Escenario } from "../data/artefactos";

export interface Perfil { oficio: string; objetivo: Objetivo | ""; situacion: "" | "Desempleado" | "Empleado" | "Independiente" }
export interface Retro { retro: string; logradas: number[]; siguiente: string }

export interface Progreso {
  herramientaId: string;
  momento: number; // 0 Descargar · 1 Personalizar · 2 Cápsulas · 3 Usar · 4 Masterclass · 5 Laboratorio · 6 Victoria
  descargado?: boolean;
  personalizacion?: string;
  capsulasVistas: number[];
  adaptadas: Record<number, string>;
  intentos: { texto: string; retro: Retro }[];
  logradas: number[];
  pregunta?: string;
  victoria?: { valores: Record<string, string>; fecha: string; consejo?: string };
  cert?: Cert;
  checklist?: number[];
  numeros?: Record<string, string>;
  simulaciones?: Record<string, { historial: Msg[]; eval?: { eval: EvalCriterio[]; consejo: string } }>;
  autoeval?: Record<string, string>;
  actualizado: string;
}

export interface EvalCriterio { criterio: string; nivel: "Logrado" | "En proceso" | "No evidenciado"; comentario: string }
export interface Cert {
  estado: "en curso" | "en validación" | "verificada";
  prueba?: { texto: string; eval: EvalCriterio[]; resumen: string; lista: boolean };
  codigo?: string; fecha?: string; evaluador?: string;
}
export interface PerfilPublico { nombre: string; ciudad: string; modalidad: string; servicio: string; desde: string; publicado: boolean }

export const MOMENTOS = [
  { nombre: "Descargar", set: "Toolset", lado: "IA", peso: 10, texto: "Te llevas la herramienta lista para usar." },
  { nombre: "Personalizar", set: "Toolset", lado: "IA", peso: 15, texto: "La ajustas tú, a tu manera, con su propia pieza de personalización." },
  { nombre: "Cápsulas", set: "Skillset", lado: "IA", peso: 15, texto: "Video, infografía y texto: lo justo para usarla." },
  { nombre: "Usar", set: "Skillset", lado: "IA", peso: 20, texto: "La usas en tu trabajo real y la IA te retroalimenta." },
  { nombre: "Masterclass", set: "Mindset", lado: "En vivo", peso: 15, texto: "Un experto entrega el conocimiento y responde tu pregunta." },
  { nombre: "Laboratorio", set: "Mindset", lado: "En vivo", peso: 25, texto: "Validamos juntos tu piloto y registras tu victoria temprana." },
];
export const ESTACIONES = MOMENTOS.map((_, i) => MOMENTOS.slice(0, i + 1).reduce((a, m) => a + m.peso, 0) / 100);
export const ULTIMO = MOMENTOS.length - 1;
export const avance = (p?: Progreso) => (p ? MOMENTOS.slice(0, Math.min(p.momento, MOMENTOS.length)).reduce((a, m) => a + m.peso, 0) : 0);

export const nuevoProgreso = (herramientaId: string): Progreso => ({
  herramientaId, momento: 0, capsulasVistas: [], adaptadas: {}, intentos: [], logradas: [], actualizado: new Date().toISOString(),
});

const VOZ = `Eres la IA de VinkU edu. Su modelo es el Aprendizaje Basado en Herramientas: cada experiencia de aprendizaje es una herramienta que la persona descarga, personaliza por su cuenta, aprende con cápsulas y usa en un caso real; así desarrolla toolset, skillset y mindset, orientada a victorias tempranas (prototipos y pilotos). Atiendes a profesionales de ciencias sociales y humanas en Colombia (desempleados, empleados o independientes) que quieren abrir nuevos campos de acción, trabajar como independientes o emprender. No importa el título, importa lo que pueden hacer y ser. Español de Colombia, cálido, directo, sin tecnicismos; tuteas. Nunca inventes datos de la persona.`;
const ctxPerfil = (p?: Perfil) => (p && (p.oficio || p.objetivo || p.situacion) ? `PERFIL: oficio ${p.oficio || "sin decir"}; objetivo ${p.objetivo || "sin decir"}; situación ${p.situacion || "sin decir"}.` : "");
const ctxH = (h: Herramienta) => `HERRAMIENTA "${h.nombre}" para ${h.oficio}. ${h.promesa} Piezas: ${h.toolset.map((t) => t.nombre).join(", ")}. Mindset: de "${h.mindset.de}" a "${h.mindset.a}".`;

// ---------- Repositorio inteligente ----------
export interface Resultado { id: string; razon: string }
export function buscarConIA(consulta: string, perfil: Perfil, demo: () => Resultado[]): Promise<Resultado[]> {
  const system = `${VOZ}
${ctxPerfil(perfil)}
REPOSITORIO: ${HERRAMIENTAS.map((h) => `${h.id}: ${h.nombre} (${h.oficio}; ${h.promesa}; objetivos: ${h.objetivos.join(", ")}; formato: ${h.formato}; estado: ${h.estado})`).join(" | ")}
La persona describe lo que necesita. Ordena de 1 a 4 herramientas del repositorio que mejor la ayudan, de la más a la menos útil, y explica en una frase cada una (por qué le sirve a ella, no qué es la herramienta). Si ninguna encaja bien, devuelve la más cercana y dilo.
Responde SOLO con JSON: {"resultados":[{"id":"","razon":""}]}`;
  return pedirJSON<{ resultados: Resultado[] }>(system, [{ role: "user", content: consulta }], () => ({ resultados: demo() }))
    .then((r) => (r.resultados || []).filter((x) => HERRAMIENTAS.some((h) => h.id === x.id)));
}

// ---------- Cápsulas: adaptar a mi caso (opcional) ----------
export async function adaptarCapsula(h: Herramienta, perfil: Perfil, titulo: string, cuerpo: string): Promise<string> {
  const system = `${VOZ}
${ctxH(h)}
${ctxPerfil(perfil)}
Reescribe esta cápsula de texto para el caso de la persona, con un ejemplo concreto de su oficio y situación. Máximo 130 palabras. No cambies datos normativos ni reglas.
Responde SOLO con JSON: {"texto":""}`;
  const r = await pedirJSON<{ texto: string }>(system, [{ role: "user", content: `Cápsula "${titulo}": ${cuerpo}` }], () => ({
    texto: `Versión demo adaptada para ${perfil.oficio || "tu oficio"}: ${cuerpo.slice(0, 220)}…`,
  }));
  return r.texto || cuerpo;
}

// ---------- Usar: retroalimentación del reto ----------
export function retroalimentar(h: Herramienta, perfil: Perfil, texto: string): Promise<Retro> {
  const system = `${VOZ}
${ctxH(h)}
${ctxPerfil(perfil)}
RETO: ${h.reto.tarea} · Quedó bien si: ${h.reto.criterio}
La persona cuenta lo que hizo. Dale retroalimentación honesta y concreta (máximo 80 palabras), di qué habilidades del skillset ya mostró (índices desde 0: ${h.skillset.map((s, n) => `${n}=${s}`).join(", ")}) y cuál es su siguiente paso en una frase.
Responde SOLO con JSON: {"retro":"","logradas":[0],"siguiente":""}`;
  return pedirJSON(system, [{ role: "user", content: texto }], () => ({
    retro: "Retroalimentación demo: buen primer uso. Con la IA activa, aquí recibes comentarios sobre lo que de verdad hiciste.",
    logradas: [0, 1].filter((n) => n < h.skillset.length),
    siguiente: "Lleva tu pregunta a la masterclass.",
  }));
}

// ---------- Masterclass: afinar la pregunta ----------
export async function afinarPregunta(h: Herramienta, perfil: Perfil, borrador: string, usos: string[]): Promise<string> {
  const system = `${VOZ}
${ctxH(h)}
${ctxPerfil(perfil)}
LO QUE HA HECHO CON LA HERRAMIENTA: ${usos.join(" / ") || "aún nada"}
Convierte su borrador en una sola pregunta clara para el experto de la masterclass, en primera persona, máximo 30 palabras, que apunte a convertir la herramienta en negocio o a destrabar su uso.
Responde SOLO con JSON: {"pregunta":""}`;
  const r = await pedirJSON<{ pregunta: string }>(system, [{ role: "user", content: borrador || "No sé qué preguntar." }], () => ({
    pregunta: borrador ? `${borrador.replace(/\?*$/, "")}?` : `¿Cómo convierto lo que hago con ${h.nombre} en ingresos este mes?`,
  }));
  return r.pregunta || borrador;
}

// ---------- Laboratorio: victoria temprana y siguiente paso ----------
export async function leerVictoria(h: Herramienta, perfil: Perfil, valores: Record<string, string>): Promise<string> {
  const system = `${VOZ}
${ctxH(h)}
${ctxPerfil(perfil)}
VICTORIA TEMPRANA ESPERADA: ${h.victoria}
OPCIONES PARA SEGUIR: ${h.siguiente.map((s) => `${s.nombre} (${s.detalle})`).join(" | ")} | Otras herramientas: ${HERRAMIENTAS.filter((x) => x.id !== h.id).map((x) => x.nombre).join(", ")}
La persona registra lo que logró. En máximo 60 palabras: reconoce lo logrado con sus datos, nombra un ajuste para su piloto y recomienda UNA opción para seguir, explicando por qué.
Responde SOLO con JSON: {"consejo":""}`;
  const r = await pedirJSON<{ consejo: string }>(system, [{ role: "user", content: Object.entries(valores).map(([k, v]) => `${k}: ${v}`).join(". ") }], () => ({
    consejo: `Consejo demo: ya tienes datos reales de tu piloto. Tu siguiente paso natural es «${h.siguiente[0].nombre}».`,
  }));
  return r.consejo || "";
}

// ---------- Certificación: primera lectura de la prueba con la rúbrica ----------
export async function evaluarPrueba(h: Herramienta, habilidad: string, caso: string, rubrica: string[], texto: string): Promise<{ eval: EvalCriterio[]; resumen: string; lista: boolean }> {
  const system = `${VOZ}
${ctxH(h)}
Eres la primera lectura (no la decisión final) de una prueba práctica para certificar la habilidad "${habilidad}".
CASO: ${caso}
RÚBRICA: ${rubrica.map((r, i) => `${i + 1}. ${r}`).join(" ")}
Evalúa la respuesta de la persona con cada criterio: "Logrado", "En proceso" o "No evidenciado", con un comentario concreto de máximo 25 palabras. Sé exigente: si no hay evidencia en el texto, es "No evidenciado". "lista" es true solo si todos los criterios están en "Logrado". "resumen" en máximo 40 palabras, con lo que debe ajustar si no está lista.
Responde SOLO con JSON: {"eval":[{"criterio":"","nivel":"Logrado","comentario":""}],"resumen":"","lista":false}`;
  const r = await pedirJSON<{ eval: EvalCriterio[]; resumen: string; lista: boolean }>(system, [{ role: "user", content: texto }], () => {
    const largo = texto.trim().split(/\s+/).length >= 40;
    return {
      eval: rubrica.map((c) => ({ criterio: c, nivel: largo ? "Logrado" : "En proceso", comentario: largo ? "Lectura demo: hay evidencia suficiente en tu respuesta." : "Lectura demo: amplía tu respuesta con lo que hiciste y por qué." })),
      resumen: largo ? "Lectura demo: lista para validación humana." : "Lectura demo: explica con más detalle (mínimo 40 palabras) para pasar a validación.",
      lista: largo,
    };
  });
  return { eval: (r.eval || []).slice(0, rubrica.length), resumen: r.resumen || "", lista: !!r.lista };
}

// ---------- Simuladores: juego de roles ----------
// En el historial, "user" es la profesional que practica y "assistant" es el personaje.
export async function turnoSimulado(e: Escenario, historial: Msg[]): Promise<string> {
  const system = `Juego de roles para practicar una conversación profesional real. ${e.rol}
Mantente siempre en el personaje, en español de Colombia. Nunca des consejos ni evalúes a la otra persona: solo responde como el personaje, en máximo 45 palabras.
Responde SOLO con JSON: {"respuesta":""}`;
  const msgs: Msg[] = [{ role: "user", content: `(Empieza la conversación. Tu primera frase fue: "${e.abre}")` }, { role: "assistant", content: JSON.stringify({ respuesta: e.abre }) },
    ...historial.slice(1).map((m) => (m.role === "assistant" ? { role: "assistant" as const, content: JSON.stringify({ respuesta: m.content }) } : m))];
  const r = await pedirJSON<{ respuesta: string }>(system, msgs, () => {
    const n = historial.filter((m) => m.role === "user").length;
    return { respuesta: e.demo[Math.min(n - 1, e.demo.length - 1)] || "Listo, gracias." };
  });
  return r.respuesta || "…";
}

export async function evaluarSimulacion(e: Escenario, historial: Msg[]): Promise<{ eval: EvalCriterio[]; consejo: string }> {
  const system = `${VOZ}
Evalúas una práctica de conversación (simulador) con "${e.personaje}". Contexto: ${e.contexto}
CRITERIOS: ${e.criterios.map((c, i) => `${i + 1}. ${c}`).join(" ")}
Para cada criterio: "Logrado", "En proceso" o "No evidenciado", con un comentario concreto que cite lo que la profesional dijo (máximo 25 palabras). Luego un consejo de máximo 40 palabras con una frase que podría usar la próxima vez.
Responde SOLO con JSON: {"eval":[{"criterio":"","nivel":"Logrado","comentario":""}],"consejo":""}`;
  const texto = historial.map((m) => `${m.role === "user" ? "Profesional" : e.personaje}: ${m.content}`).join("\n");
  const r = await pedirJSON<{ eval: EvalCriterio[]; consejo: string }>(system, [{ role: "user", content: texto }], () => ({
    eval: e.criterios.map((c) => ({ criterio: c, nivel: "En proceso", comentario: "Lectura demo: con la IA activa, aquí ves qué dijiste bien y qué ajustar." })),
    consejo: "Consejo demo: practica una frase que explique tu valor en menos de 20 palabras.",
  }));
  return { eval: (r.eval || []).slice(0, e.criterios.length), consejo: r.consejo || "" };
}

export function kitMarkdown(h: Herramienta): string {
  return `# ${h.nombre} · kit
VinkU edu · Aprendizaje Basado en Herramientas

## Qué resuelve
${h.oportunidad}
${h.promesa}

## Toolset
${h.toolset.map((t) => `- **${t.nombre}** (${t.tipo}): ${t.detalle}`).join("\n")}

## Personalízala tú
${h.personalizacion}

## Skillset
${h.skillset.map((s) => `- ${s}`).join("\n")}

## Mindset
De "${h.mindset.de}" a "${h.mindset.a}".

## Tu reto
${h.reto.tarea}
Quedó bien si: ${h.reto.criterio}

## Tu victoria temprana
${h.victoria}

¿Dudas? WhatsApp VinkU edu +57 320 662 1546 · Instagram @vinkuedu
`;
}
