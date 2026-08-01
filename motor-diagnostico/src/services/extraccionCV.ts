// ============================================================================
// Extracción y matching semántico de habilidades desde el CV.
//
// Regla dura (sección 5.1.3 / criterio de aceptación): TODO match resuelve a un
// skill_id EXISTENTE del catálogo cerrado. La IA nunca genera texto libre ni
// crea habilidades. Lo que no resuelve va a `unmatched`, nunca se inventa.
//
// Dos caminos:
//   - Producción: POST a la Edge Function `extraer-cv` (la llave de Claude vive
//     solo en el servidor). Ver supabase/functions/extraer-cv/index.ts.
//   - Local/demo: matcher heurístico en memoria contra el catálogo mock, que
//     imita el comportamiento (literal vs. semántico inferido) sin llamar a IA.
// ============================================================================

import type { CvExtractionResult, CvSkillMatch, Skill, UnmatchedMention } from '@/lib/types';
import { SKILLS } from '@/data/mockCatalog';

const EDGE_URL = import.meta.env.VITE_EXTRAER_CV_URL as string | undefined;

let contador = 0;
const nid = (p: string) => `${p}-${Date.now()}-${contador++}`;

// Diccionario de inferencia para el matcher local. Cada entrada mapea señales
// del texto del CV a una habilidad DEL CATÁLOGO. Las inferencias de narrativa
// (soft/power) llevan menor confianza y match_type 'semantico_inferido'.
interface ReglaMatch {
  skillName: string;
  literal: RegExp[];          // menciones directas → confianza alta
  inferido?: RegExp[];        // narrativa de logros → confianza menor
}

const REGLAS: ReglaMatch[] = [
  { skillName: 'Contabilidad básica', literal: [/contabilidad|contable|causaci[oó]n|conciliaci[oó]n/i], inferido: [/registr[oé].*(operaciones|cuentas)/i] },
  { skillName: 'Manejo de Excel', literal: [/excel|hojas? de c[aá]lculo|tablas din[aá]micas/i] },
  { skillName: 'Facturación electrónica', literal: [/facturaci[oó]n|facturas? electr[oó]nicas?/i] },
  { skillName: 'Manejo de inventarios', literal: [/inventarios?/i], inferido: [/(gestion[eé]|manej[eé]|control[eé]).*(stock|existencias|bodega|tienda)/i] },
  { skillName: 'Atención al cliente', literal: [/atenci[oó]n al cliente|servicio al cliente|postventa/i], inferido: [/(atend[ií]|manej[eé]).*(clientes|reclamos|pqrs?)/i] },
  { skillName: 'Técnicas de venta', literal: [/ventas?|comercial|cierre de negocios?/i], inferido: [/(vend[ií]|alcanc[eé]).*(meta|cuota)/i] },
  { skillName: 'Manejo de CRM', literal: [/\bcrm\b|salesforce|hubspot/i] },
  { skillName: 'Soporte técnico de hardware', literal: [/soporte t[eé]cnico|mantenimiento de equipos|reparaci[oó]n de (pc|computadores?)/i] },
  { skillName: 'Administración de redes', literal: [/redes (lan|wan)|administraci[oó]n de redes|routers?|switches?/i] },
  { skillName: 'Costeo de productos y servicios', literal: [/costeo|estructura de costos|punto de equilibrio|m[aá]rgenes/i] },
  // --- Soft: se infieren de la narrativa, casi nunca declaradas literal ---
  { skillName: 'Trabajo en equipo', literal: [/trabajo en equipo/i], inferido: [/(coordin[eé]|trabaj[eé]|colabor[eé]).*(equipo|compa[ñn]eros|[aá]rea)/i] },
  { skillName: 'Liderazgo', literal: [/liderazgo|lider[eé]/i], inferido: [/(coordin[eé]|dirig[ií]|lider[eé]|estuve a cargo).*(equipo|personas?|de \d+)/i] },
  { skillName: 'Orientación al servicio', literal: [/orientaci[oó]n al servicio/i], inferido: [/(call center|reclamos|satisfacci[oó]n del cliente)/i] },
  { skillName: 'Trabajo bajo presión', literal: [/trabajo bajo presi[oó]n/i], inferido: [/(alta demanda|cumpl[ií] plazos|urgenc)/i] },
  { skillName: 'Comunicación asertiva', literal: [/comunicaci[oó]n asertiva/i], inferido: [/(present[eé]|comuniqu[eé]|negoci[eé])/i] },
  { skillName: 'Organización del tiempo', literal: [/organizaci[oó]n del tiempo|gesti[oó]n del tiempo/i], inferido: [/(cumpl[ií] plazos|prioric[eé]|agenda)/i] },
];

