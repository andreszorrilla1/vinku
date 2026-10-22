/** Preferencias de lectura guardadas en el navegador (también se guardan en el perfil cuando hay sesión). */
export const CLAVE_LETRA = 'sc-letra'

/** Aplica el tamaño de letra guardado antes del primer pintado. */
export const SCRIPT_PREFERENCIAS = `try{var l=localStorage.getItem('${CLAVE_LETRA}');if(l==='grande')document.documentElement.dataset.letra='grande'}catch(e){}`

export function aplicarLetra(tamano: 'normal' | 'grande') {
  if (tamano === 'grande') document.documentElement.dataset.letra = 'grande'
  else delete document.documentElement.dataset.letra
  try {
    localStorage.setItem(CLAVE_LETRA, tamano)
  } catch {
    // Sin almacenamiento (modo privado): la preferencia dura hasta recargar.
  }
}
