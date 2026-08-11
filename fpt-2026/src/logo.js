/* ============================================================
   Congreso FPT 2026 — Logo GOBS (reconstrucción SVG inline)

   ⚠️ STAND-IN: reconstruido a partir del logo de referencia
   (wordmark "Gobs" + flecha cian en la G + bajada "Estrategias
   Públicas"). Para producción reemplazar por el SVG/PNG OFICIAL
   del Manual_de_marca.pdf, que define tamaños mínimos y usos
   indebidos. No alterar proporciones ni color sin el manual.

   Uso: <span data-logo></span>            → wordmark completo
        <span data-logo="marca"></span>    → solo el símbolo (flecha)
        data-logo-tono="claro"             → versión para fondo oscuro
   ============================================================ */

function svgLogoGobs({ marca = false, claro = false } = {}) {
  const negro = claro ? '#FFFFFF' : '#0B0F14';
  const cian = '#0AB6F2';
  const gris = claro ? '#88B0FF' : '#8A94A3';

  // Símbolo: cuadrado negro con la muesca/flecha cian (cuadrante positivo)
  const simbolo = `
    <g>
      <rect x="2" y="6" width="56" height="56" rx="6" fill="${negro}"/>
      <path d="M18 44 L18 26 L40 26 L40 34 L30 34 L30 44 Z" fill="${cian}"/>
    </g>`;

  if (marca) {
    return `<svg viewBox="0 0 60 68" role="img" aria-label="GOBS" width="34" height="38">${simbolo}</svg>`;
  }

  // Wordmark completo: símbolo + "Gobs" + bajada
  return `<svg viewBox="0 0 300 74" role="img" aria-label="GOBS Estrategias Públicas" height="42">
    <g transform="translate(0,3)">${simbolo}</g>
    <text x="70" y="42" font-family="Montserrat, system-ui, sans-serif" font-weight="800" font-size="42" letter-spacing="-1" fill="${negro}">Gobs</text>
    <text x="72" y="62" font-family="Montserrat, system-ui, sans-serif" font-weight="700" font-size="11" letter-spacing="4.5" fill="${gris}">ESTRATEGIAS PÚBLICAS</text>
  </svg>`;
}

function inyectarLogos(raiz = document) {
  raiz.querySelectorAll('[data-logo]').forEach((el) => {
    const marca = el.getAttribute('data-logo') === 'marca';
    const claro = el.getAttribute('data-logo-tono') === 'claro';
    el.innerHTML = svgLogoGobs({ marca, claro });
  });
}

document.addEventListener('DOMContentLoaded', () => inyectarLogos());
window.inyectarLogos = inyectarLogos;
