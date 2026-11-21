import { useEffect, useMemo, useState } from "react";
import { HERRAMIENTAS, EVENTOS, PLANES, ESCALERA, OBJETIVOS, FORMATOS, herramientaPorId, formatoCOP, fechaLarga, fechaCorta, wa, type Objetivo, type Formato } from "./data/herramientas";
import { avance, nuevoProgreso, buscarConIA, MOMENTOS, ULTIMO, type Progreso, type Perfil, type Resultado, type PerfilPublico } from "./lib/motor";
import { certDe, codigoNuevo, EJEMPLOS_RED, type PerfilRed } from "./data/certificacion";
import { Sello } from "./components/Certificar";
import { filtrar, demoBusqueda, proximoEvento, type Filtros } from "./lib/repositorio";
import { modoIA, type ModoIA } from "./lib/ia";
import Puente, { Isotipo } from "./components/Puente";
import HerramientaView from "./components/HerramientaView";

const LS = "vinkuedu_abh_v2";
const LS_PERFIL = "vinkuedu_perfil_v1";
const LS_RED = "vinkuedu_red_v1";
const leer = <T,>(k: string, d: T): T => { try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : d; } catch { return d; } };

function useHash() {
  const [h, setH] = useState(() => location.hash.slice(1) || "repositorio");
  useEffect(() => { const f = () => { setH(location.hash.slice(1) || "repositorio"); window.scrollTo(0, 0); }; addEventListener("hashchange", f); return () => removeEventListener("hashchange", f); }, []);
  return h;
}

export default function App() {
  const ruta = useHash();
  const [prog, setProg] = useState<Record<string, Progreso>>(() => Object.fromEntries(Object.entries(leer<Record<string, Progreso>>(LS, {})).filter(([k]) => herramientaPorId(k))));
  const [perfil, setPerfil] = useState<Perfil>(() => leer<Perfil>(LS_PERFIL, { oficio: "", objetivo: "", situacion: "" }));
  const [perfilRed, setPerfilRed] = useState<PerfilPublico>(() => leer<PerfilPublico>(LS_RED, { nombre: "", ciudad: "", modalidad: "Virtual", servicio: "", desde: "", publicado: false }));
  const [modo, setModo] = useState<ModoIA | null>(null);
  useEffect(() => { try { localStorage.setItem(LS_RED, JSON.stringify(perfilRed)); } catch { /* sin almacenamiento */ } }, [perfilRed]);
  useEffect(() => { modoIA().then(setModo); }, []);
  useEffect(() => { try { localStorage.setItem(LS, JSON.stringify(prog)); } catch { /* sin almacenamiento */ } }, [prog]);
  useEffect(() => { try { localStorage.setItem(LS_PERFIL, JSON.stringify(perfil)); } catch { /* sin almacenamiento */ } }, [perfil]);

  const guardar = (p: Progreso) => setProg((x) => ({ ...x, [p.herramientaId]: p }));
  const rutaH = ruta.startsWith("h-") ? ruta.slice(2).replace(/-recursos$/, "") : "";
  const hid = rutaH && herramientaPorId(rutaH) ? rutaH : "";
  const tabH = ruta.endsWith("-recursos") ? "recursos" : "ruta";
  const seccion = hid ? "repositorio" : ruta;

  return (
    <>
      <header className="top">
        <a className="marca" href="#repositorio"><Isotipo />VinkU<em>edu</em><small>Aprendizaje basado en herramientas</small></a>
        {modo && <span className={`modo ${modo === "demo" ? "demo" : ""}`}>{modo === "claude" ? "IA activa" : modo === "plataforma" ? "IA de la plataforma" : "IA en modo demo"}</span>}
        <nav className="nav" aria-label="Secciones">
          <a href="#repositorio" aria-current={seccion === "repositorio" ? "page" : undefined}>Repositorio</a>
          <a href="#agenda" aria-current={seccion === "agenda" ? "page" : undefined}>Agenda</a>
          <a href="#red" aria-current={seccion === "red" || seccion.startsWith("verificar") ? "page" : undefined}>Red</a>
          <a href="#planes" aria-current={seccion === "planes" ? "page" : undefined}>Planes</a>
        </nav>
      </header>
      <main>
        {hid ? <HerramientaView key={ruta} tab={tabH} p={{ ...nuevoProgreso(hid), ...prog[hid] }} perfil={perfil} guardar={guardar} perfilRed={perfilRed} setPerfilRed={setPerfilRed} />
          : seccion === "agenda" ? <Agenda prog={prog} guardar={guardar} />
          : seccion === "red" || seccion.startsWith("verificar") ? <Red prog={prog} perfilRed={perfilRed} codigo={seccion.startsWith("verificar-") ? seccion.slice(10) : ""} />
          : seccion === "planes" ? <Planes />
          : <Repositorio prog={prog} perfil={perfil} setPerfil={setPerfil} />}
      </main>
    </>
  );
}

