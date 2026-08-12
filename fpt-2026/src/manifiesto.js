/* ============================================================
   Congreso FPT 2026 — Manifiesto (firma + muro de pines)
   Formulario mínimo: Nombre · Entidad · Reflexión (máx 300).
   La reflexión responde: "¿Cuál es tu apuesta y contribución a la
   ruta El Territorio Cobra Valor?".
   Contador en vivo, animación de sello + firma caligráfica, y un
   muro de pines con las reflexiones de quienes firman.

   Backend: Google Apps Script (ver backend/api_firmantes_apps_script.gs).
   ============================================================ */

(function () {
// TODO: reemplazar con la URL real del Apps Script desplegado (/exec).
// Mientras esté vacío, el componente funciona con datos de ejemplo.
const APPS_SCRIPT_URL = '';

const MAX_REFLEXION = 300;
const PREGUNTA = '¿Cuál es tu apuesta y contribución a la ruta El Territorio Cobra Valor?';

// Datos de ejemplo (solo cuando no hay APPS_SCRIPT_URL configurada)
const EJEMPLO = {
  total: 3,
  firmantes: [
    { nombre: 'María Fernanda Ruiz', entidad: 'Gobernación de Antioquia', reflexion: 'Apuesto por catastros multipropósito que conviertan el dato predial en inversión social real para los municipios más pequeños.' },
    { nombre: 'Carlos Andrés Beltrán', entidad: 'Alcaldía de Barranquilla', reflexion: 'Mi contribución es abrir los datos de recaudo para que la ciudadanía vea a dónde va cada peso del territorio.' },
    { nombre: 'Diana Marcela Torres', entidad: 'Federación Nacional de Departamentos', reflexion: 'Tejer alianzas entre departamentos para que la autonomía fiscal deje de ser discurso y se vuelva ruta compartida.' },
  ],
};

const esPHm = (v) => typeof v === 'string' && v.trim().startsWith('‹placeholder');

function iniciales(nombre) {
  return nombre.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() || '').join('');
}

function pinHTML(f) {
  const reflexion = (f.reflexion || '').trim();
  return `
    <article class="mf-pin">
      <span class="mf-pin__tachuela" aria-hidden="true"></span>
      ${reflexion ? `<p class="mf-pin__texto">“${reflexion}”</p>` : `<p class="mf-pin__texto mf-pin__texto--vacio">Firmó la ruta El Territorio Cobra Valor.</p>`}
      <footer class="mf-pin__firma">
        <span class="mf-pin__ini" aria-hidden="true">${iniciales(f.nombre)}</span>
        <span><b>${f.nombre}</b><small>${f.entidad}</small></span>
      </footer>
    </article>`;
}

async function cargarFirmantes() {
  if (!APPS_SCRIPT_URL) return EJEMPLO;
  try {
    const res = await fetch(APPS_SCRIPT_URL);
    if (!res.ok) throw new Error('GET falló');
    return await res.json();
  } catch (e) {
    console.warn('Manifiesto: usando datos de ejemplo (fallo el GET).', e);
    return EJEMPLO;
  }
}

async function enviarFirma(datos) {
  if (!APPS_SCRIPT_URL) {
    // Modo ejemplo: simula éxito sin persistir.
    return new Promise((r) => setTimeout(() => r({ ok: true }), 700));
  }
  const res = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // evita preflight CORS
    body: JSON.stringify(datos),
  });
  return res.json();
}

