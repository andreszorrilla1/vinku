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
        <div class="tarjeta-panel__temas">${temas.slice(0, 3).map((t) => `<span>${t}</span>`).join('')}</div>
        ${clickable ? '<span class="tarjeta-panel__cta">Ver relatoría →</span>' : ''}
      </${tag}>`;
      })
      .join('');
    document.dispatchEvent(new CustomEvent('grid:listo'));
  }
});
})();
