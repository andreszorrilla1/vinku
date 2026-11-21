import { useEffect, useState } from "react";
import { HERRAMIENTAS, SERVICIOS, EN_VIVO, herramientaPorId, formatoCOP } from "./data/herramientas";
import { avance, nuevoProgreso, recomendar, MOMENTOS, ULTIMO, type Progreso } from "./lib/motor";
import { modoIA, type ModoIA } from "./lib/ia";
import Puente, { Isotipo } from "./components/Puente";
import HerramientaView from "./components/HerramientaView";

const LS = "vinkuedu_abh_v1";
const cargar = (): Record<string, Progreso> => {
  try {
    const d = JSON.parse(localStorage.getItem(LS) || "{}") as Record<string, Progreso>;
    return Object.fromEntries(Object.entries(d).filter(([k]) => herramientaPorId(k)));
  } catch { return {}; }
};

function useHash() {
  const [h, setH] = useState(() => location.hash.slice(1) || "taller");
  useEffect(() => { const f = () => { setH(location.hash.slice(1) || "taller"); window.scrollTo(0, 0); }; addEventListener("hashchange", f); return () => removeEventListener("hashchange", f); }, []);
  return h;
}

export default function App() {
  const ruta = useHash();
  const [prog, setProg] = useState<Record<string, Progreso>>(cargar);
  const [modo, setModo] = useState<ModoIA | null>(null);
  useEffect(() => { modoIA().then(setModo); }, []);
  useEffect(() => { try { localStorage.setItem(LS, JSON.stringify(prog)); } catch { /* sin almacenamiento */ } }, [prog]);

  const guardar = (p: Progreso) => setProg((x) => ({ ...x, [p.herramientaId]: p }));
  const hid = ruta.startsWith("h-") && herramientaPorId(ruta.slice(2)) ? ruta.slice(2) : "";
  const seccion = hid ? "taller" : ruta;

  return (
    <>
      <header className="top">
        <a className="marca" href="#taller"><Isotipo />VinkU<em>edu</em><small>Aprendizaje basado en herramientas</small></a>
        {modo && <span className={`modo ${modo === "demo" ? "demo" : ""}`}>{modo === "claude" ? "IA activa" : modo === "plataforma" ? "IA de la plataforma" : "IA en modo demo"}</span>}
        <nav className="nav" aria-label="Secciones">
          <a href="#taller" aria-current={seccion === "taller" ? "page" : undefined}>Herramientas</a>
          <a href="#servicios" aria-current={seccion === "servicios" ? "page" : undefined}>Servicios</a>
          <a href="#envivo" aria-current={seccion === "envivo" ? "page" : undefined}>En vivo</a>
        </nav>
      </header>
      <main>
        {hid ? <HerramientaView key={hid} p={{ ...nuevoProgreso(hid), ...prog[hid] }} guardar={guardar} />
          : seccion === "servicios" ? <Servicios />
          : seccion === "envivo" ? <EnVivo prog={prog} guardar={guardar} />
          : <Taller prog={prog} />}
      </main>
    </>
  );
}

