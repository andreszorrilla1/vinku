/**
 * Todos los textos que ve el vecino, en un solo lugar.
 * Regla: si un adulto mayor no lo entiende a la primera, se reescribe.
 * Ver reglas de oro en CLAUDE.md: las palabras vetadas las revisa src/textos/prohibidas.ts.
 */
export const textos = {
  marca: {
    nombre: 'Sabaneta Cuenta',
    frase: 'Cuéntale a Sabaneta. Aquí tu barrio cuenta.',
    fraseCorta: 'Cuéntale a Sabaneta.',
    fraseSegunda: 'Aquí tu barrio cuenta.',
    descripcion: 'Cuenta lo que vive tu cuadra y construye el programa de Sabaneta con tus vecinos.',
  },
  inicio: {
    botonContar: 'Contar algo de mi cuadra',
    botonEnVivo: 'Ver Cuentas en vivo',
    queEsTitulo: '¿Qué es esto?',
    queEs: [
      'Es un lugar para contar lo que vive tu cuadra: lo que duele, lo que falta y lo que ya hacemos.',
      'Con lo que cuentan los vecinos armamos juntos el programa para Sabaneta.',
      'Juan Carlos Jaramillo Jara lee cada cuenta y le responde a cada barrio.',
    ],
    tiposTitulo: 'Puedes contar tres cosas',
    tipos: {
      dolor: { nombre: 'Dolor', ayuda: 'Algo que nos afecta' },
      deseo: { nombre: 'Deseo', ayuda: 'Algo que nos falta' },
      proyecto: { nombre: 'Proyecto', ayuda: 'Algo que hacemos o queremos hacer' },
    },
  },
  pie: {
    privacidad: 'Cómo cuidamos tus datos',
    terminos: 'Reglas para participar',
    quienesSomos: 'Quiénes somos',
  },
  sinConexion: {
    titulo: 'No hay internet',
    texto: 'Revisa tu conexión. Cuando vuelva, intenta otra vez.',
    boton: 'Intentar otra vez',
  },
  noEncontrada: {
    titulo: 'No encontramos esta página',
    texto: 'Puede que el enlace esté mal escrito.',
    boton: 'Volver al inicio',
  },
  errores: {
    general: 'Algo salió mal. Intenta otra vez.',
    guardar: 'No pudimos guardar. Revisa tu internet e intenta otra vez.',
  },
} as const
