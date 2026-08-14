/* ============================================================
   Congreso FPT 2026 — "La voz del congreso"
   Reproductor de audio a medida (play/pausa, barra de progreso con
   ondas decorativas, tiempos, descarga). Estado "próximamente" si
   aún no hay archivo (data-audio="").
   ============================================================ */
(function () {
  const fmt = (t) => {
    if (!isFinite(t)) return '0:00';
    const m = Math.floor(t / 60), s = Math.floor(t % 60);
    return m + ':' + String(s).padStart(2, '0');
  };

  function montar() {
    const host = document.querySelector('[data-voz]');
    if (!host) return;
    const src = (host.dataset.audio || '').trim();
    const titulo = host.dataset.titulo || 'La voz del congreso';
    const sub = host.dataset.sub || '';

    // Sin archivo → estado pendiente
    if (!src) {
      host.innerHTML = `
        <div class="voz__card voz__card--vacio">
          <span class="voz__badge" aria-hidden="true">♪</span>
          <div class="voz__cuerpo">
            <div class="voz__meta"><b>${titulo}</b><small>${sub}</small></div>
            <p class="voz__pend">El audio se habilita cuando esté disponible.</p>
          </div>
        </div>`;
      return;
    }

    // Ondas decorativas (patrón fijo, no aleatorio → estable entre recargas)
    let ondas = '';
    for (let i = 0; i < 56; i++) {
      const h = 22 + Math.round(58 * Math.abs(Math.sin(i * 0.55) * Math.cos(i * 0.17)));
      ondas += `<span style="height:${h}%"></span>`;
    }

    host.innerHTML = `
      <div class="voz__card">
        <audio preload="metadata" src="${src}"></audio>
        <button class="voz__play" type="button" aria-label="Reproducir"><span class="voz__ico">►</span></button>
        <div class="voz__cuerpo">
          <div class="voz__meta"><b>${titulo}</b><small>${sub}</small></div>
          <div class="voz__barra" role="slider" tabindex="0" aria-label="Progreso del audio" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
            <div class="voz__ondas" aria-hidden="true">${ondas}</div>
            <div class="voz__relleno"></div>
          </div>
          <div class="voz__tiempo"><span class="voz__actual">0:00</span><span class="voz__total">0:00</span></div>
        </div>
        <a class="voz__dl" href="${src}" download aria-label="Descargar audio" title="Descargar audio">⭳</a>
      </div>`;

    const card = host.querySelector('.voz__card');
    const audio = host.querySelector('audio');
    const play = host.querySelector('.voz__play');
    const ico = host.querySelector('.voz__ico');
    const relleno = host.querySelector('.voz__relleno');
    const barra = host.querySelector('.voz__barra');
    const actual = host.querySelector('.voz__actual');
    const total = host.querySelector('.voz__total');

    audio.addEventListener('loadedmetadata', () => { total.textContent = fmt(audio.duration); });
    audio.addEventListener('timeupdate', () => {
      const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
      relleno.style.width = pct + '%';
      barra.setAttribute('aria-valuenow', Math.round(pct));
      actual.textContent = fmt(audio.currentTime);
    });
    audio.addEventListener('play', () => { ico.textContent = '❚❚'; play.setAttribute('aria-label', 'Pausar'); card.classList.add('is-playing'); });
    audio.addEventListener('pause', () => { ico.textContent = '►'; play.setAttribute('aria-label', 'Reproducir'); card.classList.remove('is-playing'); });
    audio.addEventListener('ended', () => { ico.textContent = '►'; relleno.style.width = '0%'; card.classList.remove('is-playing'); });

    play.addEventListener('click', () => { audio.paused ? audio.play() : audio.pause(); });

    const buscar = (clientX) => {
      const r = barra.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
      if (audio.duration) audio.currentTime = x * audio.duration;
    };
    barra.addEventListener('click', (e) => buscar(e.clientX));
    barra.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 5); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { audio.currentTime = Math.max(0, audio.currentTime - 5); e.preventDefault(); }
      if (e.key === ' ' || e.key === 'Enter') { audio.paused ? audio.play() : audio.pause(); e.preventDefault(); }
    });
  }

  document.addEventListener('DOMContentLoaded', montar);
})();
