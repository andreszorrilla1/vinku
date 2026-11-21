// ============================================================
// Aula Invertida · Catálogo de encargos y servicios
// Un encargo = un problema real + un entregable verificable.
// Todos los servicios de VinkU edu se arman con estos encargos.
// ============================================================

export type Linea = "personas" | "empresas" | "universidades";

export interface Seccion { id: string; titulo: string; guia: string }
export interface CapsulaBase { id: string; titulo: string; idea: string }

export interface Encargo {
  id: string;
  titulo: string;
  teLlevas: string;
  paraQuien: string;
  linea: Linea;
  minutosIA: number;
  minutosHumano: number;
  secciones: Seccion[];
  capsulas: CapsulaBase[];
  prueba: string; // cómo se prueba con el mundo
}

export const ENCARGOS: Encargo[] = [
  {
    id: "oferta",
    titulo: "Tu oferta en una página",
    teLlevas: "Tu servicio empaquetado: cliente ideal, problema, alcance y entregables.",
    paraQuien: "Profesionales que saben mucho pero no saben cómo venderlo como servicio.",
    linea: "personas", minutosIA: 135, minutosHumano: 90,
    secciones: [
      { id: "cliente", titulo: "Cliente ideal", guia: "Quién compra, en qué sector, en qué momento." },
      { id: "problema", titulo: "Problema que resuelves", guia: "En palabras del cliente, no de la academia." },
      { id: "alcance", titulo: "Alcance", guia: "Qué incluye, qué no, cuánto dura." },
      { id: "entregables", titulo: "Entregables", guia: "Lo tangible que el cliente recibe." },
      { id: "frase", titulo: "Tu oferta en una frase", guia: "Ayudo a [cliente] a [resultado] mediante [método]." },
    ],
    capsulas: [
      { id: "traducir", titulo: "Del concepto académico al problema del cliente", idea: "Traducir categorías de tu disciplina a dolores concretos de negocio." },
      { id: "nicho", titulo: "Elegir un nicho sin miedo a perder clientes", idea: "Un cliente ideal específico vende más que un público general." },
      { id: "empaquetar", titulo: "Empaquetar: de horas a resultados", idea: "Vender un resultado con alcance cerrado en lugar de horas." },
      { id: "entregable", titulo: "Entregables que se pueden tocar", idea: "Convertir procesos intangibles en documentos, sesiones y productos." },
      { id: "propuesta-valor", titulo: "La frase de valor", idea: "Estructura cliente + resultado + método." },
    ],
    prueba: "Muestra tu oferta a 3 posibles clientes y anota qué entendieron y qué preguntaron.",
  },
  {
    id: "precio",
    titulo: "Tu precio sin miedo",
    teLlevas: "Tu tarifa calculada y tres niveles de precio con argumentos.",
    paraQuien: "Quien cobra por intuición, cobra de menos o no sabe responder \"¿cuánto vale?\".",
    linea: "personas", minutosIA: 135, minutosHumano: 90,
    secciones: [
      { id: "costos", titulo: "Tu piso", guia: "Ingreso que necesitas, horas facturables reales, costos." },
      { id: "tarifa", titulo: "Tarifa base", guia: "Valor hora o por proyecto, con el cálculo." },
      { id: "niveles", titulo: "Tres niveles", guia: "Básico, recomendado y premium, con qué cambia en cada uno." },
      { id: "argumentos", titulo: "Argumentos de valor", guia: "Por qué vale eso para el cliente." },
      { id: "objeciones", titulo: "Respuesta a \"está caro\"", guia: "Qué dices y qué no regalas." },
    ],
    capsulas: [
      { id: "piso", titulo: "Calcular tu piso real", idea: "Horas facturables vs. horas trabajadas; costos invisibles." },
      { id: "valor", titulo: "Precio por valor, no por tiempo", idea: "Anclar el precio al resultado que el cliente obtiene." },
      { id: "anclaje", titulo: "Tres niveles y el efecto ancla", idea: "Cómo el nivel premium hace elegible el recomendado." },
      { id: "objecion", titulo: "Sostener el precio", idea: "Negociar alcance, no tarifa." },
      { id: "mercado", titulo: "Leer los precios del mercado colombiano", idea: "Referencias de tarifas de consultoría y servicios profesionales." },
    ],
    prueba: "Presenta tus tres niveles a 2 clientes o colegas del sector y registra cuál eligen y por qué.",
  },
  {
    id: "propuesta",
    titulo: "Tu propuesta lista para enviar",
    teLlevas: "Una propuesta comercial o técnica real, revisada.",
    paraQuien: "Quien tiene una oportunidad concreta (cliente, convocatoria, licitación) y debe responder ya.",
    linea: "personas", minutosIA: 135, minutosHumano: 90,
    secciones: [
      { id: "contexto", titulo: "Lectura del contexto", guia: "Lo que entendiste del cliente y su necesidad." },
      { id: "objetivo", titulo: "Objetivos", guia: "General y específicos, medibles." },
      { id: "metodo", titulo: "Metodología", guia: "Fases, actividades y por qué funciona." },
      { id: "cronograma", titulo: "Cronograma y entregables", guia: "Qué se entrega y cuándo." },
      { id: "inversion", titulo: "Inversión", guia: "Valor, forma de pago, condiciones." },
    ],
    capsulas: [
      { id: "terminos", titulo: "Leer unos términos de referencia", idea: "Encontrar lo que de verdad se evalúa." },
      { id: "objetivos", titulo: "Objetivos que se pueden verificar", idea: "Verbos de resultado e indicadores." },
      { id: "metodologia", titulo: "Una metodología que se entienda", idea: "Fases con nombre, entregable y responsable." },
      { id: "diferencial", titulo: "Tu diferencial humanista", idea: "Cómo tu disciplina se vuelve ventaja en la propuesta." },
      { id: "cierre", titulo: "Inversión y condiciones", idea: "Presentar el precio sin pedir perdón." },
    ],
    prueba: "Envía la propuesta y registra la respuesta del cliente o el resultado de la convocatoria.",
  },
  {
    id: "modelo",
    titulo: "Tu idea de negocio, probada",
    teLlevas: "Tu modelo de negocio en una página y el guion para validarlo con 5 clientes.",
    paraQuien: "Quien tiene una idea de producto o servicio y no sabe si alguien pagaría por ella.",
    linea: "personas", minutosIA: 135, minutosHumano: 90,
    secciones: [
      { id: "segmento", titulo: "Segmento", guia: "Quién tiene el problema con más urgencia." },
      { id: "propuesta", titulo: "Propuesta de valor", guia: "Qué ofreces y qué cambia para esa persona." },
      { id: "canales", titulo: "Canales y relación", guia: "Cómo te encuentran y te compran." },
      { id: "ingresos", titulo: "Ingresos y costos", guia: "Cómo ganas dinero y qué necesitas para operar." },
      { id: "guion", titulo: "Guion de validación", guia: "5 preguntas sobre hechos pasados, no opiniones." },
    ],
    capsulas: [
      { id: "hipotesis", titulo: "Tu idea como hipótesis", idea: "Separar lo que sabes de lo que supones." },
      { id: "entrevista", titulo: "Entrevistar sin sesgar", idea: "Preguntar por el pasado, no por el futuro." },
      { id: "etnografia", titulo: "Mirada etnográfica para emprender", idea: "Observar prácticas en lugar de escuchar opiniones." },
      { id: "normativo", titulo: "Negocios que nacen de una norma", idea: "Leyes y normas que crean demanda obligatoria." },
      { id: "senal", titulo: "Señales de compra", idea: "Qué cuenta como validación real." },
    ],
    prueba: "Haz las 5 entrevistas con tu guion y registra qué hipótesis se sostienen.",
  },
  {
    id: "ia-oficio",
    titulo: "La IA en tu oficio",
    teLlevas: "5 flujos de trabajo con IA sobre tus tareas reales.",
    paraQuien: "Psicólogas, abogados, docentes, trabajadores sociales y comunicadores que quieren ganar tiempo con ética.",
    linea: "personas", minutosIA: 135, minutosHumano: 90,
    secciones: [
      { id: "tareas", titulo: "Tus tareas que más tiempo consumen", guia: "Lista con horas por semana." },
      { id: "flujos", titulo: "5 flujos con IA", guia: "Tarea, herramienta, instrucción y revisión humana." },
      { id: "instrucciones", titulo: "Instrucciones base", guia: "Los prompts que vas a reutilizar." },
      { id: "etica", titulo: "Límites éticos", guia: "Datos que no entran, decisiones que no delegas." },
      { id: "medicion", titulo: "Cómo medir el ahorro", guia: "Antes y después en horas." },
    ],
    capsulas: [
      { id: "delegar", titulo: "Qué se delega y qué no", idea: "Tareas de borrador vs. tareas de criterio." },
      { id: "instruir", titulo: "Instruir bien a una IA", idea: "Contexto, ejemplo, formato y criterio de calidad." },
      { id: "datos", titulo: "Datos sensibles y confidencialidad", idea: "Habeas data y secreto profesional en Colombia." },
      { id: "revision", titulo: "Revisar lo que produce la IA", idea: "Lista de verificación humana." },
      { id: "kit", titulo: "Ejemplo: el kit Consultorio", idea: "Cómo una psicóloga convierte transcripciones en historias clínicas." },
    ],
    prueba: "Usa tus flujos durante una semana y registra horas ahorradas y errores encontrados.",
  },
  {
    id: "perfil",
    titulo: "Tu perfil donde se necesita",
    teLlevas: "El mapa de sectores con demanda y tu hoja de vida y LinkedIn reescritos.",
    paraQuien: "Profesionales de ciencias humanas y sociales que buscan nuevos campos de acción laboral.",
    linea: "personas", minutosIA: 135, minutosHumano: 90,
    secciones: [
      { id: "saberes", titulo: "Lo que sabes hacer", guia: "Habilidades traducidas a lenguaje de sector." },
      { id: "sectores", titulo: "Mapa de sectores con demanda", guia: "3 sectores, roles y por qué te necesitan." },
      { id: "titular", titulo: "Titular y extracto de LinkedIn", guia: "Quién eres para ese sector." },
      { id: "experiencia", titulo: "Experiencia reescrita", guia: "Logros con verbo, contexto y resultado." },
      { id: "plan", titulo: "Plan de 30 días", guia: "Contactos, postulaciones y conversaciones." },
    ],
    capsulas: [
      { id: "traduccion", titulo: "Traducir tu formación", idea: "Del pensum a las competencias que piden los sectores." },
      { id: "campos", titulo: "Nuevos campos de acción", idea: "ESG, experiencia de usuario, cumplimiento, cultura organizacional, datos cualitativos." },
      { id: "logros", titulo: "Escribir logros, no funciones", idea: "Fórmula verbo + contexto + resultado." },
      { id: "linkedin", titulo: "LinkedIn que te encuentra", idea: "Palabras clave y titular." },
      { id: "red", titulo: "Conversaciones de exploración", idea: "Pedir información, no empleo." },
    ],
    prueba: "Ten 3 conversaciones con personas de los sectores elegidos y registra lo que aprendiste.",
  },
  {
    id: "lanzamiento",
    titulo: "Tu lanzamiento en 30 días",
    teLlevas: "Un plan de lanzamiento con metas semanales y tus primeros clientes identificados.",
    paraQuien: "Participantes del programa De Profesional a Emprendedor en la última semana.",
    linea: "personas", minutosIA: 270, minutosHumano: 180,
    secciones: [
      { id: "meta", titulo: "Meta de 30 días", guia: "Ventas, clientes o validaciones concretas." },
      { id: "lista", titulo: "Lista de primeros 20 contactos", guia: "Quiénes son y por qué te comprarían." },
      { id: "mensajes", titulo: "Mensajes de contacto", guia: "Primer mensaje y seguimiento." },
      { id: "semanas", titulo: "Plan semana a semana", guia: "Acciones y métricas." },
      { id: "apoyo", titulo: "Qué necesitas de la cohorte", guia: "Contactos, revisión, compañía." },
    ],
    capsulas: [
      { id: "primeros", titulo: "Los primeros clientes salen de tu red", idea: "Mapa de red y círculos de confianza." },
      { id: "mensaje", titulo: "Un mensaje que no suena a venta", idea: "Contexto, propuesta y pregunta abierta." },
      { id: "constancia", titulo: "Ritmo semanal", idea: "Pocas acciones, todas las semanas." },
      { id: "metricas", titulo: "Métricas de un emprendimiento que empieza", idea: "Conversaciones, propuestas, cierres." },
    ],
    prueba: "Ejecuta las primeras dos semanas y registra conversaciones, propuestas y cierres.",
  },
  {
    id: "reto-lab",
    titulo: "Reto de innovación basado en humanidades",
    teLlevas: "Lectura del contexto, insights, conceptos de solución y un plan para probarlos con personas reales.",
    paraQuien: "Equipos de empresas, entidades, cajas y ONG (Laboratorio de Innovación).",
    linea: "empresas", minutosIA: 720, minutosHumano: 480,
    secciones: [
      { id: "leer", titulo: "Leer: el contexto", guia: "Actores, cultura, normas, territorio y comportamiento." },
      { id: "interpretar", titulo: "Interpretar: tensiones e insights", guia: "Lo que las personas hacen, dicen y significan." },
      { id: "crear", titulo: "Crear: conceptos de solución", guia: "3 conceptos para el producto, servicio o experiencia." },
      { id: "probar", titulo: "Probar: plan con personas reales", guia: "Qué se prueba, con quién y qué cuenta como éxito." },
    ],
    capsulas: [
      { id: "antropologia", titulo: "Antropología para leer una organización", idea: "Prácticas, rituales y reglas no escritas." },
      { id: "semiotica", titulo: "Semiótica de una experiencia", idea: "Qué comunica cada punto de contacto." },
      { id: "comportamiento", titulo: "Diseño del comportamiento", idea: "Fricciones, hábitos y decisiones." },
      { id: "normas", titulo: "La norma como oportunidad", idea: "Cumplimiento normativo que abre productos y servicios." },
      { id: "prototipo", titulo: "Prototipar barato", idea: "Probar antes de construir." },
    ],
    prueba: "Prueba los conceptos con al menos 5 personas del público real y registra qué cambió.",
  },
  {
    id: "puesto",
    titulo: "Encargo de tu puesto",
    teLlevas: "Una mejora aplicada a tu trabajo real, con su indicador.",
    paraQuien: "Profesionales de ciencias sociales y humanas de una organización (upskilling y reskilling).",
    linea: "empresas", minutosIA: 270, minutosHumano: 180,
    secciones: [
      { id: "situacion", titulo: "Situación de tu puesto", guia: "El reto concreto que hoy no se resuelve bien." },
      { id: "competencia", titulo: "Competencia a desarrollar", guia: "Qué necesitas aprender o actualizar." },
      { id: "aplicacion", titulo: "Entregable aplicado", guia: "La herramienta, protocolo o producto que construyes." },
      { id: "indicador", titulo: "Indicador", guia: "Cómo sabrá la organización que funcionó." },
    ],
    capsulas: [
      { id: "valor", titulo: "Mostrar el valor de tu área", idea: "Traducir lo social a indicadores de la organización." },
      { id: "ia", titulo: "IA en procesos sociales y humanos", idea: "Automatizar lo repetitivo, cuidar lo relacional." },
      { id: "datos", titulo: "Datos cualitativos que convencen", idea: "Sistematizar evidencia de campo." },
      { id: "cambio", titulo: "Gestionar el cambio", idea: "Llevar una mejora a un equipo que no la pidió." },
    ],
    prueba: "Implementa el entregable en tu equipo durante un mes y mide el indicador.",
  },
  {
    id: "programa",
    titulo: "Rediseño de un programa académico",
    teLlevas: "La brecha entre el currículo y el sector real, y el programa reorganizado en encargos con aliados.",
    paraQuien: "Facultades de ciencias sociales y humanas (pregrado, posgrado y educación continua).",
    linea: "universidades", minutosIA: 1800, minutosHumano: 1200,
    secciones: [
      { id: "brecha", titulo: "Brecha currículo–sector", guia: "Qué enseña el programa y qué piden los sectores." },
      { id: "perfil", titulo: "Perfil de egreso conectado", guia: "Campos de acción reales del egresado." },
      { id: "encargos", titulo: "Asignaturas convertidas en encargos", guia: "Encargo, entregable y aliado por asignatura." },
      { id: "aliados", titulo: "Aliados del sector real", guia: "Empresas, entidades y organizaciones." },
      { id: "ruta", titulo: "Ruta de implementación", guia: "Fases, docentes y registro calificado." },
    ],
    capsulas: [
      { id: "experiencial", titulo: "Aprendizaje experiencial", idea: "Ciclo de experiencia, reflexión y aplicación." },
      { id: "demanda", titulo: "Leer la demanda laboral", idea: "Fuentes y señales de los sectores." },
      { id: "docente", titulo: "El docente como Mesa", idea: "Del expositor al consultor que valida." },
      { id: "registro", titulo: "Cambios y registro calificado", idea: "Qué se puede ajustar sin renovar registro." },
    ],
    prueba: "Pilota un encargo en una asignatura con un aliado y registra resultados de estudiantes y aliado.",
  },
];

