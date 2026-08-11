/**
 * Congreso FPT 2026 — Muro de firmantes del manifiesto
 * Backend ligero en Google Apps Script sobre una Google Sheet.
 *
 * Columnas de la hoja (fila 1 = encabezados):
 *   A: Fecha | B: Nombre | C: Entidad | D: Reflexión
 *
 * La reflexión responde: "¿Cuál es tu apuesta y contribución a la ruta
 * El Territorio Cobra Valor?" — máximo 300 caracteres.
 *
 * Despliegue:
 *   1. Crea una Google Sheet con esos 4 encabezados en la fila 1.
 *   2. Extensiones → Apps Script, pega este archivo.
 *   3. Implementar → Nueva implementación → Aplicación web.
 *      Ejecutar como: yo · Con acceso: cualquiera.
 *   4. Copia la URL /exec y ponla en src/manifiesto.js (APPS_SCRIPT_URL).
 *
 * Se recibe texto plano (no application/json) para evitar el preflight
 * CORS del navegador.
 */

var MAX_REFLEXION = 300;

function _hoja() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
}

function _json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** POST: agrega una firma. Cuerpo: {nombre, entidad, reflexion} como texto plano. */
function doPost(e) {
  try {
    var datos = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var nombre = String(datos.nombre || '').trim();
    var entidad = String(datos.entidad || '').trim();
    var reflexion = String(datos.reflexion || '').trim().slice(0, MAX_REFLEXION);

    if (!nombre || !entidad) {
      return _json({ ok: false, error: 'Nombre y entidad son obligatorios.' });
    }

    _hoja().appendRow([new Date(), nombre, entidad, reflexion]);
    return _json({ ok: true });
  } catch (err) {
    return _json({ ok: false, error: String(err) });
  }
}

/** GET: devuelve {total, firmantes:[{fecha,nombre,entidad,reflexion}]} (recientes primero). */
function doGet(e) {
  var hoja = _hoja();
  var ultimas = Number((e && e.parameter && e.parameter.limit) || 60);
  var filas = Math.max(0, hoja.getLastRow() - 1); // sin encabezado
  if (filas === 0) return _json({ total: 0, firmantes: [] });

  var toma = Math.min(filas, ultimas);
  var inicio = 2 + (filas - toma); // arranca desde las más recientes
  var rango = hoja.getRange(inicio, 1, toma, 4).getValues();

  var firmantes = rango.map(function (r) {
    return {
      fecha: r[0] ? new Date(r[0]).toISOString() : '',
      nombre: String(r[1] || ''),
      entidad: String(r[2] || ''),
      reflexion: String(r[3] || '')
    };
  }).reverse(); // recientes primero

  return _json({ total: filas, firmantes: firmantes });
}