function Repositorio({ prog, perfil, setPerfil }: { prog: Record<string, Progreso>; perfil: Perfil; setPerfil: (p: Perfil) => void }) {
  const [f, setF] = useState<Filtros>({ texto: "", objetivo: "", formato: "", acceso: "", soloDisponibles: false });
  const [ia, setIa] = useState<Resultado[] | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const lista = useMemo(() => filtrar(f, perfil), [f, perfil]);
  const personalizado = !!(perfil.oficio || perfil.objetivo);
  const mias = Object.values(prog).filter((p) => p.momento > 0 || p.descargado).sort((a, b) => b.actualizado.localeCompare(a.actualizado));
  const piloto = herramientaPorId("consultorio")!;
  const mc = proximoEvento("consultorio");
  const preguntar = async () => {
    if (!f.texto.trim()) return;
    setCargando(true); setError("");
    try { setIa(await buscarConIA(f.texto, perfil, () => demoBusqueda(f.texto, perfil))); }
    catch (e) { setError(e instanceof Error ? e.message : "No se pudo buscar."); }
    setCargando(false);
  };
  const tog = <K extends keyof Filtros>(k: K, v: Filtros[K]) => setF({ ...f, [k]: f[k] === v ? ("" as Filtros[K]) : v });

  return (
    <>
      <section className="band hero">
        <div>
          <h1>Herramientas para <em className="s">hacer</em> y <em className="s">ser</em>.</h1>
          <p className="lead">Para profesionales de ciencias sociales y humanas que quieren abrir nuevos campos de acción, trabajar como independientes o emprender. Descargas una herramienta, la ajustas a tu manera, la usas con tu trabajo real y la validas en vivo. No importa el título: importa lo que puedes hacer, y lo certificamos con microcertificaciones.</p>
          <div className="fila" style={{ marginTop: 18 }}><a className="btn sec" href="#red">Ver la Red de profesionales verificados</a></div>
        </div>
        <article className="destacada">
          <div className="fila" style={{ gap: 8 }}><span className="etq h">Piloto abierto</span><span className="mono" style={{ color: "#9DB5B0" }}>15 cupos · gratis</span></div>
          <h2>{piloto.nombre}</h2>
          <p>{piloto.promesa}</p>
          <p className="mindset chico" style={{ color: "#CFE0DB" }}>De <s>{piloto.mindset.de}</s> a <em className="s">{piloto.mindset.a}</em></p>
          <div className="eventos-mini">
            {EVENTOS.filter((e) => e.herramientaId === "consultorio").map((e) => <div key={e.id}><span className="mono">{fechaCorta(e.fecha)}</span><b>{e.tipo}</b></div>)}
          </div>
          <div className="fila" style={{ marginTop: 14 }}>
            <a className="btn" href={wa("Hola VinkU edu, quiero un cupo en el piloto de Consultorio.")} target="_blank" rel="noreferrer">Quiero un cupo</a>
            <a className="btn sec claro" href="#h-consultorio">Ver la herramienta</a>
          </div>
          {mc && <p className="mono" style={{ color: "#9DB5B0", marginTop: 10 }}>Masterclass: {fechaLarga(mc.fecha)}</p>}
        </article>
      </section>

      {mias.length > 0 && (
        <section className="band" style={{ paddingTop: 0 }}>
          <h2>Sigue donde ibas</h2>
          <div className="carril">
            {mias.map((p) => {
              const h = herramientaPorId(p.herramientaId)!;
              return (
                <a className="card" key={h.id} href={`#h-${h.id}`}>
                  <div className="meta"><span className={p.momento >= 4 ? "etq h" : "etq"}>{p.victoria ? "Victoria" : MOMENTOS[Math.min(p.momento, ULTIMO)].nombre}</span><span className="mono dim">{avance(p)} %</span></div>
                  <h3>{h.nombre}</h3>
                  <div className="barra" aria-hidden="true"><i style={{ width: `${Math.min(avance(p), 60)}%` }} /><i style={{ width: `${Math.max(avance(p) - 60, 0)}%` }} /></div>
                </a>
              );
            })}
          </div>
        </section>
      )}

      <section className="band repo" style={{ paddingTop: 0 }}>
        <div className="buscador">
          <h2>El repositorio</h2>
          <form className="busca" onSubmit={(x) => { x.preventDefault(); preguntar(); }}>
            <input type="search" aria-label="Buscar herramientas" value={f.texto} onChange={(x) => { setF({ ...f, texto: x.target.value }); setIa(null); }} placeholder="Busca o cuéntale a la IA qué necesitas: «soy socióloga y quiero venderle a empresas»" />
            <button className="btn sal" disabled={cargando || !f.texto.trim()}>Preguntar a la IA</button>
          </form>
          <details className="perfil" open={!personalizado}>
            <summary>{personalizado ? `Ordenado para ti: ${[perfil.oficio, perfil.objetivo, perfil.situacion].filter(Boolean).join(" · ")}` : "Cuéntanos de ti y ordenamos el repositorio para ti"}</summary>
            <div className="perfil-campos">
              <label className="campo">Tu oficio o formación<input type="text" value={perfil.oficio} onChange={(x) => setPerfil({ ...perfil, oficio: x.target.value })} placeholder="Ej.: psicóloga, sociólogo, abogada" /></label>
              <label className="campo">Hoy estás
                <select value={perfil.situacion} onChange={(x) => setPerfil({ ...perfil, situacion: x.target.value as Perfil["situacion"] })}>
                  <option value="">Prefiero no decir</option><option>Desempleado</option><option>Empleado</option><option>Independiente</option>
                </select>
              </label>
            </div>
            <p className="campo">Quieres</p>
            <div className="chips" role="group" aria-label="Objetivo del perfil">
              {OBJETIVOS.map((o) => <button key={o} className="chip" aria-pressed={perfil.objetivo === o} onClick={() => setPerfil({ ...perfil, objetivo: perfil.objetivo === o ? "" : o })}>{o}</button>)}
            </div>
          </details>
          <div className="facetas">
            <div className="chips" role="group" aria-label="Filtrar por objetivo">
              {OBJETIVOS.map((o) => <button key={o} className="chip" aria-pressed={f.objetivo === o} onClick={() => tog("objetivo", o as Objetivo)}>{o}</button>)}
            </div>
            <div className="chips" role="group" aria-label="Filtrar por formato y acceso">
              {FORMATOS.map((o) => <button key={o} className="chip chico" aria-pressed={f.formato === o} onClick={() => tog("formato", o as Formato)}>{o}</button>)}
              <button className="chip chico" aria-pressed={f.acceso === "Gratis"} onClick={() => tog("acceso", "Gratis")}>Gratis</button>
              <button className="chip chico" aria-pressed={f.soloDisponibles} onClick={() => setF({ ...f, soloDisponibles: !f.soloDisponibles })}>Disponibles ya</button>
            </div>
          </div>
        </div>

        {cargando && <p className="cargando">La IA está buscando en el repositorio…</p>}
        {error && <p className="aviso" role="alert">{error}</p>}
        {ia && (
          <div className="ia-res">
            <div className="fila" style={{ justifyContent: "space-between" }}><h3>La IA te recomienda</h3><button className="btn sec" onClick={() => setIa(null)}>Limpiar</button></div>
            {ia.map((r, i) => { const h = herramientaPorId(r.id)!; return (
              <a className="ia-item" key={r.id} href={`#h-${h.id}`}><span className="num">{i + 1}</span><div><b>{h.nombre}</b><p>{r.razon}</p></div><span className="precio">{formatoCOP(h.precio)}</span></a>
            ); })}
          </div>
        )}

        <p className="dim" style={{ margin: "14px 0 10px" }}>{lista.length} {lista.length === 1 ? "herramienta" : "herramientas"}{personalizado ? " · ordenadas para ti" : ""}</p>
        <div className="grid">
          {lista.map(({ h, p }, i) => {
            const ev = proximoEvento(h.id);
            return (
              <a className="card herr" key={h.id} href={`#h-${h.id}`}>
                <div className="meta">
                  <span className={h.estado === "En diseño" ? "etq gris" : "etq h"}>{h.estado}</span>
                  <span className="precio">{formatoCOP(h.precio)}</span>
                </div>
                <h3>{h.nombre}</h3>
                <p>{h.promesa}</p>
                <p className="dim" style={{ fontSize: 14 }}>{h.oficio}</p>
                <p className="mindset chico">De <s>{h.mindset.de}</s> a <em className="s">{h.mindset.a}</em></p>
                <div className="pie">
                  <span className="etq">{h.formato}</span>
                  {h.objetivos.map((o) => <span className="etq gris" key={o}>{o}</span>)}
                </div>
                <div className="pie dim mono">
                  <span>{h.capsulas.length} cápsulas</span>
                  <span>{ev ? `En vivo ${fechaCorta(ev.fecha)}` : "En vivo por programar"}</span>
                  {personalizado && i < 2 && p > 3 && <span className="parati">Para ti</span>}
                </div>
              </a>
            );
          })}
        </div>
        {lista.length === 0 && <p className="aviso">Nada coincide con esos filtros. Prueba «Preguntar a la IA» o quita un filtro.</p>}
      </section>

      <section className="band">
        <div className="lienzo modelo">
          <div>
            <h2 style={{ color: "#fff" }}>Cómo aprendes con una herramienta</h2>
            <div className="sets">
              <div><b>Toolset</b>Descargas la herramienta y la personalizas tú</div>
              <div><b>Skillset</b>Aprendes con cápsulas y la usas en tu trabajo real</div>
              <div className="h"><b>Mindset</b>Masterclass y laboratorio: validas tu piloto</div>
            </div>
          </div>
          <div>
            <div className="fig-label mono"><span>Lo que sabes</span><span>Donde se necesita</span></div>
            <Puente avance={60} alto={150} />
            <p className="mono" style={{ color: "#9DB5B0" }}>60 % a tu ritmo con IA · 40 % en vivo y en el mundo</p>
          </div>
        </div>
      </section>
    </>
  );
}

