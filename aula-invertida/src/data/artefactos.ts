// ============================================================
// Artefactos de aprendizaje de Consultorio
// No solo contenido: cosas para hacer, sobre casos reales o simulados.
// ============================================================

export type TipoArtefacto = "Caso simulado" | "Simulador" | "Calculadora" | "Checklist" | "Plantillas" | "Autoevaluación" | "Dilemas" | "Piezas";
export interface Artefacto { id: string; tipo: TipoArtefacto; titulo: string; para: string; minutos: number }

export const ARTEFACTOS_CONSULTORIO: Artefacto[] = [
  { id: "caso-laura", tipo: "Caso simulado", titulo: "Expediente de práctica: Laura Prueba", para: "Practica todo Consultorio sin tocar datos reales: tres sesiones transcritas, un instrumento, pagos y una señal de riesgo.", minutos: 45 },
  { id: "dilemas", tipo: "Dilemas", titulo: "Seis decisiones difíciles", para: "Situaciones reales de privacidad, riesgo y documentos. Decides y recibes la explicación.", minutos: 10 },
  { id: "sim-precio", tipo: "Simulador", titulo: "«Está caro»: conversación de precio", para: "Una consultante potencial te pide descuento. Practica sostener tu precio.", minutos: 10 },
  { id: "sim-aliado", tipo: "Simulador", titulo: "Preséntate a una médica", para: "Tienes 3 minutos con una médica general ocupada. Propón remisiones mutuas.", minutos: 10 },
  { id: "sim-empresa", tipo: "Simulador", titulo: "Un taller para una empresa", para: "El jefe de gestión humana de una pyme quiere un taller de estrés con poco presupuesto.", minutos: 12 },
  { id: "numeros", tipo: "Calculadora", titulo: "Mis números del consultorio", para: "Tu precio piso, las horas que se te van y lo que vale tu cartera, con tus datos.", minutos: 8 },
  { id: "consentimiento", tipo: "Plantillas", titulo: "Consentimiento con autorización de transcripción", para: "Modelo para adaptar: confidencialidad, IA, transcripción opcional y datos personales.", minutos: 10 },
  { id: "piezas", tipo: "Piezas", titulo: "Infografías para descargar", para: "Las tres infografías de Consultorio en formato de post, para estudiar o compartir.", minutos: 3 },
  { id: "checklist", tipo: "Checklist", titulo: "Instalación y primera semana", para: "Marca cada paso y sabrás exactamente dónde vas.", minutos: 5 },
  { id: "mensajes", tipo: "Plantillas", titulo: "Mensajes listos para WhatsApp", para: "Recordatorio, cobro amable, seguimiento y presentación a un aliado, sin información clínica.", minutos: 5 },
  { id: "rubrica", tipo: "Autoevaluación", titulo: "¿Estás lista para certificarte?", para: "La misma rúbrica de la certificación, para que te evalúes antes.", minutos: 5 },
];

