// ============================================================
// Aprendizaje Basado en Herramientas · Repositorio
// Cada experiencia de aprendizaje es una herramienta: se descarga
// genérica, la persona la personaliza sola, aprende con cápsulas,
// la usa en un caso real y la valida en vivo (masterclass y laboratorio).
// TOOLSET · SKILLSET · MINDSET — de profesional a emprendedor.
// ============================================================

export type TipoPieza = "Plantilla Notion" | "Skill de Claude" | "Conector" | "Plantilla" | "Guía" | "Hoja de cálculo" | "Mini app";
export type Formato = "Kit con IA" | "Plantilla" | "Guía" | "Hoja de cálculo" | "Mini app";
export type Objetivo = "Nuevo campo de acción" | "Independiente" | "Emprendedor";
export const OBJETIVOS: Objetivo[] = ["Nuevo campo de acción", "Independiente", "Emprendedor"];
export const FORMATOS: Formato[] = ["Kit con IA", "Plantilla", "Guía", "Hoja de cálculo", "Mini app"];

export interface Pieza { nombre: string; tipo: TipoPieza; detalle: string }
export type Capsula =
  | { formato: "Video"; titulo: string; minutos: number; idea: string; guion: string[]; src?: string; serie?: string }
  | { formato: "Infográfico"; titulo: string; minutos: number; idea: string; pasos?: string[]; comparacion?: { izq: string; der: string; filas: [string, string][] } }
  | { formato: "Texto"; titulo: string; minutos: number; idea: string; cuerpo: string[] };

export interface Herramienta {
  id: string;
  nombre: string;
  oficio: string;
  claves: string[];            // palabras para la búsqueda y la relevancia
  oportunidad: string;
  promesa: string;             // qué logras crear, implementar o gestionar
  objetivos: Objetivo[];
  formato: Formato;
  precio: number;              // 0 = herramienta de entrada gratis
  estado: "Disponible" | "Piloto abierto" | "En diseño";
  semana: number;
  toolset: Pieza[];
  personalizacion: string;     // cómo la persona la ajusta sola
  skillset: string[];
  mindset: { de: string; a: string };
  capsulas: Capsula[];
  reto: { tarea: string; criterio: string };
  victoria: string;            // la victoria temprana
  metricas: string[];          // lo que se reporta en el laboratorio
  negocio: string;
  siguiente: { nombre: string; detalle: string; precio: string }[];
}

const SIGUIENTE_BASE = [
  { nombre: "Suscripción VinkU edu", detalle: "Todas las herramientas, masterclasses y laboratorios cada semana.", precio: "Próximamente" },
  { nombre: "De Profesional a Emprendedor", detalle: "Seis semanas para armar tu caja de herramientas y lanzar una al mercado. Cohorte 1: 20 de enero de 2027.", precio: "$2.400.000 · preventa $1.990.000" },
];

type Corta = Omit<Herramienta, "id" | "nombre" | "capsulas" | "siguiente"> & { capsulas?: Capsula[] };
const corta = (id: string, nombre: string, x: Corta): Herramienta => ({
  ...x,
  id, nombre,
  capsulas: x.capsulas || [
    { formato: "Video", titulo: `Cómo funciona ${nombre}`, minutos: 6, idea: "Recorrido por la herramienta y primer uso.", guion: [] },
    { formato: "Infográfico", titulo: "El recorrido", minutos: 3, idea: "De lo que sabes a donde se necesita.", pasos: x.toolset.map((t) => t.nombre).concat(x.victoria.split(" ").slice(0, 4).join(" ") + "…") },
    { formato: "Texto", titulo: "Cómo se vuelve negocio", minutos: 4, idea: x.negocio, cuerpo: [x.oportunidad, x.negocio, `El cambio de mentalidad: de «${x.mindset.de}» a «${x.mindset.a}».`] },
  ],
  siguiente: SIGUIENTE_BASE,
});

