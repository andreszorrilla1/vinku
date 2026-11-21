// ============================================================
// Aprendizaje Basado en Herramientas · Catálogo
// Cada experiencia de aprendizaje es una herramienta que se descarga.
// Al instalarla y usarla en un caso real, la persona desarrolla
// TOOLSET (lo que se lleva), SKILLSET (lo que aprende a hacer)
// y MINDSET (la nueva forma de pensar).
// Foco inicial: de profesional a emprendedor. Cada herramienta nace
// de una oportunidad de negocio o necesidad por cubrir.
// ============================================================

export type TipoPieza = "Plantilla Notion" | "Skill de Claude" | "Conector" | "Plantilla" | "Guía";
export interface Pieza { nombre: string; tipo: TipoPieza; detalle: string }

export type Formato = "Video" | "Infográfico" | "Texto";
export interface CapsulaH { titulo: string; formato: Formato; minutos: number; idea: string; pasos?: string[] }

export interface Herramienta {
  id: string;
  semana: number;            // herramienta de la semana (orden de lanzamiento)
  precio: number;            // COP, incluye kit, cápsulas y la masterclass en vivo
  capsulas: CapsulaH[];
  nombre: string;
  oficio: string;            // a quién va dirigida
  oportunidad: string;       // la necesidad o el negocio que cubre
  estado: "Disponible" | "En diseño";
  toolset: Pieza[];
  skillset: string[];
  mindset: { de: string; a: string };
  primerUso: string;         // tarea real para usarla por primera vez
  negocio: string;           // cómo se gana dinero con ella
  lanzar: string;            // con quién se prueba
  preguntas: string[];       // para personalizar la instalación
}