// ---------- Caso simulado ----------
export const CASO_LAURA = {
  ficha: "Laura Prueba (caso ficticio) · 29 años · analista de mercadeo en Medellín · vive con su pareja · EPS: ficticia · consulta particular, modalidad virtual · tarifa $120.000.",
  motivo: "Ansiedad antes de reuniones y presentaciones de trabajo, insomnio de conciliación desde hace cuatro meses, tras un cambio de jefe.",
  sesiones: [
    { titulo: "Sesión 1 · Primera vez · 3 de noviembre", ejercicio: "Pégala en Claude y pide: «procesa esta transcripción como la primera sesión de Laura Prueba». Revisa que la historia de ingreso use sus palabras y deje en «…» lo que no se habló.",
      deberias: ["Consultante nueva creada con los datos dichos", "Historia de ingreso con motivo en palabras de Laura", "Autorización verbal de transcripción registrada", "Riesgo: sin indicadores, tal como lo dijo la psicóloga", "Consentimiento en borrador"],
      lineas: [
        ["Psicóloga", "Sesión con Laura Prueba. Primera vez. Virtual."],
        ["Psicóloga", "Laura, antes de empezar: ¿autorizas que la sesión se transcriba para mi historia clínica? Solo yo tengo acceso."],
        ["Laura", "Sí, lo autorizo."],
        ["Psicóloga", "Gracias. Cuéntame qué te trae."],
        ["Laura", "Desde que cambiaron a mi jefe hace como cuatro meses, me da mucha ansiedad antes de cualquier reunión. El domingo en la noche ya no duermo pensando en el lunes."],
        ["Psicóloga", "¿Qué pasa en tu cuerpo cuando se acerca una reunión?"],
        ["Laura", "Se me acelera el corazón, me sudan las manos y siento que se me va a olvidar todo."],
        ["Psicóloga", "¿Has estado antes en terapia o tomado algún medicamento para esto?"],
        ["Laura", "Fui a terapia en la universidad un semestre. Medicamentos no."],
        ["Psicóloga", "¿Alguna vez has pensado en hacerte daño o en no querer vivir?"],
        ["Laura", "No, nunca."],
        ["Psicóloga", "Bien. Te propongo trabajar ocho sesiones, una por semana, con el objetivo de que puedas ir a las reuniones con menos ansiedad y dormir mejor."],
        ["Psicóloga", "Notas para la historia: impresión de ansiedad situacional laboral, sin riesgo identificado. Enfoque cognitivo-conductual. Pagó 120.000 por Nequi."],
      ] as [string, string][] },
    { titulo: "Sesión 2 · Seguimiento · 10 de noviembre", ejercicio: "Procesa la transcripción y verifica que el GAD-7 quede registrado con el puntaje calculado y la observación «verificar».",
      deberias: ["Sesión 2 en Borrador IA", "Tareas anteriores revisadas", "GAD-7 = 10 (moderado) con «Puntaje calculado desde la transcripción — verificar»", "Cobro pendiente creado"],
      lineas: [
        ["Psicóloga", "Sesión con Laura Prueba. Seguimiento. Virtual."],
        ["Psicóloga", "¿Cómo te fue con el registro de pensamientos?"],
        ["Laura", "Lo hice tres días. Me di cuenta de que siempre pienso que van a descubrir que no sé hacer mi trabajo."],
        ["Psicóloga", "Vamos a aplicar un cuestionario corto. En las últimas dos semanas, de 0 a 3: ¿te has sentido nerviosa o con los nervios de punta?"],
        ["Laura", "Dos."],
        ["Psicóloga", "¿No poder dejar de preocuparte?"], ["Laura", "Dos."],
        ["Psicóloga", "¿Preocuparte demasiado por diferentes cosas?"], ["Laura", "Uno."],
        ["Psicóloga", "¿Dificultad para relajarte?"], ["Laura", "Dos."],
        ["Psicóloga", "¿Estar tan inquieta que te cuesta quedarte quieta?"], ["Laura", "Uno."],
        ["Psicóloga", "¿Molestarte o irritarte fácilmente?"], ["Laura", "Uno."],
        ["Psicóloga", "¿Sentir miedo, como si algo terrible fuera a pasar?"], ["Laura", "Uno."],
        ["Psicóloga", "Para esta semana: registro de pensamientos cinco días y respiración diafragmática antes de cada reunión."],
      ] as [string, string][] },
    { titulo: "Sesión 3 · Seguimiento con señal de riesgo · 17 de noviembre", ejercicio: "Procesa la transcripción. La señal de riesgo debe aparecer de primera en la respuesta de Claude, citada literal, y el nivel de riesgo debe quedar como lo dijo la psicóloga en sus notas, no como lo infiera la IA.",
      deberias: ["Alerta de riesgo de primera en la respuesta", "Cita literal en la valoración de riesgo", "Nivel de riesgo «Bajo», tomado de las notas de la psicóloga", "Entrada «Alerta de riesgo» en la bitácora, sin contenido clínico", "Segundo cobro pendiente"],
      lineas: [
        ["Psicóloga", "Sesión con Laura Prueba. Seguimiento. Virtual."],
        ["Laura", "Esta semana fue muy pesada. Me cambiaron un proyecto a última hora y me sentí muy sola."],
        ["Laura", "Hubo una noche en que pensé que sería más fácil no despertarme. No quiero hacer nada, pero lo pensé."],
        ["Psicóloga", "Gracias por contármelo. ¿Has pensado en alguna forma de hacerte daño o en algún plan?"],
        ["Laura", "No, nada de eso. Fue un pensamiento esa noche."],
        ["Psicóloga", "¿Con quién cuentas si una noche así vuelve?"],
        ["Laura", "Con mi pareja y con mi hermana."],
        ["Psicóloga", "Acordemos un plan: si vuelve ese pensamiento, le escribes a tu hermana y me escribes a mí. Y tienes la línea de atención en crisis de tu ciudad."],
        ["Psicóloga", "Notas para la historia: ideación pasiva de muerte una noche, sin plan ni intención, con red de apoyo. Riesgo bajo. Plan de seguridad acordado. Seguimiento en 7 días."],
      ] as [string, string][] },
  ],
  pagos: "Sesión 1: pagada ($120.000, Nequi). Sesiones 2 y 3: pendientes. Ejercicio final: pregúntale a Claude «¿quién me debe?» y luego «escríbele a Laura un cobro amable» y revisa que el mensaje no tenga información clínica.",
};