export const HERRAMIENTAS: Herramienta[] = [
  {
    id: "consultorio",
    nombre: "Consultorio",
    oficio: "Psicólogas y psicólogos independientes",
    claves: ["psicología", "psicóloga", "psicólogo", "clínica", "terapia", "consulta", "historia clínica", "pacientes", "consultantes", "notion", "tactiq", "cobros"],
    oportunidad: "La consulta privada se pierde en historias clínicas, cobros y documentos que se hacen de noche.",
    promesa: "Gestionar tu consulta con IA: sesiones, historias, cobros y documentos.",
    objetivos: ["Independiente"],
    formato: "Kit con IA",
    precio: 0,
    estado: "Piloto abierto",
    semana: 1,
    toolset: [
      { nombre: "Plantilla Consultorio", tipo: "Plantilla Notion", detalle: "Consultantes, sesiones, pagos, instrumentos, documentos, técnicas y bitácora conectados." },
      { nombre: "consultorio-psicologico", tipo: "Skill de Claude", detalle: "14 flujos: sesiones, historia de ingreso, cobros, PHQ-9 y GAD-7, documentos en PDF y Word, resumen del día y cierre semanal." },
      { nombre: "consultorio-enfoque", tipo: "Skill de Claude", detalle: "Tu personalización: ajusta registros, historia y técnicas a tu enfoque clínico y tu población." },
      { nombre: "Tactiq (opcional)", tipo: "Conector", detalle: "Transcribe sesiones virtuales y presenciales para que la IA haga el borrador." },
    ],
    personalizacion: "Con la skill consultorio-enfoque eliges tu enfoque (TCC, ACT, psicodinámico, humanista, sistémico, logoterapia o integrativo) y tu población. Ella ajusta tus registros, tu historia de ingreso y tu catálogo de técnicas.",
    skillset: ["Documentar con IA sin perder el criterio clínico", "Gestionar cartera y cobros", "Proteger datos sensibles", "Diseñar el proceso de tu consulta"],
    mindset: { de: "Atiendo pacientes", a: "Dirijo mi consultorio" },
    capsulas: [
      { formato: "Video", titulo: "Instala Consultorio en 15 minutos", minutos: 1, src: "consultorio-01-instala", serie: "Instalar y usar", idea: "Duplicar la plantilla, conectar Notion, subir las skills y configurar.",
        guion: ["«Si terminas la consulta y te faltan tres historias, este video es para ti»", "Las piezas: Notion, Claude y Tactiq", "Duplicar la plantilla", "Conectar Notion y subir las dos skills", "«configura mi consultorio»", "Personalízalo a tu enfoque"] },
      { formato: "Video", titulo: "De la sesión a la historia", minutos: 1, src: "consultorio-02-sesion", serie: "Instalar y usar", idea: "Una sesión de prueba convertida en borrador, revisada, aprobada y cobrada.",
        guion: ["Sesión de prueba con Tactiq y frase de apertura", "«procesa la sesión de Laura»", "Revisar, corregir y aprobar", "Riesgo primero: lo que la IA avisa"] },
      { formato: "Video", titulo: "Tu consultorio como negocio", minutos: 1, src: "crecer-01-negocio", serie: "Haz crecer tu consultorio", idea: "Tres números que casi nadie mira: horas fuera de sesión, cartera y abandono.",
        guion: ["Eres psicóloga y diriges una pequeña empresa", "Horas, cartera y abandono", "Cierre semanal y «¿quién me debe?»", "Qué hacer con las horas ganadas"] },
      { formato: "Video", titulo: "Convierte tus horas en ingresos", minutos: 1, src: "crecer-02-horas", serie: "Haz crecer tu consultorio", idea: "Cuatro ideas para las horas que recuperas: talleres, bienestar para empresas, supervisión y contenido.",
        guion: ["Recuperaste horas, ¿y ahora qué?", "Cuatro formas de convertirlas en ingresos", "Haz la cuenta de un taller", "Elige una y pruébala en 30 días"] },
      { formato: "Video", titulo: "Tu precio sin miedo", minutos: 1, src: "crecer-03-precio", serie: "Haz crecer tu consultorio", idea: "Tu precio piso en tres pasos y tres formas de cobrar.",
        guion: ["¿Cobras lo que te da pena cobrar?", "Tu precio piso", "Sesión, paquete y programa", "Ajusta el alcance, no tu valor"] },
      { formato: "Video", titulo: "Alianzas que traen consultantes", minutos: 1, src: "crecer-04-alianzas", serie: "Haz crecer tu consultorio", idea: "Cuatro alianzas para empezar y cómo escribir el primer mensaje.",
        guion: ["Tus próximos consultantes ya conocen a alguien", "Cuatro alianzas para empezar", "El primer mensaje", "Una alianza por semana"] },
      { formato: "Infográfico", titulo: "El recorrido de una sesión", minutos: 2, idea: "Del diálogo en consulta a la historia aprobada.",
        pasos: ["Sesión con Tactiq", "Borrador IA en Notion", "Revisas y apruebas", "Cobro creado", "Cierre semanal"] },
      { formato: "Infográfico", titulo: "Lo que hace la IA, lo que decides tú", minutos: 2, idea: "La firma sigue siendo tuya.",
        comparacion: { izq: "La IA", der: "Tú", filas: [["Transcribe y ordena", "Defines el nivel de riesgo"], ["Redacta borradores", "Apruebas, corriges o descartas"], ["Calcula puntajes y saldos", "Haces la impresión diagnóstica"], ["Te recuerda pendientes", "Decides qué sale hacia el consultante"]] } },
      { formato: "Infográfico", titulo: "Tu semana con Consultorio", minutos: 2, idea: "Una rutina corta que evita trabajar de noche.",
        pasos: ["Mañana: resumen del día", "Tras cada sesión: borrador", "Fin del día: apruebas", "Viernes: cierre semanal"] },
      { formato: "Texto", titulo: "Datos sensibles y autorización para transcribir", minutos: 5, idea: "Las reglas de privacidad que Consultorio respeta por diseño.",
        cuerpo: [
          "La historia clínica es un documento privado y sometido a reserva. En Colombia la regula la Resolución 1995 de 1999 del Ministerio de Salud, modificada por la Resolución 839 de 2017. La Ley 2015 de 2020 regula la historia clínica electrónica interoperable y la Ley 1581 de 2012 protege los datos personales, que en salud son sensibles. Como psicóloga, además, te rige el secreto profesional de la Ley 1090 de 2006.",
          "Consultorio cumple cinco reglas. Uno: el consultante autoriza la transcripción por escrito o en voz alta al inicio, y queda registrado. Dos: la transcripción es materia prima y no se copia completa a Notion. Tres: nada clínico va en la bitácora ni por WhatsApp. Cuatro: lo que sale hacia terceros es tuyo y no menciona la IA. Cinco: la historia vive en tu Notion, no en la memoria de Claude.",
          "El Ministerio de Salud tiene en consulta, desde julio de 2026, un proyecto que actualiza las reglas de historia clínica. Revisa los cambios con Colpsic o con tu asesor jurídico: esta cápsula orienta, no reemplaza una asesoría legal.",
        ] },
      { formato: "Texto", titulo: "Elige tu enfoque", minutos: 4, idea: "Cómo se personaliza Consultorio sin depender de nadie.",
        cuerpo: [
          "Consultorio llega genérico a propósito: tú lo ajustas a tu forma de trabajar. Escribe en Claude «ajusta el consultorio a mi enfoque» y la skill consultorio-enfoque te pregunta tu enfoque y tu población.",
          "Antes de cambiar nada te muestra qué hará: secciones nuevas en tus registros de sesión, qué explorar más en la historia de ingreso y las técnicas de tu enfoque, que se suman a tu catálogo.",
          "Puedes repetirlo cuando cambies de enfoque o quieras sumar técnicas propias. Lo que nunca cambia: los borradores los apruebas tú y el riesgo va primero.",
        ] },
    ],
    reto: { tarea: "Registra en Consultorio todas tus sesiones de una semana, apruébalas al final de cada día y haz el cierre semanal el viernes.", criterio: "El viernes no tienes borradores pendientes, sabes quién te debe y cuántas horas recuperaste." },
    victoria: "Cerré una semana de consulta con todas mis sesiones registradas y sin trabajar de noche.",
    metricas: ["Sesiones registradas", "Horas ahorradas por semana", "Una fricción que encontraste"],
    negocio: "Más horas para atender o crear servicios nuevos y menos cartera perdida.",
    siguiente: [
      { nombre: "Instalación asistida 1:1", detalle: "Una hora con un consultor de VinkU para dejar tu Consultorio funcionando y personalizado.", precio: "$50.000" },
      ...SIGUIENTE_BASE,
    ],
  },
  corta("consultora", "Consultora en una caja", {
    oficio: "Profesionales de ciencias sociales y humanas que quieren vender consultoría",
    claves: ["consultoría", "consultor", "consultora", "oferta", "propuesta", "precio", "servicio", "independiente", "clientes"],
    oportunidad: "Sabes resolver problemas, pero no tienes una oferta, un precio ni una propuesta para venderlo.",
    promesa: "Crear tu servicio de consultoría: oferta, precio y propuesta.",
    objetivos: ["Independiente", "Emprendedor"], formato: "Kit con IA", precio: 39000, estado: "En diseño", semana: 2,
    toolset: [
      { nombre: "Oferta en una página", tipo: "Plantilla", detalle: "Cliente ideal, problema, alcance, entregables y frase de valor." },
      { nombre: "Calculadora de precio", tipo: "Hoja de cálculo", detalle: "Tu piso, tu tarifa y tres niveles con argumentos." },
      { nombre: "Skill de propuestas", tipo: "Skill de Claude", detalle: "Convierte una conversación con un cliente en propuesta." },
    ],
    personalizacion: "Variantes de la oferta y la propuesta por tipo de cliente: empresa, entidad pública u ONG.",
    skillset: ["Empaquetar un servicio", "Calcular y sostener un precio", "Escribir propuestas que se aprueban"],
    mindset: { de: "Vendo mis horas", a: "Vendo resultados con alcance cerrado" },
    reto: { tarea: "Arma tu oferta y una propuesta para una oportunidad real que tengas hoy.", criterio: "La enviarías hoy sin pedir permiso a nadie." },
    victoria: "Envié mi primera propuesta con precio por resultado.",
    metricas: ["Propuestas enviadas", "Respuestas recibidas", "Una objeción que escuchaste"],
    negocio: "Consultorías por proyecto en tres niveles de precio.",
  }),
  corta("radar", "Radar normativo", {
    oficio: "Abogados, politólogos y profesionales del sector público",
    claves: ["derecho", "abogado", "abogada", "ley", "norma", "decreto", "cumplimiento", "política pública", "politólogo", "regulación"],
    oportunidad: "Cada ley o norma nueva crea obligaciones que alguien tiene que ayudar a cumplir: eso es demanda.",
    promesa: "Crear servicios de cumplimiento a partir de normas nuevas.",
    objetivos: ["Emprendedor", "Nuevo campo de acción"], formato: "Kit con IA", precio: 49000, estado: "En diseño", semana: 3,
    toolset: [
      { nombre: "Skill lector de normas", tipo: "Skill de Claude", detalle: "Extrae a quién obliga una norma, qué exige y desde cuándo." },
      { nombre: "Matriz de oportunidades", tipo: "Plantilla Notion", detalle: "Obligación → quién la sufre → servicio posible." },
      { nombre: "Guía de servicio de cumplimiento", tipo: "Guía", detalle: "Cómo empaquetar diagnóstico y acompañamiento." },
    ],
    personalizacion: "Eliges tu campo normativo (laboral, ambiental, datos, salud, educación) y el radar filtra obligaciones.",
    skillset: ["Leer una norma como mercado", "Diseñar servicios de cumplimiento", "Explicar lo jurídico a quien decide"],
    mindset: { de: "La norma es un trámite", a: "La norma es un mercado" },
    reto: { tarea: "Pasa una norma reciente de tu campo por el radar y elige una oportunidad.", criterio: "Puedes decir en una frase quién te pagaría y por qué." },
    victoria: "Ofrecí un diagnóstico de cumplimiento a una organización obligada.",
    metricas: ["Normas analizadas", "Organizaciones contactadas", "Interés recibido"],
    negocio: "Diagnósticos de cumplimiento y acompañamientos por organización.",
  }),
  corta("mapa", "Mapa de nuevos campos de acción", {
    oficio: "Humanistas que buscan dónde se necesita lo que saben",
    claves: ["empleo", "desempleado", "desempleada", "trabajo", "hoja de vida", "linkedin", "sector", "perfil", "nuevos campos", "reinventarme", "egresado"],
    oportunidad: "Los sectores buscan lo que sabes hacer, pero lo nombran distinto y no te encuentran.",
    promesa: "Abrir un nuevo campo de acción con tu formación.",
    objetivos: ["Nuevo campo de acción"], formato: "Guía", precio: 30000, estado: "En diseño", semana: 4,
    toolset: [
      { nombre: "Mapa de sectores", tipo: "Guía", detalle: "ESG, experiencia de usuario, cumplimiento, cultura organizacional, datos cualitativos." },
      { nombre: "Traductor de perfil", tipo: "Skill de Claude", detalle: "Reescribe tu experiencia en el lenguaje del sector elegido." },
    ],
    personalizacion: "Respondes tu formación y experiencia; el mapa resalta tus tres campos más cercanos.",
    skillset: ["Traducir tu formación", "Escribir logros, no funciones", "Conversar para explorar"],
    mindset: { de: "Busco un empleo de lo mío", a: "Llevo lo que sé donde se necesita" },
    reto: { tarea: "Elige un campo y ten una conversación de exploración con alguien que trabaje ahí.", criterio: "Sales con un dato que no sabías y un siguiente contacto." },
    victoria: "Tuve mi primera conversación con alguien de un nuevo campo.",
    metricas: ["Conversaciones", "Postulaciones", "Lo que aprendiste"],
    negocio: "Nuevos empleos, contratos o proyectos en sectores con demanda.",
  }),
  corta("insights", "Laboratorio de insights", {
    oficio: "Sociólogos, antropólogos e investigadores cualitativos",
    claves: ["sociología", "socióloga", "antropología", "investigación", "cualitativa", "entrevistas", "etnografía", "insights", "mercado", "usuarios"],
    oportunidad: "Las empresas deciden sin entender a sus clientes; la investigación cualitativa rápida es escasa.",
    promesa: "Crear un servicio de investigación cualitativa rápida para empresas.",
    objetivos: ["Nuevo campo de acción", "Independiente"], formato: "Kit con IA", precio: 45000, estado: "En diseño", semana: 5,
    toolset: [
      { nombre: "Kit de entrevistas", tipo: "Plantilla", detalle: "Guion, consentimiento y matriz de registro." },
      { nombre: "Skill de síntesis", tipo: "Skill de Claude", detalle: "De transcripciones a patrones, tensiones e insights con citas." },
      { nombre: "Informe de decisión", tipo: "Plantilla", detalle: "Hallazgos que una gerencia usa el lunes." },
    ],
    personalizacion: "Eliges el método (entrevistas, etnografía rápida o grupos focales) y el kit cambia guiones y matrices.",
    skillset: ["Investigar en semanas", "Sintetizar con IA sin perder el matiz", "Traducir hallazgos a decisiones"],
    mindset: { de: "Investigo para publicar", a: "Investigo para que alguien decida" },
    reto: { tarea: "Haz 3 entrevistas sobre un producto o servicio real y sintetízalas.", criterio: "Tu informe cabe en una página y propone una decisión." },
    victoria: "Presenté hallazgos a quien toma la decisión.",
    metricas: ["Entrevistas", "Insights", "Decisión propuesta"],
    negocio: "Estudios cualitativos rápidos para pymes, agencias y fundaciones.",
  }),
  corta("contenido", "Estudio de contenido", {
    oficio: "Comunicadores, periodistas y publicistas",
    claves: ["comunicación", "comunicador", "comunicadora", "periodista", "redes", "contenido", "marca", "instagram", "publicidad", "marketing"],
    oportunidad: "Las pymes necesitan publicar todas las semanas y no tienen quién lo piense.",
    promesa: "Gestionar el contenido de pymes por suscripción.",
    objetivos: ["Independiente", "Emprendedor"], formato: "Kit con IA", precio: 35000, estado: "En diseño", semana: 6,
    toolset: [
      { nombre: "Parrilla mensual", tipo: "Plantilla Notion", detalle: "Calendario, pilares, formatos y estados." },
      { nombre: "Skill de voz de marca", tipo: "Skill de Claude", detalle: "Aprende la voz de cada cliente y propone piezas." },
    ],
    personalizacion: "La skill aprende la voz de cada cliente a partir de cinco publicaciones suyas.",
    skillset: ["Diseñar un sistema de contenido", "Producir en la voz del cliente", "Mostrar resultados mensuales"],
    mindset: { de: "Publico por inspiración", a: "Opero un sistema que se vende por suscripción" },
    reto: { tarea: "Arma la parrilla de un mes para una marca real.", criterio: "La marca podría publicarla sin pedirte nada más." },
    victoria: "Propuse mi primer plan mensual a una pyme.",
    metricas: ["Parrillas armadas", "Propuestas", "Clientes"],
    negocio: "Planes mensuales de contenido por suscripción.",
  }),
  corta("proyectos", "Formulador de proyectos sociales", {
    oficio: "Trabajadores sociales, gestores culturales y profesionales de ONG",
    claves: ["trabajo social", "trabajadora social", "ong", "fundación", "comunidad", "convocatoria", "cooperación", "proyecto", "cultura", "gestión cultural"],
    oportunidad: "Hay convocatorias y recursos de cooperación que las organizaciones pequeñas no saben formular.",
    promesa: "Crear un servicio de formulación de proyectos.",
    objetivos: ["Nuevo campo de acción", "Independiente"], formato: "Kit con IA", precio: 39000, estado: "En diseño", semana: 7,
    toolset: [
      { nombre: "Tablero de convocatorias", tipo: "Plantilla Notion", detalle: "Requisitos, fechas y estado." },
      { nombre: "Skill formuladora", tipo: "Skill de Claude", detalle: "Problema, objetivos, marco lógico y presupuesto en borrador." },
    ],
    personalizacion: "Eliges el tipo de convocatoria (pública, privada o de cooperación) y la skill ajusta formatos.",
    skillset: ["Leer términos de referencia", "Formular con marco lógico", "Cobrar por formular"],
    mindset: { de: "Ejecuto proyectos de otros", a: "Diseño y vendo los proyectos" },
    reto: { tarea: "Formula un proyecto para una convocatoria abierta.", criterio: "Cumple todos los requisitos y lo presentarías." },
    victoria: "Presenté un proyecto a una convocatoria real.",
    metricas: ["Proyectos formulados", "Presentados", "Aprobados"],
    negocio: "Formulación por proyecto para fundaciones, juntas y colectivos.",
  }),
  corta("clima", "Termómetro de clima", {
    oficio: "Psicólogos organizacionales y profesionales de talento humano",
    claves: ["organizacional", "talento humano", "clima", "cultura", "recursos humanos", "empresa", "equipos", "bienestar"],
    oportunidad: "Las pymes sienten que algo pasa con su gente y no tienen cómo medirlo.",
    promesa: "Implementar diagnósticos de clima para pymes.",
    objetivos: ["Nuevo campo de acción", "Independiente"], formato: "Hoja de cálculo", precio: 45000, estado: "En diseño", semana: 8,
    toolset: [
      { nombre: "Encuesta breve", tipo: "Plantilla", detalle: "Instrumento corto con dimensiones y escala." },
      { nombre: "Tablero de resultados", tipo: "Hoja de cálculo", detalle: "Calcula dimensiones y alertas." },
      { nombre: "Skill de análisis", tipo: "Skill de Claude", detalle: "Respuestas abiertas y plan de acción." },
    ],
    personalizacion: "Eliges el tamaño de la empresa y las dimensiones a medir.",
    skillset: ["Medir clima sin un gran estudio", "Analizar respuestas abiertas", "Proponer acciones con indicador"],
    mindset: { de: "Entrego un informe", a: "Acompaño un cambio que se mide" },
    reto: { tarea: "Aplica la encuesta en un equipo pequeño y analízala.", criterio: "Tienes tres hallazgos y tres acciones medibles." },
    victoria: "Presenté un diagnóstico a una gerencia.",
    metricas: ["Equipos medidos", "Hallazgos", "Acciones aceptadas"],
    negocio: "Diagnóstico y acompañamiento trimestral para pymes.",
  }),
  corta("tarifa", "Calculadora de tarifa", {
    oficio: "Cualquier profesional independiente",
    claves: ["precio", "tarifa", "cobrar", "honorarios", "cuánto cobrar", "independiente", "freelance"],
    oportunidad: "La mayoría de independientes cobra por intuición y termina cobrando de menos.",
    promesa: "Calcular tu tarifa y tres niveles de precio en 10 minutos.",
    objetivos: ["Independiente"], formato: "Mini app", precio: 30000, estado: "En diseño", semana: 9,
    toolset: [{ nombre: "Calculadora de tarifa", tipo: "Mini app", detalle: "Ingresos que necesitas, horas facturables reales, costos y tres niveles." }],
    personalizacion: "Ingresas tus costos, tus horas y tu meta; la calculadora hace el resto.",
    skillset: ["Calcular tu piso", "Fijar precio por valor", "Sostener el precio"],
    mindset: { de: "Cobro lo que me da pena cobrar", a: "Cobro lo que vale y sé por qué" },
    reto: { tarea: "Calcula tu tarifa y preséntala a un cliente o colega.", criterio: "Puedes explicar tu precio sin disculparte." },
    victoria: "Cobré mi nueva tarifa por primera vez.",
    metricas: ["Tarifa anterior", "Tarifa nueva", "Respuesta del cliente"],
    negocio: "Ingresos más altos por el mismo trabajo.",
  }),
];

