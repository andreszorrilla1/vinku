/* ============================================================
   Congreso FPT 2026 — Marcas y línea gráfica (SVG inline)

   Reconstrucción de alta fidelidad de los logos oficiales
   entregados como imagen:
     · FPT Colombia 2026  → identidad del evento (nav)
     · Gobs (10 años)     → marca corporativa productora (footer)
     · Escalera de paralelogramos azul→cian→verde→menta → LÍNEA
       GRÁFICA reusable (geometría exacta del brand)

   ⚠️ Los wordmarks (FPT, Gobs) son reconstrucción tipográfica. Si
   llegan los vectores oficiales, se intercambian 1:1. La escalera
   de paralelogramos sí es fiel al 100%.

   Uso:
     <span data-logo="fpt"></span>
     <span data-logo="gobs"></span>        data-logo-tono="claro"
     <span data-logo="diagonal"></span>    la línea gráfica
   ============================================================ */

const C = {
  azul: '#0B43F7', cian: '#0AB6F2', verde: '#00CC30',
  menta: '#6CD3A5', negro: '#0B0F14', blanco: '#FFFFFF', gris: '#8A94A3',
};

/* ---- Línea gráfica: escalera de 4 paralelogramos (cuadrante positivo) ---- */
function svgDiagonal({ escala = 1 } = {}) {
  // Parallelogramo en (X,Y): top desplazado a la derecha (lean up-right)
  const w = 92, h = 54, s = 34, dy = 44, dx = -40;
  const filas = [
    { x: 172, y: 0, c: C.menta },
    { x: 172 + dx, y: dy, c: C.verde },
    { x: 172 + dx * 2, y: dy * 2, c: C.cian },
    { x: 172 + dx * 3, y: dy * 3, c: C.azul },
  ];
  const poly = ({ x, y, c }) =>
    `<polygon points="${x + s},${y} ${x + s + w},${y} ${x + w},${y + h} ${x},${y + h}" fill="${c}"/>`;
  const W = 300, H = 190;
  return `<svg viewBox="0 0 ${W} ${H}" width="${Math.round(W * escala)}" height="${Math.round(H * escala)}" role="img" aria-label="Línea gráfica FPT" preserveAspectRatio="xMidYMid meet">${filas.map(poly).join('')}</svg>`;
}

/* Bloque-flecha del brand (cuadrado con muesca, cuadrante positivo) */
function flecha(x, y, size, color) {
  const n = size * 0.42;
  return `<path d="M${x},${y} h${size} v${size} h${-n} v${-n} h${-(size - n)} Z" fill="${color}"/>`;
}

/* ---- FPT Colombia 2026 (evento) ---- */
function svgFPT({ claro = false, compacto = false } = {}) {
  const tinta = claro ? C.blanco : C.negro;
  if (compacto) {
    return `<svg viewBox="0 0 168 78" height="40" role="img" aria-label="FPT Colombia 2026">
      <text x="0" y="60" font-family="Montserrat, sans-serif" font-weight="800" font-size="62" letter-spacing="-2" fill="${tinta}">FPT</text>
      ${flecha(150, 8, 34, tinta)}
    </svg>`;
  }
  return `<svg viewBox="0 0 300 150" height="86" role="img" aria-label="FPT Colombia 2026">
    <text x="0" y="96" font-family="Montserrat, sans-serif" font-weight="800" font-size="110" letter-spacing="-4" fill="${tinta}">FPT</text>
    ${flecha(232, 12, 56, tinta)}
    <text x="4" y="138" font-family="Georgia, serif" font-style="italic" font-size="30" letter-spacing="4" fill="${tinta}">Colombia 2026</text>
  </svg>`;
}

/* ---- Gobs (marca corporativa productora) ---- */
function svgGobs({ claro = false, aniversario = true } = {}) {
  const tinta = claro ? C.blanco : C.negro;
  return `<svg viewBox="0 0 210 74" height="44" role="img" aria-label="Gobs · 10 años">
    <text x="0" y="52" font-family="Montserrat, sans-serif" font-weight="800" font-size="56" letter-spacing="-2" fill="${C.cian}">G<tspan fill="${tinta}">o</tspan>bs</text>
    ${flecha(38, 30, 20, tinta)}
    ${aniversario ? `<text x="44" y="70" font-family="Montserrat, sans-serif" font-weight="700" font-size="12" letter-spacing="3" fill="${C.cian}">10 AÑOS</text>` : ''}
  </svg>`;
}

function render(el) {
  const tipo = el.getAttribute('data-logo') || 'fpt';
  const claro = el.getAttribute('data-logo-tono') === 'claro';
  const compacto = el.hasAttribute('data-logo-compacto');
  if (tipo === 'diagonal') el.innerHTML = svgDiagonal({ escala: parseFloat(el.getAttribute('data-escala')) || 1 });
  else if (tipo === 'gobs') el.innerHTML = svgGobs({ claro });
  else el.innerHTML = svgFPT({ claro, compacto });
}

function inyectarLogos(raiz = document) {
  raiz.querySelectorAll('[data-logo]').forEach(render);
}

document.addEventListener('DOMContentLoaded', () => inyectarLogos());
window.inyectarLogos = inyectarLogos;
