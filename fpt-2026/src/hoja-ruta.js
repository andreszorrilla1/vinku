/* ============================================================
   Congreso FPT 2026 — Hoja de ruta (camino HORIZONTAL con pines)
   Prioridad 1 del brief. El sendero avanza hacia la derecha; el
   fondo (silueta de Colombia) se corre revelando nuevos pines.
   Se navega con swipe/drag y con flechas. Cada pin abre una
   ventana con problema · cita · acciones · actores · descarga.
   ============================================================ */

const SVG_NS = 'http://www.w3.org/2000/svg';

// Silueta de Colombia — DECORATIVA y aproximada (el brief la pide así).
const COLOMBIA_PATH =
  'M300 120 C360 90 430 110 470 160 C520 130 560 175 545 230 C600 250 620 320 585 370 ' +
  'C640 400 640 470 590 505 C620 560 590 640 560 690 C600 740 585 820 540 860 ' +
  'C560 930 520 1010 470 1050 C500 1120 470 1210 430 1270 C400 1360 350 1470 320 1560 ' +
  'C300 1650 250 1720 210 1690 C230 1600 245 1500 230 1420 C180 1400 150 1340 175 1290 ' +
  'C120 1250 110 1170 155 1130 C110 1080 120 1000 170 970 C130 910 150 830 200 805 ' +
  'C160 740 185 660 235 640 C195 580 220 500 270 485 C230 420 260 340 315 335 ' +
  'C285 280 300 200 300 120 Z';

const esPH = (v) => typeof v === 'string' && v.trim().startsWith('‹placeholder');
const limpio = (v) => (v && !esPH(v) ? v.trim() : '');

function el(tag, attrs = {}, ...children) {
  const n = document.createElementNS(SVG_NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  children.forEach((c) => n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
  return n;
}

// Posiciones de los pines a lo largo de un eje horizontal, en zig-zag suave.
function calcularPuntos(n, paso, margenX, mid, amp) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const x = margenX + i * paso;
    const y = mid + (i % 2 === 0 ? -amp : amp);
    pts.push({ x, y });
  }
  return pts;
}

// Path 'd' que enhebra los puntos con curvas suaves (S horizontales).
function senderoD(pts) {
  if (!pts.length) return '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    const cx = (a.x + b.x) / 2;
    d += ` C ${cx} ${a.y}, ${cx} ${b.y}, ${b.x} ${b.y}`;
  }
  return d;
}

