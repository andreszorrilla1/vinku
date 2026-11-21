import { useState } from "react";
import { herramientaPorId, eventosDe, fechaLarga, formatoCOP, wa, type Capsula } from "../data/herramientas";
import { ENFOQUES, POBLACIONES } from "../data/consultorio";
import {
  MOMENTOS, ULTIMO, avance, kitMarkdown, retroalimentar, afinarPregunta, leerVictoria,
  type Progreso, type Perfil, type PerfilPublico,
} from "../lib/motor";
import Certificar, { Sello } from "./Certificar";
import { certDe } from "../data/certificacion";
import { relacionadas } from "../lib/repositorio";
import { descargar } from "../lib/descarga";
import Puente from "./Puente";
import CapsulaCard from "./CapsulaCard";
import Recursos from "./Recursos";
import skillEnfoque from "../../piloto/consultorio-enfoque/SKILL.md?raw";

interface Props { tab?: "ruta" | "recursos"; p: Progreso; perfil: Perfil; guardar: (p: Progreso) => void; perfilRed: PerfilPublico; setPerfilRed: (x: PerfilPublico) => void }

const GUIA_CONSULTORIO = `
## Instalación paso a paso
1. Duplica la plantilla Consultorio en tu Notion (te llega el enlace al inscribirte en el piloto).
2. En Claude, conecta Notion desde los conectores.
3. Sube las skills consultorio-psicologico y consultorio-enfoque.
4. Escribe "configura mi consultorio" y responde los datos.
5. Escribe "ajusta el consultorio a mi enfoque".
6. Opcional: instala Tactiq en Chrome y conéctalo, para registrar sesiones sin dictar.
7. Haz el reto de la primera semana.

Piloto: masterclass el martes 1 de diciembre y laboratorio el martes 15 de diciembre, 7:00 p. m., virtual.
`;

