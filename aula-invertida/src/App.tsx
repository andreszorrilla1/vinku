import { useEffect, useState } from "react";
import { ENCARGOS, SERVICIOS, LINEAS, encargoPorId, type Linea } from "./data/encargos";
import { avance, nuevoProgreso, MOMENTOS, type Progreso } from "./lib/motor";
import { modoIA, type ModoIA } from "./lib/ia";
import Puente, { Isotipo } from "./components/Puente";
import EncargoView from "./components/EncargoView";

const LS = "aula_invertida_v1";
const cargar = (): Record<string, Progreso> => { try { return JSON.parse(localStorage.getItem(LS) || "{}"); } catch { return {}; } };

function useHash() {
  const [h, setH] = useState(() => location.hash.slice(1) || "cuaderno");
  useEffect(() => { const f = () => { setH(location.hash.slice(1) || "cuaderno"); window.scrollTo(0, 0); }; addEventListener("hashchange", f); return () => removeEventListener("hashchange", f); }, []);
  return h;
}

const pctIA = (min: number, minH: number) => Math.round((min / (min + minH)) * 100);

export default function App() {
  const ruta = useHash();
  const [prog, setProg] = useState<Record<string, Progreso>>(cargar);
  const [modo, setModo] = useState<ModoIA | null>(null);
  useEffect(() => { modoIA().then(setModo); }, []);
  useEffect(() => { try { localStorage.setItem(LS, JSON.stringify(prog)); } catch { /* sin almacenamiento */ } }, [prog]);

  const guardar = (p: Progreso) => setProg((x) => ({ ...x, [p.encargoId]: p }));
  const encId = ruta.startsWith("e-") ? ruta.slice(2) : "";
  const enc = encId && ENCARGOS.some((x) => x.id === encId) ? encId : "";
  const seccion = enc ? "cuaderno" : ruta;

  return (
    <>
      <header className="top">
        <a className="marca" href="#cuaderno"><Isotipo />VinkU<em>edu</em><small>Aula Invertida</small></a>
        {modo && <span className={`modo ${modo === "demo" ? "demo" : ""}`} title="Origen de la IA">{modo === "claude" ? "IA activa" : modo === "plataforma" ? "IA de la plataforma" : "IA en modo demo"}</span>}
        <nav className="nav" aria-label="Secciones">
          <a href="#cuaderno" aria-current={seccion === "cuaderno" ? "page" : undefined}>Cuaderno</a>
          <a href="#servicios" aria-current={seccion === "servicios" ? "page" : undefined}>Servicios</a>
          <a href="#mesa" aria-current={seccion === "mesa" ? "page" : undefined}>Mesa</a>
        </nav>
      </header>
      <main>
        {enc ? <EncargoView key={enc} p={prog[enc] || nuevoProgreso(enc)} guardar={guardar} />
          : seccion === "servicios" ? <Servicios />
          : seccion === "mesa" ? <Mesa prog={prog} guardar={guardar} />
          : <Cuaderno prog={prog} />}
      </main>
    </>
  );
}

