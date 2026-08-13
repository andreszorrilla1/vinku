/* ============================================================
   Congreso FPT 2026 — Galería de imágenes del evento
   Toma las fotos de sesión (recursos.fotoSintesis) de la fuente
   única y arma una galería; cada foto abre la relatoría de su panel.
   ============================================================ */
(function () {
  function construir(paneles) {
    const cont = document.querySelector('[data-galeria]');
    if (!cont) return;
    const items = (paneles || []).filter((p) => p.recursos && p.recursos.fotoSintesis);
    if (!items.length) return;
    cont.classList.remove('en-construccion');
    cont.innerHTML = `<div class="galeria">${items
      .map((p) => {
        const titulo = (p.titulo && !p.titulo.startsWith('‹placeholder')) ? p.titulo : `Panel ${p.numero}`;
        return `<a class="galeria__item" href="relatoria.html?panel=${p.id}" aria-label="${titulo}">
            <img src="${p.recursos.fotoSintesis}" alt="Sesión ${p.numero}: ${titulo}" loading="lazy">
            <span class="galeria__cap"><small>Sesión ${p.numero}</small>${titulo}</span>
          </a>`;
      })
      .join('')}</div>`;
    if (window.inyectarLogos) window.inyectarLogos(cont);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const arranque = () => {
      if (!window.FPT) return setTimeout(arranque, 40);
      construir(window.FPT.paneles || []);
    };
    arranque();
  });
})();