export default function HerramientaView({ tab: tab0 = "ruta", p, perfil, guardar, perfilRed, setPerfilRed }: Props) {
  const h = herramientaPorId(p.herramientaId)!;
  const [vista, setVista] = useState(Math.min(p.momento, ULTIMO));
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [uso, setUso] = useState("");
  const [filtroCap, setFiltroCap] = useState<"" | Capsula["formato"]>("");
  const [enfoque, setEnfoque] = useState(ENFOQUES[0].id);
  const [poblacion, setPoblacion] = useState("Adultos");
  const [ajuste, setAjuste] = useState("");
  const [valores, setValores] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<"ruta" | "recursos">(tab0);

  const act = (c: Partial<Progreso>) => guardar({ ...p, ...c, actualizado: new Date().toISOString() });
  const ir = (m: number, c: Partial<Progreso> = {}) => { act({ ...c, momento: Math.max(p.momento, m) }); setVista(Math.min(m, ULTIMO)); setAviso(""); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const correr = async (fn: () => Promise<void>) => {
    setCargando(true); setError(""); setAviso("");
    try { await fn(); } catch (e) { setError(e instanceof Error ? e.message : "Algo falló. Intenta de nuevo."); }
    setCargando(false);
  };
  const copiar = async (t: string) => { try { await navigator.clipboard.writeText(t); setAviso("Copiado."); } catch { setError("No se pudo copiar; selecciona el texto manualmente."); } };
  const bajar = (nombre: string, contenido: string, avanzar: boolean) => correr(async () => {
    const r = await descargar(nombre, contenido);
    if (r === "ok") { if (avanzar && !p.descargado) ir(1, { descargado: true }); else setAviso("Descargado."); }
    else if (r === "rechazada") setAviso("Descarga cancelada.");
    else setError("No se pudo descargar aquí. Escríbenos por WhatsApp y te lo enviamos.");
  });

  const eventos = eventosDe(h.id);
  const mc = eventos.find((e) => e.tipo === "Masterclass");
  const lab = eventos.find((e) => e.tipo === "Laboratorio");
  const enf = ENFOQUES.find((e) => e.id === enfoque)!;
  const caps = h.capsulas.map((c, n) => ({ c, n })).filter(({ c }) => !filtroCap || c.formato === filtroCap);
  const vistas = p.capsulasVistas;
  const m = MOMENTOS[vista];
  const pct = Math.round(avance(p));

  return (
    <>
      <section className="band cabeza">
        <div>
          <a className="volver" href="#repositorio">← Repositorio</a>
          <div className="fila" style={{ gap: 8 }}>
            <span className={h.estado === "En diseño" ? "etq gris" : "etq h"}>{h.estado}</span>
            <span className="etq">{h.formato}</span>
            <span className="precio">{formatoCOP(h.precio)}</span>
          </div>
          <h1 style={{ marginTop: 10 }}>{h.nombre}</h1>
          <p className="lead" style={{ marginTop: 10, fontSize: 18 }}>{h.promesa}</p>
          <p className="dim" style={{ marginTop: 6 }}>{h.oficio}</p>
          <p className="mindset">De <s>{h.mindset.de}</s> a <em className="s">{h.mindset.a}</em></p>
        </div>
        <div className="lienzo">
          <div className="fig-label mono"><span>A tu ritmo · 60 %</span><span>{pct} %</span><span>En vivo · 40 %</span></div>
          <Puente avance={pct} actual={vista} alto={130} />
          <nav className="pasos seis" aria-label="Ruta de la herramienta">
            {MOMENTOS.map((mo, i) => (
              <button key={mo.nombre} aria-current={i === vista ? "step" : undefined} disabled={i > p.momento} onClick={() => setVista(i)}>
                {mo.nombre}<small>{mo.set}</small>
              </button>
            ))}
          </nav>
        </div>
      </section>

      <div className="ficha">
        <div className="principal">
        <div className="tabs" role="tablist">
          <button role="tab" aria-selected={tab === "ruta"} onClick={() => setTab("ruta")}>Mi ruta</button>
          <button role="tab" aria-selected={tab === "recursos"} onClick={() => setTab("recursos")}>Recursos y práctica</button>
        </div>
        {tab === "recursos" ? <Recursos h={h} p={p} perfil={perfil} act={act} /> : <>
        <section className="panel" style={{ marginTop: 0 }}>
          <div className="quien"><span className={m.lado === "IA" ? "etq" : "etq h"}>{m.set} · {m.lado === "IA" ? "a tu ritmo, con IA" : "en vivo"}</span><span className="dim">{m.texto}</span></div>

          {vista === 0 && (
            <>
              <h2>Lo que te llevas</h2>
              <div className="piezas">
                {h.toolset.map((t) => <div key={t.nombre}><span className="etq">{t.tipo}</span><h3>{t.nombre}</h3><p className="dim">{t.detalle}</p></div>)}
              </div>
              {h.estado === "En diseño" && <p className="aviso">Esta herramienta está en diseño: hoy te llevas la ficha del kit y te avisamos cuando estén las piezas completas.</p>}
              <div className="fila" style={{ marginTop: 14 }}>
                <button className="btn" disabled={cargando} onClick={() => bajar(`${h.nombre} - kit VinkU edu.md`, kitMarkdown(h) + (h.id === "consultorio" ? GUIA_CONSULTORIO : ""), true)}>
                  {h.precio === 0 ? "Descargar gratis" : "Descargar el kit"}
                </button>
                {h.id === "consultorio" && <button className="btn sec" disabled={cargando} onClick={() => bajar("consultorio-enfoque - SKILL.md", skillEnfoque, false)}>Descargar la skill de personalización</button>}
                {h.estado === "En diseño" && <a className="btn sec" href={wa(`Hola VinkU edu, avísenme cuando esté lista la herramienta "${h.nombre}".`)} target="_blank" rel="noreferrer">Avísame cuando esté</a>}
                {p.descargado && <button className="btn sal" onClick={() => setVista(1)}>Personalizarla →</button>}
              </div>
              {h.precio > 0 && <p className="nota">Prototipo: la descarga no cobra todavía. En la plataforma real se paga con Wompi o se incluye en la suscripción.</p>}
            </>
          )}

          {vista === 1 && (
            <>
              <h2>Personalízala tú</h2>
              <p>{h.personalizacion}</p>
              {h.id === "consultorio" ? (
                <div className="personalizador">
                  <p className="campo" style={{ marginTop: 14 }}>Tu enfoque</p>
                  <div className="chips" role="group" aria-label="Enfoque">
                    {ENFOQUES.map((e) => <button key={e.id} className="chip" aria-pressed={e.id === enfoque} onClick={() => setEnfoque(e.id)}>{e.nombre}</button>)}
                  </div>
                  <p className="campo">Tu población</p>
                  <div className="chips" role="group" aria-label="Población">
                    {Object.keys(POBLACIONES).map((k) => <button key={k} className="chip" aria-pressed={k === poblacion} onClick={() => setPoblacion(k)}>{k}</button>)}
                  </div>
                  <div className="preview">
                    <h3>Así queda tu registro de sesión</h3>
                    <ul className="secciones">
                      {["Objetivo de la sesión", "Lo trabajado", "Valoración de riesgo"].map((s) => <li key={s}>{s}</li>)}
                      {[...enf.secciones, ...POBLACIONES[poblacion]].map((s) => <li key={s} className="nueva">{s}</li>)}
                      <li>Para la próxima sesión</li>
                    </ul>
                    <p className="nota"><b>En la historia de ingreso explorarás más:</b> {enf.enfasis}</p>
                    <p style={{ marginTop: 10 }}><b>Técnicas que se suman a tu catálogo</b></p>
                    <div className="fila" style={{ gap: 6, marginTop: 6 }}>{enf.tecnicas.map((t) => <span className="etq" key={t}>{t}</span>)}</div>
                  </div>
                  <p style={{ marginTop: 14 }}>Para aplicarlo, escribe en tu proyecto de Claude:</p>
                  <div className="comando"><code>ajusta el consultorio a mi enfoque: {enf.nombre.toLowerCase()}, {poblacion.toLowerCase()}</code><button className="btn sec" onClick={() => copiar(`ajusta el consultorio a mi enfoque: ${enf.nombre.toLowerCase()}, ${poblacion.toLowerCase()}`)}>Copiar</button></div>
                  <div className="fila" style={{ marginTop: 14 }}><button className="btn" onClick={() => ir(2, { personalizacion: `${enf.nombre} · ${poblacion}` })}>Ya la personalicé</button></div>
                </div>
              ) : (
                <>
                  <label className="campo">¿Cómo la ajustaste? (opcional)<input type="text" value={ajuste} onChange={(x) => setAjuste(x.target.value)} placeholder="Ej.: la configuré para ONG" /></label>
                  <div className="fila" style={{ marginTop: 14 }}><button className="btn" onClick={() => ir(2, { personalizacion: ajuste || "Personalizada" })}>Ya la personalicé</button></div>
                </>
              )}
              {p.personalizacion && <p className="nota">Tu personalización: {p.personalizacion}</p>}
            </>
          )}

          {vista === 2 && (
            <>
              <h2>Cápsulas</h2>
              <p className="dim">{vistas.length} de {h.capsulas.length} vistas · {h.capsulas.reduce((a, c) => a + c.minutos, 0)} minutos en total.</p>
              <div className="barra" style={{ marginTop: 8 }} aria-hidden="true"><i style={{ width: `${(vistas.length / h.capsulas.length) * 100}%` }} /></div>
              <div className="chips" role="group" aria-label="Formato">
                {(["", "Video", "Infográfico", "Texto"] as const).map((f) => <button key={f || "todo"} className="chip" aria-pressed={f === filtroCap} onClick={() => setFiltroCap(f)}>{f || "Todo"}</button>)}
              </div>
              {caps.map(({ c, n }) => <CapsulaCard key={c.titulo} h={h} c={c} n={n} p={p} perfil={perfil} act={act} />)}
              <div className="fila" style={{ marginTop: 16 }}><button className="btn" disabled={vistas.length === 0} onClick={() => ir(3)}>Ir al reto →</button></div>
            </>
          )}

          {vista === 3 && (
            <>
              <h2>Úsala en tu trabajo real</h2>
              <p className="aviso"><b>Tu reto:</b> {h.reto.tarea}</p>
              <p className="nota"><b>Quedó bien si:</b> {h.reto.criterio}</p>
              <h3 style={{ marginTop: 20 }}>Skillset</h3>
              <ul className="skills">{h.skillset.map((s, n) => <li key={s} className={p.logradas.includes(n) ? "ok" : ""}>{s}</li>)}</ul>
              {p.intentos.map((x, i) => <article className="capsula" key={i}><p>{x.texto}</p><p className="accion"><b>La IA:</b> {x.retro.retro}</p><p className="nota">{x.retro.siguiente}</p></article>)}
              <label className="campo">Cuéntale a la IA qué hiciste y cómo te fue
                <textarea value={uso} onChange={(x) => setUso(x.target.value)} rows={3} placeholder="Ej.: registré tres sesiones con Tactiq; el borrador de la segunda quedó largo" />
              </label>
              <div className="fila" style={{ marginTop: 12 }}>
                <button className="btn sal" disabled={cargando || !uso.trim()} onClick={() => correr(async () => {
                  const retro = await retroalimentar(h, perfil, uso);
                  const logradas = Array.from(new Set([...p.logradas, ...(retro.logradas || []).filter((n) => n >= 0 && n < h.skillset.length)]));
                  act({ intentos: [...p.intentos, { texto: uso, retro }], logradas }); setUso("");
                })}>Pedir retroalimentación</button>
                {p.intentos.length > 0 && <button className="btn" onClick={() => ir(4)}>Ir a la masterclass →</button>}
              </div>
            </>
          )}

          {vista === 4 && (
            <>
              <h2>Masterclass en vivo</h2>
              {mc ? <div className="envivo"><span className="mono">{fechaLarga(mc.fecha)} · {mc.minutos} min · virtual</span><h3>{mc.titulo}</h3><p>{mc.detalle}</p></div>
                : <p className="aviso">La masterclass de esta herramienta está por programar. Te avisamos por WhatsApp.</p>}
              <label className="campo">Tu pregunta para el experto
                <textarea value={p.pregunta || ""} onChange={(x) => act({ pregunta: x.target.value })} rows={2} placeholder="Escribe un borrador; la IA te ayuda a afinarla" />
              </label>
              <div className="fila" style={{ marginTop: 10 }}>
                <button className="btn sal" disabled={cargando} onClick={() => correr(async () => act({ pregunta: await afinarPregunta(h, perfil, p.pregunta || "", p.intentos.map((x) => x.texto)) }))}>Afinarla con IA</button>
                <a className="btn" href={wa(`Hola VinkU edu, quiero mi cupo en la masterclass de ${h.nombre}.${p.pregunta ? ` Mi pregunta: ${p.pregunta}` : ""}`)} target="_blank" rel="noreferrer">Separar cupo y enviar pregunta</a>
                <button className="btn sec" onClick={() => ir(5)}>Ya asistí</button>
              </div>
            </>
          )}

          {vista === 5 && (
            <>
              <h2>Laboratorio: valida tu piloto</h2>
              {lab ? <div className="envivo"><span className="mono">{fechaLarga(lab.fecha)} · {lab.minutos} min · virtual</span><h3>{lab.titulo}</h3><p>{lab.detalle}</p></div>
                : <p className="aviso">El laboratorio de esta herramienta está por programar.</p>}
              <div className="victoria-meta"><span className="mono">Victoria temprana</span><p>{h.victoria}</p></div>
              {!p.victoria ? (
                <form onSubmit={(x) => { x.preventDefault(); correr(async () => { const consejo = await leerVictoria(h, perfil, valores); act({ momento: MOMENTOS.length, victoria: { valores, fecha: new Date().toISOString(), consejo } }); }); }}>
                  <p className="campo" style={{ marginTop: 14 }}>Trae tus datos al laboratorio</p>
                  {h.metricas.map((k) => <label className="campo" key={k}>{k}<input type="text" value={valores[k] || ""} onChange={(x) => setValores({ ...valores, [k]: x.target.value })} /></label>)}
                  <div className="fila" style={{ marginTop: 12 }}><button className="btn" disabled={cargando || h.metricas.some((k) => !valores[k])}>Registrar mi victoria</button></div>
                </form>
              ) : (
                <div className="victoria">
                  <svg width="46" height="46" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="17" fill="#FF8A4C" /><path d="M12 20l6 6 10-12" stroke="#fff" strokeWidth="3.5" fill="none" strokeLinecap="round" /></svg>
                  <div>
                    <h3>Victoria registrada</h3>
                    <dl>{Object.entries(p.victoria.valores).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
                    {p.victoria.consejo && <p className="accion" style={{ marginTop: 10 }}>{p.victoria.consejo}</p>}
                  </div>
                </div>
              )}
              {p.victoria && (
                <>
                  <h3 style={{ marginTop: 20 }}>Para seguir</h3>
                  <div className="grid" style={{ marginTop: 10 }}>
                    {h.siguiente.map((s) => (
                      <a className="card" key={s.nombre} href={wa(`Hola VinkU edu, terminé ${h.nombre} y me interesa: ${s.nombre}.`)} target="_blank" rel="noreferrer">
                        <span className="precio" style={{ fontSize: 15 }}>{s.precio}</span><h3>{s.nombre}</h3><p className="dim">{s.detalle}</p>
                      </a>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {cargando && <p className="cargando">La IA está trabajando…</p>}
          {aviso && <p className="nota" role="status">{aviso}</p>}
          {error && <p className="aviso" role="alert">{error}</p>}
        </section>
        <Certificar h={h} p={p} guardar={guardar} perfilRed={perfilRed} setPerfilRed={setPerfilRed} />
        </>}
        </div>

        <aside className="lateral">
          <div className="cert-mini">
            <Sello activo={p.cert?.estado === "verificada"} tam={64} />
            <div><h3>Certifica la habilidad</h3><p className="dim" style={{ fontSize: 14, marginTop: 4 }}>{certDe(h).habilidad}</p>
              <button className="btn sec" style={{ marginTop: 10, minHeight: 40, padding: "8px 14px" }} onClick={() => document.getElementById("certificar")?.scrollIntoView({ behavior: "smooth" })}>{p.cert?.estado === "verificada" ? "Ver credencial" : "Cómo se certifica"}</button></div>
          </div>
          <div>
            <h3>Toolset · Skillset · Mindset</h3>
            <p className="dim" style={{ fontSize: 14, marginTop: 6 }}>{h.toolset.length} piezas · {h.skillset.length} habilidades · {h.capsulas.length} cápsulas</p>
            <ul className="mini">{h.skillset.map((s) => <li key={s}>{s}</li>)}</ul>
          </div>
          <div>
            <h3>En vivo</h3>
            {eventos.length ? eventos.map((e) => <p key={e.id} className="evento"><span className={e.tipo === "Masterclass" ? "etq h" : "etq"}>{e.tipo}</span><span>{fechaLarga(e.fecha)}</span></p>) : <p className="dim" style={{ fontSize: 14 }}>Por programar.</p>}
          </div>
          <div>
            <h3>También te puede servir</h3>
            {relacionadas(h).map((r) => <a key={r.id} className="rel" href={`#h-${r.id}`}><b>{r.nombre}</b><span className="dim">{r.promesa}</span></a>)}
          </div>
        </aside>
      </div>
    </>
  );
}
