// ============================================================
// Aula Invertida · Adaptador de IA (el 60 %)
// Orden de preferencia:
//   1. Página publicada en claude.ai → capacidad `sample` (Claude real).
//   2. Plataforma VinkU → Edge Function `diagnostico-ia` de Supabase
//      (la clave de Anthropic vive en el servidor).
//   3. Modo demo → respuestas simuladas para recorrer el flujo sin IA.
// ============================================================

export interface Msg { role: "user" | "assistant"; content: string }
export type ModoIA = "claude" | "plataforma" | "demo";

type Sampler = ((input: unknown, opts?: unknown) => Promise<{ text: string }>) & {
  json?: (input: unknown, opts?: unknown) => Promise<unknown>;
};

let samplerP: Promise<Sampler | null> | null = null;
let deshabilitado = false;

function sampler(): Promise<Sampler | null> {
  if (deshabilitado) return Promise.resolve(null);
  if (!samplerP) {
    const c = (window as unknown as { claude?: { use?: (n: string) => Promise<unknown> } }).claude;
    samplerP = c?.use ? (c.use("sample") as Promise<Sampler | null>).catch(() => null) : Promise.resolve(null);
  }
  return samplerP;
}

const SUPA_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPA_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export async function modoIA(): Promise<ModoIA> {
  if (await sampler()) return "claude";
  if (SUPA_URL && SUPA_KEY) return "plataforma";
  return "demo";
}

export function extraerJSON<T>(texto: string): T | null {
  const ini = texto.indexOf("{");
  const fin = texto.lastIndexOf("}");
  if (ini < 0 || fin <= ini) return null;
  try { return JSON.parse(texto.slice(ini, fin + 1)) as T; } catch { return null; }
}

/** Pide a la IA una respuesta en JSON. `demo` se usa si no hay IA disponible. */
export async function pedirJSON<T>(system: string, mensajes: Msg[], demo: () => T): Promise<T> {
  const s = await sampler();
  if (s) {
    const conInstrucciones: Msg[] = mensajes.map((m, i) =>
      i === 0 ? { ...m, content: `${system}\n\n---\n\n${m.content}` } : m
    );
    const input = conInstrucciones.length === 1 ? conInstrucciones[0].content : conInstrucciones;
    try {
      const r = await s(input, { modelTier: "default", cache: false });
      const v = extraerJSON<T>(r.text);
      if (v) return v;
      throw new Error("La IA respondió en un formato inesperado. Intenta de nuevo.");
    } catch (e) {
      const code = (e as { code?: string }).code;
      if (code === "not_granted") { deshabilitado = true; return demo(); }
      if (code === "rate_limited") throw new Error("La IA está atendiendo muchas solicitudes. Espera un minuto e intenta de nuevo.");
      throw e instanceof Error ? e : new Error("No se pudo hablar con la IA.");
    }
  }
  if (SUPA_URL && SUPA_KEY) {
    const r = await fetch(`${SUPA_URL}/functions/v1/diagnostico-ia`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` },
      body: JSON.stringify({ system, messages: mensajes }),
    });
    const data = await r.json().catch(() => ({}));
    const v = typeof data?.mensaje === "string" ? extraerJSON<T>(data.mensaje) : null;
    if (v) return v;
    throw new Error(data?.error || "La IA de la plataforma no respondió.");
  }
  await new Promise((res) => setTimeout(res, 700));
  return demo();
}
