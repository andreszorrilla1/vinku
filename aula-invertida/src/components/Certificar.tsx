import { useState } from "react";
import type { Herramienta } from "../data/herramientas";
import { certDe, REQUISITOS } from "../data/certificacion";
import { evaluarPrueba, type Progreso, type PerfilPublico } from "../lib/motor";

interface Props { h: Herramienta; p: Progreso; guardar: (p: Progreso) => void; perfilRed: PerfilPublico; setPerfilRed: (x: PerfilPublico) => void }

export default function Certificar({ h, p, guardar, perfilRed, setPerfilRed }: Props) {
  const c = certDe(h);
  const [texto, setTexto] = useState(p.cert?.prueba?.texto || "");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const cert = p.cert || { estado: "en curso" as const };
  const act = (x: Partial<Progreso>) => guardar({ ...p, ...x, actualizado: new Date().toISOString() });
  const hecho = {
    evidencia: !!p.victoria,
    prueba: !!cert.prueba?.lista,
    validacion: cert.estado === "verificada",
  };
  const enviar = async () => {
    setCargando(true); setError("");
    try {
      const r = await evaluarPrueba(h, c.habilidad, c.caso, c.rubrica, texto);
      act({ cert: { ...cert, estado: r.lista ? "en validación" : "en curso", prueba: { texto, ...r } } });
    } catch (e) { setError(e instanceof Error ? e.message : "No se pudo evaluar."); }
    setCargando(false);
  };
  const copiar = async (t: string) => { try { await navigator.clipboard.writeText(t); setAviso("Copiado."); } catch { setError("No se pudo copiar."); } };

  return (
    <section className="panel cert" id="certificar">
      <div className="cert-cab">
        <div>
          <span className="mono" style={{ color: "var(--albar)" }}>Certificación de habilidad</span>
          <h2 style={{ marginTop: 6 }}>{c.habilidad}</h2>
          <p className="dim" style={{ marginTop: 6 }}>La herramienta se puede compartir; la habilidad no. Demuéstrala con evidencia, una prueba práctica y una validación humana, y entra a la Red de profesionales verificados.</p>
        </div>
        <Sello activo={hecho.validacion} />
      </div>

      <ol className="requisitos">
        {REQUISITOS.map((r) => (
          <li key={r.id} className={hecho[r.id] ? "ok" : ""}>
            <b>{r.nombre}</b><span>{r.detalle}</span>
            <em>{hecho[r.id] ? "Cumplido" : r.id === "validacion" && cert.estado === "en validación" ? "En revisión" : "Pendiente"}</em>
          </li>
        ))}
      </ol>

      {!p.victoria && <p className="aviso">Se desbloquea cuando registras tu victoria temprana en el laboratorio.</p>}

      {p.victoria && cert.estado !== "verificada" && (
        <div className="prueba">
          <h3>Prueba práctica</h3>
          <p>{c.caso}</p>
          <p className="nota"><b>Rúbrica:</b> {c.rubrica.join(" · ")}</p>
          <label className="campo">Tu entrega y tus decisiones
            <textarea rows={5} value={texto} onChange={(x) => setTexto(x.target.value)} disabled={cert.estado === "en validación"} placeholder="Pega lo que produjiste con la herramienta y explica por qué decidiste así" />
          </label>
          {cert.estado !== "en validación" && <div className="fila" style={{ marginTop: 10 }}><button className="btn" disabled={cargando || texto.trim().length < 20} onClick={enviar}>Enviar a primera lectura</button></div>}
          {cargando && <p className="cargando">La IA está leyendo tu prueba con la rúbrica…</p>}
          {cert.prueba && (
            <div className="lectura">
              {cert.prueba.eval.map((e) => (
                <div key={e.criterio} className={`crit ${e.nivel === "Logrado" ? "ok" : e.nivel === "En proceso" ? "medio" : ""}`}><b>{e.criterio}</b><em>{e.nivel}</em><span>{e.comentario}</span></div>
              ))}
              <p className="nota">{cert.prueba.resumen}</p>
              {cert.estado === "en validación" && <p className="aviso">Tu prueba pasó la primera lectura. Un evaluador de VinkU la revisará y agendará contigo 15 minutos. En el prototipo, la validación se hace desde <a href="#agenda">Agenda › Para quien evalúa</a>.</p>}
            </div>
          )}
        </div>
      )}

      {cert.estado === "verificada" && (
        <div className="credencial">
          <div className="cred-tarjeta">
            <Sello activo />
            <div>
              <span className="mono">VinkU edu · Habilidad verificada</span>
              <h3>{c.habilidad}</h3>
              <p>Código <b>{cert.codigo}</b> · {new Date(cert.fecha!).toLocaleDateString("es-CO")} · vigente 12 meses</p>
              <p className="dim">Validada por {cert.evaluador}</p>
            </div>
          </div>
          <div className="fila" style={{ marginTop: 12 }}>
            <button className="btn sec" onClick={() => copiar(`Habilidad verificada por VinkU edu: ${c.habilidad}. Código ${cert.codigo}. Verifícala en vinkuedu · Red.`)}>Copiar para LinkedIn</button>
            <a className="btn sec" href={`#verificar-${cert.codigo}`}>Ver verificación pública</a>
          </div>
          <h3 style={{ marginTop: 20 }}>Tu perfil en la Red</h3>
          {c.requisitoRed && <p className="nota">{c.requisitoRed}</p>}
          <div className="perfil-campos">
            <label className="campo">Nombre<input type="text" value={perfilRed.nombre} onChange={(x) => setPerfilRed({ ...perfilRed, nombre: x.target.value })} /></label>
            <label className="campo">Ciudad<input type="text" value={perfilRed.ciudad} onChange={(x) => setPerfilRed({ ...perfilRed, ciudad: x.target.value })} /></label>
            <label className="campo">Servicio que ofreces<input type="text" value={perfilRed.servicio} onChange={(x) => setPerfilRed({ ...perfilRed, servicio: x.target.value })} placeholder={c.servicioRed} /></label>
            <label className="campo">Precio desde<input type="text" value={perfilRed.desde} onChange={(x) => setPerfilRed({ ...perfilRed, desde: x.target.value })} placeholder="$120.000" /></label>
          </div>
          <div className="fila" style={{ marginTop: 12 }}>
            <button className="btn" disabled={!perfilRed.nombre || !perfilRed.servicio} onClick={() => { setPerfilRed({ ...perfilRed, publicado: true }); location.hash = "red"; }}>{perfilRed.publicado ? "Ver mi perfil en la Red" : "Publicar mi perfil en la Red"}</button>
          </div>
        </div>
      )}
      {aviso && <p className="nota" role="status">{aviso}</p>}
      {error && <p className="aviso" role="alert">{error}</p>}
    </section>
  );
}

export function Sello({ activo, tam = 92 }: { activo?: boolean; tam?: number }) {
  return (
    <svg width={tam} height={tam} viewBox="0 0 100 100" aria-hidden="true" style={{ flex: "none", opacity: activo ? 1 : 0.35 }}>
      <circle cx="50" cy="50" r="46" fill={activo ? "#0D2F33" : "none"} stroke={activo ? "#FF8A4C" : "#86CBB9"} strokeWidth="4" strokeDasharray={activo ? "0" : "6 6"} />
      <path d="M30 52V60a20 20 0 0 0 40 0v-8" fill="none" stroke="#EEF4F1" strokeWidth="8" strokeLinecap="round" />
      <path d="M30 38Q50 22 70 38" fill="none" stroke="#86CBB9" strokeWidth="5" strokeLinecap="round" />
      <circle cx="30" cy="39" r="6" fill="#0D2F33" stroke="#86CBB9" strokeWidth="4" />
      <circle cx="70" cy="39" r="7" fill="#FF8A4C" />
    </svg>
  );
}
