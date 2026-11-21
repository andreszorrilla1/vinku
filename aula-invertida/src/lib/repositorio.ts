// Repositorio inteligente: relevancia local (sin IA, instantánea)
// + búsqueda en lenguaje natural con IA (motor.buscarConIA).
import { HERRAMIENTAS, EVENTOS, type Herramienta, type Formato, type Objetivo } from "../data/herramientas";
import type { Perfil, Resultado } from "./motor";

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const VACIAS = new Set(["soy", "de", "la", "el", "los", "las", "y", "a", "en", "un", "una", "que", "quiero", "para", "mi", "me", "con", "por", "del", "lo", "como", "mas", "es"]);
const palabras = (s: string) => norm(s).split(/[^a-z0-9ñ]+/).filter((w) => w.length > 2 && !VACIAS.has(w));

/** Puntaje de una herramienta para un texto libre y un perfil. */
export function puntaje(h: Herramienta, texto: string, perfil: Perfil): number {
  const campo = norm([h.nombre, h.oficio, h.promesa, h.oportunidad, ...h.claves, ...h.skillset].join(" "));
  let p = 0;
  for (const w of palabras(texto)) {
    if (h.claves.some((c) => norm(c).includes(w) || w.includes(norm(c).split(" ")[0]))) p += 3;
    else if (campo.includes(w)) p += 1;
  }
  for (const w of palabras(perfil.oficio)) if (h.claves.some((c) => norm(c).startsWith(w.slice(0, 6)))) p += 4;
  if (perfil.objetivo && h.objetivos.includes(perfil.objetivo)) p += 2;
  if (h.estado !== "En diseño") p += 1;
  return p;
}

export interface Filtros { texto: string; objetivo: Objetivo | ""; formato: Formato | ""; acceso: "" | "Gratis" | "Pago"; soloDisponibles: boolean }

export function filtrar(f: Filtros, perfil: Perfil): { h: Herramienta; p: number }[] {
  return HERRAMIENTAS
    .filter((h) => (!f.objetivo || h.objetivos.includes(f.objetivo)) && (!f.formato || h.formato === f.formato))
    .filter((h) => (f.acceso === "Gratis" ? h.precio === 0 : f.acceso === "Pago" ? h.precio > 0 : true))
    .filter((h) => (!f.soloDisponibles || h.estado !== "En diseño"))
    .map((h) => ({ h, p: puntaje(h, f.texto, perfil) }))
    .filter((x) => !f.texto.trim() || x.p > 0)
    .sort((a, b) => b.p - a.p || a.h.semana - b.h.semana);
}

/** Respaldo sin IA para la búsqueda en lenguaje natural. */
export function demoBusqueda(consulta: string, perfil: Perfil): Resultado[] {
  return HERRAMIENTAS.map((h) => ({ h, p: puntaje(h, consulta, perfil) }))
    .sort((a, b) => b.p - a.p).slice(0, 3)
    .map(({ h }) => ({ id: h.id, razon: `Coincide con lo que escribiste: ${h.promesa.toLowerCase()} (búsqueda sin IA).` }));
}

export const relacionadas = (h: Herramienta) =>
  HERRAMIENTAS.filter((x) => x.id !== h.id)
    .map((x) => ({ x, n: x.objetivos.filter((o) => h.objetivos.includes(o)).length + (x.formato === h.formato ? 0.5 : 0) }))
    .sort((a, b) => b.n - a.n).slice(0, 3).map((r) => r.x);

export const proximoEvento = (id: string) => EVENTOS.filter((e) => e.herramientaId === id && new Date(e.fecha) > new Date()).sort((a, b) => a.fecha.localeCompare(b.fecha))[0];