function Taller({ prog }: { prog: Record<string, Progreso> }) {
  const mias = Object.values(prog).sort((a, b) => b.actualizado.localeCompare(a.actualizado));
  const [texto, setTexto] = useState("");
  const [rec, setRec] = useState<{ id: string; porque: string } | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const buscar = async () => {
    setCargando(true); setError("");
    try { const r = await recomendar(texto); setRec(herramientaPorId(r.id) ? r : { id: "consultora", porque: r.porque }); }
    catch (e) { setError(e instanceof Error ? e.message : "No se pudo recomendar."); }
    setCargando(false);
  };
  const recH = rec && herramientaPorId(rec.id);

  return (
    <>
      <section className="band hero">
        <div>
          <h1>Aprende con una <em className="s">herramienta</em> en la mano.</h1>
          <p className="lead">Cada experiencia es una herramienta que descargas, ajustas a tu oficio y usas en un caso real. Te llevas el toolset, desarrollas el skillset y cambias el mindset: de profesional a emprendedor.</p>
          <form className="recomendador" onSubmit={(x) => { x.preventDefault(); if (texto.trim()) buscar(); }}>
            <label className="campo">¿Cuál es tu herramienta? Cuéntanos tu oficio y qué quieres lograr
              <textarea value={texto} onChange={(x) => setTexto(x.target.value)} rows={2} placeholder="Ej.: soy socióloga y quiero venderle investigación a empresas" />
            </label>
            <div className="fila" style={{ marginTop: 10 }}><button className="btn" disabled={cargando || !texto.trim()}>Recomiéndame una</button></div>
            {cargando && <p className="cargando">Buscando tu herramienta…</p>}
            {error && <p className="aviso" role="alert">{error}</p>}
            {recH && <a className="card" href={`#h-${recH.id}`} style={{ marginTop: 12 }}><span className="etq h">Tu herramienta</span><h3>{recH.nombre}</h3><p>{rec!.porque}</p></a>}
          </form>
        </div>
        <div className="lienzo">
          <div className="fig-label mono"><span>Lo que sabes</span><span>Donde se necesita</span></div>
          <Puente avance={60} alto={170} />
          <div className="sets">
            <div><b>Toolset</b>La herramienta que descargas y ajustas a tu oficio</div>
            <div><b>Skillset</b>Lo que aprendes a hacer al usarla en tu caso</div>
            <div className="h"><b>Mindset</b>Cómo cambias de profesional a emprendedor</div>
          </div>
          <p className="mono" style={{ color: "#9DB5B0", marginTop: 12 }}>60 % IA · 40 % en vivo y en el mundo</p>
        </div>
      </section>

      {mias.length > 0 && (
        <section className="band">
          <h2>Mi caja de herramientas</h2>
          <div className="grid" style={{ marginTop: 14 }}>
            {mias.map((p) => {
              const h = herramientaPorId(p.herramientaId)!;
              return (
                <a className="card" key={h.id} href={`#h-${h.id}`}>
                  <div className="meta"><span className={p.momento >= 3 ? "etq h" : "etq"}>{p.sello ? "Sellada" : MOMENTOS[Math.min(p.momento, ULTIMO)].nombre}</span><span className="mono dim">{avance(p)} %</span></div>
                  <h3>{h.nombre}</h3>
                  <div className="barra" aria-hidden="true"><i style={{ width: `${Math.min(avance(p), 60)}%` }} /><i style={{ width: `${Math.max(avance(p) - 60, 0)}%` }} /></div>
                </a>
              );
            })}
          </div>
        </section>
      )}

      <section className="band">
        <h2>Una herramienta por semana</h2>
        <p className="dim" style={{ marginTop: 6 }}>Cada una trae su kit descargable, cápsulas en video, infografía y texto, y su masterclass en vivo los {EN_VIVO.dia} a las {EN_VIVO.hora}.</p>
        <div className="grid" style={{ marginTop: 16 }}>
          {HERRAMIENTAS.map((h) => (
            <a className="card herr" key={h.id} href={`#h-${h.id}`}>
              <div className="meta"><span className="mono dim">Semana {h.semana}</span><span className="precio">{formatoCOP(h.precio)}</span></div>
              <h3>{h.nombre}</h3>
              <p className="dim" style={{ fontSize: 14 }}>{h.oficio}</p>
              <p>{h.oportunidad}</p>
              <p className="mindset chico">De <s>{h.mindset.de}</s> a <em className="s">{h.mindset.a}</em></p>
              <div className="fila" style={{ gap: 6 }}>
                {h.toolset.map((t) => <span className="etq" key={t.nombre}>{t.tipo}</span>)}
                {h.estado === "Disponible" ? <span className="etq h">Disponible</span> : <span className="etq gris">En diseño</span>}
              </div>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}

function Servicios() {
  return (
    <section className="band">
      <h1>Todo se arma con <em className="s">herramientas</em></h1>
      <p className="lead" style={{ marginTop: 12, maxWidth: "38em" }}>La herramienta de la semana es la puerta de entrada. Los demás servicios instalan más herramientas, con más acompañamiento humano.</p>
      {(["personas", "organizaciones"] as const).map((l) => (
        <div key={l} style={{ marginTop: 28 }}>
          <h2>{l === "personas" ? "Personas: de profesional a emprendedor" : "Organizaciones"}</h2>
          <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
            {SERVICIOS.filter((s) => s.linea === l).map((s) => (
              <article className="card servicio2" key={s.id}>
                <div><h3>{s.nombre}</h3><p className="mono dim" style={{ marginTop: 4 }}>{s.precio}</p></div>
                <p>{s.como}</p>
              </article>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

function EnVivo({ prog, guardar }: { prog: Record<string, Progreso>; guardar: (p: Progreso) => void }) {
  const [nombre, setNombre] = useState("Andrés Zorrilla");
  const [notas, setNotas] = useState<Record<string, string>>({});
  const conBrief = Object.values(prog).filter((p) => p.brief);
  return (
    <section className="band">
      <h1>Las masterclasses <em className="s">en vivo</em></h1>
      <p className="lead" style={{ marginTop: 12, maxWidth: "38em" }}>Vista de quien dicta: el calendario de herramientas, las preguntas que llegan preparadas por la IA y el sello para quienes ya la lanzaron.</p>

      <h2 style={{ marginTop: 28 }}>Calendario</h2>
      <p className="nota">Propuesta: una herramienta nueva por semana, en vivo los {EN_VIVO.dia} a las {EN_VIVO.hora}, {EN_VIVO.modalidad}. Fechas por definir.</p>
      <ol className="calendario">
        {HERRAMIENTAS.map((h) => <li key={h.id}><span className="mono">Semana {h.semana}</span><b>{h.nombre}</b><span className="dim">{h.oficio}</span></li>)}
      </ol>

      <h2 style={{ marginTop: 28 }}>Preguntas para el en vivo</h2>
      <label className="campo" style={{ maxWidth: 360 }}>Quien dicta<input type="text" value={nombre} onChange={(x) => setNombre(x.target.value)} /></label>
      {conBrief.length === 0 && <p className="aviso">Aún no llegan preguntas. Aparecen cuando alguien usa su herramienta y se prepara para el en vivo.</p>}
      <div style={{ display: "grid", gap: 14, marginTop: 16 }}>
        {conBrief.map((p) => {
          const h = herramientaPorId(p.herramientaId)!;
          const b = p.brief!;
          return (
            <article className="panel" key={h.id} style={{ marginTop: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}><h2>{h.nombre}</h2><span className="etq h">{p.sello ? "Sellada" : p.momento >= 4 ? "Lanzando" : "Viene al en vivo"}</span></div>
              <p className="aviso"><b>Pregunta:</b> {b.pregunta}</p>
              <p className="nota">{b.resumen}</p>
              <div className="brief">
                <div><h3>Mindset</h3><p>{b.mindset}</p></div>
                <div><h3>Para responder en vivo</h3><ul>{b.preguntas.map((d) => <li key={d}>{d}</li>)}</ul></div>
              </div>
              <p style={{ marginTop: 12 }}><b>Evidencias:</b> {p.evidencias.length ? p.evidencias.map((x) => x.conQuien).join(" · ") : "todavía ninguna"}</p>
              {!p.sello && p.evidencias.length > 0 && (
                <form onSubmit={(x) => { x.preventDefault(); guardar({ ...p, momento: MOMENTOS.length, sello: { consultor: nombre || "Consultor VinkU", nota: notas[h.id] || "Herramienta usada y lanzada con personas reales.", fecha: new Date().toISOString() }, actualizado: new Date().toISOString() }); }}>
                  <label className="campo">Nota del sello<input type="text" value={notas[h.id] || ""} onChange={(x) => setNotas({ ...notas, [h.id]: x.target.value })} placeholder="Qué quedó demostrado" /></label>
                  <div className="fila" style={{ marginTop: 10 }}><button className="btn">Poner el sello</button></div>
                </form>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
