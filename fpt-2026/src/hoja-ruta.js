/* ============================================================
   Congreso FPT 2026 — Hoja de ruta como LÍNEA DE TIEMPO horizontal
   Línea estilizada con pines numerados (número de panel). Al hacer
   click se abre una ventana con la ficha (problema · propuestas ·
   cómo hacerlo posible) y el botón de descarga.
   Navegación: swipe / arrastre / flechas.
   ============================================================ */

const esPH = (v) => typeof v === 'string' && v.trim().startsWith('‹placeholder');
const limpio = (v) => (v && !esPH(v) ? v.trim() : '');
const tituloDe = (p) => (esPH(p.titulo) ? `Panel ${p.numero}` : p.titulo);

function abrirModal(panel) {
  const ov = document.getElementById('rm-overlay');
  if (!ov) return;
  const problema = limpio(panel.captura?.problema?.sintesis);
  const cita = panel.captura?.problema?.cita || {};
  const citaTxt = limpio(cita.texto);
  const acciones = (panel.comunicaciones?.acciones || []).filter((a) => a && (a.titulo || typeof a === 'string'));
  const pasos = (panel.pasos || []).filter((a) => a && a.titulo);
  const pdf = panel.recursos?.pdfHojaRuta;
  const titulo = tituloDe(panel);
  const vacio = (t) => `<p class="rm__vacio">${t}</p>`;
  const etiqConf = { alto: 'Confianza alta', medio: 'Confianza media', bajo: 'Confianza baja' };
  const li = (a) =>
    typeof a === 'string' ? `<li>${a}</li>` : `<li><b>${a.titulo}</b>${a.detalle ? `<span>${a.detalle}</span>` : ''}</li>`;

  ov.querySelector('.rm__cuerpo').innerHTML = `
    <div class="rm__num">Panel ${panel.numero} · <span class="chip-confianza" data-nivel="${panel.confianza}" style="vertical-align:middle">${etiqConf[panel.confianza] || panel.confianza}</span></div>
    <h3 class="rm__titulo">${titulo}</h3>
    <div class="rm__bloque">
      <h5>El problema a resolver</h5>
      ${problema ? `<p>${problema}</p>` : vacio('Ficha en sistematización.')}
    </div>
    ${citaTxt ? `<div class="rm__bloque"><blockquote class="rm__cita">“${citaTxt}”${limpio(cita.autor) ? `<cite>${limpio(cita.autor)}${limpio(cita.rol) ? ` · ${limpio(cita.rol)}` : ''}</cite>` : ''}</blockquote></div>` : ''}
    <div class="rm__bloque">
      <h5>Propuestas · qué hacer</h5>
      ${acciones.length ? `<ul class="rm__lista">${acciones.map(li).join('')}</ul>` : vacio('Propuestas por definir.')}
    </div>
    ${pasos.length ? `<div class="rm__bloque"><h5>Cómo hacerlo posible</h5><ol class="rm__lista rm__lista--num">${pasos.map(li).join('')}</ol></div>` : ''}
    <div class="rm__pie">
      ${pdf ? `<a class="btn" href="${pdf}" download>⭳ Descargar hoja de ruta</a>` : `<button class="btn" disabled title="El PDF se habilita cuando esté disponible" style="opacity:.5;cursor:not-allowed">⭳ Descarga próximamente</button>`}
      <a class="btn btn--fantasma" href="relatoria.html?panel=${panel.id}">Ver relatoría del panel</a>
    </div>
  `;
  ov.dataset.abierto = 'true';
  document.body.style.overflow = 'hidden';
  ov.querySelector('.rm__cerrar').focus();
}

function cerrarModal() {
  const ov = document.getElementById('rm-overlay');
  if (!ov) return;
  ov.dataset.abierto = 'false';
  document.body.style.overflow = '';
}

