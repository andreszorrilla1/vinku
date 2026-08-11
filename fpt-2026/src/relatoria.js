/* ============================================================
   Congreso FPT 2026 — Relatoría visual inmersiva
   Una plantilla, 13 instancias por dato. Lee ?panel=<id> de la
   URL, toma el panel de la fuente única y despliega las 4 etapas
   (Problema · Reto · Solución · Sinergia) + cierre con descarga.
   ============================================================ */

const esPH = (v) => typeof v === 'string' && v.trim().startsWith('‹placeholder');
const limpio = (v) => (v && !esPH(v) ? v.trim() : '');

const ETAPAS = [
  { key: 'problema', etiqueta: 'El problema' },
  { key: 'reto', etiqueta: 'El reto' },
  { key: 'solucion', etiqueta: 'La solución' },
  { key: 'sinergia', etiqueta: 'La sinergia' },
];

function citaHTML(cita, colorVar) {
  const txt = limpio(cita?.texto);
  if (!txt) return `<p class="rel-vacio">Cita textual pendiente de la relatoría final.</p>`;
  const autor = limpio(cita?.autor);
  const rol = limpio(cita?.rol);
  return `<blockquote>“${txt}”</blockquote>${autor ? `<cite><b>${autor}</b>${rol ? rol : ''}</cite>` : ''}`;
}

function render(panel) {
  const cont = document.getElementById('rel-app');
  const titulo = esPH(panel.titulo) ? `Panel ${panel.numero}` : panel.titulo;
  const etiqConf = { alto: 'Trazabilidad alta', medio: 'Trazabilidad media', bajo: 'Trazabilidad baja' };
  const sub = limpio(panel.subtitulo) || limpio(panel.anclajePolitico);
  const sintCaliente = limpio(panel.sintesisEnCaliente);
  const pdf = panel.recursos?.pdfRelatoria;

  const tarjetas = ETAPAS.map((e, i) => {
    const bloque = panel.captura?.[e.key] || {};
    const sintesis = limpio(bloque.sintesis);
    return `
      <section class="rel-tarjeta" data-idx="${i}">
        <div class="rel-tarjeta__inner">
          <div class="rel-reveal">
            <span class="rel-etapa">${e.etiqueta}</span>
            ${sintesis ? `<div class="rel-tarjeta__sintesis">${sintesis}</div>` : `<p class="rel-vacio">Síntesis de esta etapa pendiente de la relatoría final del panel.</p>`}
          </div>
          <div class="rel-cita rel-reveal">${citaHTML(bloque.cita)}</div>
        </div>
      </section>`;
  }).join('');

  cont.innerHTML = `
    <div class="rel-progreso" id="rel-progreso"></div>
    <header class="rel-portada">
      <div class="rel-portada__inner">
        <span class="rel-portada__num">Relatoría estratégica · Panel ${panel.numero} · 2026</span>
        <h1>${titulo}</h1>
        ${sub ? `<p class="rel-portada__sub">${sub}</p>` : ''}
        <div class="rel-portada__meta">
          <span class="chip-confianza" data-nivel="${panel.confianza}">${etiqConf[panel.confianza] || panel.confianza}</span>
          ${panel.estado !== 'final' ? `<span class="etiqueta" style="color:var(--gobs-azul-claro)">En sistematización</span>` : ''}
        </div>
        <div class="rel-scroll-hint">Desliza para recorrer ↓</div>
      </div>
    </header>

    ${tarjetas}

    <section class="rel-cierre">
      <div class="rel-cierre__inner">
        <span class="etiqueta">Síntesis en caliente</span>
        <blockquote>${sintCaliente ? `“${sintCaliente}”` : 'El territorio cobra valor.'}</blockquote>
        <div class="rel-cierre__acciones">
          ${pdf ? `<a class="btn" href="${pdf}" download>Descargar relatoría (PDF)</a>` : `<button class="btn" disabled style="opacity:.5;cursor:not-allowed">Relatoría PDF próximamente</button>`}
          <a class="btn btn--fantasma" style="border-color:var(--gobs-cian);color:var(--gobs-cian)" href="index.html#repositorio">Volver al repositorio</a>
        </div>
        <div class="rel-cierre__logo"><span data-logo data-logo-tono="claro"></span></div>
      </div>
    </section>`;

  if (window.inyectarLogos) window.inyectarLogos(cont);

  // Revelado por scroll
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) en.target.classList.add('visible'); });
  }, { threshold: 0.2 });
  cont.querySelectorAll('.rel-reveal').forEach((n) => io.observe(n));

  // Barra de progreso de lectura
  const barra = document.getElementById('rel-progreso');
  const onScroll = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    barra.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  document.title = `${titulo} · Relatoría FPT 2026`;
}

function noEncontrado(id) {
  document.getElementById('rel-app').innerHTML = `
    <div class="rel-aviso">
      <h2 style="font-family:var(--font-serif)">Panel no encontrado</h2>
      <p>No hay un panel con el identificador <code>${id || '(vacío)'}</code>.</p>
      <a class="btn" href="index.html#repositorio">Ir al repositorio</a>
    </div>`;
}

document.addEventListener('DOMContentLoaded', () => {
  const id = new URLSearchParams(location.search).get('panel') || window.__PANEL_ID__;
  const arranque = () => {
    if (!window.FPT) return setTimeout(arranque, 40);
    const panel = (window.FPT.paneles || []).find((p) => p.id === id);
    if (panel) render(panel); else noEncontrado(id);
  };
  arranque();
});
