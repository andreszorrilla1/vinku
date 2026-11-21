import { useState } from "react";
import type { Capsula, Herramienta } from "../data/herramientas";
import { adaptarCapsula, type Perfil, type Progreso } from "../lib/motor";

interface Props { h: Herramienta; c: Capsula; n: number; p: Progreso; perfil: Perfil; act: (x: Partial<Progreso>) => void }

export default function CapsulaCard({ h, c, n, p, perfil, act }: Props) {
  const [abierta, setAbierta] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const vistas = p.capsulasVistas;
  const marcar = (extra: Partial<Progreso> = {}) => act({ ...extra, capsulasVistas: vistas.includes(n) ? vistas : [...vistas, n] });
  const adaptar = async () => {
    if (c.formato !== "Texto") return;
    setCargando(true); setError("");
    try { const t = await adaptarCapsula(h, perfil, c.titulo, c.cuerpo.join(" ")); marcar({ adaptadas: { ...p.adaptadas, [n]: t } }); }
    catch (e) { setError(e instanceof Error ? e.message : "No se pudo adaptar."); }
    setCargando(false);
  };
  return (
    <article className="capsula">
      <div className="cap-cab">
        <span className={c.formato === "Texto" ? "etq" : "etq h"}>{c.formato} · {c.minutos} min</span>
        {vistas.includes(n) && <span className="mono dim">Vista ✓</span>}
      </div>
      <h3 style={{ marginTop: 8 }}>{c.titulo}</h3>
      {c.formato === "Video" && c.serie && <p className="mono dim" style={{ fontSize: 12 }}>{c.serie}</p>}
      <p className="dim">{c.idea}</p>
      {c.formato === "Video" && c.src && (
        <video className="clip" controls playsInline preload="none" poster={`videos/${c.src}.jpg`} src={`videos/${c.src}.mp4`} onPlay={() => marcar()} />
      )}
      {c.formato === "Video" && !c.src && (
        <>
          <button className="video" onClick={() => { marcar(); setAbierta(!abierta); }} aria-expanded={abierta}>
            <svg width="52" height="52" viewBox="0 0 56 56" aria-hidden="true"><circle cx="28" cy="28" r="27" fill="#FF8A4C" /><path d="M23 18l15 10-15 10z" fill="#fff" /></svg>
            <span>Video en producción · ver el guion</span>
          </button>
          {abierta && c.guion.length > 0 && <ol className="lista">{c.guion.map((g) => <li key={g}>{g}</li>)}</ol>}
        </>
      )}
      {c.formato === "Infográfico" && c.pasos && (
        <div className="info" style={{ gridTemplateColumns: `repeat(${c.pasos.length},minmax(0,1fr))` }} onClick={() => marcar()} onMouseEnter={() => !vistas.includes(n) && marcar()}>
          {c.pasos.map((x, k) => <div key={x} className={k === c.pasos!.length - 1 ? "lleno" : k === 0 ? "abierto" : ""}><i />{x}</div>)}
        </div>
      )}
      {c.formato === "Infográfico" && c.comparacion && (
        <div className="compara" onClick={() => marcar()} onMouseEnter={() => !vistas.includes(n) && marcar()}>
          <b>{c.comparacion.izq}</b><b>{c.comparacion.der}</b>
          {c.comparacion.filas.map(([a, b]) => [<span key={a}>{a}</span>, <span key={b} className="tu">{b}</span>])}
        </div>
      )}
      {c.formato === "Texto" && (
        abierta || p.adaptadas[n] ? (
          <div className="texto">
            {(p.adaptadas[n] ? p.adaptadas[n].split(/\n+/) : c.cuerpo).map((x, k) => <p key={k}>{x}</p>)}
            {p.adaptadas[n] && <p className="nota">Adaptada a tu caso por la IA.</p>}
            {!p.adaptadas[n] && <button className="btn sec" disabled={cargando} onClick={adaptar}>Adáptala a mi caso con IA</button>}
            {cargando && <p className="cargando">Adaptando…</p>}
            {error && <p className="aviso">{error}</p>}
          </div>
        ) : <button className="btn sec" style={{ marginTop: 10 }} onClick={() => { setAbierta(true); marcar(); }}>Leer · {c.minutos} min</button>
      )}
    </article>
  );
}
