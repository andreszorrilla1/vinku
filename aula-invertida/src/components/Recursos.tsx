import { useState } from "react";
import type { Herramienta } from "../data/herramientas";
import { ARTEFACTOS_CONSULTORIO, CASO_LAURA, ESCENARIOS, MENSAJES, CHECKLIST_CONSULTORIO, casoLauraMarkdown, type Artefacto } from "../data/artefactos";
import { certDe } from "../data/certificacion";
import { DILEMAS, CONSENTIMIENTO } from "../data/consultorio-micro";
import { turnoSimulado, evaluarSimulacion, type Perfil, type Progreso } from "../lib/motor";
import { descargar } from "../lib/descarga";
import CapsulaCard from "./CapsulaCard";

interface Props { h: Herramienta; p: Progreso; perfil: Perfil; act: (x: Partial<Progreso>) => void }

export default function Recursos({ h, p, perfil, act }: Props) {
  const [abierto, setAbierto] = useState<string | null>(null);
  const videos = h.capsulas.map((c, n) => ({ c, n })).filter(({ c }) => c.formato === "Video");
  const otras = h.capsulas.map((c, n) => ({ c, n })).filter(({ c }) => c.formato !== "Video");
  const artefactos = h.id === "consultorio" ? ARTEFACTOS_CONSULTORIO : [];
  const sel = artefactos.find((a) => a.id === abierto);
  const hecho = (a: Artefacto) =>
    a.id === "checklist" ? (p.checklist?.length || 0) === CHECKLIST_CONSULTORIO.length
    : a.tipo === "Simulador" ? !!p.simulaciones?.[a.id]?.eval
    : a.id === "numeros" ? !!p.numeros?.meta
    : a.id === "rubrica" ? Object.keys(p.autoeval || {}).length > 0
    : a.id === "dilemas" ? Object.keys(p.dilemas || {}).length === DILEMAS.length : false;

  return (
    <div className="recursos">
      <section className="panel" style={{ marginTop: 0 }}>
        <h2>Practica con casos reales y simulados</h2>
        <p className="dim" style={{ marginTop: 6 }}>Artefactos para hacer, no solo para ver. Todo está abierto: úsalos en el orden que necesites.</p>
        {artefactos.length === 0 && <p className="aviso">Los artefactos de esta herramienta están en diseño.</p>}
        <div className="artefactos">
          {artefactos.map((a) => (
            <button key={a.id} className={`artefacto ${abierto === a.id ? "on" : ""}`} onClick={() => setAbierto(abierto === a.id ? null : a.id)} aria-expanded={abierto === a.id}>
              <span className="fila" style={{ gap: 8, justifyContent: "space-between", width: "100%" }}><span className={a.tipo === "Simulador" || a.tipo === "Caso simulado" ? "etq h" : "etq"}>{a.tipo}</span><span className="mono dim">{hecho(a) ? "Hecho ✓" : `${a.minutos} min`}</span></span>
              <b>{a.titulo}</b>
              <span className="dim">{a.para}</span>
            </button>
          ))}
        </div>
        {sel && (
          <div className="art-panel">
            {sel.id === "caso-laura" && <CasoLaura />}
            {sel.tipo === "Simulador" && <Simulador key={sel.id} id={sel.id} p={p} act={act} />}
            {sel.id === "numeros" && <Numeros p={p} act={act} />}
            {sel.id === "checklist" && <Checklist p={p} act={act} />}
            {sel.id === "mensajes" && <Mensajes />}
            {sel.id === "rubrica" && <Rubrica h={h} p={p} act={act} />}
            {sel.id === "dilemas" && <Dilemas p={p} act={act} />}
            {sel.id === "consentimiento" && <Consentimiento />}
            {sel.id === "piezas" && <Piezas />}
          </div>
        )}
      </section>

      {videos.length > 0 && (
        <section className="panel">
          <h2>Videos</h2>
          <div className="carril videos">
            {videos.map(({ c, n }) => <CapsulaCard key={c.titulo} h={h} c={c} n={n} p={p} perfil={perfil} act={act} />)}
          </div>
        </section>
      )}

      <section className="panel">
        <h2>Infografías y textos</h2>
        {otras.map(({ c, n }) => <CapsulaCard key={c.titulo} h={h} c={c} n={n} p={p} perfil={perfil} act={act} />)}
      </section>
    </div>
  );
}

function useCopiar() {
  const [msg, setMsg] = useState("");
  const copiar = async (t: string) => { try { await navigator.clipboard.writeText(t); setMsg("Copiado."); } catch { setMsg("No se pudo copiar; selecciona el texto."); } setTimeout(() => setMsg(""), 2000); };
  return { msg, copiar };
}

