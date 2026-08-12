/* ============================================================
   Congreso FPT 2026 — Buscador temático del repositorio
   Búsqueda sofisticada por temática: alcance (Nacional / Territorial),
   temas (chips multi-selección) y texto libre, sobre los 13 paneles.
   ============================================================ */

(function () {
const ETIQ_TIPO = { nacional: 'Nacional', territorial: 'Territorial' };

function temasConConteo(paneles) {
  const m = new Map();
  paneles.forEach((p) => (p.codificacion?.temas || []).forEach((t) => {
    if (t && !t.startsWith('‹placeholder')) m.set(t, (m.get(t) || 0) + 1);
  }));
  return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function construir(data) {
  const barra = document.querySelector('[data-buscador]');
  if (!barra || barra.dataset.listo) return;
  barra.dataset.listo = '1';
  const paneles = data.paneles || [];
  const temas = temasConConteo(paneles);

  barra.innerHTML = `
    <div class="bus__fila">
      <div class="bus__buscar">
        <span class="bus__lupa" aria-hidden="true">⌕</span>
        <input id="bus-q" type="search" placeholder="Buscar palabras clave en todo el contenido…" autocomplete="off" aria-label="Buscar">
      </div>
      <div class="bus__alcance" role="group" aria-label="Alcance temático">
        <button class="bus__seg is-activo" data-tipo="" type="button">Todos</button>
        <button class="bus__seg" data-tipo="nacional" type="button">Nacional</button>
        <button class="bus__seg" data-tipo="territorial" type="button">Territorial</button>
      </div>
    </div>
    <div class="bus__temas" role="group" aria-label="Temas">
      ${temas.map(([t, n]) => `<button class="bus__chip" type="button" data-tema="${t}">${t}<small>${n}</small></button>`).join('')}
    </div>
    <div class="bus__pie">
      <output class="bus__conteo" aria-live="polite"></output>
      <button class="bus__limpiar" type="button" hidden>Limpiar filtros</button>
    </div>`;

  const q = barra.querySelector('#bus-q');
  const segs = [...barra.querySelectorAll('.bus__seg')];
  const chips = [...barra.querySelectorAll('.bus__chip')];
  const limpiar = barra.querySelector('.bus__limpiar');
  const conteo = barra.querySelector('.bus__conteo');
  const grid = document.querySelector('[data-grid-paneles]');
  let fTipo = '';
  const temasSel = new Set();

  function aplicar() {
    const texto = q.value.trim().toLowerCase();
    const tarjetas = grid.querySelectorAll('.tarjeta-panel');
    let visibles = 0;
    tarjetas.forEach((c) => {
      const temasC = (c.dataset.temas || '').split('|').filter(Boolean);
      const okTexto = !texto || (c.dataset.buscar || '').includes(texto);
      const okTipo = !fTipo || c.dataset.tipo === fTipo;
      const okTemas = temasSel.size === 0 || [...temasSel].some((t) => temasC.includes(t));
      const ok = okTexto && okTipo && okTemas;
      c.hidden = !ok;
      if (ok) visibles++;
    });
    conteo.textContent = `${visibles} de ${tarjetas.length} paneles`;
    const activo = texto || fTipo || temasSel.size;
    limpiar.hidden = !activo;
    let vacio = grid.querySelector('.bus__vacio');
    if (visibles === 0 && !vacio) {
      vacio = document.createElement('p');
      vacio.className = 'bus__vacio';
      vacio.textContent = 'Ningún panel coincide con estos filtros.';
      grid.appendChild(vacio);
    } else if (visibles > 0 && vacio) vacio.remove();
  }

  q.addEventListener('input', aplicar);
  segs.forEach((b) => b.addEventListener('click', () => {
    segs.forEach((s) => s.classList.toggle('is-activo', s === b));
    fTipo = b.dataset.tipo;
    aplicar();
  }));
  chips.forEach((b) => b.addEventListener('click', () => {
    const t = b.dataset.tema;
    if (temasSel.has(t)) { temasSel.delete(t); b.classList.remove('is-activo'); }
    else { temasSel.add(t); b.classList.add('is-activo'); }
    aplicar();
  }));
  limpiar.addEventListener('click', () => {
    q.value = ''; fTipo = '';
    segs.forEach((s) => s.classList.toggle('is-activo', s.dataset.tipo === ''));
    temasSel.clear(); chips.forEach((c) => c.classList.remove('is-activo'));
    aplicar();
  });
  aplicar();
}

function arranque() {
  if (!window.FPT || !document.querySelector('[data-grid-paneles] .tarjeta-panel')) {
    return setTimeout(arranque, 40);
  }
  construir(window.FPT);
}
document.addEventListener('grid:listo', () => construir(window.FPT));
document.addEventListener('DOMContentLoaded', arranque);
})();