function construirRuta(paneles) {
  const cont = document.querySelector('[data-modulo="hoja-de-ruta"]');
  if (!cont || !paneles.length) return;
  cont.classList.remove('en-construccion');
  cont.classList.add('tl-wrap');
  cont.innerHTML = '';

  const pista = document.createElement('div');
  pista.className = 'tl-scroll';

  const tl = document.createElement('div');
  tl.className = 'tl';
  tl.style.setProperty('--n', paneles.length);

  // Línea base + relleno de progreso
  tl.innerHTML = '<span class="tl__linea" aria-hidden="true"></span><span class="tl__linea tl__linea--fill" aria-hidden="true"></span>';

  paneles.forEach((panel, i) => {
    const item = document.createElement('div');
    item.className = 'tl__item';
    item.dataset.estado = panel.estado;
    const etiqEstado = { final: 'Relatoría final', transcripcion: 'En sistematización', pendiente: 'Próximamente' }[panel.estado] || '';
    item.innerHTML = `
      <div class="tl__titulo">${tituloDe(panel)}</div>
      <button class="tl__nodo" type="button" aria-label="Abrir ficha del Panel ${panel.numero}: ${tituloDe(panel)}">
        <span class="tl__num">${panel.numero}</span>
      </button>
      <div class="tl__estado">${etiqEstado}</div>`;
    const abrir = () => abrirModal(panel);
    const btn = item.querySelector('.tl__nodo');
    btn.addEventListener('click', abrir);
    tl.appendChild(item);
  });

  pista.appendChild(tl);
  cont.appendChild(pista);

  // Flechas
  const flechas = document.createElement('div');
  flechas.className = 'tl-flechas';
  flechas.innerHTML = `
    <button class="tl-flecha" data-dir="-1" aria-label="Anterior">‹</button>
    <button class="tl-flecha" data-dir="1" aria-label="Siguiente">›</button>`;
  cont.appendChild(flechas);
  const paso = () => Math.max(240, pista.clientWidth * 0.6);
  flechas.querySelectorAll('.tl-flecha').forEach((b) =>
    b.addEventListener('click', () => pista.scrollBy({ left: b.dataset.dir * paso(), behavior: 'smooth' }))
  );

  // Progreso (relleno de la línea + barra inferior)
  const fill = tl.querySelector('.tl__linea--fill');
  const barra = document.createElement('div');
  barra.className = 'tl-progreso';
  barra.innerHTML = '<span></span>';
  cont.appendChild(barra);
  const relleno = barra.querySelector('span');
  const actualizar = () => {
    const max = pista.scrollWidth - pista.clientWidth;
    const pct = max > 0 ? pista.scrollLeft / max : 0;
    relleno.style.width = pct * 100 + '%';
    fill.style.transform = `scaleX(${Math.max(0.02, pct)})`;
  };
  pista.addEventListener('scroll', actualizar, { passive: true });
  requestAnimationFrame(actualizar);

  // Arrastrar para desplazar (escritorio)
  let abajo = false, sx = 0, sl = 0, movido = false;
  pista.addEventListener('pointerdown', (e) => { abajo = true; movido = false; sx = e.clientX; sl = pista.scrollLeft; pista.classList.add('arrastrando'); });
  pista.addEventListener('pointermove', (e) => { if (!abajo) return; const dx = e.clientX - sx; if (Math.abs(dx) > 4) movido = true; pista.scrollLeft = sl - dx; });
  const soltar = () => { abajo = false; pista.classList.remove('arrastrando'); };
  pista.addEventListener('pointerup', soltar);
  pista.addEventListener('pointerleave', soltar);
  pista.addEventListener('click', (e) => { if (movido) { e.stopPropagation(); e.preventDefault(); } }, true);
}

function montarModal() {
  if (document.getElementById('rm-overlay')) return;
  const ov = document.createElement('div');
  ov.className = 'rm-overlay';
  ov.id = 'rm-overlay';
  ov.dataset.abierto = 'false';
  ov.innerHTML = `<div class="rm" role="dialog" aria-modal="true" aria-label="Ficha de hoja de ruta">
      <button class="rm__cerrar" aria-label="Cerrar">×</button>
      <div class="rm__cuerpo"></div>
    </div>`;
  ov.addEventListener('click', (e) => { if (e.target === ov) cerrarModal(); });
  ov.querySelector('.rm__cerrar').addEventListener('click', cerrarModal);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrarModal(); });
  document.body.appendChild(ov);
}

document.addEventListener('DOMContentLoaded', () => {
  const arranque = () => {
    if (!window.FPT) return setTimeout(arranque, 40);
    montarModal();
    construirRuta(window.FPT.paneles || []);
  };
  arranque();
});