function CasoLaura() {
  const [s, setS] = useState(0);
  const { msg, copiar } = useCopiar();
  const ses = CASO_LAURA.sesiones[s];
  return (
    <>
      <h3>Expediente de práctica: Laura Prueba</h3>
      <p className="nota">Caso ficticio. Practica en un Notion de prueba, nunca mezclado con consultantes reales.</p>
      <p style={{ marginTop: 10 }}><b>Ficha:</b> {CASO_LAURA.ficha}</p>
      <p style={{ marginTop: 6 }}><b>Motivo:</b> {CASO_LAURA.motivo}</p>
      <div className="chips" role="group" aria-label="Sesión">
        {CASO_LAURA.sesiones.map((x, i) => <button key={x.titulo} className="chip chico" aria-pressed={i === s} onClick={() => setS(i)}>Sesión {i + 1}</button>)}
      </div>
      <h3>{ses.titulo}</h3>
      <div className="transcripcion">
        {ses.lineas.map(([q, t], i) => <p key={i}><b className={q === "Laura" ? "laura" : ""}>{q}:</b> {t}</p>)}
      </div>
      <p className="aviso"><b>Ejercicio:</b> {ses.ejercicio}</p>
      <p style={{ marginTop: 10 }}><b>Deberías ver</b></p>
      <ul className="mini">{ses.deberias.map((d) => <li key={d}>{d}</li>)}</ul>
      <div className="fila" style={{ marginTop: 12 }}>
        <button className="btn sal" onClick={() => copiar(ses.lineas.map(([q, t]) => `${q}: ${t}`).join("\n"))}>Copiar transcripción</button>
        <button className="btn sec" onClick={() => descargar("Expediente de practica - Laura Prueba.md", casoLauraMarkdown())}>Descargar el expediente completo</button>
      </div>
      <p className="nota"><b>Pagos:</b> {CASO_LAURA.pagos}</p>
      {msg && <p className="nota" role="status">{msg}</p>}
    </>
  );
}

function Simulador({ id, p, act }: { id: string; p: Progreso; act: (x: Partial<Progreso>) => void }) {
  const e = ESCENARIOS[id];
  const guardado = p.simulaciones?.[id];
  const historial = guardado?.historial?.length ? guardado.historial : [{ role: "assistant" as const, content: e.abre }];
  const [texto, setTexto] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const guardar = (h: typeof historial, ev?: NonNullable<typeof guardado>["eval"]) => act({ simulaciones: { ...p.simulaciones, [id]: { historial: h, eval: ev } } });
  const enviar = async () => {
    const h1 = [...historial, { role: "user" as const, content: texto.trim() }];
    guardar(h1); setTexto(""); setCargando(true); setError("");
    try { const r = await turnoSimulado(e, h1); guardar([...h1, { role: "assistant", content: r }]); }
    catch (x) { setError(x instanceof Error ? x.message : "No se pudo continuar."); }
    setCargando(false);
  };
  const evaluar = async () => {
    setCargando(true); setError("");
    try { guardar(historial, await evaluarSimulacion(e, historial)); }
    catch (x) { setError(x instanceof Error ? x.message : "No se pudo evaluar."); }
    setCargando(false);
  };
  const turnos = historial.filter((m) => m.role === "user").length;
  return (
    <>
      <h3>Simulador · {e.personaje}</h3>
      <p className="dim" style={{ marginTop: 4 }}>{e.contexto}</p>
      <p className="nota">Practica como si fuera real. La IA hace el papel del personaje y al final te devuelve una lectura con criterios.</p>
      <div className="chat sim" aria-live="polite">
        {historial.map((m, i) => <div key={i} className={`burbuja ${m.role === "user" ? "yo" : "ia"}`}>{m.role === "assistant" && <span className="mono quien-sim">{e.personaje.split(",")[0]}</span>}{m.content}</div>)}
      </div>
      {!guardado?.eval && (
        <form className="entrada" onSubmit={(x) => { x.preventDefault(); if (texto.trim()) enviar(); }}>
          <textarea aria-label="Tu respuesta" rows={2} value={texto} onChange={(x) => setTexto(x.target.value)} placeholder="Responde como lo harías de verdad" />
          <button className="btn" disabled={cargando || !texto.trim()}>Enviar</button>
        </form>
      )}
      {cargando && <p className="cargando">…</p>}
      <div className="fila" style={{ marginTop: 10 }}>
        {turnos >= 2 && !guardado?.eval && <button className="btn sal" disabled={cargando} onClick={evaluar}>Terminar y pedir retroalimentación</button>}
        {turnos > 0 && <button className="btn sec" onClick={() => act({ simulaciones: { ...p.simulaciones, [id]: { historial: [] } } })}>Empezar de nuevo</button>}
      </div>
      {guardado?.eval && (
        <div className="lectura">
          {guardado.eval.eval.map((c) => <div key={c.criterio} className={`crit ${c.nivel === "Logrado" ? "ok" : c.nivel === "En proceso" ? "medio" : ""}`}><b>{c.criterio}</b><em>{c.nivel}</em><span>{c.comentario}</span></div>)}
          <p className="accion">{guardado.eval.consejo}</p>
        </div>
      )}
      {error && <p className="aviso" role="alert">{error}</p>}
    </>
  );
}

