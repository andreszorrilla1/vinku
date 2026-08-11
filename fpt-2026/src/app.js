/* ============================================================
   Congreso FPT 2026 — App base
   Carga la fuente única de datos y prepara los ganchos de cada
   sección. Los módulos interactivos (hoja de ruta, buscador,
   manifiesto) se conectan en sus propias secciones del proyecto.
   ============================================================ */

// Permite inyectar datos en línea para previews offline; en producción
// se sirve data/paneles.json por HTTP.
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
        return `
      <${tag} class="tarjeta-panel${p.estado === 'pendiente' ? ' es-placeholder' : ''}"${href} data-estado="${p.estado}">
        <span class="tarjeta-panel__num">${p.numero}</span>
        <span class="chip-confianza" data-nivel="${p.confianza}">${etiquetaEstado[p.estado] || p.estado}</span>
        <h3 class="tarjeta-panel__titulo">${tituloPanel(p)}</h3>
        ${clickable ? '<span class="tarjeta-panel__cta">Ver relatoría →</span>' : ''}
      </${tag}>`;
      })
      .join('');
  }
});
