/* ============================================================
   Congreso FPT 2026 — App base
   Carga la fuente única de datos y prepara los ganchos de cada
   sección. Los módulos interactivos (hoja de ruta, buscador,
   relatoría) se conectan en sus propias secciones del proyecto.
   ============================================================ */

// Permite inyectar datos en línea para previews offline; en producción
// se sirve data/paneles.json por HTTP.
(function () {
async function cargarDatos() {
  if (window.__PANELES__) return window.__PANELES__;
  const res = await fetch('data/paneles.json');
  if (!res.ok) throw new Error('No se pudo cargar paneles.json');
  return res.json();
}

const etiquetaEstado = {
  final: 'Relatoría final',
  transcripcion: 'En sistematización',
  pendiente: 'Próximamente',
};

function esPlaceholder(v) {
  return typeof v === 'string' && v.trim().startsWith('‹placeholder');
}

// Recoge recursivamente todo el texto real de un panel (ignora placeholders
// y las rutas de recursos) para el índice de búsqueda de texto completo.
function textoCompleto(obj, clave) {
  if (typeof obj === 'string') {
    if (esPlaceholder(obj)) return '';
    if (/^(assets\/|https?:|data:)/.test(obj)) return ''; // rutas/URLs no
    return obj + ' ';
  }
  if (Array.isArray(obj)) return obj.map((x) => textoCompleto(x)).join('');
  if (obj && typeof obj === 'object') {
    return Object.entries(obj)
      .filter(([k]) => k !== 'recursos' && k !== 'id' && k !== 'estado' && k !== 'confianza')
      .map(([k, v]) => textoCompleto(v, k))
      .join('');
  }
  return '';
}

function tituloPanel(p) {
  return esPlaceholder(p.titulo) ? `Panel ${p.numero}` : p.titulo;
}

// Descripción breve para la tarjeta (del subtítulo), recortada a una frase.
function descripcionPanel(p) {
  let d = p.subtitulo;
  if (!d || esPlaceholder(d)) d = p.anclajePolitico;
  if (!d || esPlaceholder(d)) return '';
  d = String(d).trim();
  if (d.length > 110) {
    const corte = d.slice(0, 110);
    d = corte.slice(0, corte.lastIndexOf(' ')) + '…';
  }
  return d;
}

// Iconos de línea (outline) para cada tema, coloreados con el acento.
const SVG_ICONOS = {
  banco: '<path d="M3 8l7-4 7 4"/><path d="M4 8v8M8 8v8M12 8v8M16 8v8"/><path d="M3 17h14"/>',
  balanza: '<path d="M10 3v14"/><path d="M4 17h12"/><path d="M6 6l-3 5h6z"/><path d="M14 6l3 5h-6z"/><path d="M6 6h8"/>',
  casa: '<path d="M3 9l7-6 7 6"/><path d="M5 9v8h10V9"/><path d="M8 17v-4h4v4"/>',
  red: '<circle cx="10" cy="4" r="2"/><circle cx="4" cy="16" r="2"/><circle cx="16" cy="16" r="2"/><path d="M10 6v3M9 11l-3.5 3M11 11l3.5 3"/>',
  linea: '<path d="M3 15l4-4 3 3 6-7"/><path d="M13 4h4v4"/>',
  edificio: '<path d="M4 17V4h8v13"/><path d="M12 17V8h4v9"/><path d="M3 17h14"/><path d="M6 7h2M6 10h2M6 13h2"/>',
  pastel: '<path d="M10 3a7 7 0 1 0 7 7h-7z"/><path d="M10 3v7h7"/>',
  idea: '<path d="M7 13a5 5 0 1 1 6 0 3 3 0 0 0-1 2H8a3 3 0 0 0-1-2z"/><path d="M8 17h4"/>',
  documento: '<path d="M5 3h7l3 3v11H5z"/><path d="M12 3v3h3"/><path d="M7 10h6M7 13h5"/>',
  calculadora: '<rect x="5" y="3" width="10" height="14" rx="1.5"/><path d="M7 6h6"/><path d="M7.5 10h.1M10 10h.1M12.5 10h.1M7.5 13h.1M10 13h.1M12.5 13h.1"/>',
  tag: '<path d="M4 4h6l6 6-6 6-6-6z"/><circle cx="7.5" cy="7.5" r="1"/>',
};
const TEMA_ICONO = {
  'Autonomía fiscal': 'banco',
  'Reforma estructural': 'red',
  'ICA y tributación municipal': 'calculadora',
  'Normatividad y marcos legales': 'balanza',
  'Fuentes alternativas': 'idea',
  'Presupuesto y crédito': 'pastel',
  'Catastro y predial': 'casa',
  'Descentralización': 'red',
  'Economía digital': 'linea',
  'Infraestructura y captura de valor': 'edificio',
  'Jurisprudencia': 'balanza',
  'Procedimiento tributario': 'documento',
  'Transferencias y SGP': 'red',
  'Tecnología y datos': 'linea',
};
function iconoTema(t) {
  const k = TEMA_ICONO[t] || 'tag';
  return `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${SVG_ICONOS[k]}</svg>`;
}

document.addEventListener('DOMContentLoaded', async () => {
  // Año siempre 2026 (regla fija del proyecto)
  document.querySelectorAll('[data-anio]').forEach((el) => (el.textContent = '2026'));

  let data;
  try {
    data = await cargarDatos();
  } catch (e) {
    console.error(e);
    return;
  }
  window.FPT = data; // disponible para los módulos posteriores

  const paneles = data.paneles || [];

  // Contador de paneles en el banner
  const cont = document.querySelector('[data-total-paneles]');
  if (cont) cont.textContent = String(paneles.length);

  // Vista previa del grid del repositorio (armazón; el buscador completo
  // llega en la Sección 6). Renderiza tarjetas mínimas desde el JSON.
  const grid = document.querySelector('[data-grid-paneles]');
  if (grid) {
    grid.innerHTML = paneles
      .map((p) => {
        const clickable = p.estado !== 'pendiente';
        const tag = clickable ? 'a' : 'div';
        const href = clickable ? ` href="relatoria.html?panel=${p.id}"` : '';
        const temas = (p.codificacion?.temas || []).filter((s) => s && !esPlaceholder(s));
        // Índice de texto COMPLETO: recoge todo el contenido de la relatoría
        // (reto, solución, sinergia, citas, anclaje, síntesis, acciones,
        // pasos, actores…) para que las palabras clave busquen en todo.
        const haystack = textoCompleto(p).toLowerCase();
        const tipoTxt = p.tipo === 'nacional' ? 'Nacional' : p.tipo === 'territorial' ? 'Territorial' : '';
        return `
      <${tag} class="tarjeta-panel${p.estado === 'pendiente' ? ' es-placeholder' : ''}"${href}
        data-tipo="${p.tipo || ''}" data-temas="${temas.join('|')}" data-buscar="${haystack.replace(/"/g, '')}">
        <div class="tarjeta-panel__top">
          <span class="tarjeta-panel__num">${p.numero}</span>
          ${tipoTxt ? `<span class="tarjeta-panel__tipo" data-tipo="${p.tipo}">${tipoTxt}</span>` : ''}
        </div>
        <h3 class="tarjeta-panel__titulo">${tituloPanel(p)}</h3>
        ${descripcionPanel(p) ? `<p class="tarjeta-panel__desc">${descripcionPanel(p)}</p>` : ''}
        <div class="tarjeta-panel__temas">${temas.slice(0, 3).map((t) => `<span class="tarjeta-panel__tema">${iconoTema(t)}${t}</span>`).join('')}</div>
      </${tag}>`;
      })
      .join('');
    document.dispatchEvent(new CustomEvent('grid:listo'));
  }
});
})();
