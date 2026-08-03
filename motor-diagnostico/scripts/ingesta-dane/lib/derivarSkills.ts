// ============================================================================
// Derivación función → skills duras atómicas (las 5 reglas acordadas):
//   1. Una función → 1..3 skills atómicas (verbo + objeto, cortas).
//   2. Se quitan los calificativos ("de acuerdo con…", "según…").
//   3. Se descarta el ruido (ej. "Desempeñar funciones afines").
//   4. Se detecta lo que en realidad es blando (coordinar/liderar personal) y
//      NO se vuelve skill dura (se marca para la capa de destrezas).
//   5. Salen piezas Lego COMPARTIBLES entre ocupaciones (nombres canónicos).
//
// Dos motores, mismo contrato:
//   - IA (Claude API): calidad; requiere ANTHROPIC_API_KEY (lado servidor).
//   - Heurístico: sin key; borrador más crudo (1 skill/función), útil para
//     arrancar. Aplica las mismas reglas de descarte y detección de blandas.
// ============================================================================

import { canonizar } from './normalizar.ts';

export interface DerivacionFuncion {
  consecutivo: number | null;
  texto: string;
  skills: string[];          // skills duras derivadas (vacío si descartada/blanda)
  descartada: boolean;       // ruido/boilerplate
  es_blanda: boolean;        // en realidad es una destreza (no dura)
}

const BOILERPLATE = /desempe[ñn]ar (otras )?funciones (afines|conexas|relacionadas)/i;

const BLANDA = /^(coordinar a (otros|los)|coordinar (el |al )?(equipo|personal|trabajo del)|dirigir (al|el|a los|a las) (personal|equipo|colaborador)|liderar|supervisar (al|el|a) (personal|equipo|colaborador)|motivar (al|el|a)|orientar al personal|gestionar el talento)/i;

// Cola de calificativos que no forman parte de la skill.
const COLA = /\s+(?:de acuerdo con|seg[uú]n|conforme a|con base en|a partir de|con el fin de|con el prop[oó]sito de|para (?:garantizar|asegurar|mejorar|cumplir)|teniendo en cuenta|bas[aá]ndose en)\b/i;

/** Motor heurístico: reglas 2,3,4 + una skill limpia por función. */
export function derivarHeuristico(texto: string, consecutivo: number | null): DerivacionFuncion {
  const base: DerivacionFuncion = { consecutivo, texto, skills: [], descartada: false, es_blanda: false };
  const t = (texto ?? '').trim();
  if (!t || BOILERPLATE.test(t)) return { ...base, descartada: true };
  if (BLANDA.test(t)) return { ...base, es_blanda: true };

  // regla 2: cortar la cola de calificativos
  let cuerpo = t.split(COLA)[0].replace(/,?\s*entre otr[oa]s\.?$/i, '').replace(/\.$/, '').trim();

  // regla 1 (aprox.): si hay enumeración "como A, B, C", generar una skill por ítem
  const mComo = cuerpo.match(/^(.*?)\s+como\s+(.+)$/i);
  let skills: string[];
  if (mComo) {
    const verboObjeto = mComo[1].trim(); // ej. "Diseñar la arquitectura de TIC"
    const items = mComo[2].split(/\s*,\s*|\s+y\s+|\s+e\s+/).map((x) => x.trim()).filter(Boolean);
    const nucleo = verboObjeto.replace(/^(dise[ñn]ar|desarrollar|construir|implementar|configurar|elaborar|crear|producir)\b/i, '').trim();
    skills = items.slice(0, 3).map((it) => canonizar(`${primeraPalabra(verboObjeto)} ${it}`.replace(/\s+/g, ' ')));
    if (nucleo) skills.unshift(canonizar(verboObjeto));
  } else {
    skills = [canonizar(recortar(cuerpo))];
  }
  return { ...base, skills: dedup(skills).slice(0, 3) };
}

function primeraPalabra(s: string): string {
  return s.trim().split(/\s+/)[0];
}
function recortar(s: string, max = 80): string {
  const t = s.replace(/\s+/g, ' ').trim();
  return t.length <= max ? t : t.slice(0, max).replace(/\s+\S*$/, '') + '…';
}
function dedup(xs: string[]): string[] {
  const seen = new Set<string>();
  return xs.filter((x) => { const k = x.toLowerCase(); if (seen.has(k) || x.length < 3) return false; seen.add(k); return true; });
}

// --- Motor IA (Claude API) -------------------------------------------------

const PROMPT_SISTEMA = `Eres un analista ocupacional de VinkU. Recibes las FUNCIONES de una ocupación (perfil CUOC de Colombia) y devuelves las HABILIDADES DURAS atómicas que cada función implica.

REGLAS:
1. De cada función extrae de 1 a 3 habilidades duras CORTAS y CONCRETAS (verbo + objeto). Ej: "Diseñar arquitectura de software", "Control de calidad (QA)".
2. Quita los calificativos ("de acuerdo con estándares", "según normativa", "entre otros"): no son parte de la habilidad.
3. DESCARTA funciones de relleno como "Desempeñar funciones afines".
4. Si una función es en realidad una habilidad BLANDA (coordinar/liderar/motivar personal), NO la conviertas en dura: márcala como blanda.
5. Usa nombres CANÓNICOS y REUTILIZABLES entre ocupaciones (piezas Lego), no frases específicas de una sola.

Responde SOLO un JSON:
{"funciones":[{"consecutivo":1,"skills":["…"],"descartada":false,"es_blanda":false}]}`;

interface EntradaIA { consecutivo: number | null; texto: string }

export async function derivarConIA(
  ocupacionNombre: string,
  funciones: EntradaIA[],
  opts: { apiKey: string; baseUrl?: string; model?: string },
): Promise<DerivacionFuncion[]> {
  const base = (opts.baseUrl ?? 'https://api.anthropic.com').replace(/\/$/, '');
  const resp = await fetch(`${base}/v1/messages`, {
    method: 'POST',
    headers: {
      'x-api-key': opts.apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: opts.model ?? 'claude-sonnet-5',
      max_tokens: 2000,
      system: PROMPT_SISTEMA,
      messages: [{
        role: 'user',
        content: `Ocupación: ${ocupacionNombre}\n\nFUNCIONES:\n` +
          funciones.map((f) => `${f.consecutivo}. ${f.texto}`).join('\n'),
      }],
    }),
  });
  if (!resp.ok) throw new Error(`Claude API ${resp.status}: ${await resp.text()}`);
  const data = await resp.json();
  const raw = data?.content?.[0]?.text ?? '{}';
  const parsed = JSON.parse(raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1));
  const porConsecutivo = new Map<number, { skills: string[]; descartada?: boolean; es_blanda?: boolean }>();
  for (const f of parsed.funciones ?? []) porConsecutivo.set(Number(f.consecutivo), f);

  return funciones.map((f) => {
    const r = porConsecutivo.get(Number(f.consecutivo)) ?? { skills: [] };
    return {
      consecutivo: f.consecutivo,
      texto: f.texto,
      skills: (r.skills ?? []).map(canonizar).slice(0, 3),
      descartada: Boolean(r.descartada),
      es_blanda: Boolean(r.es_blanda),
    };
  });
}