const byName = new Map(SKILLS.map((sk) => [sk.name, sk] as const));

function matchLocal(texto: string): CvExtractionResult {
  const matches: CvSkillMatch[] = [];
  const usados = new Set<string>();

  for (const regla of REGLAS) {
    const skill = byName.get(regla.skillName);
    if (!skill || usados.has(skill.id)) continue;

    const snippet = primerSnippet(texto, [...regla.literal, ...(regla.inferido ?? [])]);
    const hitLiteral = regla.literal.some((r) => r.test(texto));
    const hitInferido = (regla.inferido ?? []).some((r) => r.test(texto));

    if (hitLiteral) {
      usados.add(skill.id);
      matches.push(nuevoMatch(skill, 'literal', 0.9, snippet));
    } else if (hitInferido) {
      usados.add(skill.id);
      // soft/power inferido → confianza aún más baja
      const conf = skill.skill_type === 'hard' ? 0.7 : 0.55;
      matches.push(nuevoMatch(skill, 'semantico_inferido', conf, snippet));
    }
  }

  return { matches, unmatched: detectarNoResueltas(texto, usados), raw_text: texto };
}

function nuevoMatch(
  skill: Skill,
  match_type: CvSkillMatch['match_type'],
  match_confidence: number,
  source_snippet: string,
): CvSkillMatch {
  return {
    id: nid('m'),
    skill_id: skill.id,
    match_type,
    match_confidence,
    source_snippet,
    status: 'sugerida',
  };
}

function primerSnippet(texto: string, regexes: RegExp[]): string {
  for (const r of regexes) {
    const m = texto.match(r);
    if (m && m.index != null) {
      const ini = Math.max(0, m.index - 30);
      const fin = Math.min(texto.length, m.index + m[0].length + 40);
      return '…' + texto.slice(ini, fin).trim() + '…';
    }
  }
  return '';
}

// Menciones que "suenan" a habilidad pero NO están en el catálogo → unmatched.
// Nunca se convierten en skill nueva automáticamente (regla / criterio).
const SENALES_FUERA_DE_CATALOGO =
  /\b(photoshop|illustrator|python|sql|ingl[eé]s|franc[eé]s|autocad|soldadura|cocina|marketing digital|redes sociales)\b/gi;

function detectarNoResueltas(texto: string, _usados: Set<string>): UnmatchedMention[] {
  const encontradas = new Map<string, string>();
  let m: RegExpExecArray | null;
  SENALES_FUERA_DE_CATALOGO.lastIndex = 0;
  while ((m = SENALES_FUERA_DE_CATALOGO.exec(texto)) !== null) {
    const raw = m[0].toLowerCase();
    if (!encontradas.has(raw)) encontradas.set(raw, m[0]);
  }
  return [...encontradas.values()].map((raw_text) => ({ id: nid('u'), raw_text }));
}

/** Punto de entrada. Usa la Edge Function si está desplegada; si no, el matcher local. */
export async function extraerHabilidadesDeCV(texto: string): Promise<CvExtractionResult> {
  if (EDGE_URL) {
    try {
      const resp = await fetch(EDGE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto }),
      });
      if (resp.ok) {
        const data = (await resp.json()) as CvExtractionResult;
        return data;
      }
    } catch {
      // cae al matcher local
    }
  }
  return matchLocal(texto);
}