function abrirModal(panel) {
  const ov = document.getElementById('rm-overlay');
  if (!ov) return;
  const problema = limpio(panel.captura?.problema?.sintesis);
  const cita = panel.captura?.problema?.cita || {};
  const citaTxt = limpio(cita.texto);
  const acciones = (panel.comunicaciones?.acciones || []).filter((a) => !esPH(a) && a);
  const actores = (panel.codificacion?.actores || []).filter((a) => a && !esPH(a.nombre));
  const pdf = panel.recursos?.pdfHojaRuta;
  const titulo = esPH(panel.titulo) ? `Panel ${panel.numero}` : panel.titulo;
  const vacio = (t) => `<p class="rm__vacio">${t}</p>`;
  const etiqConf = { alto: 'Confianza alta', medio: 'Confianza media', bajo: 'Confianza baja' };

  ov.querySelector('.rm__cuerpo').innerHTML = `
    <div class="rm__num">Panel ${panel.numero} · <span class="chip-confianza" data-nivel="${panel.confianza}" style="vertical-align:middle">${etiqConf[panel.confianza] || panel.confianza}</span></div>
    <h3 class="rm__titulo">${titulo}</h3>
    <div class="rm__bloque">
      <h5>El problema</h5>
      ${problema ? `<p>${problema}</p>` : vacio('Relatoría en sistematización — el problema se publica con la ficha final.')}
    </div>
    ${citaTxt ? `<div class="rm__bloque"><blockquote class="rm__cita">“${citaTxt}”${limpio(cita.autor) ? `<cite>${limpio(cita.autor)}${limpio(cita.rol) ? ` · ${limpio(cita.rol)}` : ''}</cite>` : ''}</blockquote></div>` : ''}
    <div class="rm__bloque">
      <h5>Acciones de incidencia</h5>
      ${acciones.length ? `<ul class="rm__lista">${acciones.map((a) => `<li>${a}</li>`).join('')}</ul>` : vacio('Acciones por definir a partir de la relatoría.')}
    </div>
    <div class="rm__bloque">
      <h5>Quiénes lo hacen posible</h5>
      ${actores.length ? `<div class="rm__actores">${actores.map((a) => `<span class="rm__actor">${a.nombre}${a.entidad ? ` · ${a.entidad}` : ''}</span>`).join('')}</div>` : vacio('Actoría por codificar.')}
    </div>
    <div class="rm__pie">
      ${pdf ? `<a class="btn" href="${pdf}" download>Descargar hoja de ruta</a>` : `<button class="btn" disabled style="opacity:.5;cursor:not-allowed">Hoja de ruta próximamente</button>`}
      <a class="btn btn--fantasma" href="#repositorio">Ver relatoría del panel</a>
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
  cont.classList.add('ruta');
  cont.innerHTML = '';

  // Geometría horizontal
  const PASO = 300;         // separación entre pines (px)
  const MARGEN = 200;       // margen a izquierda/derecha
  const H = 460;            // alto del lienzo
  const mid = H / 2;
  const amp = 90;           // amplitud del zig-zag
  const W = MARGEN * 2 + (paneles.length - 1) * PASO;

  const pts = calcularPuntos(paneles.length, PASO, MARGEN, mid, amp);
  const d = senderoD(pts);

  // Estructura: pista con scroll horizontal + flechas
  const pista = document.createElement('div');
  pista.className = 'ruta__pista';

  const svg = el('svg', {
    class: 'ruta__lienzo',
    viewBox: `0 0 ${W} ${H}`,
    width: String(W),
    height: String(H),
    role: 'list',
    'aria-label': 'Hoja de ruta: camino de paneles',
  });
  svg.style.width = W + 'px';
  svg.style.height = H + 'px';

  // Silueta de Colombia repetida/expandida como fondo que se corre
  const gcol = el('g', { 'aria-hidden': 'true' });
  const escala = (H * 1.2) / 1800; // 1800 ~ alto natural del path
  for (let x = 0; x < W; x += 900) {
    gcol.appendChild(
      el('path', { class: 'ruta__colombia', d: COLOMBIA_PATH, transform: `translate(${x} ${mid - 900 * escala}) scale(${escala})` })
    );
  }
  svg.appendChild(gcol);

  // Sendero
  svg.appendChild(el('path', { class: 'ruta__sendero--trazo', d }));
  svg.appendChild(el('path', { class: 'ruta__sendero', d }));

  // Pines exactamente sobre los puntos calculados
  paneles.forEach((panel, i) => {
    const { x, y } = pts[i];
    const arriba = i % 2 === 0; // etiqueta arriba o abajo según posición
    const g = el('g', {
      class: 'pin',
      'data-estado': panel.estado,
      role: 'listitem',
      tabindex: '0',
      'aria-label': `Panel ${panel.numero}`,
      transform: `translate(${x} ${y})`,
    });
    g.appendChild(el('circle', { class: 'pin__estela', r: '34', opacity: '0.12' }));
    g.appendChild(el('circle', { class: 'pin__disco', r: '34' }));
    g.appendChild(el('text', { class: 'pin__num' }, String(panel.numero)));

    const titulo = esPH(panel.titulo) ? `Panel ${panel.numero}` : panel.titulo;
    const ly = arriba ? -58 : 66;
    g.appendChild(el('text', { class: 'pin__label', x: '0', y: String(ly), 'text-anchor': 'middle' }, titulo));

    const abrir = () => abrirModal(panel);
    g.addEventListener('click', abrir);
    g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrir(); } });
    svg.appendChild(g);
  });

  pista.appendChild(svg);
  cont.appendChild(pista);

  // Flechas de navegación
  const flechas = document.createElement('div');
  flechas.className = 'ruta__flechas';
  flechas.innerHTML = `
    <button class="ruta__flecha" data-dir="-1" aria-label="Anterior">‹</button>
    <button class="ruta__flecha" data-dir="1" aria-label="Siguiente">›</button>`;
  cont.appendChild(flechas);
  flechas.querySelectorAll('.ruta__flecha').forEach((b) => {
    b.addEventListener('click', () => pista.scrollBy({ left: b.dataset.dir * PASO * 1.6, behavior: 'smooth' }));
  });

  // Pista de progreso
  const barra = document.createElement('div');
  barra.className = 'ruta__progreso';
  barra.innerHTML = '<span></span>';
  cont.appendChild(barra);
  const relleno = barra.querySelector('span');
  const actualizar = () => {
    const max = pista.scrollWidth - pista.clientWidth;
    relleno.style.width = (max > 0 ? (pista.scrollLeft / max) * 100 : 0) + '%';
  };
  pista.addEventListener('scroll', actualizar);
  actualizar();

  // Arrastrar para desplazar (escritorio)
  let abajo = false, sx = 0, sl = 0, movido = false;
  pista.addEventListener('pointerdown', (e) => { abajo = true; movido = false; sx = e.clientX; sl = pista.scrollLeft; pista.classList.add('arrastrando'); });
  pista.addEventListener('pointermove', (e) => { if (!abajo) return; const dx = e.clientX - sx; if (Math.abs(dx) > 4) movido = true; pista.scrollLeft = sl - dx; });
  const soltar = () => { abajo = false; pista.classList.remove('arrastrando'); };
  pista.addEventListener('pointerup', soltar);
  pista.addEventListener('pointerleave', soltar);
  // Evita abrir modal si venías arrastrando
  pista.addEventListener('click', (e) => { if (movido) { e.stopPropagation(); e.preventDefault(); } }, true);
}

function montarModal() {
  if (document.getElementById('rm-overlay')) return;
  const ov = document.createElement('div');
  ov.className = 'rm-overlay';
  ov.id = 'rm-overlay';
  ov.dataset.abierto = 'false';
  ov.innerHTML = `<div class="rm" role="dialog" aria-modal="true" aria-label="Detalle del panel">
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