const CAMPOS = [
  { k: "meta", l: "Lo que necesitas ganar al mes", ej: "6000000" },
  { k: "costos", l: "Costos del consultorio al mes", ej: "1500000" },
  { k: "sesiones", l: "Sesiones que atiendes por semana", ej: "14" },
  { k: "tarifa", l: "Tu tarifa actual por sesión", ej: "120000" },
  { k: "horas", l: "Horas fuera de sesión por semana (historias, cobros, documentos)", ej: "6" },
  { k: "cartera", l: "Cartera pendiente hoy", ej: "480000" },
];
const pesos = (n: number) => `${n < 0 ? "−" : ""}$${Math.abs(Math.round(n)).toLocaleString("es-CO")}`;

function Numeros({ p, act }: { p: Progreso; act: (x: Partial<Progreso>) => void }) {
  const v = p.numeros || {};
  const n = (k: string) => Number((v[k] || "").replace(/[^\d.]/g, "")) || 0;
  const sesMes = n("sesiones") * 4.33;
  const piso = sesMes ? (n("meta") + n("costos")) / sesMes : 0;
  const horasMes = n("horas") * 4.33;
  const ingresoMes = n("tarifa") * sesMes;
  const listo = n("meta") && n("sesiones") && n("tarifa");
  const filas: [string, string][] = listo ? [
    ["Sesiones al mes", sesMes.toFixed(0)],
    ["Tu precio piso", pesos(piso)],
    ["Diferencia con tu tarifa", `${n("tarifa") >= piso ? "+" : ""}${pesos(n("tarifa") - piso)}${n("tarifa") < piso ? " (cobras por debajo de tu piso)" : ""}`],
    ["Horas al mes fuera de sesión", horasMes.toFixed(0)],
    ["Equivalen a sesiones de una hora", horasMes.toFixed(0)],
    ["Cartera frente a un mes de ingresos", ingresoMes ? `${Math.round((n("cartera") / ingresoMes) * 100)} %` : "—"],
  ] : [];
  const csv = () => descargar("Mis numeros del consultorio.csv", ["Concepto;Valor", ...CAMPOS.map((c) => `${c.l};${v[c.k] || ""}`), ...filas.map(([a, b]) => `${a};${b}`)].join("\n"));
  return (
    <>
      <h3>Mis números del consultorio</h3>
      <p className="nota">Tus datos se quedan en este navegador. Usa cifras aproximadas: sirve igual.</p>
      <div className="perfil-campos">
        {CAMPOS.map((c) => <label key={c.k} className="campo">{c.l}<input type="text" inputMode="numeric" value={v[c.k] || ""} placeholder={`Ej.: ${Number(c.ej).toLocaleString("es-CO")}`} onChange={(x) => act({ numeros: { ...v, [c.k]: x.target.value } })} /></label>)}
      </div>
      {listo ? (
        <div className="resultados">
          {filas.map(([a, b]) => <div key={a} className={a === "Tu precio piso" ? "dest" : ""}><span>{a}</span><b>{b}</b></div>)}
          <p className="nota">Precio piso = (lo que necesitas + costos) ÷ sesiones reales del mes. Por debajo de ese valor, pierdes dinero.</p>
          <button className="btn sec" onClick={csv}>Descargar en CSV</button>
        </div>
      ) : <p className="aviso">Llena al menos lo que necesitas ganar, tus sesiones por semana y tu tarifa.</p>}
    </>
  );
}

function Checklist({ p, act }: { p: Progreso; act: (x: Partial<Progreso>) => void }) {
  const ok = p.checklist || [];
  return (
    <>
      <h3>Instalación y primera semana</h3>
      <div className="barra" style={{ marginTop: 8 }}><i style={{ width: `${(ok.length / CHECKLIST_CONSULTORIO.length) * 100}%` }} /></div>
      <ul className="check">
        {CHECKLIST_CONSULTORIO.map((t, i) => (
          <li key={t}><label><input type="checkbox" checked={ok.includes(i)} onChange={() => act({ checklist: ok.includes(i) ? ok.filter((x) => x !== i) : [...ok, i] })} />{t}</label></li>
        ))}
      </ul>
    </>
  );
}

