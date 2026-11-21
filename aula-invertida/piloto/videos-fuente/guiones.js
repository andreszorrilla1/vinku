// Serie de videos de Consultorio · VinkU edu
// *texto* = acento serif salvia · _texto_ = acento serif albaricoque
window.VIDEOS = {
  "consultorio-01-instala": {
    serie: "Consultorio · Instalar", n: "01",
    escenas: [
      { tipo: "gancho", dur: 5, lineas: ["¿Terminas la consulta", "y te faltan *tres historias*", "por escribir?"], cap: "Esto es para ti." },
      { tipo: "gancho", dur: 4, lineas: ["En _15 minutos_", "dejas tu consultorio", "funcionando."], cap: "Te muestro cómo, paso a paso." },
      { tipo: "piezas", dur: 7, titulo: "Tres piezas", items: [
        { t: "Notion", s: "Donde vive tu consultorio", i: "N" },
        { t: "Claude", s: "Quien redacta los borradores", i: "C" },
        { t: "Tactiq", s: "Quien escucha la sesión · opcional", i: "T" }], cap: "Tú decides. La IA solo redacta." },
      { tipo: "titulo", dur: 2.6, num: "1", kicker: "Paso 1 de 5", titulo: "Duplica la plantilla" },
      { tipo: "ventana", dur: 7, titulo: "Consultorio", filas: ["Consultantes", "Sesiones", "Pagos", "Instrumentos", "Documentos", "Técnicas y herramientas", "Bitácora"].map((t) => ({ t })), boton: "Duplicar", click: 4.4, toast: "Plantilla duplicada en tu Notion", cap: "Te llega el enlace al inscribirte en el piloto." },
      { tipo: "titulo", dur: 2.6, num: "2", kicker: "Paso 2 de 5", titulo: "Conecta Notion a Claude" },
      { tipo: "toggle", dur: 5.5, titulo: "Conectores", items: [{ t: "Notion", on: 1.4 }, { t: "Tactiq · opcional", on: 3.0 }, { t: "Google Calendar · opcional", on: 99 }], cap: "En Claude: configuración, conectores." },
      { tipo: "titulo", dur: 2.6, num: "3", kicker: "Paso 3 de 5", titulo: "Sube las dos skills" },
      { tipo: "piezas", dur: 6, titulo: "Tus skills", check: true, items: [
        { t: "consultorio-psicologico", s: "Sesiones, historias, cobros y documentos" },
        { t: "consultorio-enfoque", s: "Tu personalización por enfoque clínico" }], cap: "Vienen en el kit que descargas." },
      { tipo: "titulo", dur: 2.6, num: "4", kicker: "Paso 4 de 5", titulo: "Configura tu consultorio" },
      { tipo: "chat", dur: 8, usuario: "configura mi consultorio", respuesta: "¡Empecemos! Cuéntame tu nombre, tu tarjeta profesional, tu tarifa por sesión y tu política de cancelación.", tarjeta: "Configuración del consultorio · creada", cap: "Respondes una vez y queda guardado." },
      { tipo: "titulo", dur: 2.6, num: "5", kicker: "Paso 5 de 5", titulo: "Ajústalo a tu enfoque" },
      { tipo: "chips", dur: 7.5, titulo: "Tu enfoque", chips: ["TCC", "ACT", "Psicodinámico", "Humanista", "Sistémico", "Logoterapia"], sel: 4, selEn: 1.4, items: ["Pautas relacionales", "Hipótesis sistémica", "Genograma en la historia"], cap: "Escribe: «ajusta el consultorio a mi enfoque»." },
      { tipo: "cierre", dur: 5.5, linea1: "Listo. La IA redacta,", linea2: "tú decides.", cta: "Masterclass · 1 de diciembre · 7:00 p. m." },
    ],
  },
  "consultorio-02-sesion": {
    serie: "Consultorio · Usar", n: "02",
    escenas: [
      { tipo: "gancho", dur: 4.2, lineas: ["¿Qué pasa", "después de *colgar*?"], cap: "Caso ficticio, para que lo veas funcionar." },
      { tipo: "transcripcion", dur: 7.5, titulo: "Sala del consultorio · Tactiq", lineas: [
        ["Psicóloga", "Sesión con Laura Prueba. Seguimiento. Virtual."],
        ["Laura", "Esta semana practiqué la respiración tres días."],
        ["Psicóloga", "¿Y qué pasó antes de la reunión del lunes?"],
        ["Laura", "Me anticipé otra vez, pero esta vez lo noté."]], cap: "Tactiq transcribe. Tú solo atiendes." },
      { tipo: "chat", dur: 6.5, usuario: "procesa la sesión de Laura", respuesta: "Listo. Registré la sesión 4 como borrador para que la revises. No encontré alertas de riesgo.", cap: "Le pides una sola cosa." },
      { tipo: "registro", dur: 8.5, titulo: "Laura Prueba · Sesión 4", cambia: 6.4, secciones: [
        ["Revisión de tareas", "Practicó la respiración 3 de 7 días."],
        ["Temas trabajados", "Ansiedad anticipatoria en el trabajo."],
        ["Tareas acordadas", "Registro de pensamientos, 5 días."],
        ["Para la próxima sesión", "Revisar el registro juntas."]], cap: [[0, "El borrador aparece en tu Notion."], [5, "Lo lees, corriges y apruebas."]] },
      { tipo: "ventana", dur: 5, titulo: "Pagos", filas: [{ t: "Laura Prueba · Sesión 4", tag: "Pendiente" }, { t: "Andrés Prueba · Sesión 2", tag: "Pagado" }], toast: "Cobro creado", toastEn: 1.6, cap: "Y el cobro queda creado." },
      { tipo: "alerta", dur: 5.5, titulo: "Riesgo primero", texto: "Si en una sesión aparece riesgo, es lo primero que te avisa. El nivel lo defines tú.", cap: "Lo clínico lo decides tú." },
      { tipo: "cierre", dur: 5.5, linea1: "La IA escribe el borrador.", linea2: "La firma es tuya.", cta: "Consultorio · piloto gratis" },
    ],
  },
  "crecer-01-negocio": {
    serie: "Haz crecer tu consultorio", n: "03",
    escenas: [
      { tipo: "gancho", dur: 5, lineas: ["Eres psicóloga.", "Y también diriges", "una *pequeña empresa*."], cap: "Aunque nadie te lo haya dicho." },
      { tipo: "titulo", dur: 2.8, num: "1", kicker: "Tres números que casi nadie mira", titulo: "Horas fuera de sesión" },
      { tipo: "numero", dur: 5, etiqueta: "Horas que escribes fuera de sesión", valor: 6, sufijo: " h", nota: "por semana · ejemplo · ¿cuál es tu número?", cap: "Anótalo hoy. Es tu punto de partida." },
      { tipo: "titulo", dur: 2.8, num: "2", kicker: "Tres números que casi nadie mira", titulo: "Cartera de más de 30 días" },
      { tipo: "chat", dur: 6, usuario: "¿quién me debe?", respuesta: "Tienes 3 cobros pendientes. El más antiguo lleva 42 días.", cap: "Lo que no cobras también es tu trabajo." },
      { tipo: "titulo", dur: 2.8, num: "3", kicker: "Tres números que casi nadie mira", titulo: "Consultantes que se fueron sin cierre" },
      { tipo: "lista", dur: 7, titulo: "Riesgo de abandono", items: [
        { t: "21 días sin sesión", s: "y sin una cita futura" },
        { t: "Un mensaje de seguimiento", s: "cálido y sin información clínica" },
        { t: "Cierre o regreso", s: "los dos son buenos finales" }], cap: "Seguir no es perseguir." },
      { tipo: "gancho", dur: 4.6, lineas: ["Cada viernes,", "el *cierre semanal*", "te muestra los tres."], cap: "Escribe: «cierre semanal»." },
      { tipo: "cierre", dur: 5.5, linea1: "De atender pacientes", linea2: "a dirigir tu consultorio.", cta: "Laboratorio · 15 de diciembre" },
    ],
  },
  "crecer-02-horas": {
    serie: "Haz crecer tu consultorio", n: "04",
    escenas: [
      { tipo: "gancho", dur: 5, lineas: ["Recuperaste", "_4 horas_ a la semana.", "¿Y ahora qué?"], cap: "Cuatro ideas para convertirlas en ingresos." },
      { tipo: "lista", dur: 12, titulo: "Del tiempo al negocio", gap: 2.2, items: [
        { t: "Talleres grupales", s: "Psicoeducación para 8 a 12 personas: un tema, una tarde." },
        { t: "Bienestar para empresas", s: "Charlas y programas cortos de salud mental laboral." },
        { t: "Supervisión entre colegas", s: "Lo que sabes de tu enfoque, para quienes empiezan." },
        { t: "Contenido que atrae", s: "Responde en público las preguntas que más te hacen." }], cap: "Cada idea nace de algo que ya haces." },
      { tipo: "formula", dur: 8.5, titulo: "Haz la cuenta", filas: [
        { l: "Personas en el taller", v: "10" },
        { l: "Valor por persona", v: "$60.000", op: "×" },
        { l: "Ingreso de una tarde", v: "$600.000", op: "=" }], nota: "Cifras de ejemplo: pon las tuyas.", cap: "Una tarde puede valer varias sesiones." },
      { tipo: "gancho", dur: 5, lineas: ["Elige _una_.", "Pruébala en *30 días*."], cap: "Un piloto pequeño vale más que un plan perfecto." },
      { tipo: "cierre", dur: 5.5, linea1: "Tráela al laboratorio", linea2: "y la validamos juntas.", cta: "Laboratorio · 15 de diciembre · 7:00 p. m." },
    ],
  },
  "crecer-03-precio": {
    serie: "Haz crecer tu consultorio", n: "05",
    escenas: [
      { tipo: "gancho", dur: 5, lineas: ["¿Cobras lo que", "te da _pena_ cobrar?"], cap: "Calcula tu precio en tres pasos." },
      { tipo: "formula", dur: 10.5, titulo: "Tu precio piso", filas: [
        { l: "Lo que necesitas al mes", v: "$6.000.000" },
        { l: "Costos del consultorio", v: "$1.500.000", op: "+" },
        { l: "Sesiones reales al mes", v: "60", op: "÷" },
        { l: "Tu precio piso", v: "$125.000", op: "=" }], nota: "Cifras de ejemplo.", cap: "Por debajo de tu piso, pierdes dinero." },
      { tipo: "lista", dur: 9, titulo: "Tres formas de cobrar", items: [
        { t: "Sesión suelta", s: "El precio completo." },
        { t: "Paquete de 4 sesiones", s: "Compromiso y un pequeño descuento." },
        { t: "Programa", s: "Un proceso con objetivo, duración y entregables." }], cap: "Tres opciones hacen más fácil decidir." },
      { tipo: "gancho", dur: 5.5, lineas: ["Si te dicen", "_«está caro»_,", "ajusta el alcance,", "no tu valor."], cap: "Negocia lo que incluyes, no lo que vales." },
      { tipo: "cierre", dur: 5.5, linea1: "Cobra lo que vale", linea2: "y sabe por qué.", cta: "Herramienta: Calculadora de tarifa" },
    ],
  },
  "crecer-04-alianzas": {
    serie: "Haz crecer tu consultorio", n: "06",
    escenas: [
      { tipo: "gancho", dur: 5.5, lineas: ["Tus próximos consultantes", "ya conocen a *alguien*", "que te conoce."], cap: "La recomendación es tu canal más cercano." },
      { tipo: "lista", dur: 12, titulo: "Cuatro alianzas para empezar", gap: 2.2, items: [
        { t: "Médicos y psiquiatras", s: "Remisiones en las dos vías." },
        { t: "Colegios y universidades", s: "Talleres para familias y estudiantes." },
        { t: "Empresas pequeñas", s: "Bienestar laboral por horas." },
        { t: "Colegas de otros enfoques", s: "Te remiten lo que no atienden." }], cap: "Empieza por quien ya confía en ti." },
      { tipo: "chat", dur: 7, usuario: "ayúdame a presentarme a la doctora Ruiz", respuesta: "Aquí tienes un mensaje corto: quién eres, qué atiendes y una propuesta de remisión mutua. Sin datos de consultantes.", cap: "Claude te ayuda con el primer mensaje." },
      { tipo: "gancho", dur: 5, lineas: ["Una alianza", "por *semana*.", "Cuatro al mes."], cap: "Constancia antes que intensidad." },
      { tipo: "cierre", dur: 5.5, linea1: "Tu consultorio", linea2: "también es una red.", cta: "De Profesional a Emprendedor · 20 de enero" },
    ],
  },
};