function construir(cont) {
  cont.classList.remove('en-construccion');
  cont.innerHTML = `
    <div class="mf">
      <div class="mf__panel">
        <p class="mf__manifiesto">Firmo la ruta <b>El Territorio Cobra Valor</b>: me comprometo con una gestión pública moderna, basada en datos y en la incidencia real de los territorios.</p>
        <div class="mf__contador"><b data-mf-total>—</b><span>personas ya firmaron en <span data-anio>2026</span></span></div>

        <form class="mf__form" data-mf-form novalidate>
          <div class="mf__campo">
            <label class="etiqueta" for="mf-nombre">Nombre</label>
            <input id="mf-nombre" name="nombre" type="text" required autocomplete="name" placeholder="Tu nombre">
          </div>
          <div class="mf__campo">
            <label class="etiqueta" for="mf-entidad">Entidad</label>
            <input id="mf-entidad" name="entidad" type="text" required autocomplete="organization" placeholder="Gobernación, alcaldía, gremio, ministerio…">
          </div>
          <div class="mf__campo">
            <label class="etiqueta" for="mf-reflexion">${PREGUNTA}</label>
            <textarea id="mf-reflexion" name="reflexion" maxlength="${MAX_REFLEXION}" rows="3" placeholder="Tu apuesta y contribución (máx. ${MAX_REFLEXION} caracteres)"></textarea>
            <span class="mf__conteo"><span data-mf-cuenta>0</span>/${MAX_REFLEXION}</span>
          </div>
          <button class="btn mf__enviar" type="submit">Firmar el manifiesto</button>
          <p class="mf__aviso" data-mf-aviso hidden></p>
        </form>
      </div>

      <div class="mf__muro">
        <div class="mf__muro-cab">
          <span class="etiqueta">Muro de firmas</span>
          <h3>Apuestas por el territorio</h3>
        </div>
        <div class="mf__pines" data-mf-pines></div>
      </div>
    </div>

    <!-- Animación de sello + firma -->
    <div class="mf-sello" data-mf-sello hidden>
      <div class="mf-sello__caja">
        <span class="mf-sello__marca" data-logo data-logo-tono="claro"></span>
        <p class="mf-sello__texto">Tu firma quedó en la ruta</p>
        <p class="mf-sello__firma" data-mf-firma></p>
      </div>
    </div>
  `;
  if (window.inyectarLogos) window.inyectarLogos(cont);

  const form = cont.querySelector('[data-mf-form]');
  const total = cont.querySelector('[data-mf-total]');
  const pines = cont.querySelector('[data-mf-pines]');
  const cuenta = cont.querySelector('[data-mf-cuenta]');
  const reflexion = cont.querySelector('#mf-reflexion');
  const aviso = cont.querySelector('[data-mf-aviso]');
  const sello = cont.querySelector('[data-mf-sello]');
  const firmaCal = cont.querySelector('[data-mf-firma]');

  reflexion.addEventListener('input', () => (cuenta.textContent = String(reflexion.value.length)));

  // Carga inicial
  cargarFirmantes().then((data) => {
    total.textContent = String(data.total ?? data.firmantes?.length ?? 0);
    pines.innerHTML = (data.firmantes || []).map(pinHTML).join('');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    aviso.hidden = true;
    const datos = {
      nombre: form.nombre.value.trim(),
      entidad: form.entidad.value.trim(),
      reflexion: form.reflexion.value.trim().slice(0, MAX_REFLEXION),
    };
    if (!datos.nombre || !datos.entidad) {
      aviso.hidden = false; aviso.textContent = 'El nombre y la entidad son obligatorios.'; return;
    }
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true; btn.textContent = 'Firmando…';
    try {
      const r = await enviarFirma(datos);
      if (r && r.ok === false) throw new Error(r.error || 'Error al firmar');
      // Sello + firma caligráfica
      firmaCal.textContent = datos.nombre;
      sello.hidden = false;
      requestAnimationFrame(() => sello.classList.add('mf-sello--activo'));
      setTimeout(() => { sello.classList.remove('mf-sello--activo'); setTimeout(() => (sello.hidden = true), 400); }, 2600);
      // Optimista: suma al muro y al contador
      total.textContent = String((parseInt(total.textContent, 10) || 0) + 1);
      pines.insertAdjacentHTML('afterbegin', pinHTML(datos));
      form.reset(); cuenta.textContent = '0';
      if (!APPS_SCRIPT_URL) { aviso.hidden = false; aviso.classList.add('mf__aviso--info'); aviso.textContent = 'Modo demo: la firma se muestra pero aún no se guarda (falta configurar el Apps Script).'; }
    } catch (err) {
      aviso.hidden = false; aviso.textContent = 'No se pudo registrar la firma. Intenta de nuevo.';
      console.error(err);
    } finally {
      btn.disabled = false; btn.textContent = 'Firmar el manifiesto';
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const cont = document.querySelector('[data-modulo="manifiesto"]');
  if (cont) construir(cont);
  document.querySelectorAll('[data-anio]').forEach((el) => (el.textContent = '2026'));
});
})();
