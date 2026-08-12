/* ============================================================
   Congreso FPT 2026 — Relatoría visual inmersiva
   Sirve en dos modos:
   · Página propia (relatoria.html?panel=<id>) — URL compartible.
   · Overlay dentro del Home — window.abrirRelatoria(id) abre la
     relatoría como capa a pantalla completa, sin cambiar de página.
   ============================================================ */
(function () {
const esPH = (v) => typeof v === 'string' && v.trim().startsWith('‹placeholder');
const limpio = (v) => (v && !esPH(v) ? v.trim() : '');

const ETAPAS = [
  { key: 'problema', etiqueta: 'El problema' },
  { key: 'reto', etiqueta: 'El reto' },
  { key: 'solucion', etiqueta: 'La solución' },
  { key: 'sinergia', etiqueta: 'La sinergia' },
];

function citaHTML(cita) {
  const txt = limpio(cita?.texto);
  if (!txt) return `<p class="rel-vacio">Cita textual pendiente de la relatoría final.</p>`;
  const autor = limpio(cita?.autor);
  const rol = limpio(cita?.rol);
  return `<blockquote>“${txt}”</blockquote>${autor ? `<cite><b>${autor}</b>${rol ? rol : ''}</cite>` : ''}`;
}

function navPaneles(paneles, idx) {
  const prev = idx > 0 ? paneles[idx - 1] : null;
  const next = idx < paneles.length - 1 ? paneles[idx + 1] : null;
  const rot = (p) => (esPH(p.titulo) ? `Panel ${p.numero}` : p.titulo);
  const btn = (p, dir) =>
    p
      ? `<a class="rel-flip rel-flip--${dir}" href="relatoria.html?panel=${p.id}" aria-label="${dir === 'prev' ? 'Panel anterior' : 'Panel siguiente'}">
           <span class="rel-flip__ico">${dir === 'prev' ? '‹' : '›'}</span>
           <span class="rel-flip__txt"><small>${dir === 'prev' ? 'Anterior' : 'Siguiente'}</small><b>${rot(p)}</b></span>
         </a>`
      : `<span class="rel-flip rel-flip--${dir} rel-flip--off" aria-hidden="true"><span class="rel-flip__ico">${dir === 'prev' ? '‹' : '›'}</span></span>`;
  return { prev, next, html: `<nav class="rel-flip-nav">${btn(prev, 'prev')}${btn(next, 'next')}</nav>` };
}

// Renderiza un panel en `cont`. `scroller` es el elemento que hace scroll
// (window en página propia; el overlay en modo capa).
function render(panel, paneles, idx, cont, scroller) {
  scroller = scroller || window;
  const titulo = esPH(panel.titulo) ? `Panel ${panel.numero}` : panel.titulo;
  const etiqConf = { alto: 'Trazabilidad alta', medio: 'Trazabilidad media', bajo: 'Trazabilidad baja' };
  const sub = limpio(panel.subtitulo) || limpio(panel.anclajePolitico);
  const sintCaliente = limpio(panel.sintesisEnCaliente);
  const pdf = panel.recursos?.pdfRelatoria;
  const nav = navPaneles(paneles, idx);

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
    ${nav.html}
    <header class="rel-portada">
      <div class="rel-portada__inner">
        <span class="rel-portada__num">Relatoría estratégica · Panel ${panel.numero} · ${idx + 1} de ${paneles.length} · 2026</span>
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
          <a class="btn btn--fantasma rel-volver" style="border-color:var(--gobs-cian);color:var(--gobs-cian)" href="index.html#repositorio">Volver al repositorio</a>
        </div>
        ${nav.next ? `<p style="margin-top:var(--sp-8)"><a href="relatoria.html?panel=${nav.next.id}" style="color:var(--gobs-cian);font-family:var(--font-sans);font-weight:600;text-decoration:none">Siguiente panel: ${esPH(nav.next.titulo) ? 'Panel ' + nav.next.numero : nav.next.titulo} →</a></p>` : ''}
        <div class="rel-cierre__logo"><span data-logo="gobs" data-logo-tono="claro"></span></div>
      </div>
    </section>`;

  if (window.inyectarLogos) window.inyectarLogos(cont);

  // Revelado por scroll
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) en.target.classList.add('visible'); });
  }, { root: scroller === window ? null : scroller, threshold: 0.15 });
  cont.querySelectorAll('.rel-reveal').forEach((n) => io.observe(n));

  // Barra de progreso de lectura
  const barra = cont.querySelector('#rel-progreso');
  const onScroll = () => {
    const top = scroller === window ? document.documentElement.scrollTop : scroller.scrollTop;
    const max = scroller === window
      ? document.documentElement.scrollHeight - document.documentElement.clientHeight
      : scroller.scrollHeight - scroller.clientHeight;
    barra.style.width = (max > 0 ? (top / max) * 100 : 0) + '%';
  };
  (scroller === window ? window : scroller).addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Navegación entre paneles (re-render en el mismo contenedor)
  const irA = (p) => {
    if (!p) return;
    render(p, paneles, paneles.findIndex((x) => x.id === p.id), cont, scroller);
    (scroller === window ? window : scroller).scrollTo(0, 0);
  };
  cont.querySelectorAll('a[href*="relatoria.html?panel="]').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const id = new URL(a.href, location.href).searchParams.get('panel');
      irA((paneles).find((x) => x.id === id));
    });
  });
  cont._irA = irA;
  cont._nav = nav; // prev/next para el teclado

  document.title = `${titulo} · Relatoría FPT 2026`;
}

// Teclado: flechas ← → navegan el contenedor activo (overlay u página)
let _tecladoRel = false;
function activarTecladoRel() {
  if (_tecladoRel) return; _tecladoRel = true;
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const ov = document.getElementById('rel-overlay');
    const cont = (ov && !ov.hidden) ? ov.querySelector('#rel-app') : document.getElementById('rel-app');
    if (!cont || !cont._irA || !cont._nav) return;
    cont._irA(e.key === 'ArrowRight' ? cont._nav.next : cont._nav.prev);
  });
}

/* ---------- Modo página propia ---------- */
function noEncontrado(cont, id) {
  cont.innerHTML = `<div class="rel-aviso">
      <h2 style="font-family:var(--font-serif)">Panel no encontrado</h2>
      <p>No hay un panel con el identificador <code>${id || '(vacío)'}</code>.</p>
      <a class="btn" href="index.html#repositorio">Ir al repositorio</a>
    </div>`;
}

/* ---------- Modo overlay (dentro del Home) ---------- */
function cerrarRelatoria() {
  const ov = document.getElementById('rel-overlay');
  if (ov) { ov.hidden = true; document.body.style.overflow = ''; }
}
window.abrirRelatoria = function (id) {
  const paneles = (window.FPT && window.FPT.paneles) || [];
  const idx = paneles.findIndex((p) => p.id === id);
  if (idx < 0) return;
  // cierra la ficha de hoja de ruta si estaba abierta
  const rm = document.getElementById('rm-overlay');
  if (rm) rm.dataset.abierto = 'false';
  let ov = document.getElementById('rel-overlay');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'rel-overlay';
    ov.innerHTML = '<button class="rel-cerrar" aria-label="Cerrar relatoría">×</button><div id="rel-app"></div>';
    document.body.appendChild(ov);
    ov.querySelector('.rel-cerrar').addEventListener('click', cerrarRelatoria);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !ov.hidden) cerrarRelatoria(); });
  }
  ov.hidden = false;
  document.body.style.overflow = 'hidden';
  render(paneles[idx], paneles, idx, ov.querySelector('#rel-app'), ov);
  ov.scrollTo(0, 0);
  activarTecladoRel();
};

document.addEventListener('DOMContentLoaded', () => {
  const standalone = document.getElementById('rel-app'); // existe solo en relatoria.html
  const arranque = () => {
    if (!window.FPT) return setTimeout(arranque, 40);
    if (standalone) {
      const id = new URLSearchParams(location.search).get('panel') || window.__PANEL_ID__;
      const paneles = window.FPT.paneles || [];
      const idx = paneles.findIndex((p) => p.id === id);
      if (idx >= 0) render(paneles[idx], paneles, idx, standalone, window);
      else noEncontrado(standalone, id);
      activarTecladoRel();
    }
  };
  arranque();

  // Modo embebido (Home): interceptar enlaces a relatorías → overlay
  if (!standalone) {
    document.addEventListener('click', (e) => {
      const a = e.target.closest && e.target.closest('a[href*="relatoria.html?panel="]');
      if (!a || a.closest('#rel-overlay')) return;
      e.preventDefault();
      const id = new URL(a.href, location.href).searchParams.get('panel');
      if (window.abrirRelatoria) window.abrirRelatoria(id);
    });
  }
});
})();