function Agenda({ prog, guardar }: { prog: Record<string, Progreso>; guardar: (p: Progreso) => void }) {
  const [evaluador, setEvaluador] = useState("Andrés Zorrilla");
  const pendientes = Object.values(prog).filter((p) => p.cert?.estado === "en validación");
  const preguntas = Object.values(prog).filter((p) => p.pregunta);
  const victorias = Object.values(prog).filter((p) => p.victoria);
  return (
    <section className="band">
      <h1>Agenda <em className="s">en vivo</em></h1>
      <p className="lead" style={{ marginTop: 12, maxWidth: "38em" }}>Dos espacios por herramienta: la masterclass, donde un experto entrega el conocimiento, y el laboratorio, donde validamos juntos los pilotos.</p>
      <div className="agenda">
        {EVENTOS.slice().sort((a, b) => a.fecha.localeCompare(b.fecha)).map((e) => {
          const h = herramientaPorId(e.herramientaId)!;
          const d = new Date(e.fecha);
          return (
            <article className="evento-card" key={e.id}>
              <div className="dia"><b>{d.toLocaleString("es-CO", { day: "numeric", timeZone: "America/Bogota" })}</b><span>{d.toLocaleString("es-CO", { month: "short", timeZone: "America/Bogota" })}</span></div>
              <div>
                <div className="fila" style={{ gap: 8 }}><span className={e.tipo === "Masterclass" ? "etq h" : "etq"}>{e.tipo}</span><span className="mono dim">{fechaLarga(e.fecha)} · {e.minutos} min</span></div>
                <h3 style={{ marginTop: 6 }}>{e.titulo}</h3>
                <p className="dim">{h.nombre} · {e.detalle}</p>
                <div className="fila" style={{ marginTop: 10 }}>
                  <a className="btn" href={wa(`Hola VinkU edu, quiero mi cupo en ${e.tipo.toLowerCase()} "${e.titulo}".`)} target="_blank" rel="noreferrer">Separar cupo</a>
                  <a className="btn sec" href={`#h-${h.id}`}>Ver la herramienta</a>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <h2 style={{ marginTop: 32 }}>Próximos lanzamientos</h2>
      <p className="nota">Una herramienta nueva por semana después del piloto. Fechas por definir.</p>
      <ol className="calendario">
        {HERRAMIENTAS.filter((h) => h.estado === "En diseño").map((h) => <li key={h.id}><span className="mono">Semana {h.semana}</span><b>{h.nombre}</b><span className="dim">{h.promesa}</span></li>)}
      </ol>

      <h2 style={{ marginTop: 32 }}>Para quien dicta</h2>
      <p className="nota">Lo que llega de la plataforma antes de cada sesión (en el prototipo, solo lo de este navegador).</p>
      <div className="grid" style={{ marginTop: 12 }}>
        <article className="card"><h3>Preguntas para la masterclass</h3>
          {preguntas.length ? <ul className="mini">{preguntas.map((p) => <li key={p.herramientaId}><b>{herramientaPorId(p.herramientaId)!.nombre}:</b> {p.pregunta}</li>)}</ul> : <p className="dim">Aún no hay preguntas.</p>}
        </article>
        <article className="card"><h3>Para quien evalúa: microcertificaciones</h3>
          <label className="campo">Evaluador<input type="text" value={evaluador} onChange={(x) => setEvaluador(x.target.value)} /></label>
          {pendientes.length ? pendientes.map((p) => { const h = herramientaPorId(p.herramientaId)!; return (
            <div key={h.id} className="pend"><b>{certDe(h).habilidad}</b><p className="dim">{p.cert!.prueba?.resumen}</p>
              <button className="btn" onClick={() => guardar({ ...p, cert: { ...p.cert!, estado: "verificada", codigo: codigoNuevo(h), fecha: new Date().toISOString(), evaluador: evaluador || "Evaluador VinkU" }, actualizado: new Date().toISOString() })}>Validar y emitir insignia</button></div>
          ); }) : <p className="dim">No hay pruebas esperando validación.</p>}
        </article>
        <article className="card"><h3>Victorias para el laboratorio</h3>
          {victorias.length ? <ul className="mini">{victorias.map((p) => <li key={p.herramientaId}><b>{herramientaPorId(p.herramientaId)!.nombre}:</b> {Object.entries(p.victoria!.valores).map(([k, v]) => `${k}: ${v}`).join(" · ")}</li>)}</ul> : <p className="dim">Aún no hay victorias registradas.</p>}
        </article>
      </div>
    </section>
  );
}

function Planes() {
  return (
    <section className="band">
      <h1>Elige cómo <em className="s">aprender</em></h1>
      <p className="lead" style={{ marginTop: 12, maxWidth: "38em" }}>Precios accesibles, formación ágil y siempre actualizada. Empiezas gratis y sigues a tu ritmo.</p>
      <div className="planes">
        {PLANES.map((pl) => (
          <article className={`card plan ${pl.destacado ? "dest" : ""}`} key={pl.nombre}>
            {pl.destacado && <span className="etq h">Recomendado</span>}
            <h3>{pl.nombre}</h3>
            <p className="precio grande">{pl.precio}</p>
            <ul className="mini">{pl.incluye.map((x) => <li key={x}>{x}</li>)}</ul>
            <a className={pl.destacado ? "btn" : "btn sec"} href={wa(`Hola VinkU edu, me interesa el plan: ${pl.nombre}.`)} target="_blank" rel="noreferrer">{pl.precio === "Gratis" ? "Empezar gratis" : "Me interesa"}</a>
          </article>
        ))}
      </div>
      <h2 style={{ marginTop: 32 }}>Cuando quieras ir más lejos</h2>
      <div className="grid" style={{ marginTop: 12 }}>
        {ESCALERA.map((e) => <article className="card" key={e.nombre}><span className="precio" style={{ fontSize: 15 }}>{e.precio}</span><h3>{e.nombre}</h3><p className="dim">{e.detalle}</p></article>)}
      </div>
    </section>
  );
}

function Red({ prog, perfilRed, codigo }: { prog: Record<string, Progreso>; perfilRed: PerfilPublico; codigo: string }) {
  const [hab, setHab] = useState("");
  const [q, setQ] = useState("");
  const [cod, setCod] = useState(codigo);
  const mias = Object.values(prog).filter((p) => p.cert?.estado === "verificada");
  const propio: PerfilRed | null = mias.length && perfilRed.publicado ? {
    codigo: mias[0].cert!.codigo!, nombre: perfilRed.nombre, oficio: "Perfil tuyo", ciudad: perfilRed.ciudad || "Sin ciudad", modalidad: perfilRed.modalidad,
    habilidades: mias.map((p) => certDe(herramientaPorId(p.herramientaId)!).habilidad),
    servicios: [{ nombre: perfilRed.servicio, desde: perfilRed.desde || "A convenir" }],
    victoria: Object.entries(mias[0].victoria?.valores || {}).map(([k, v]) => `${k}: ${v}`).join(" · "), fecha: mias[0].cert!.fecha!,
  } : null;
  const todos = [...(propio ? [propio] : []), ...EJEMPLOS_RED];
  const habilidades = Array.from(new Set(todos.flatMap((x) => x.habilidades)));
  const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const lista = todos.filter((x) => (!hab || x.habilidades.includes(hab)) && (!q || norm([x.nombre, x.oficio, x.ciudad, ...x.servicios.map((s) => s.nombre)].join(" ")).includes(norm(q))));
  const encontrado = cod ? todos.find((x) => x.codigo.toLowerCase() === cod.trim().toLowerCase()) : undefined;

  return (
    <section className="band">
      <h1>La Red de profesionales <em className="s">verificados</em></h1>
      <p className="lead" style={{ marginTop: 12, maxWidth: "40em" }}>Cada persona de la Red tiene al menos una microcertificación: demostró su habilidad con evidencia real, una prueba práctica y una validación humana, y la lleva como insignia digital. Si buscas a alguien que lo sepa hacer, empieza aquí.</p>

      <div className="verifica">
        <Sello activo={!!encontrado} tam={70} />
        <form onSubmit={(x) => { x.preventDefault(); }} style={{ flex: 1 }}>
          <label className="campo" style={{ marginTop: 0 }}>Verifica una credencial
            <input type="text" value={cod} onChange={(x) => setCod(x.target.value)} placeholder="Ej.: VKU-CONS-0001" />
          </label>
        </form>
        {cod && (encontrado
          ? <p className="ok-ver"><b>Verificada:</b> {encontrado.nombre} · {encontrado.habilidades.join(", ")} · desde {new Date(encontrado.fecha).toLocaleDateString("es-CO")}{encontrado.ejemplo ? " (ejemplo)" : ""}</p>
          : <p className="dim">No encontramos ese código.</p>)}
      </div>

      <div className="busca" style={{ marginTop: 20 }}>
        <input type="search" aria-label="Buscar en la Red" value={q} onChange={(x) => setQ(x.target.value)} placeholder="Busca por servicio, ciudad u oficio" />
      </div>
      <div className="chips" role="group" aria-label="Habilidad">
        <button className="chip chico" aria-pressed={!hab} onClick={() => setHab("")}>Todas</button>
        {habilidades.map((h) => <button key={h} className="chip chico" aria-pressed={hab === h} onClick={() => setHab(hab === h ? "" : h)}>{h}</button>)}
      </div>
      <p className="nota">Los perfiles marcados como ejemplo son ilustrativos: no son personas reales.</p>
      <div className="grid" style={{ marginTop: 12 }}>
        {lista.map((x) => (
          <article className={`card perfil-red ${x.ejemplo ? "" : "propio"}`} key={x.codigo}>
            <div className="meta"><span className="avatar">{x.nombre.split(" ").map((w) => w[0]).slice(0, 2).join("")}</span>{x.ejemplo ? <span className="etq gris">Ejemplo</span> : <span className="etq h">Tu perfil</span>}</div>
            <h3>{x.nombre}</h3>
            <p className="dim" style={{ fontSize: 14 }}>{x.oficio} · {x.ciudad} · {x.modalidad}</p>
            {x.habilidades.map((hb) => <p key={hb} className="verif"><Sello activo tam={26} />{hb}</p>)}
            <ul className="mini">{x.servicios.map((s) => <li key={s.nombre}>{s.nombre} · <b>desde {s.desde}</b></li>)}</ul>
            {x.victoria && <p className="nota">Evidencia: {x.victoria}</p>}
            <div className="fila" style={{ marginTop: "auto" }}>
              {x.ejemplo ? <button className="btn sec" disabled>Contactar</button> : <a className="btn sec" href={`#verificar-${x.codigo}`}>Mi verificación</a>}
              <span className="mono dim" style={{ fontSize: 12 }}>{x.codigo}</span>
            </div>
          </article>
        ))}
      </div>

      <div className="lienzo modelo" style={{ marginTop: 32 }}>
        <div><h2 style={{ color: "#fff" }}>¿Quieres estar en la Red?</h2>
          <p style={{ color: "#CFE0DB", marginTop: 10 }}>Usa una herramienta, registra tu victoria temprana y certifica la habilidad. Estar en la Red no tiene costo: solo se paga la microcertificación. Tu perfil queda visible para personas, empresas y entidades que buscan a alguien que ya lo demostró.</p></div>
        <div className="fila"><a className="btn" href="#h-consultorio">Empezar con Consultorio</a><a className="btn sec claro" href="#planes">Ver planes</a></div>
      </div>
    </section>
  );
}