function Mensajes() {
  const { msg, copiar } = useCopiar();
  return (
    <>
      <h3>Mensajes listos para WhatsApp</h3>
      <p className="nota">Cambia lo que está entre «». Ninguno lleva información clínica.</p>
      {MENSAJES.map((m) => (
        <div key={m.titulo} className="plantilla"><b>{m.titulo}</b><p>{m.texto}</p><button className="btn sec" onClick={() => copiar(m.texto)}>Copiar</button></div>
      ))}
      {msg && <p className="nota" role="status">{msg}</p>}
    </>
  );
}

function Rubrica({ h, p, act }: { h: Herramienta; p: Progreso; act: (x: Partial<Progreso>) => void }) {
  const c = certDe(h);
  const v = p.autoeval || {};
  const niveles = ["Todavía no", "En proceso", "Lo hago bien"];
  const listo = c.rubrica.every((r) => v[r] === "Lo hago bien");
  return (
    <>
      <h3>¿Estás lista para certificarte?</h3>
      <p className="nota">Es la rúbrica de la certificación «{c.habilidad}». Sé honesta: es para ti.</p>
      {c.rubrica.map((r) => (
        <div key={r} className="auto">
          <b>{r}</b>
          <div className="chips" role="group" aria-label={r}>{niveles.map((nv) => <button key={nv} className="chip chico" aria-pressed={v[r] === nv} onClick={() => act({ autoeval: { ...v, [r]: nv } })}>{nv}</button>)}</div>
        </div>
      ))}
      {Object.keys(v).length === c.rubrica.length && <p className={listo ? "accion" : "aviso"}>{listo ? "Estás lista: ve a la certificación al final de tu ruta." : "Practica con el expediente de Laura y los simuladores lo que marcaste como pendiente."}</p>}
    </>
  );
}

function Dilemas({ p, act }: { p: Progreso; act: (x: Partial<Progreso>) => void }) {
  const r = p.dilemas || {};
  const aciertos = DILEMAS.filter((d, i) => r[i] === d.correcta).length;
  return (
    <>
      <h3>Seis decisiones difíciles</h3>
      <p className="nota">Situaciones que pasan en la vida real. Elige y lee por qué.</p>
      {DILEMAS.map((d, i) => (
        <div key={i} className="dilema">
          <p><b>{i + 1}.</b> {d.situacion}</p>
          <div className="opciones">
            {d.opciones.map((o, k) => {
              const elegida = r[i] === k, resp = r[i] !== undefined;
              return <button key={k} className={`opcion ${resp && k === d.correcta ? "bien" : ""} ${elegida && k !== d.correcta ? "mal" : ""}`} disabled={resp} onClick={() => act({ dilemas: { ...r, [i]: k } })}>{o}</button>;
            })}
          </div>
          {r[i] !== undefined && <p className={r[i] === d.correcta ? "accion" : "aviso"}><b>{r[i] === d.correcta ? "Bien decidido." : "Revisa esta."}</b> {d.porque}</p>}
        </div>
      ))}
      {Object.keys(r).length === DILEMAS.length && (
        <div className="fila" style={{ marginTop: 12 }}><p><b>{aciertos} de {DILEMAS.length}</b> decisiones alineadas con los principios de Consultorio.</p><button className="btn sec" onClick={() => act({ dilemas: {} })}>Repetir</button></div>
      )}
    </>
  );
}

function Consentimiento() {
  const { msg, copiar } = useCopiar();
  return (
    <>
      <h3>Consentimiento con autorización de transcripción</h3>
      <p className="aviso">Es un modelo para adaptar a tu práctica. Revísalo con tu asesoría jurídica o con Colpsic antes de usarlo.</p>
      <pre className="doc">{CONSENTIMIENTO}</pre>
      <div className="fila" style={{ marginTop: 10 }}>
        <button className="btn sal" onClick={() => copiar(CONSENTIMIENTO)}>Copiar</button>
        <button className="btn sec" onClick={() => descargar("Consentimiento modelo - Consultorio.md", CONSENTIMIENTO)}>Descargar</button>
      </div>
      {msg && <p className="nota" role="status">{msg}</p>}
    </>
  );
}

function Piezas() {
  const ps = [["consultorio-info1", "El recorrido de una sesión"], ["consultorio-info2", "Lo que hace la IA, lo que decides tú"], ["consultorio-info3", "Tu semana con Consultorio"]];
  return (
    <>
      <h3>Infografías para descargar</h3>
      <p className="nota">Formato de post (1080 × 1350). Mantén presionada la imagen en el celular para guardarla.</p>
      <div className="carril piezas-g">
        {ps.map(([f, t]) => <figure key={f}><img src={`piezas/${f}.png`} alt={t} loading="lazy" /><figcaption>{t}</figcaption><a className="btn sec" href={`piezas/${f}.png`} target="_blank" rel="noreferrer">Abrir en tamaño completo</a></figure>)}
      </div>
    </>
  );
}