export const HERRAMIENTAS: Herramienta[] = [
  {
    id: "consultorio",
    semana: 1,
    precio: 50000,
    capsulas: [
      { formato: "Video", titulo: "Instala Consultorio en 15 minutos", minutos: 6, idea: "Duplicar la plantilla, conectar Notion y Tactiq, y cargar la skill." },
      { formato: "Infográfico", titulo: "El recorrido de una sesión", minutos: 3, idea: "De la transcripción al borrador de historia y al cobro.", pasos: ["Sesión con Tactiq", "Borrador IA en Notion", "Revisas y apruebas"] },
      { formato: "Texto", titulo: "Datos sensibles: lo que la IA no debe ver", minutos: 5, idea: "Habeas data, secreto profesional y autorización del consultante." },
    ],
    nombre: "Consultorio",
    oficio: "Psicólogas y psicólogos independientes",
    oportunidad: "La consulta privada se pierde en historias clínicas, cobros y documentos que se hacen de noche.",
    estado: "Disponible",
    toolset: [
      { nombre: "Plantilla Consultorio", tipo: "Plantilla Notion", detalle: "Consultantes, sesiones, pagos, instrumentos, documentos, técnicas y bitácora conectados." },
      { nombre: "Skill consultorio-psicologico", tipo: "Skill de Claude", detalle: "14 flujos: registrar sesiones, historia de ingreso, cobros, PHQ-9 y GAD-7, documentos en PDF y Word, resumen del día." },
      { nombre: "Tactiq", tipo: "Conector", detalle: "Transcripción de sesiones presenciales y virtuales que se convierten en borradores de historia." },
    ],
    skillset: ["Documentar con IA sin perder el criterio clínico", "Gestionar cartera y cobros", "Proteger datos sensibles", "Diseñar el proceso de tu consulta"],
    mindset: { de: "Atiendo pacientes", a: "Dirijo mi consultorio" },
    primerUso: "Registrar una sesión real (o de práctica) desde la transcripción y revisar el borrador.",
    negocio: "Más horas para atender y menos cartera perdida. Hoy VinkU edu regala el kit y cobra $50.000 por la hora de instalación.",
    lanzar: "Usarla una semana completa de consulta y medir las horas ahorradas.",
    preguntas: ["¿Cuál es tu enfoque clínico y cuántas personas atiendes por semana?", "¿Atiendes presencial, virtual o ambas? ¿Cómo registras hoy tus sesiones?", "¿Qué es lo que más tiempo te quita fuera de sesión?"],
  },
  {
    id: "consultora",
    semana: 2,
    precio: 39000,
    capsulas: [
      { formato: "Video", titulo: "De horas a resultados", minutos: 7, idea: "Empaquetar tu servicio con alcance cerrado." },
      { formato: "Infográfico", titulo: "Tres niveles de precio", minutos: 3, idea: "Básico, recomendado y premium: el ancla vende el del medio.", pasos: ["Calcula tu piso", "Fija la tarifa base", "Arma tres niveles"] },
      { formato: "Texto", titulo: "Anatomía de una propuesta que se aprueba", minutos: 6, idea: "Contexto, objetivos, método, cronograma e inversión." },
    ],
    nombre: "Consultora en una caja",
    oficio: "Cualquier profesional de ciencias sociales y humanas que quiera vender consultoría",
    oportunidad: "Sabes resolver problemas, pero no tienes una oferta, un precio ni una propuesta para venderlo.",
    estado: "En diseño",
    toolset: [
      { nombre: "Oferta en una página", tipo: "Plantilla", detalle: "Cliente ideal, problema, alcance, entregables y frase de valor." },
      { nombre: "Calculadora de precio", tipo: "Plantilla", detalle: "Tu piso, tu tarifa y tres niveles con argumentos." },
      { nombre: "Skill de propuestas", tipo: "Skill de Claude", detalle: "Convierte una conversación con un cliente en propuesta comercial o técnica." },
    ],
    skillset: ["Empaquetar un servicio", "Calcular y sostener un precio", "Escribir propuestas que se aprueban"],
    mindset: { de: "Vendo mis horas", a: "Vendo resultados con alcance cerrado" },
    primerUso: "Armar tu oferta y una propuesta para una oportunidad real que tengas hoy.",
    negocio: "Consultorías por proyecto en tres niveles de precio.",
    lanzar: "Enviar la propuesta a un cliente real y registrar la respuesta.",
    preguntas: ["¿Qué problema resuelves mejor que nadie y para quién?", "¿Tienes hoy una oportunidad o cliente concreto?", "¿Cuánto cobras hoy y cómo llegaste a ese valor?"],
  },
  {
    id: "radar",
    semana: 3,
    precio: 49000,
    capsulas: [
      { formato: "Video", titulo: "Leer una norma como mercado", minutos: 6, idea: "Quién queda obligado, a qué y desde cuándo." },
      { formato: "Infográfico", titulo: "De la obligación al servicio", minutos: 3, idea: "Cada obligación nueva es un problema que alguien paga por resolver.", pasos: ["Obligación", "Quién la sufre", "Servicio que la resuelve"] },
      { formato: "Texto", titulo: "Cómo cobrar un diagnóstico de cumplimiento", minutos: 5, idea: "Diagnóstico de entrada y acompañamiento después." },
    ],
    nombre: "Radar normativo",
    oficio: "Abogados, politólogos y profesionales del sector público",
    oportunidad: "Cada ley o norma nueva crea obligaciones que alguien tiene que ayudar a cumplir: eso es demanda.",
    estado: "En diseño",
    toolset: [
      { nombre: "Skill lector de normas", tipo: "Skill de Claude", detalle: "Lee una ley o decreto y extrae a quién obliga, qué exige y desde cuándo." },
      { nombre: "Matriz de oportunidades", tipo: "Plantilla Notion", detalle: "Obligación → quién la sufre → servicio o producto posible." },
      { nombre: "Guía de servicio de cumplimiento", tipo: "Guía", detalle: "Cómo empaquetar un diagnóstico y un acompañamiento de cumplimiento." },
    ],
    skillset: ["Leer una norma como mercado", "Diseñar servicios de cumplimiento", "Explicar lo jurídico a quien decide"],
    mindset: { de: "La norma es un trámite", a: "La norma es un mercado" },
    primerUso: "Pasar una norma reciente de tu campo por el radar y elegir una oportunidad.",
    negocio: "Diagnósticos de cumplimiento y acompañamientos por organización.",
    lanzar: "Ofrecer el diagnóstico a 3 organizaciones obligadas por la norma.",
    preguntas: ["¿En qué campo normativo te mueves (laboral, ambiental, datos, salud, educación…)?", "¿Hay una norma reciente que conozcas bien?", "¿A qué tipo de organización le hablarías primero?"],
  },
  {
    id: "insights",
    semana: 4,
    precio: 45000,
    capsulas: [
      { formato: "Video", titulo: "Entrevistar sin sesgar", minutos: 7, idea: "Preguntar por lo que pasó, no por lo que haría." },
      { formato: "Infográfico", titulo: "De la transcripción al insight", minutos: 3, idea: "Patrones, tensiones e insights con citas.", pasos: ["Transcripción", "Patrones y tensiones", "Insight para decidir"] },
      { formato: "Texto", titulo: "Un informe que se lee en 5 minutos", minutos: 5, idea: "Tres hallazgos, tres decisiones." },
    ],
    nombre: "Laboratorio de insights",
    oficio: "Sociólogos, antropólogos e investigadores cualitativos",
    oportunidad: "Las empresas deciden sin entender a sus clientes; la investigación cualitativa rápida es un servicio escaso.",
    estado: "En diseño",
    toolset: [
      { nombre: "Kit de entrevistas", tipo: "Plantilla", detalle: "Guion, consentimiento y matriz de registro." },
      { nombre: "Skill de síntesis", tipo: "Skill de Claude", detalle: "De transcripciones a patrones, tensiones e insights con citas." },
      { nombre: "Informe de decisión", tipo: "Plantilla", detalle: "Hallazgos que una gerencia puede usar el lunes." },
    ],
    skillset: ["Investigar en semanas, no en semestres", "Sintetizar con IA sin perder el matiz", "Traducir hallazgos a decisiones"],
    mindset: { de: "Investigo para publicar", a: "Investigo para que alguien decida" },
    primerUso: "Hacer 3 entrevistas sobre un producto o servicio real y sintetizarlas.",
    negocio: "Estudios cualitativos rápidos para pymes, agencias y fundaciones.",
    lanzar: "Presentar el informe a la persona que toma la decisión.",
    preguntas: ["¿Qué método cualitativo dominas?", "¿Qué empresa o sector te gustaría entender?", "¿Has vendido alguna vez una investigación?"],
  },
  {
    id: "contenido",
    semana: 5,
    precio: 35000,
    capsulas: [
      { formato: "Video", titulo: "Tu sistema de contenido en una tarde", minutos: 6, idea: "Pilares, formatos y frecuencia." },
      { formato: "Infográfico", titulo: "Pilares, formatos y frecuencia", minutos: 3, idea: "El sistema que evita publicar por inspiración.", pasos: ["Pilares", "Formatos", "Frecuencia"] },
      { formato: "Texto", titulo: "Vender contenido por suscripción", minutos: 5, idea: "Planes mensuales y el informe que los renueva." },
    ],
    nombre: "Estudio de contenido",
    oficio: "Comunicadores, periodistas y publicistas",
    oportunidad: "Las pymes necesitan publicar todas las semanas y no tienen quién lo piense.",
    estado: "En diseño",
    toolset: [
      { nombre: "Parrilla mensual", tipo: "Plantilla Notion", detalle: "Calendario, pilares, formatos y estados." },
      { nombre: "Skill de voz de marca", tipo: "Skill de Claude", detalle: "Aprende la voz de cada cliente y propone piezas." },
      { nombre: "Tablero de resultados", tipo: "Plantilla", detalle: "Lo que funcionó, para el informe mensual." },
    ],
    skillset: ["Diseñar un sistema de contenido", "Producir con IA en la voz del cliente", "Mostrar resultados mensuales"],
    mindset: { de: "Publico por inspiración", a: "Opero un sistema que se vende por suscripción" },
    primerUso: "Armar la parrilla de un mes para una marca real.",
    negocio: "Planes mensuales de contenido por suscripción.",
    lanzar: "Proponer el primer mes a una pyme de tu red.",
    preguntas: ["¿Qué tipo de contenido haces mejor?", "¿Para qué marcas o sectores te gustaría trabajar?", "¿Tienes una marca con la que puedas probar?"],
  },
  {
    id: "proyectos",
    semana: 6,
    precio: 39000,
    capsulas: [
      { formato: "Video", titulo: "Leer unos términos de referencia", minutos: 6, idea: "Encontrar lo que de verdad se evalúa." },
      { formato: "Infográfico", titulo: "El marco lógico en una página", minutos: 3, idea: "Del problema a los indicadores.", pasos: ["Problema", "Objetivos", "Actividades e indicadores"] },
      { formato: "Texto", titulo: "Cobrar por formular: tres modelos", minutos: 5, idea: "Tarifa fija, éxito o mixto." },
    ],
    nombre: "Formulador de proyectos sociales",
    oficio: "Trabajadores sociales, gestores culturales y profesionales de ONG",
    oportunidad: "Hay convocatorias y recursos de cooperación que las organizaciones pequeñas no saben formular.",
    estado: "En diseño",
    toolset: [
      { nombre: "Tablero de convocatorias", tipo: "Plantilla Notion", detalle: "Convocatorias, requisitos, fechas y estado." },
      { nombre: "Skill formuladora", tipo: "Skill de Claude", detalle: "Problema, objetivos, marco lógico, presupuesto y anexos en borrador." },
      { nombre: "Guía de cobro por formulación", tipo: "Guía", detalle: "Tarifa fija, éxito o mixto." },
    ],
    skillset: ["Leer términos de referencia", "Formular con marco lógico", "Cobrar por formular"],
    mindset: { de: "Ejecuto proyectos de otros", a: "Diseño y vendo los proyectos" },
    primerUso: "Formular un proyecto para una convocatoria abierta.",
    negocio: "Formulación por proyecto para fundaciones, juntas y colectivos.",
    lanzar: "Presentar el proyecto a una convocatoria real.",
    preguntas: ["¿Con qué comunidades o temas trabajas?", "¿Conoces una organización que necesite recursos?", "¿Has formulado antes? ¿Qué salió bien o mal?"],
  },
  {
    id: "clima",
    semana: 7,
    precio: 45000,
    capsulas: [
      { formato: "Video", titulo: "Medir clima sin un gran estudio", minutos: 6, idea: "Una encuesta corta y bien analizada." },
      { formato: "Infográfico", titulo: "Las dimensiones del clima", minutos: 3, idea: "Liderazgo, reconocimiento, carga, relaciones y sentido.", pasos: ["Medir", "Entender", "Actuar con indicador"] },
      { formato: "Texto", titulo: "Del hallazgo a la acción con indicador", minutos: 5, idea: "Cómo proponer una intervención que se mide." },
    ],
    nombre: "Termómetro de clima",
    oficio: "Psicólogos organizacionales y profesionales de talento humano",
    oportunidad: "Las pymes sienten que algo pasa con su gente pero no tienen cómo medirlo ni qué hacer.",
    estado: "En diseño",
    toolset: [
      { nombre: "Encuesta de clima breve", tipo: "Plantilla", detalle: "Instrumento corto con dimensiones y escala." },
      { nombre: "Skill de análisis", tipo: "Skill de Claude", detalle: "Resultados, comentarios abiertos y plan de acción." },
      { nombre: "Informe para gerencia", tipo: "Plantilla", detalle: "Tres hallazgos y tres acciones." },
    ],
    skillset: ["Medir clima sin un gran estudio", "Analizar respuestas abiertas con IA", "Proponer intervenciones con indicadores"],
    mindset: { de: "Entrego un informe", a: "Acompaño un cambio que se mide" },
    primerUso: "Aplicar la encuesta en un equipo pequeño (incluso de prueba) y analizarla.",
    negocio: "Diagnóstico más acompañamiento trimestral para pymes.",
    lanzar: "Presentar el diagnóstico a una gerencia.",
    preguntas: ["¿Qué experiencia tienes con equipos o talento humano?", "¿A qué tamaño de empresa te gustaría atender?", "¿Tienes un equipo con el que puedas probar?"],
  },
];

