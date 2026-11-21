import { useState } from "react";
import { herramientaPorId, WHATSAPP, EN_VIVO, formatoCOP } from "../data/herramientas";
import {
  MOMENTOS, avance, instalar, kitMarkdown, capsulaTexto, retoDeUso, retroalimentar, prepararEnVivo, ajustarConEvidencia,
  type Progreso,
} from "../lib/motor";
import { descargar } from "../lib/descarga";
import Puente from "./Puente";

interface Props { p: Progreso; guardar: (p: Progreso) => void }

export default function HerramientaView({ p, guardar }: Props) {
  const h = herramientaPorId(p.herramientaId)!;
  const [vista, setVista] = useState(Math.min(p.momento, 4));
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [texto, setTexto] = useState("");
  const [uso, setUso] = useState("");
  const [nombre, setNombre] = useState("");
  const [ev, setEv] = useState({ conQuien: "", quePaso: "" });

  const act = (c: Partial<Progreso>) => guardar({ ...p, ...c, actualizado: new Date().toISOString() });
  const correr = async (fn: () => Promise<void>) => {
    setCargando(true); setError(""); setAviso("");
    try { await fn(); } catch (e) { setError(e instanceof Error ? e.message : "Algo falló. Intenta de nuevo."); }
    setCargando(false);
  };
  const ir = (m: number, c: Partial<Progreso>) => { act({ ...c, momento: Math.max(p.momento, m) }); setVista(Math.min(m, 4)); };

  // 1. Instalar
  const enviar = (contenido?: string) => correr(async () => {
    const chat = contenido ? [...p.chat, { role: "user" as const, content: contenido }] : p.chat;
    if (contenido) { act({ chat }); setTexto(""); }
    const r = await instalar(h, chat);
    const nuevo = [...chat, { role: "assistant" as const, content: r.mensaje }];
    act(r.listo && r.instalacion ? { chat: nuevo, instalacion: r.instalacion } : { chat: nuevo });
  });
  const bajarKit = () => correr(async () => {
    const r = await descargar(`${h.nombre} - kit VinkU edu.md`, kitMarkdown(h, p.instalacion!, nombre));
    if (r === "ok") { act({ descargado: true }); setAviso("Kit descargado. Ábrelo y sigue los primeros pasos."); }
    else if (r === "rechazada") setAviso("Descarga cancelada. Puedes intentarlo cuando quieras.");
    else setError("No se pudo descargar desde aquí. Usa «Copiar instrucciones» mientras tanto.");
  });
  const copiar = async (t: string) => { try { await navigator.clipboard.writeText(t); setAviso("Copiado."); } catch { setError("No se pudo copiar; selecciona el texto manualmente."); } };

  // 2. Cápsulas
  const vistas = p.capsulasVistas || [];
  const textos = p.textos || {};
  const marcar = (n: number, extra: Partial<Progreso> = {}) => act({ ...extra, capsulasVistas: vistas.includes(n) ? vistas : [...vistas, n] });
  const leerTexto = (n: number) => correr(async () => { const t = await capsulaTexto(h, p, n); marcar(n, { textos: { ...textos, [n]: t } }); });

  // 3. Usar
  const empezarUso = () => correr(async () => { const reto = await retoDeUso(h, p); ir(2, { reto }); });
  const contarUso = () => correr(async () => {
    const retro = await retroalimentar(h, p, uso);
    const logradas = Array.from(new Set([...p.logradas, ...(retro.logradas || []).filter((n) => n >= 0 && n < h.skillset.length)]));
    act({ intentos: [...p.intentos, { texto: uso, retro }], logradas }); setUso("");
  });

  // 4. En vivo
  const llevarAEnVivo = () => correr(async () => { const brief = await prepararEnVivo(h, p); ir(3, { brief }); });
  const wa = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hola VinkU edu, tengo la herramienta "${h.nombre}" y quiero mi cupo en la masterclass en vivo de esta semana.${p.brief ? ` Mi pregunta: ${p.brief.pregunta}` : ""}`)}`;

  // 5. Lanzar
  const registrar = () => correr(async () => {
    const nueva = { ...ev, fecha: new Date().toISOString() };
    const ajuste = await ajustarConEvidencia(h, nueva);
    act({ evidencias: [...p.evidencias, { ...nueva, ajuste }] }); setEv({ conQuien: "", quePaso: "" });
  });

  const m = MOMENTOS[vista];
  return (
    <>
      <section className="band cabeza">
        <div>
          <a className="volver" href="#taller">← Mi caja de herramientas</a>
          <p className="mono dim">Semana {h.semana} · {formatoCOP(h.precio)} · {h.oficio}</p>
          <h1>{h.nombre}</h1>
          <p className="lead" style={{ marginTop: 10, fontSize: 18 }}>{h.oportunidad}</p>
          <p className="mindset">De <s>{h.mindset.de}</s> a <em className="s">{h.mindset.a}</em></p>
        </div>
        <div className="lienzo">
          <div className="fig-label mono"><span>Lo que sabes</span><span>{avance(p)} %</span><span>Donde se necesita</span></div>
          <Puente avance={avance(p)} actual={vista} alto={130} />
          <nav className="pasos" aria-label="Momentos">
            {MOMENTOS.map((mo, i) => (
              <button key={mo.nombre} aria-current={i === vista ? "step" : undefined} disabled={i > p.momento} onClick={() => setVista(i)}>
                {mo.nombre}<small>{mo.set} · {mo.quien}</small>
              </button>
            ))}
          </nav>
        </div>
      </section>

      <section className="panel">
        <div className="quien"><span className={m.quien === "IA" ? "etq" : "etq h"}>{m.set} · {m.quien === "IA" ? "60 % IA" : "40 % humano"}</span><span className="dim">{m.texto}</span></div>

        {vista === 0 && (
          <>
            <h2>Instala tu herramienta</h2>
            <div className="piezas">
              {h.toolset.map((t) => <div key={t.nombre}><span className="etq">{t.tipo}</span><h3>{t.nombre}</h3><p className="dim">{t.detalle}</p></div>)}
            </div>
            <div className="chat" aria-live="polite">
              {p.chat.map((c, i) => <div key={i} className={`burbuja ${c.role === "user" ? "yo" : "ia"}`}>{c.content}</div>)}
            </div>
            {p.chat.length === 0 && <button className="btn" disabled={cargando} onClick={() => enviar()}>Ajustarla a mi oficio</button>}
            {p.chat.length > 0 && !p.instalacion && (
              <form className="entrada" onSubmit={(x) => { x.preventDefault(); if (texto.trim()) enviar(texto.trim()); }}>
                <textarea aria-label="Tu respuesta" value={texto} onChange={(x) => setTexto(x.target.value)} placeholder="Escribe tu respuesta" rows={2} />
                <button className="btn" disabled={cargando || !texto.trim()}>Enviar</button>
              </form>
            )}
            {p.instalacion && (
              <div className="kit">
                <h3>Tu kit personalizado</h3>
                <ul>{p.instalacion.ajustes.map((a) => <li key={a.pieza}><b>{a.pieza}:</b> {a.ajuste}</li>)}</ul>
                <p style={{ marginTop: 10 }}><b>Instrucciones para tu proyecto en Claude</b></p>
                <blockquote>{p.instalacion.instrucciones}</blockquote>
                <label className="campo">Tu nombre (va en el kit)<input type="text" value={nombre} onChange={(x) => setNombre(x.target.value)} /></label>
                <div className="fila" style={{ marginTop: 12 }}>
                  <button className="btn" disabled={cargando} onClick={bajarKit}>Descargar mi kit</button>
                  <button className="btn sec" onClick={() => copiar(p.instalacion!.instrucciones)}>Copiar instrucciones</button>
                  <button className="btn sal" onClick={() => ir(1, {})}>Ver mis cápsulas →</button>
                </div>
              </div>
            )}
          </>
        )}

        {vista === 1 && (
          <>
            <h2>Cápsulas de {h.nombre}</h2>
            <p className="dim">Lo justo para usarla: {h.capsulas.reduce((a, c) => a + c.minutos, 0)} minutos en total.</p>
            {h.capsulas.map((c, n) => (
              <article className="capsula" key={c.titulo}>
                <div className="meta" style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                  <span className={c.formato === "Texto" ? "etq" : "etq h"}>{c.formato} · {c.minutos} min</span>
                  {vistas.includes(n) && <span className="mono dim">Vista ✓</span>}
                </div>
                <h3 style={{ marginTop: 8 }}>{c.titulo}</h3>
                <p className="dim">{c.idea}</p>
                {c.formato === "Video" && (
                  <button className="video" onClick={() => marcar(n)} aria-label={`Ver el video ${c.titulo}`}>
                    <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden="true"><circle cx="28" cy="28" r="27" fill="#FF8A4C" /><path d="M23 18l15 10-15 10z" fill="#fff" /></svg>
                    <span>Video por grabar · {c.minutos} min</span>
                  </button>
                )}
                {c.formato === "Infográfico" && c.pasos && (
                  <div className="info" onMouseEnter={() => !vistas.includes(n) && marcar(n)} onClick={() => marcar(n)}>
                    {c.pasos.map((x, k) => <div key={x} className={k === c.pasos!.length - 1 ? "lleno" : k === 0 ? "abierto" : ""}><i />{x}</div>)}
                  </div>
                )}
                {c.formato === "Texto" && (textos[n]
                  ? <div className="texto">{textos[n].split(/\n+/).map((x, k) => <p key={k}>{x}</p>)}</div>
                  : <button className="btn sec" style={{ marginTop: 10 }} disabled={cargando} onClick={() => leerTexto(n)}>Leerla, escrita para mi caso</button>)}
              </article>
            ))}
            <div className="fila" style={{ marginTop: 16 }}>
              <button className="btn sal" disabled={cargando} onClick={p.reto ? () => setVista(2) : empezarUso}>Usarla en un caso real →</button>
            </div>
          </>
        )}

        {vista === 2 && p.reto && (
          <>
            <h2>Úsala en un caso real</h2>
            <p className="aviso"><b>Tu reto:</b> {p.reto.tarea}</p>
            <ol className="lista">{p.reto.pasos.map((s) => <li key={s}>{s}</li>)}</ol>
            <p className="nota"><b>Quedó bien si:</b> {p.reto.criterio}</p>
            <h3 style={{ marginTop: 20 }}>Skillset</h3>
            <ul className="skills">{h.skillset.map((s, n) => <li key={s} className={p.logradas.includes(n) ? "ok" : ""}>{s}</li>)}</ul>
            {p.intentos.map((x, i) => (
              <article className="capsula" key={i}><p>{x.texto}</p><p className="accion"><b>La IA:</b> {x.retro.retro}</p><p className="nota">{x.retro.siguiente}</p></article>
            ))}
            <label className="campo">Cuéntale a la IA qué hiciste con la herramienta y cómo te fue
              <textarea value={uso} onChange={(x) => setUso(x.target.value)} rows={3} />
            </label>
            <div className="fila" style={{ marginTop: 12 }}>
              <button className="btn sal" disabled={cargando || !uso.trim()} onClick={contarUso}>Pedir retroalimentación</button>
              {p.intentos.length > 0 && <button className="btn" disabled={cargando} onClick={llevarAEnVivo}>Prepararme para el en vivo</button>}
            </div>
          </>
        )}

        {vista === 3 && p.brief && (
          <>
            <h2>Masterclass en vivo</h2>
            <div className="envivo">
              <div><span className="mono">Esta semana · {EN_VIVO.dia} {EN_VIVO.hora} · {EN_VIVO.modalidad}</span><h3>{h.nombre}: de herramienta a negocio</h3><p>Incluida en tu herramienta. Un consultor humanista de VinkU responde las preguntas de quienes la están usando.</p></div>
            </div>
            <label className="campo">Tu pregunta para el en vivo (la IA la propuso; ajústala)
              <textarea value={p.brief.pregunta} onChange={(x) => act({ brief: { ...p.brief!, pregunta: x.target.value } })} rows={2} />
            </label>
            <p className="aviso"><b>Mindset hoy:</b> {p.brief.mindset}</p>
            <div className="brief">
              <div><h3>Decisiones de negocio</h3><ul>{p.brief.decisiones.map((d) => <li key={d}>{d}</li>)}</ul></div>
              <div><h3>Cómo se vuelve negocio</h3><p>{h.negocio}</p></div>
            </div>
            <div className="fila" style={{ marginTop: 16 }}>
              <a className="btn" href={wa} target="_blank" rel="noreferrer" onClick={() => act({ mesaAgendada: true })}>Separar mi cupo por WhatsApp</a>
              <button className="btn sec" onClick={() => ir(4, {})}>Ya asistí</button>
            </div>
            <p className="nota">WhatsApp VinkU edu: +57 320 662 1546{p.mesaAgendada ? " · Solicitud enviada." : ""} · ¿Prefieres instalarla 1:1 con un consultor? Acompañamiento personalizado de $190.000.</p>
          </>
        )}

        {vista === 4 && (
          <>
            <h2>Lánzala</h2>
            <p>{h.lanzar}</p>
            {p.evidencias.map((x, i) => (
              <article className="capsula" key={i}><h3>{x.conQuien}</h3><p>{x.quePaso}</p>{x.ajuste && <p className="accion"><b>Ajuste sugerido:</b> {x.ajuste}</p>}</article>
            ))}
            {!p.sello && (
              <form onSubmit={(x) => { x.preventDefault(); if (ev.conQuien && ev.quePaso) registrar(); }}>
                <label className="campo">¿Con quién la probaste?<input type="text" value={ev.conQuien} onChange={(x) => setEv({ ...ev, conQuien: x.target.value })} placeholder="Ej.: mi primera clienta, una pyme de mi barrio" /></label>
                <label className="campo">¿Qué pasó?<textarea value={ev.quePaso} onChange={(x) => setEv({ ...ev, quePaso: x.target.value })} rows={3} placeholder="Qué funcionó, qué preguntaron, si pagaron" /></label>
                <div className="fila" style={{ marginTop: 12 }}><button className="btn" disabled={cargando || !ev.conQuien || !ev.quePaso}>Registrar evidencia</button></div>
              </form>
            )}
            {p.sello ? (
              <div className="sello"><svg width="44" height="44" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="17" fill="#FF8A4C" /><path d="M12 20l6 6 10-12" stroke="#fff" strokeWidth="3.5" fill="none" strokeLinecap="round" /></svg>
                <div><h3>Sellado por {p.sello.consultor}</h3><p>{p.sello.nota}</p></div></div>
            ) : p.evidencias.length > 0 && <p className="nota">Con tu evidencia, tu consultor ya puede poner el sello desde la vista <a href="#envivo">En vivo</a>.</p>}
          </>
        )}

        {cargando && <p className="cargando">La IA está trabajando en tu caso…</p>}
        {aviso && <p className="nota" role="status">{aviso}</p>}
        {error && <p className="aviso" role="alert">{error}</p>}
      </section>
    </>
  );
}
