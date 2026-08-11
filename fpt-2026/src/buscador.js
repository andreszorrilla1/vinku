/* ============================================================
   Congreso FPT 2026 — Buscador del repositorio
   Filtros por tipo (nacional/territorial) + eje temático y
   búsqueda por texto sobre el grid de los 13 paneles.
   Los valores de los filtros se pueblan desde la fuente única;
   hoy salen pocos porque tipo/eje aún vienen de fichas sin ingerir.
   ============================================================ */

const ETIQ_TIPO = { nacional: 'Nacional', territorial: 'Territorial' };
const ETIQ_ESTADO = { final: 'Relatoría final', transcripcion: 'En sistematización', pendiente: 'Próximamente' };

function nombreEje(data, id) {
  const e = (data.meta?.ejesTematicos || []).find((x) => x.id === id);
  const n = e?.nombre;
  return n && !n.startsWith('‹placeholder') ? n : null;
}

function opcionesUnicas(paneles, campo) {
  return [...new Set(paneles.map((p) => p[campo]).filter(Boolean))];
}

function construir(data) {
  const barra = document.querySelector('[data-buscador]');
  if (!barra || barra.dataset.listo) return;
  barra.dataset.listo = '1';
  const paneles = data.paneles || [];

  const tipos = opcionesUnicas(paneles, 'tipo');
  const ejes = opcionesUnicas(paneles, 'ejeTematico');
  const estados = opcionesUnicas(paneles, 'estado');

  const opt = (v, txt) => `<option value="${v}">${txt}</option>`;

  barra.innerHTML = `
    <div class="bus__campo bus__campo--texto">
      <label for="bus-q" class="etiqueta">Buscar</label>
      <input id="bus-q" type="search" placeholder="Tema, territorio, problema…" autocomplete="off">
    </div>
    <div class="bus__campo">
      <label for="bus-tipo" class="etiqueta">Tipo</label>
      <select id="bus-tipo">${opt('', 'Todos')}${tipos.map((t) => opt(t, ETIQ_TIPO[t] || t)).join('')}</select>
    </div>
    <div class="bus__campo">
      <label for="bus-eje" class="etiqueta">Eje temático</label>
      <select id="bus-eje" ${ejes.length ? '' : 'disabled title="Se activa cuando se ingieran las fichas"'}>
        ${opt('', ejes.length ? 'Todos' : 'Por definir')}${ejes.map((e) => opt(e, nombreEje(data, e) || e)).join('')}
      </select>
    </div>
    <div class="bus__campo">
      <label for="bus-estado" class="etiqueta">Estado</label>
      <select id="bus-estado">${opt('', 'Todos')}${estados.map((s) => opt(s, ETIQ_ESTADO[s] || s)).join('')}</select>
    </div>
    <button class="bus__limpiar" type="button" hidden>Limpiar</button>
    <output class="bus__conteo" aria-live="polite"></output>
  `;

  const q = barra.querySelector('#bus-q');
  const selTipo = barra.querySelector('#bus-tipo');
  const selEje = barra.querySelector('#bus-eje');
  const selEstado = barra.querySelector('#bus-estado');
  const limpiar = barra.querySelector('.bus__limpiar');
  const conteo = barra.querySelector('.bus__conteo');
  const grid = document.querySelector('[data-grid-paneles]');

  function aplicar() {
    const texto = q.value.trim().toLowerCase();
    const fTipo = selTipo.value, fEje = selEje.value, fEstado = selEstado.value;
    const tarjetas = grid.querySelectorAll('.tarjeta-panel');
    let visibles = 0;
    tarjetas.forEach((c) => {
      const ok =
        (!texto || (c.dataset.buscar || '').includes(texto) || c.textContent.toLowerCase().includes(texto)) &&
        (!fTipo || c.dataset.tipo === fTipo) &&
        (!fEje || c.dataset.eje === fEje) &&
        (!fEstado || c.dataset.estado === fEstado);
      c.hidden = !ok;
      if (ok) visibles++;
    });
    conteo.textContent = `${visibles} de ${tarjetas.length} paneles`;
    const activo = texto || fTipo || fEje || fEstado;
    limpiar.hidden = !activo;
    let vacio = grid.querySelector('.bus__vacio');
    if (visibles === 0) {
      if (!vacio) {
        vacio = document.createElement('p');
        vacio.className = 'bus__vacio';
        vacio.textContent = 'Ningún panel coincide con estos filtros.';
        grid.appendChild(vacio);
      }
    } else if (vacio) vacio.remove();
  }

  [q, selTipo, selEje, selEstado].forEach((el) => el.addEventListener('input', aplicar));
  limpiar.addEventListener('click', () => {
    q.value = ''; selTipo.value = ''; selEje.value = ''; selEstado.value = '';
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