export const herramientaPorId = (id: string) => HERRAMIENTAS.find((h) => h.id === id);

// ---------- Agenda en vivo ----------
export interface Evento { id: string; tipo: "Masterclass" | "Laboratorio"; herramientaId: string; titulo: string; fecha: string; minutos: number; detalle: string }
export const EVENTOS: Evento[] = [
  { id: "mc-consultorio", tipo: "Masterclass", herramientaId: "consultorio", titulo: "Tu consultorio con IA: de la sesión a la historia sin trabajar de noche", fecha: "2026-12-01T19:00:00-05:00", minutos: 60, detalle: "Un experto entrega el conocimiento: demostración en vivo, ética y datos, y tus preguntas." },
  { id: "lab-consultorio", tipo: "Laboratorio", herramientaId: "consultorio", titulo: "Validemos tu consultorio", fecha: "2026-12-15T19:00:00-05:00", minutos: 90, detalle: "Validación colaborativa: tablero de victorias, rondas de fricción y ajustes en vivo. Máximo 15 personas." },
];
export const eventosDe = (id: string) => EVENTOS.filter((e) => e.herramientaId === id);

export const fechaLarga = (iso: string) =>
  new Date(iso).toLocaleString("es-CO", { weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit", timeZone: "America/Bogota" });
export const fechaCorta = (iso: string) =>
  new Date(iso).toLocaleString("es-CO", { day: "numeric", month: "short", timeZone: "America/Bogota" });

export const formatoCOP = (n: number) => (n === 0 ? "Gratis" : `$${n.toLocaleString("es-CO")}`);

// ---------- Planes ----------
export interface Plan { nombre: string; precio: string; incluye: string[]; destacado?: boolean }
export const PLANES: Plan[] = [
  { nombre: "Herramientas", precio: "Gratis a $50.000", incluye: ["Kit descargable y su personalización", "Se puede compartir: es la puerta de entrada", "Consultorio gratis durante el piloto"] },
  { nombre: "Formación", precio: "Suscripción · precio por definir", incluye: ["Cápsulas en video, infografía y texto de todas las herramientas", "Masterclasses y laboratorios en vivo cada semana", "Retroalimentación con IA sobre tu trabajo real"] },
  { nombre: "Microcertificación", precio: "Precio por definir", incluye: ["Evaluación exhaustiva: evidencia real, caso simulado y evaluación en vivo", "Insignia digital verificable con código, vigente 12 meses", "Perfil gratis en la Red de profesionales verificados"], destacado: true },
];
export const ESCALERA = [
  { nombre: "Acompañamientos 1:1", precio: "$190.000 · 3 por $490.000", detalle: "Instalas una herramienta con un consultor sobre tu caso." },
  { nombre: "Bootcamps de un día", precio: "$490.000", detalle: "Varias herramientas instaladas en un día." },
  { nombre: "De Profesional a Emprendedor", precio: "$2.400.000 · preventa $1.990.000", detalle: "Seis semanas, cohortes de 5. Cohorte 1: 20 de enero de 2027." },
  { nombre: "Empresas y universidades", precio: "Desde $4.500.000", detalle: "Herramientas a la medida para equipos y programas académicos." },
];

export const WHATSAPP = "573206621546";
export const wa = (texto: string) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`;
