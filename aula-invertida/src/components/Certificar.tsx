import { useState } from "react";
import type { Herramienta } from "../data/herramientas";
import { certDe, REQUISITOS } from "../data/certificacion";
import { evaluarPrueba, type Progreso, type PerfilPublico } from "../lib/motor";
import { MICRO, RUBRICA, NIVELES, CASO_DANIEL, GUIA_VIVO, casoDanielMarkdown } from "../data/consultorio-micro";
import { descargar } from "../lib/descarga";

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
      const rub = h.id === "consultorio" ? RUBRICA.filter((r) => r.peso !== "Sustentación").map((r) => `${r.criterio} (nivel Competente: ${r.niveles[2]})`) : c.rubrica;
      const r = await evaluarPrueba(h, c.habilidad, c.caso, rub, texto);
      act({ cert: { ...cert, estado: r.lista ? "en validación" : "en curso", prueba: { texto, ...r } } });
    } catch (e) { setError(e instanceof Error ? e.message : "No se pudo evaluar."); }
    setCargando(false);
  };
  const copiar = async (t: string) => { try { await navigator.clipboard.writeText(t); setAviso("Copiado."); } catch { setError("No se pudo copiar."); } };

  return (
    <section className="panel cert" id="certificar">
      <div className="cert-cab">
        <div>
          <span className="mono" style={{ color: "var(--albar)" }}>Microcertificación · insignia digital</span>
          <h2 style={{ marginTop: 6 }}>{c.habilidad}</h2>
          <p className="dim" style={{ marginTop: 6 }}>La herramienta se puede compartir; la habilidad no. Demuéstrala en una evaluación exhaustiva (evidencia real, caso simulado y evaluación en vivo), obtén tu insignia digital y entra gratis a la Red de profesionales verificados.</p>
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

      {h.certificables.length > 1 && (
        <p className="nota"><b>Habilidades certificables con esta herramienta:</b> {h.certificables.map((x) => `${x.nombre}${x.estado === "Próximamente" ? " (próximamente)" : ""}`).join(" · ")}</p>
      )}
      {h.id === "consultorio" && <FichaConsultorio />}

      {!p.victoria && <p className="aviso">El caso de evaluación se entrega cuando registras tu victoria temprana en el laboratorio. Ya puedes leer la ficha, la rúbrica y el caso.</p>}

      {p.victoria && cert.estado !== "verificada" && (
        <div className="prueba">
          <h3>Caso simulado de evaluación</h3>
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
              {cert.estado === "en validación" && <p className="aviso">Tu prueba pasó la primera lectura. Un evaluador de VinkU la revisará y agendará contigo la evaluación en vivo (30 minutos). En el prototipo, la validación se hace desde <a href="#agenda">Agenda › Para quien evalúa</a>.</p>}
            </div>
          )}
        </div>
      )}

      {cert.estado === "verificada" && (
        <div className="credencial">
          <div className="cred-tarjeta">
            {h.id === "consultorio" ? <img className="badge-img" src="insignias/consultorio.png" alt={`Insignia digital: ${c.habilidad}`} /> : <Sello activo />}
            <div>
              <span className="mono">VinkU edu · Insignia digital · Microcertificación</span>
              <h3>{c.habilidad}</h3>
              <p>Código <b>{cert.codigo}</b> · {new Date(cert.fecha!).toLocaleDateString("es-CO")} · vigente 12 meses</p>
              <p className="dim">Validada por {cert.evaluador}</p>
            </div>
          </div>
          <div className="fila" style={{ marginTop: 12 }}>
            <button className="btn sec" onClick={() => copiar(`Microcertificación VinkU edu (insignia digital): ${c.habilidad}. Código ${cert.codigo}. Verifícala en la Red de VinkU edu.`)}>Copiar insignia para LinkedIn</button>
            <a className="btn sec" href={`#verificar-${cert.codigo}`}>Ver verificación pública</a>
            <button className="btn sec" onClick={() => descargar(`insignia-${cert.codigo}.json`, openBadge(c.habilidad, cert.codigo!, cert.fecha!, h.id === "consultorio" ? MICRO.competencia : c.habilidad))}>Descargar insignia (Open Badges)</button>
          </div>
          <h3 style={{ marginTop: 20 }}>Tu perfil en la Red · gratis</h3>
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

function openBadge(nombre: string, codigo: string, fecha: string, descripcion: string) {
  const hasta = new Date(fecha); hasta.setFullYear(hasta.getFullYear() + 1);
  return JSON.stringify({
    "@context": ["https://www.w3.org/ns/credentials/v2", "https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json"],
    type: ["VerifiableCredential", "OpenBadgeCredential"],
    id: `https://«dominio-vinkuedu»/credenciales/${codigo}`,
    name: nombre,
    issuer: { id: "https://«dominio-vinkuedu»/emisor", type: ["Profile"], name: "VinkU edu" },
    validFrom: fecha, validUntil: hasta.toISOString(),
    credentialSubject: { type: ["AchievementSubject"], achievement: { type: ["Achievement"], achievementType: "MicroCredential", name: nombre, description: descripcion,
      criteria: { narrative: "Evidencia real de uso, caso simulado de evaluación y evaluación en vivo (simulación y sustentación), con nivel Competente o superior en todos los criterios de la rúbrica." } } },
    nota: "Ejemplo del prototipo: sin firma criptográfica. La plataforma real la firma al emitirla.",
  }, null, 2);
}

function FichaConsultorio() {
  return (
    <div className="ficha-micro">
      <details>
        <summary>Ficha de la microcertificación</summary>
        <p style={{ marginTop: 8 }}><b>Competencia:</b> {MICRO.competencia}</p>
        <p style={{ marginTop: 8 }}><b>Resultados de aprendizaje</b></p>
        <ul className="mini">{MICRO.resultados.map((r) => <li key={r}>{r}</li>)}</ul>
        <p style={{ marginTop: 8 }}><b>Evidencias:</b> {MICRO.evidencias.join(" · ")}</p>
        <p style={{ marginTop: 8 }}><b>Vigencia:</b> {MICRO.vigencia}</p>
        <p style={{ marginTop: 8 }}><b>Resultado posible:</b> {MICRO.resultado}</p>
      </details>
      <details>
        <summary>Rúbrica por niveles</summary>
        <p className="nota">Se otorga con «Competente» o más en los cinco criterios.</p>
        <div className="scroll"><table className="tabla-r">
          <thead><tr><th>Criterio</th>{NIVELES.map((n) => <th key={n}>{n}</th>)}</tr></thead>
          <tbody>{RUBRICA.map((r) => <tr key={r.id}><td>{r.criterio}<br /><span className="dim" style={{ fontWeight: 400 }}>{r.peso}</span></td>{r.niveles.map((n, i) => <td key={i}>{n}</td>)}</tr>)}</tbody>
        </table></div>
      </details>
      <details>
        <summary>Caso de evaluación: Daniel Prueba</summary>
        <p className="nota">Caso ficticio, distinto al de práctica.</p>
        <p style={{ marginTop: 8 }}><b>Ficha:</b> {CASO_DANIEL.ficha}</p>
        <p style={{ marginTop: 6 }}>{CASO_DANIEL.antecedentes}</p>
        <div className="transcripcion">{CASO_DANIEL.transcripcion.map(([q, t], i) => <p key={i}><b className={q === "Daniel" ? "laura" : ""}>{q}:</b> {t}</p>)}</div>
        {CASO_DANIEL.eventos.map((e) => <p key={e.titulo} className="aviso"><b>{e.titulo}:</b> {e.texto}</p>)}
        <p style={{ marginTop: 10 }}><b>Entregables</b></p>
        <ol className="lista">{CASO_DANIEL.entregables.map((e) => <li key={e}>{e}</li>)}</ol>
        <button className="btn sec" style={{ marginTop: 10 }} onClick={() => descargar("Caso de evaluacion - Daniel Prueba.md", casoDanielMarkdown())}>Descargar el caso completo</button>
      </details>
      <details>
        <summary>Evaluación en vivo (30 minutos)</summary>
        <ul className="mini">{GUIA_VIVO.agenda.map((a) => <li key={a.min}><b>{a.min} · {a.bloque}:</b> {a.texto}</li>)}</ul>
        <p className="nota">Las preguntas de la sustentación se conocen de antemano: lo que se evalúa es tu criterio, no la sorpresa.</p>
        <ul className="mini">{GUIA_VIVO.sustentacion.map((q) => <li key={q}>{q}</li>)}</ul>
      </details>
    </div>
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