export function casoLauraMarkdown(): string {
  return `# Expediente de práctica · Laura Prueba (caso ficticio)
VinkU edu · Consultorio · Material de práctica. Úsalo en un Notion de prueba, nunca mezclado con consultantes reales.

## Ficha
${CASO_LAURA.ficha}

## Motivo de consulta
${CASO_LAURA.motivo}

${CASO_LAURA.sesiones.map((s) => `## ${s.titulo}

### Transcripción
${s.lineas.map(([q, t]) => `**${q}:** ${t}`).join("\n\n")}

### Ejercicio
${s.ejercicio}

### Deberías ver
${s.deberias.map((d) => `- [ ] ${d}`).join("\n")}
`).join("\n")}
## Pagos
${CASO_LAURA.pagos}

---
Caso construido con fines formativos. Cualquier parecido con personas reales es coincidencia.
`;
}

// ---------- Simuladores (juego de roles con IA) ----------
export interface Escenario { id: string; personaje: string; contexto: string; rol: string; abre: string; criterios: string[]; demo: string[] }
export const ESCENARIOS: Record<string, Escenario> = {
  "sim-precio": {
    id: "sim-precio", personaje: "Carolina, consultante potencial",
    contexto: "Carolina te escribe por WhatsApp. Tiene 34 años, quiere iniciar terapia por estrés y ya cotizó con otra psicóloga.",
    rol: "Eres Carolina, 34 años, de Medellín. Quieres empezar terapia por estrés laboral pero el presupuesto te preocupa. Otra psicóloga te cobra $80.000. Pide descuento con amabilidad pero con insistencia; si la psicóloga explica bien su valor u ofrece opciones de alcance (paquete, frecuencia), te abres a aceptar. No eres grosera. Respuestas cortas, como en WhatsApp.",
    abre: "Hola, me pasaron tu contacto. ¿Cuánto cobras por sesión? Es que otra psicóloga me dijo $80.000…",
    criterios: ["Sostiene su precio sin disculparse", "Explica el valor con claridad", "Ofrece alternativas de alcance, no de precio", "Mantiene un tono cálido y profesional"],
    demo: ["Entiendo… ¿y no me puedes dejar la sesión más barata?", "Ok, ¿y si vengo cada quince días?", "Bueno, me sirve lo del paquete. ¿Cómo pago?"],
  },
  "sim-aliado": {
    id: "sim-aliado", personaje: "Dra. Ruiz, médica general",
    contexto: "Tienes tres minutos con la Dra. Ruiz al final de su jornada en una IPS de barrio. No te conoce.",
    rol: "Eres la Dra. Ruiz, médica general en una IPS de barrio en Medellín. Estás cansada al final de la jornada y eres algo escéptica. Ves muchos pacientes con ansiedad y no sabes a quién remitirlos. Valoras propuestas concretas y breves; si te hablan en abstracto, cortas la conversación con educación. Nunca compartes datos de pacientes. Respuestas cortas.",
    abre: "Hola, sí, cuénteme rápido que ya me voy.",
    criterios: ["Se presenta en menos de 30 segundos", "Dice con claridad qué atiende y qué no", "Propone una remisión concreta en las dos vías", "No pide ni comparte datos de pacientes", "Cierra con un siguiente paso"],
    demo: ["¿Y usted qué tipo de casos atiende?", "Me llegan muchos con ansiedad. ¿Cómo sería la remisión?", "Listo, déjeme su tarjeta y lo hablamos la otra semana."],
  },
  "sim-empresa": {
    id: "sim-empresa", personaje: "Jorge, jefe de gestión humana",
    contexto: "Jorge dirige gestión humana en una pyme de 60 empleados. Te llamó porque quiere «un taller de estrés» y tiene poco presupuesto.",
    rol: "Eres Jorge, jefe de gestión humana de una pyme de logística con 60 empleados en Itagüí. Quieres un taller de manejo del estrés porque hay ausentismo, pero tu presupuesto es bajo (unos $800.000) y te preocupa que sea una charla motivacional sin resultados. Respondes preguntas si te las hacen. Al final pides propuesta y precio. Respuestas cortas.",
    abre: "Buenas, le cuento: queremos hacer un taller de estrés para la gente. ¿Usted cuánto cobra?",
    criterios: ["Pregunta antes de cotizar: necesidad, público y resultado esperado", "Propone un alcance claro con entregables", "Da un precio con base en lo conversado", "Cierra con un siguiente paso concreto"],
    demo: ["Pues hay mucho ausentismo, sobre todo en bodega.", "Unas 25 personas. Que aprendan a manejar la presión.", "Suena bien. Mándeme la propuesta con el precio."],
  },
};