function Cuaderno({ prog }: { prog: Record<string, Progreso> }) {
  const [linea, setLinea] = useState<Linea>("personas");
  const enCurso = Object.values(prog).sort((a, b) => b.actualizado.localeCompare(a.actualizado));
  return (
    <>
      <section className="band hero">
        <div>
          <h1>No tomas cursos. Traes un <em className="s">encargo</em>.</h1>
          <p className="lead">Llegas con un problema real de tu oficio y sales con un entregable real. La IA hace el 60 % del camino contigo; el 40 % es con personas: un consultor humanista de VinkU edu y el mundo donde lo pruebas.</p>
          <div className="fila" style={{ marginTop: 20 }}>
            <a className="btn" href="#e-oferta">Empezar por mi oferta</a>
            <a className="btn sec" href="#servicios">Ver cómo funciona cada servicio</a>
          </div>
        </div>
        <div className="lienzo">
          <div className="fig-label mono"><span>Lo que sabes</span><span>Donde se necesita</span></div>
          <Puente avance={60} alto={170} />
          <div className="reparto">
            <div><b>60 % IA</b>Leer tu caso · Contenido justo a tiempo · Borrador contigo</div>
            <div><b>40 % humano</b>Mesa con consultor · Prueba real y sello</div>
          </div>
        </div>
      </section>

      {enCurso.length > 0 && (
        <section className="band">
          <h2>Mi bitácora</h2>
          <div className="grid" style={{ marginTop: 14 }}>
            {enCurso.map((p) => {
              const e = encargoPorId(p.encargoId);
              return (
                <a className="card" key={p.encargoId} href={`#e-${p.encargoId}`}>
                  <div className="meta"><span className={p.momento >= 3 ? "etq h" : "etq"}>{p.sello ? "Sellado" : MOMENTOS[Math.min(p.momento, 4)].nombre}</span><span className="mono dim">{avance(p)} %</span></div>
                  <h3>{e.titulo}</h3>
                  <div className="barra" aria-hidden="true"><i style={{ width: `${Math.min(avance(p), 60)}%` }} /><i style={{ width: `${Math.max(avance(p) - 60, 0)}%` }} /></div>
                </a>
              );
            })}
          </div>
        </section>
      )}

      <section className="band">
        <h2>Elige tu encargo</h2>
        <div className="chips" role="group" aria-label="Línea">
          {(Object.keys(LINEAS) as Linea[]).map((l) => <button key={l} className="chip" aria-pressed={l === linea} onClick={() => setLinea(l)}>{LINEAS[l]}</button>)}
        </div>
        <div className="grid">
          {ENCARGOS.filter((e) => e.linea === linea).map((e) => (
            <a className="card" key={e.id} href={`#e-${e.id}`}>
              <h3>{e.titulo}</h3>
              <p>{e.teLlevas}</p>
              <p className="dim" style={{ fontSize: 14 }}>{e.paraQuien}</p>
              <div className="barra" aria-hidden="true"><i style={{ width: `${pctIA(e.minutosIA, e.minutosHumano)}%` }} /><i style={{ width: `${100 - pctIA(e.minutosIA, e.minutosHumano)}%` }} /></div>
              <div className="meta mono dim"><span>IA {Math.round(e.minutosIA / 60 * 10) / 10} h</span><span>Humano {Math.round(e.minutosHumano / 60 * 10) / 10} h</span></div>
            </a>
          ))}
        </div>
      </section>

      <section className="band">
        <h2>Por qué no se parece a ninguna aula</h2>
        <div className="principios">
          <div><h3>Encargos, no cursos</h3><p>La unidad es un problema tuyo con un entregable verificable.</p></div>
          <div><h3>Contenido justo a tiempo</h3><p>Solo te llega lo que tu caso pide, escrito sobre tu caso.</p></div>
          <div><h3>La IA coproduce, no califica</h3><p>Sin quices: la IA redacta contigo y tú decides.</p></div>
          <div><h3>El humano donde la IA no alcanza</h3><p>Tu consultor llega con el brief: criterio, sector, ética y red.</p></div>
          <div><h3>Se evalúa con el mundo</h3><p>El sello llega con evidencia de personas reales, no con una nota.</p></div>
          <div><h3>Humanidades como método</h3><p>Leer, interpretar, crear y probar: el método del Laboratorio VinkU.</p></div>
        </div>
      </section>
    </>
  );
}