export const herramientaPorId = (id: string) => HERRAMIENTAS.find((h) => h.id === id);

export interface Servicio { id: string; nombre: string; precio: string; como: string; linea: "personas" | "organizaciones" }

// Propuesta: una herramienta nueva cada semana, con su masterclass en vivo.
export const EN_VIVO = { dia: "martes", hora: "7:00 p. m.", modalidad: "virtual" };

export const formatoCOP = (n: number) => `$${n.toLocaleString("es-CO")}`;

// Cómo cada servicio vigente se arma con herramientas.
export const SERVICIOS: Servicio[] = [
  { id: "herramienta", linea: "personas", nombre: "Herramienta de la semana (la puerta de entrada)", precio: "$30.000 a $50.000", como: "Kit descargable, cápsulas en video, infografía y texto, y la masterclass en vivo de esa semana. Reemplaza a la masterclass suelta de $59.000." },
  { id: "acomp", linea: "personas", nombre: "Acompañamientos personalizados", precio: "$190.000 · 3 por $490.000", como: "Instalas una herramienta con un consultor 1:1 y la dejas funcionando sobre tu caso." },
  { id: "bootcamps", linea: "personas", nombre: "Bootcamps de un día", precio: "$490.000", como: "Varias herramientas instaladas en un día: Escuela de Consultores → Consultora en una caja; Emprendimiento de Base Humanista → Radar normativo; Nuevos Campos de Acción → la herramienta de tu oficio." },
  { id: "programa", linea: "personas", nombre: "De Profesional a Emprendedor", precio: "$2.400.000 · preventa $1.990.000", como: "Seis semanas para armar tu caja de herramientas y lanzar una al mercado, con Mesa grupal los miércoles." },
  { id: "empresas", linea: "organizaciones", nombre: "Laboratorio e upskilling para empresas", precio: "Desde $4.500.000", como: "Herramientas diseñadas a la medida de la organización; sus profesionales aprenden instalándolas en su puesto." },
  { id: "universidades", linea: "organizaciones", nombre: "Universidades y entidades", precio: "Desde $25.000.000 por programa", como: "Las asignaturas se convierten en herramientas que el estudiante se lleva al sector real." },
];

export const WHATSAPP = "573206621546";