// ---------- Plantillas ----------
export const MENSAJES = [
  { titulo: "Recordatorio de cita", texto: "Hola, «nombre». Te recuerdo tu cita de mañana, «día» a las «hora», «modalidad». Si necesitas reprogramar, avísame con 24 horas de anticipación. ¡Nos vemos!" },
  { titulo: "Cobro amable", texto: "Hola, «nombre». Te comparto el saldo pendiente de las sesiones de «mes»: «valor». Puedes pagar por «medio de pago». Cualquier cosa me cuentas. ¡Gracias!" },
  { titulo: "Seguimiento sin cita", texto: "Hola, «nombre». Hace un tiempo no nos vemos y quería saber cómo estás. Si quieres retomar, tengo espacio esta semana. Y si prefieres cerrar el proceso, también podemos hacer una sesión de cierre." },
  { titulo: "Presentación a un aliado", texto: "Hola, «nombre del aliado». Soy «tu nombre», psicóloga «enfoque» en «ciudad». Atiendo «tipo de casos» en modalidad «modalidad». Me gustaría proponerte remisiones mutuas para los casos que cada una no atiende. ¿Te parece si hablamos 15 minutos esta semana?" },
];

export const CHECKLIST_CONSULTORIO = [
  "Dupliqué la plantilla Consultorio en mi Notion",
  "Conecté Notion a Claude",
  "Subí las skills consultorio-psicologico y consultorio-enfoque",
  "Escribí «configura mi consultorio» y respondí los datos",
  "Ajusté el consultorio a mi enfoque",
  "Practiqué con el expediente de Laura Prueba",
  "Registré mi primera sesión real",
  "Aprobé mis borradores al final del día",
  "Hice mi primer cierre semanal",
];
