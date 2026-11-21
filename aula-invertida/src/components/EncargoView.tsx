import { useState } from "react";
import { encargoPorId, WHATSAPP } from "../data/encargos";
import {
  MOMENTOS, avance, leer, interpretar, crear, mejorarSeccion, prepararMesa, ajustarConEvidencia,
  type Progreso,
} from "../lib/motor";
import Puente from "./Puente";

interface Props { p: Progreso; guardar: (p: Progreso) => void }

const hora = (min: number) => (min % 60 ? `${Math.floor(min / 60)} h ${min % 60} min` : `${min / 60} h`);

export default function EncargoView({ p, guardar }: Props) {
  const e = encargoPorId(p.encargoId);
  const [vista, setVista] = useState(Math.min(p.momento, 4));
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [texto, setTexto] = useState("");
  const [notas, setNotas] = useState<Record<string, string>>({});
  const [pedidos, setPedidos] = useState<Record<string, string>>({});
  const [ev, setEv] = useState({ conQuien: "", quePaso: "" });

  const act = (cambios: Partial<Progreso>) => guardar({ ...p, ...cambios, actualizado: new Date().toISOString() });
  const correr = async (fn: () => Promise<void>) => {
    setCargando(true); setError("");
    try { await fn(); } catch (err) { setError(err instanceof Error ? err.message : "Algo falló. Intenta de nuevo."); }
    setCargando(false);
  };
  const avanzarA = (m: number, cambios: Partial<Progreso>) => { act({ ...cambios, momento: Math.max(p.momento, m) }); setVista(Math.min(m, 4)); };

  // ---- 1. Leer
  const enviar = (contenido?: string) => correr(async () => {
    const chat = contenido ? [...p.chat, { role: "user" as const, content: contenido }] : p.chat;
    if (contenido) { act({ chat }); setTexto(""); }
    const r = await leer(e, chat);
    const nuevo = [...chat, { role: "assistant" as const, content: r.mensaje }];
    if (r.listo && r.caso) act({ chat: nuevo, caso: r.caso, momento: Math.max(p.momento, 1) });
    else act({ chat: nuevo });
  });

  const traerCapsulas = () => correr(async () => { const c = await interpretar(e, p.caso); act({ capsulas: c, momento: Math.max(p.momento, 1) }); });

  const escribirBorrador = () => correr(async () => {
    const n = (p.capsulas || []).map((c) => notas[c.id] ? `${c.titulo}: ${notas[c.id]}` : "").filter(Boolean).join(" | ");
    const b = await crear(e, p.caso, n);
    avanzarA(2, { borrador: b, vistas: (p.capsulas || []).map((c) => c.id) });
  });

  const mejorar = (id: string, titulo: string) => correr(async () => {
    const t = await mejorarSeccion(e, p.caso, titulo, p.borrador?.[id] || "", pedidos[id] || "");
    act({ borrador: { ...p.borrador, [id]: t } }); setPedidos({ ...pedidos, [id]: "" });
  });

  const llevarAMesa = () => correr(async () => { const b = await prepararMesa(e, p.caso, p.borrador || {}); avanzarA(3, { brief: b }); });

  const registrar = () => correr(async () => {
    const nueva = { ...ev, fecha: new Date().toISOString() };
    const ajuste = await ajustarConEvidencia(e, nueva);
    act({ evidencias: [...p.evidencias, { ...nueva, ajuste }] }); setEv({ conQuien: "", quePaso: "" });
  });

  const entregableTexto = e.secciones.map((s) => `${s.titulo}\n${p.borrador?.[s.id] || ""}`).join("\n\n");
  const copiar = async () => { try { await navigator.clipboard.writeText(`${e.titulo}\n\n${entregableTexto}`); setError(""); } catch { setError("No se pudo copiar desde aquí; selecciona el texto manualmente."); } };
  const waMesa = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hola VinkU edu, terminé la parte de IA del encargo "${e.titulo}" en el Aula Invertida y quiero agendar mi Mesa con un consultor.`)}`;

  const m = MOMENTOS[vista];
  return (
    <>
      <section className="band cabeza">
        <div>
          <a className="volver" href="#cuaderno">← Mi cuaderno</a>
          <h1>{e.titulo}</h1>
          <p className="lead" style={{ marginTop: 10, fontSize: 18 }}>Te llevas: {e.teLlevas}</p>
          <p className="mono dim" style={{ marginTop: 8 }}>IA {hora(e.minutosIA)} · Humano {hora(e.minutosHumano)}</p>
        </div>
        <div className="lienzo">
          <div className="fig-label mono"><span>Lo que sabes</span><span>{Math.round(avance(p))} %</span><span>Donde se necesita</span></div>
          <Puente avance={avance(p)} actual={vista} alto={130} />
          <nav className="pasos" aria-label="Momentos del encargo">
            {MOMENTOS.map((mo, i) => (
              <button key={mo.nombre} aria-current={i === vista ? "step" : undefined} disabled={i > p.momento} onClick={() => setVista(i)}>
                {mo.nombre}<small>{mo.quien}</small>
              </button>
            ))}
          </nav>
        </div>
      </section>

      <section className="panel">
        <div className="quien"><span className={m.quien === "IA" ? "etq" : "etq h"}>{m.quien === "IA" ? "60 % · IA" : "40 % · Humano"}</span><span className="dim">{m.texto}</span></div>

        {vista === 0 && (
          <>
            <h2>Cuéntale tu caso</h2>
            <div className="chat" aria-live="polite">
              {p.chat.map((c, i) => <div key={i} className={`burbuja ${c.role === "user" ? "yo" : "ia"}`}>{c.content}</div>)}
            </div>
            {p.chat.length === 0 ? (
              <button className="btn" disabled={cargando} onClick={() => enviar()}>Empezar el encargo</button>
            ) : p.momento === 0 ? (
              <form className="entrada" onSubmit={(ev2) => { ev2.preventDefault(); if (texto.trim()) enviar(texto.trim()); }}>
                <textarea aria-label="Tu respuesta" value={texto} onChange={(x) => setTexto(x.target.value)} placeholder="Escribe tu respuesta" rows={2} />
                <button className="btn" disabled={cargando || !texto.trim()}>Enviar</button>
              </form>
            ) : (
              <div className="fila"><button className="btn" onClick={() => setVista(1)}>Ver mis cápsulas →</button></div>
            )}
            {p.caso && <p className="nota">Tu caso: {p.caso.resumen}</p>}
          </>
        )}

        {vista === 1 && (
          <>
            <h2>Lo que necesitas saber, justo ahora</h2>
            <p className="dim">No hay temario. La IA eligió {e.capsulas.length > 3 ? "3" : "estas"} de las {e.capsulas.length} cápsulas de este encargo para tu caso.</p>
            {!p.capsulas && <div className="fila" style={{ marginTop: 14 }}><button className="btn" disabled={cargando} onClick={traerCapsulas}>Traer mis cápsulas</button></div>}
            {p.capsulas?.map((c) => (
              <article className="capsula" key={c.id}>
                <h3>{c.titulo}</h3>
                <p className="porque">{c.porque}</p>
                <p>{c.contenido}</p>
                <p className="accion"><b>Tarea de 5 minutos:</b> {c.accion}</p>
                <label className="campo">Tu respuesta (alimenta el borrador)
                  <textarea value={notas[c.id] || ""} onChange={(x) => setNotas({ ...notas, [c.id]: x.target.value })} rows={2} />
                </label>
              </article>
            ))}
            {p.capsulas && <div className="fila" style={{ marginTop: 16 }}><button className="btn" disabled={cargando} onClick={escribirBorrador}>{p.borrador ? "Reescribir el borrador" : "Escribir mi borrador con la IA"}</button>{p.borrador && <button className="btn sec" onClick={() => setVista(2)}>Ir al borrador</button>}</div>}
          </>
        )}

        {vista === 2 && p.borrador && (
          <>
            <h2>Tu entregable, en borrador</h2>
            <p className="dim">Edita lo que quieras. Lo que esté entre corchetes es una suposición de la IA: confírmala o cámbiala.</p>
            {e.secciones.map((s) => (
              <div className="seccion" key={s.id}>
                <h3>{s.titulo}</h3><p className="dim" style={{ fontSize: 14 }}>{s.guia}</p>
                <textarea aria-label={s.titulo} value={p.borrador?.[s.id] || ""} onChange={(x) => act({ borrador: { ...p.borrador, [s.id]: x.target.value } })} />
                <div className="mejora">
                  <input type="text" aria-label={`Pedido de mejora para ${s.titulo}`} placeholder="Pídele un ajuste a la IA" value={pedidos[s.id] || ""} onChange={(x) => setPedidos({ ...pedidos, [s.id]: x.target.value })} />
                  <button className="btn sal" disabled={cargando} onClick={() => mejorar(s.id, s.titulo)}>Mejorar</button>
                </div>
              </div>
            ))}
            <div className="fila"><button className="btn" disabled={cargando} onClick={llevarAMesa}>Llevar a la Mesa</button><button className="btn sec" onClick={copiar}>Copiar entregable</button></div>
          </>
        )}

        {vista === 3 && p.brief && (
          <>
            <h2>Tu Mesa empieza en el minuto 60</h2>
            <p>Este es el brief que recibe tu consultor VinkU antes de la sesión. Así no se gasta la hora humana en contexto, sino en criterio.</p>
            <p className="nota">{p.brief.resumen}</p>
            <div className="brief">
              <div><h3>Decisiones para la Mesa</h3><ul>{p.brief.decisiones.map((d) => <li key={d}>{d}</li>)}</ul></div>
              <div><h3>Riesgos del borrador</h3><ul>{p.brief.riesgos.map((d) => <li key={d}>{d}</li>)}</ul></div>
              <div><h3>Preguntas del consultor</h3><ul>{p.brief.preguntas.map((d) => <li key={d}>{d}</li>)}</ul></div>
            </div>
            <p className="aviso"><b>Lo que solo un humano puede juzgar aquí:</b> {p.brief.soloHumano}</p>
            <div className="fila" style={{ marginTop: 16 }}>
              <a className="btn" href={waMesa} target="_blank" rel="noreferrer" onClick={() => act({ mesaAgendada: true })}>Agendar mi Mesa por WhatsApp</a>
              <button className="btn sec" onClick={() => avanzarA(4, {})}>Ya tuve mi Mesa</button>
            </div>
            <p className="nota">WhatsApp VinkU edu: +57 320 662 1546{p.mesaAgendada ? " · Solicitud enviada." : ""}</p>
          </>
        )}

        {vista === 4 && (
          <>
            <h2>Pruébalo con el mundo</h2>
            <p>{e.prueba}</p>
            {p.evidencias.map((x, i) => (
              <article className="capsula" key={i}>
                <h3>{x.conQuien}</h3><p>{x.quePaso}</p>
                {x.ajuste && <p className="accion"><b>Ajuste sugerido por la IA:</b> {x.ajuste}</p>}
              </article>
            ))}
            {!p.sello && (
              <form onSubmit={(x) => { x.preventDefault(); if (ev.conQuien && ev.quePaso) registrar(); }}>
                <label className="campo">¿Con quién lo probaste?<input type="text" value={ev.conQuien} onChange={(x) => setEv({ ...ev, conQuien: x.target.value })} placeholder="Ej.: directora de talento humano de una caja de compensación" /></label>
                <label className="campo">¿Qué pasó?<textarea value={ev.quePaso} onChange={(x) => setEv({ ...ev, quePaso: x.target.value })} rows={3} placeholder="Qué entendió, qué preguntó, qué decidió" /></label>
                <div className="fila" style={{ marginTop: 12 }}><button className="btn" disabled={cargando || !ev.conQuien || !ev.quePaso}>Registrar evidencia</button></div>
              </form>
            )}
            {p.sello ? (
              <div className="sello"><svg width="44" height="44" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="17" fill="#FF8A4C" /><path d="M12 20l6 6 10-12" stroke="#fff" strokeWidth="3.5" fill="none" strokeLinecap="round" /></svg>
                <div><h3>Sellado por {p.sello.consultor}</h3><p>{p.sello.nota}</p></div></div>
            ) : p.evidencias.length > 0 && <p className="nota">Con tu evidencia, tu consultor ya puede poner el sello desde la vista <a href="#mesa">Mesa</a>.</p>}
          </>
        )}

        {cargando && <p className="cargando">La IA está trabajando en tu caso…</p>}
        {error && <p className="aviso" role="alert">{error}</p>}
      </section>
    </>
  );
}