function Servicios() {
  return (
    <section className="band">
      <h1>Un aula, <em className="s">todos</em> los servicios</h1>
      <p className="lead" style={{ marginTop: 12, maxWidth: "38em" }}>Cada servicio de VinkU edu se arma con los mismos encargos. Cambia quién lo contrata y cuánto dura; la regla 60/40 se mantiene.</p>
      {(Object.keys(LINEAS) as Linea[]).map((l) => (
        <div key={l} style={{ marginTop: 28 }}>
          <h2>{LINEAS[l]}</h2>
          <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
            {SERVICIOS.filter((s) => s.linea === l).map((s) => (
              <article className="card servicio" key={s.id}>
                <div>
                  <h3>{s.nombre}</h3>
                  <p className="mono dim" style={{ marginTop: 4 }}>{s.precio}</p>
                  <div className="chips" style={{ margin: "10px 0 0" }}>
                    {s.encargos.map((id) => <a key={id} className="etq" href={`#e-${id}`} style={{ textDecoration: "none" }}>{encargoPorId(id).titulo}</a>)}
                  </div>
                </div>
                <div className="lado"><b className="etq">60 % IA</b><p style={{ marginTop: 6 }}>{s.ia}</p></div>
                <div className="lado"><b className="etq h">40 % humano</b><p style={{ marginTop: 6 }}>{s.humano}</p></div>
              </article>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

function Mesa({ prog, guardar }: { prog: Record<string, Progreso>; guardar: (p: Progreso) => void }) {
  const lista = Object.values(prog).filter((p) => p.brief);
  const [nombre, setNombre] = useState("Andrés Zorrilla");
  const [notas, setNotas] = useState<Record<string, string>>({});
  return (
    <section className="band">
      <h1>La <em className="s">Mesa</em> del consultor</h1>
      <p className="lead" style={{ marginTop: 12, maxWidth: "38em" }}>Vista del consultor humanista de VinkU edu: recibe los briefs que deja la IA, atiende la Mesa y pone el sello cuando hay evidencia del mundo real.</p>
      <label className="campo" style={{ maxWidth: 360 }}>Consultor<input type="text" value={nombre} onChange={(x) => setNombre(x.target.value)} /></label>
      {lista.length === 0 && <p className="aviso">Aún no hay briefs. Cuando un participante termina la parte de IA de un encargo, su brief aparece aquí.</p>}
      <div style={{ display: "grid", gap: 14, marginTop: 18 }}>
        {lista.map((p) => {
          const e = encargoPorId(p.encargoId);
          const b = p.brief!;
          return (
            <article className="panel" key={p.encargoId} style={{ marginTop: 0 }}>
              <div className="meta" style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                <h2>{e.titulo}</h2><span className="etq h">{p.sello ? "Sellado" : p.momento >= 4 ? "Probando" : "Mesa pendiente"}</span>
              </div>
              <p className="nota">{b.resumen}</p>
              <div className="brief">
                <div><h3>Decisiones</h3><ul>{b.decisiones.map((d) => <li key={d}>{d}</li>)}</ul></div>
                <div><h3>Preguntas para hacer</h3><ul>{b.preguntas.map((d) => <li key={d}>{d}</li>)}</ul></div>
              </div>
              <p className="aviso"><b>Tu parte:</b> {b.soloHumano}</p>
              <p style={{ marginTop: 12 }}><b>Evidencias:</b> {p.evidencias.length ? p.evidencias.map((x) => x.conQuien).join(" · ") : "todavía ninguna"}</p>
              <div className="fila" style={{ marginTop: 12 }}>
                {p.momento === 3 && <button className="btn sec" onClick={() => guardar({ ...p, momento: 4, actualizado: new Date().toISOString() })}>Marcar Mesa realizada</button>}
                <a className="btn sec" href={`#e-${p.encargoId}`}>Abrir el entregable</a>
              </div>
              {!p.sello && p.evidencias.length > 0 && (
                <form onSubmit={(x) => { x.preventDefault(); guardar({ ...p, momento: 5, sello: { consultor: nombre || "Consultor VinkU", nota: notas[p.encargoId] || "Entregable probado con personas reales.", fecha: new Date().toISOString() }, actualizado: new Date().toISOString() }); }}>
                  <label className="campo">Nota del sello<input type="text" value={notas[p.encargoId] || ""} onChange={(x) => setNotas({ ...notas, [p.encargoId]: x.target.value })} placeholder="Qué quedó demostrado" /></label>
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
