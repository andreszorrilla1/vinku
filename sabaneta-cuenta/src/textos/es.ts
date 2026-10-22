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

  navegacion: {
    etiqueta: 'Menú principal',
    contar: 'Contar',
    enVivo: 'En vivo',
    miBarrio: 'Mi barrio',
    yo: 'Yo',
  },

  preferencias: {
    letraGrande: 'Letra más grande',
    letraNormal: 'Letra normal',
  },

  voz: {
    leer: 'Leer en voz alta',
    detener: 'Dejar de leer',
  },

  instalar: {
    titulo: 'Ten Sabaneta Cuenta en tu celular',
    texto: 'Queda como una app, sin ocupar casi espacio.',
    boton: 'Instalar',
    cerrar: 'Ahora no',
  },

  inicio: {
    sello: 'Hecho con los vecinos de Sabaneta',
    botonContar: 'Contar algo de mi cuadra',
    botonEnVivo: 'Ver Cuentas en vivo',
    queEsTitulo: '¿Qué es esto?',
    queEs: [
      'Es un lugar para contar lo que vive tu cuadra: lo que duele, lo que falta y lo que ya hacemos.',
      'Con lo que cuentan los vecinos armamos juntos el programa para Sabaneta.',
      'Juan Carlos Jaramillo Jara lee cada cuenta y le responde a cada barrio.',
    ],
    pasosTitulo: 'Así funciona',
    pasos: [
      { titulo: 'Cuenta', texto: 'Di qué pasa en tu cuadra. Con texto, con tu voz o con una foto.' },
      { titulo: 'Suma', texto: 'Apoya lo que cuentan tus vecinos con un «Me suma».' },
      { titulo: 'Recibe respuesta', texto: 'Tu barrio sabe qué entró al programa y por qué.' },
    ],
    tiposTitulo: '¿Qué quieres contar?',
    tipos: {
      dolor: { nombre: 'Dolor', ayuda: 'Algo que nos afecta' },
      deseo: { nombre: 'Deseo', ayuda: 'Algo que nos falta' },
      proyecto: { nombre: 'Proyecto', ayuda: 'Algo que hacemos o queremos hacer' },
    },
    reparteTitulo: 'Reparte los 100',
    reparteTexto: 'Si Sabaneta tuviera 100 pesos, ¿cuántos le pondrías a cada cosa?',
    reparteBoton: 'Repartir mis 100',
    cierreTitulo: 'Tu cuadra tiene algo que contar',
    cierreTexto: 'Entra con tu celular. Te llega un código por WhatsApp.',
    cierreBoton: 'Entrar con mi celular',
  },

  ingresar: {
    tituloCelular: 'Entra con tu celular',
    ayudaCelular: 'Te enviamos un código por WhatsApp. No necesitas clave.',
    etiquetaCelular: 'Tu número de celular',
    ejemploCelular: 'Ej: 300 123 4567',
    botonEnviar: 'Enviarme el código',
    enviando: 'Enviando…',
    tituloCodigo: 'Escribe el código',
    ayudaCodigo: (celular: string, canal: 'whatsapp' | 'sms') =>
      `Te lo enviamos por ${canal === 'whatsapp' ? 'WhatsApp' : 'mensaje de texto'} al ${celular}.`,
    etiquetaCodigo: 'Código de 6 números',
    botonVerificar: 'Entrar',
    verificando: 'Revisando…',
    cambiarNumero: 'Cambiar número',
    reenviarEn: (segundos: number) => `Pedir otro código en ${segundos} s`,
    reenviar: 'Enviar otro código',
    porSms: 'Mejor por mensaje de texto',
    invitado: 'Un vecino te invitó. ¡Qué bueno tenerte!',
    noDisponible: 'Muy pronto vas a poder entrar con tu celular.',
    privacidad: 'Al entrar te pediremos permiso para usar tus datos.',
    errores: {
      celular: 'Ese número no parece de celular. Revisa que tenga 10 números y empiece por 3.',
      codigo: 'El código tiene 6 números.',
      codigoMalo: 'Ese código no sirve o ya venció. Revisa o pide otro.',
      muyRapido: 'Espera un momento antes de pedir otro código.',
      envio: 'No pudimos enviar el código. Revisa tu internet e intenta otra vez.',
    },
  },

  bienvenida: {
    paso: (actual: number, total: number) => `Paso ${actual} de ${total}`,
    consentimiento: {
      titulo: 'Antes de empezar',
      intro: 'Queremos ser claros con tus datos. Léelo con calma.',
      queGuardamos: 'Qué guardamos',
      queGuardamosTexto: 'Tu celular, el nombre con el que quieres que te llamen, tu barrio y lo que cuentes aquí.',
      paraQue: 'Para qué',
      paraQueTexto: 'Solo para construir con los vecinos el programa de gobierno de Sabaneta.',
      quien: 'Quién los cuida',
      quienTexto: 'El equipo de Sabaneta Cuenta, de la iniciativa de Juan Carlos Jaramillo Jara.',
      borrar: 'Cómo borrarlos',
      borrarTexto: 'Cuando quieras, desde tu perfil. También puedes escribirnos.',
      aceptaTratamiento:
        'Acepto que usen mis datos para esto. Entiendo que participar puede mostrar mi opinión política.',
      obligatorio: 'Obligatorio',
      aceptaNombre: 'Quiero que mi nombre aparezca junto a lo que cuento.',
      aceptaNombreAyuda: 'Si no, saldrá «Un vecino de tu barrio».',
      aceptaWhatsapp: 'Quiero recibir mensajes por WhatsApp sobre Sabaneta Cuenta.',
      opcional: 'Opcional',
      leerPolitica: 'Leer la política completa',
      boton: 'Acepto y sigo',
      faltaTratamiento: 'Para seguir, marca la primera casilla.',
    },
    perfil: {
      titulo: 'Cuéntanos de ti',
      intro: 'Solo lo necesario. No te pedimos cédula, dirección ni correo.',
      etiquetaNombre: '¿Cómo quieres que te llamemos?',
      ejemploNombre: 'Ej: Doña Marta',
      etiquetaBarrio: '¿En qué barrio o vereda vives?',
      ubicarme: 'Ubícame',
      ubicando: 'Buscando…',
      ubicado: (nombre: string) => `Te ubicamos en ${nombre}.`,
      fueraDeSabaneta: 'Tu ubicación queda fuera de Sabaneta. Elige tu barrio en la lista.',
      sinPermiso: 'No pudimos ver tu ubicación. Elige tu barrio en la lista.',
      etiquetaEdad: '¿Cuántos años tienes?',
      ayudaEdad: 'Opcional. Solo para saber si participan todas las edades.',
      edades: { menos_30: 'Menos de 30', de_30_a_59: '30 a 59', mas_60: '60 o más' },
      boton: 'Listo, seguir',
      errores: {
        nombre: 'Escribe un nombre de 2 a 40 letras.',
        barrio: 'Elige tu barrio o vereda.',
        guardar: 'No pudimos guardar. Revisa tu internet e intenta otra vez.',
      },
    },
    lista: {
      titulo: (nombre: string) => `¡Hola, ${nombre}!`,
      texto: 'Ya eres parte de Sabaneta Cuenta.',
      nivel: 'Tu nivel',
      nivelNombre: 'Vecino',
      insignia: 'Tu primera insignia',
      insigniaNombre: 'Primera cuenta',
      insigniaAyuda: 'Llega cuando se publique tu primera cuenta.',
      comunidad: 'Grupo de WhatsApp de tu barrio',
      comunidadPronto: 'Pronto te contamos cuál es el grupo de tu barrio.',
      boton: 'Contar algo de mi cuadra',
      despues: 'Mejor después',
    },
  },

  perfil: {
    titulo: 'Yo',
    barrio: 'Tu barrio',
    nivel: 'Tu nivel',
    codigo: 'Tu código para sumar vecinos',
    preferencias: 'Cómo ves la app',
    letra: 'Tamaño de la letra',
    letraNormal: 'Normal',
    letraGrande: 'Grande',
    misDatos: 'Mis datos',
    misDatosPronto: 'Pronto podrás descargar, corregir o borrar tus datos desde aquí.',
    salir: 'Salir',
    copiar: 'Copiar',
    copiado: 'Copiado',
    guardado: 'Guardado',
  },

  pronto: {
    titulo: 'Muy pronto',
    texto: 'Estamos construyendo esta parte con mucho cuidado.',
    contar: 'Aquí vas a contar lo que vive tu cuadra: dolores, deseos y proyectos.',
    enVivo: 'Aquí vas a ver en vivo lo que cuenta Sabaneta: el mapa y cómo reparten los 100.',
    miBarrio: 'Aquí vas a ver el Estado de cuenta de tu barrio y su cartelera.',
    reparte: 'Aquí vas a repartir los 100 pesos entre lo que más le importa a Sabaneta.',
    volver: 'Volver al inicio',
  },

  legal: {
    pendiente: 'PENDIENTE DE REVISIÓN DEL ABOGADO',
    pendienteElectoral: 'PENDIENTE DE REVISIÓN DEL ABOGADO ELECTORAL',
    actualizado: 'Versión',
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
    reintentar: 'Intentar otra vez',
  },
  cargando: 'Cargando…',
} as const