export interface Servicio {
  id: string;
  nombre: string;
  linea: Linea;
  precio: string;
  ia: string;      // qué hace el 60 % IA
  humano: string;  // qué hace el 40 % humano
  encargos: string[];
}

export const SERVICIOS: Servicio[] = [
  { id: "acomp", nombre: "Acompañamientos personalizados (6)", linea: "personas", precio: "$190.000 · 3 por $490.000",
    ia: "2 h 15 min de encargo en el aula: leer tu caso, cápsulas y borrador.", humano: "90 min de Mesa 1:1 y sello con evidencia.",
    encargos: ["oferta", "precio", "propuesta", "modelo", "ia-oficio", "perfil"] },
  { id: "programa", nombre: "De Profesional a Emprendedor", linea: "personas", precio: "$2.400.000 · preventa $1.990.000",
    ia: "4 h 30 min por semana: un encargo semanal durante 6 semanas.", humano: "Mesa grupal los miércoles de 6 a 9 p. m., cohorte de 5.",
    encargos: ["oferta", "precio", "modelo", "propuesta", "ia-oficio", "lanzamiento"] },
  { id: "bootcamps", nombre: "Bootcamps de un día", linea: "personas", precio: "$490.000",
    ia: "9 h en dos semanas: 3 h antes del bootcamp y 6 h de aplicación después.", humano: "6 h presenciales con Mesas por equipos.",
    encargos: ["oferta", "precio", "propuesta", "modelo", "perfil"] },
  { id: "masterclass", nombre: "Masterclass y La Mesa VinkU", linea: "personas", precio: "$59.000 · La Mesa gratis",
    ia: "Antes: tu pregunta. Después: un mini encargo para dar el primer paso.", humano: "La sesión en vivo y la comunidad.",
    encargos: ["oferta"] },
  { id: "lab", nombre: "Laboratorio de Innovación basado en Humanidades", linea: "empresas", precio: "Desde $4.500.000",
    ia: "Leer e Interpretar: síntesis de entrevistas, normas, actores y comportamiento.", humano: "Talleres de Crear y Probar con personas reales.",
    encargos: ["reto-lab"] },
  { id: "upskilling", nombre: "Upskilling y reskilling", linea: "empresas", precio: "Desde $4.500.000",
    ia: "Cada profesional trabaja un encargo de su propio puesto.", humano: "Mesas in-company con facilitador VinkU y tablero de evidencias.",
    encargos: ["puesto", "ia-oficio"] },
  { id: "universidades", nombre: "Transformación de programas académicos", linea: "universidades", precio: "Desde $25.000.000 por programa",
    ia: "Análisis de brecha currículo–sector y diseño de encargos.", humano: "Consultoría con la facultad; los docentes asumen la Mesa.",
    encargos: ["programa"] },
  { id: "empleabilidad", nombre: "Ruta de Empleabilidad y cupos patrocinados", linea: "universidades", precio: "Por cupos o ingresos compartidos",
    ia: "Las rutas de personas, patrocinadas por la entidad.", humano: "Mesas y reporte de evidencias para la entidad.",
    encargos: ["perfil", "oferta", "ia-oficio"] },
];

export const LINEAS: Record<Linea, string> = {
  personas: "Personas",
  empresas: "Empresas",
  universidades: "Universidades y organizaciones",
};

export const encargoPorId = (id: string) => ENCARGOS.find((e) => e.id === id)!;

export const WHATSAPP = "573206621546";
