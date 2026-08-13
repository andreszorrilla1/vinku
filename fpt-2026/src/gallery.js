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

  // Carátula del reproductor de YouTube: inyecta el iframe solo al tocar.
  function montarAV() {
    const av = document.querySelector('.av__player[data-yt-playlist]');
    if (!av) return;
    const reproducir = () => {
      const id = av.dataset.ytPlaylist;
      av.style.cursor = 'default';
      av.innerHTML = `<iframe src="https://www.youtube.com/embed/videoseries?list=${id}&autoplay=1&rel=0"
        title="Relatoría audiovisual · Congreso FPT 2026"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
    };
    av.addEventListener('click', reproducir);
    av.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); reproducir(); } });
  }

  document.addEventListener('DOMContentLoaded', () => {
    montarAV();
    const arranque = () => {
      if (!window.FPT) return setTimeout(arranque, 40);
      construir(window.FPT.paneles || []);
    };
    arranque();
  });
})();
