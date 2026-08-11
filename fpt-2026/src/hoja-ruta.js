/* ============================================================
   Congreso FPT 2026 — Hoja de ruta (camino con pines)
   Prioridad 1 del brief. Genera un sendero serpenteante en SVG,
   distribuye un pin por panel y abre una ventana emergente con
   problema · cita · acciones · actores · descarga.

   Reconstruido desde la descripción del brief. Cuando llegue
   landing_borrador_1.jsx, se calibra el trazado y la silueta.
   ============================================================ */

const SVG_NS = 'http://www.w3.org/2000/svg';

// Silueta de Colombia — DECORATIVA y aproximada (el brief la pide así).
// Se reemplaza por la silueta aprobada cuando llegue el .jsx de referencia.
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

// Construye el path 'd' de un sendero serpenteante vertical de n curvas.
function senderoD(w, h, filas) {
  const mx = w * 0.22;
  const pasoY = h / filas;
  let d = `M ${mx} ${pasoY * 0.4}`;
  for (let i = 0; i < filas; i++) {
    const y0 = pasoY * (i + 0.4);
    const y1 = pasoY * (i + 1.4);
    const izq = i % 2 === 0;
    const x0 = izq ? mx : w - mx;
    const x1 = izq ? w - mx : mx;
    const cy = (y0 + y1) / 2;
    d += ` C ${x1} ${y0}, ${x0} ${cy}, ${x1} ${cy}` + ` S ${x0} ${y1}, ${x1} ${y1}`;
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

  ov.querySelector('.rm__cuerpo').innerHTML = `
    <div class="rm__num">Panel ${panel.numero} · <span class="chip-confianza" data-nivel="${panel.confianza}" style="vertical-align:middle">${{alto:'Confianza alta',medio:'Confianza media',bajo:'Confianza baja'}[panel.confianza]||panel.confianza}</span></div>
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
  if (!cont) return;
  cont.classList.remove('en-construccion');
  cont.innerHTML = '';
  cont.classList.add('ruta');

  const W = 1000;
  const filas = Math.ceil(paneles.length / 1); // un pin por fila-curva
  const H = Math.max(1600, paneles.length * 190);

  const svg = el('svg', {
    class: 'ruta__lienzo',
    viewBox: `0 0 ${W} ${H}`,
    role: 'list',
    'aria-label': 'Hoja de ruta: camino de paneles',
  });

  // Silueta de Colombia (decorativa), centrada y escalada al alto
  const gCol = el('g', {
    transform: `translate(${W / 2 - 375} ${H / 2 - 900}) scale(1.0)`,
    'aria-hidden': 'true',
  });
  gCol.appendChild(el('path', { class: 'ruta__colombia', d: COLOMBIA_PATH }));
  svg.appendChild(gCol);

  // Sendero
  const d = senderoD(W, H, paneles.length);
  svg.appendChild(el('path', { class: 'ruta__sendero--trazo', d }));
  const sendero = el('path', { class: 'ruta__sendero', d });
  svg.appendChild(sendero);

  // Medimos el sendero para colocar pines equidistantes
  svg.appendChild(el('defs'));
  document.body.appendChild(svg); // temporal para poder medir
  const total = sendero.getTotalLength();

  paneles.forEach((panel, i) => {
    const t = (i + 0.5) / paneles.length;
    const pt = sendero.getPointAtLength(total * t);
    const alaDerecha = pt.x < W / 2;

    const g = el('g', {
      class: 'pin',
      'data-estado': panel.estado,
      role: 'listitem',
      tabindex: '0',
      'aria-label': `Panel ${panel.numero}`,
      transform: `translate(${pt.x} ${pt.y})`,
    });
    g.appendChild(el('circle', { class: 'pin__estela', r: '30', opacity: '0.12' }));
    g.appendChild(el('circle', { class: 'pin__disco', r: '30' }));
    g.appendChild(el('text', { class: 'pin__num' }, String(panel.numero)));

    const lx = alaDerecha ? 46 : -46;
    const titulo = esPH(panel.titulo) ? `Panel ${panel.numero}` : panel.titulo;
    g.appendChild(
      el('text', { class: 'pin__label', x: String(lx), y: '6', 'text-anchor': alaDerecha ? 'start' : 'end' }, titulo)
    );

    const abrir = () => abrirModal(panel);
    g.addEventListener('click', abrir);
    g.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrir(); }
    });
    svg.appendChild(g);
  });

  // Movemos el svg ya medido al contenedor real
  cont.appendChild(svg);
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
  // Espera a que app.js deje los datos en window.FPT
  const arranque = () => {
    if (!window.FPT) return setTimeout(arranque, 40);
    montarModal();
    construirRuta(window.FPT.paneles || []);
  };
  arranque();
});
