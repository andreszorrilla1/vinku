// ============================================================================
// Edge Function `extraer-cv` — proxy SEGURO a Claude para extracción de CV.
//
// - La ANTHROPIC_API_KEY vive SOLO aquí (servidor), nunca en el navegador.
//   Configurar con: supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
// - Regla 7.1: esta función NUNCA hace INSERT en `skills`. Solo LEE el catálogo
//   y devuelve matches resueltos a skill_id existentes + menciones no resueltas.
// - Prohibición explícita en el system prompt de proponer habilidades fuera del
//   catálogo recibido. Lo que no resuelve → unmatched.
//
// Contrato de respuesta idéntico a CvExtractionResult (src/lib/types.ts).
// ============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface SkillRow { id: string; name: string; skill_type: string; description: string | null }

const SYSTEM_PROMPT = `Eres un extractor de habilidades para VinkU. Recibes el texto de una hoja de vida y un CATÁLOGO CERRADO de habilidades (con id y nombre).

REGLAS ABSOLUTAS:
1. SOLO puedes referirte a habilidades del catálogo recibido, usando su "id" exacto. Está PROHIBIDO inventar habilidades nuevas o devolver nombres que no estén en el catálogo.
2. Puedes INTERPRETAR: si una experiencia narrada implica una habilidad del catálogo aunque no esté escrita literal, la puedes sugerir con match_type "semantico_inferido".
3. Para habilidades blandas (soft) y de poder (power): infiérelas de la narrativa de logros y responsabilidades (ej. "coordiné un equipo de 8" → liderazgo, trabajo en equipo). Estas SIEMPRE son "semantico_inferido" con confianza más baja que un match literal.
4. Un match literal (la habilidad está nombrada directamente) usa match_type "literal".
5. Todo fragmento del CV que suene a habilidad pero NO calce con ninguna del catálogo va en "unmatched" como texto crudo. NUNCA lo conviertas en una habilidad.

Responde SOLO un JSON válido con esta forma:
{"matches":[{"skill_id":"<id del catálogo>","match_type":"literal|semantico_inferido","match_confidence":0.0-1.0,"source_snippet":"<fragmento>"}],"unmatched":[{"raw_text":"<mención>"}]}`;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const { texto } = await req.json();
    if (!texto || typeof texto !== 'string') {
      return json({ error: 'Falta el campo "texto".' }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Solo LECTURA del catálogo. (En catálogos grandes: paginar / pgvector.)
    const { data: skills, error } = await supabase
      .from('skills')
      .select('id, name, skill_type, description');
    if (error) throw error;

    const catalogo = (skills as SkillRow[])
      .map((s) => `${s.id} | ${s.name} | ${s.skill_type}`)
      .join('\n');

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) return json({ error: 'ANTHROPIC_API_KEY no configurada.' }, 500);

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `CATÁLOGO (id | nombre | tipo):\n${catalogo}\n\n--- HOJA DE VIDA ---\n${texto}`,
          },
        ],
      }),
    });

    if (!resp.ok) {
      return json({ error: `Claude API: ${resp.status}` }, 502);
    }

    const data = await resp.json();
    const raw = data?.content?.[0]?.text ?? '{}';
    const parsed = JSON.parse(extraerJSON(raw));

    const idsValidos = new Set((skills as SkillRow[]).map((s) => s.id));

    // Red de seguridad del lado servidor: descartar cualquier skill_id que la IA
    // haya devuelto fuera del catálogo (defensa en profundidad de la regla 7.1).
    const matches = (parsed.matches ?? [])
      .filter((m: { skill_id: string }) => idsValidos.has(m.skill_id))
      .map((m: Record<string, unknown>, i: number) => ({
        id: `srv-${i}`,
        skill_id: m.skill_id,
        match_type: m.match_type === 'literal' ? 'literal' : 'semantico_inferido',
        match_confidence: Number(m.match_confidence ?? 0.6),
        source_snippet: String(m.source_snippet ?? ''),
        status: 'sugerida',
      }));

    const unmatched = (parsed.unmatched ?? []).map((u: { raw_text: string }, i: number) => ({
      id: `srvu-${i}`,
      raw_text: String(u.raw_text ?? ''),
    }));

    return json({ matches, unmatched, raw_text: texto });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function extraerJSON(s: string): string {
  const ini = s.indexOf('{');
  const fin = s.lastIndexOf('}');
  return ini >= 0 && fin >= 0 ? s.slice(ini, fin + 1) : '{}';
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}
