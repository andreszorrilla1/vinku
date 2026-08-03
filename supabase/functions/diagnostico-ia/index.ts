// ============================================================
// Supabase Edge Function — diagnostico-ia
// Proxy seguro entre el frontend de Campus Pass y la API de Anthropic.
// La API key vive SOLO aquí (Deno.env), nunca en el navegador.
//
// Despliegue:
//   1. supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//   2. supabase functions deploy diagnostico-ia
//
// verify_jwt está activo por defecto: solo usuarios autenticados
// (con el anon key + sesión Supabase) pueden invocarla.
// ============================================================

// @ts-nocheck — Deno runtime (los tipos Deno no existen en el tsconfig del front).

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODELO_PERMITIDO = "claude-sonnet-5";
const MAX_TOKENS = 1024;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método no permitido" }), {
      status: 405,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Servicio de IA no configurado." }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }

  let body: { system?: string; messages?: Array<{ role: string; content: string }> };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "JSON inválido." }), {
      status: 400,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  const system = typeof body.system === "string" ? body.system : "";
  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (messages.length === 0) {
    return new Response(
      JSON.stringify({ error: "Faltan mensajes en la solicitud." }),
      { status: 400, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }

  try {
    const resp = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODELO_PERMITIDO,
        max_tokens: MAX_TOKENS,
        system,
        messages,
      }),
    });

    if (!resp.ok) {
      const detalle = await resp.text();
      return new Response(
        JSON.stringify({ error: "Error de la IA.", detalle }),
        { status: 502, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    const data = await resp.json();
    const texto =
      Array.isArray(data.content) && data.content[0]?.type === "text"
        ? data.content[0].text
        : "";

    return new Response(JSON.stringify({ mensaje: texto }), {
      status: 200,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "No se pudo contactar la IA.", detalle: String(e) }),
      { status: 502, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }
});
