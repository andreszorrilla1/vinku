// Vista previa de la personalización autónoma de Consultorio
// (resumen de la skill consultorio-enfoque; la fuente es piloto/consultorio-enfoque/SKILL.md).
export interface Enfoque { id: string; nombre: string; secciones: string[]; tecnicas: string[]; enfasis: string }

export const ENFOQUES: Enfoque[] = [
  { id: "tcc", nombre: "Cognitivo-conductual", enfasis: "Conductas problema, antecedentes y consecuentes, creencias centrales.",
    secciones: ["Situación – pensamiento – emoción – conducta", "Revisión de tareas entre sesiones", "Distorsiones o creencias identificadas", "Tareas acordadas"],
    tecnicas: ["Psicoeducación", "Registro de pensamientos", "Reestructuración cognitiva", "Activación conductual", "Exposición gradual", "Resolución de problemas"] },
  { id: "act", nombre: "ACT y terceras generaciones", enfasis: "Evitación experiencial, fusión y áreas de valor.",
    secciones: ["Procesos trabajados", "Valores explorados", "Acción comprometida", "Ejercicios experienciales"],
    tecnicas: ["Defusión cognitiva", "Aceptación", "Clarificación de valores", "Acción comprometida", "Atención plena", "Metáforas experienciales"] },
  { id: "psicodinamico", nombre: "Psicodinámico", enfasis: "Historia vincular temprana, conflictos recurrentes y defensas.",
    secciones: ["Material asociativo", "Sueños o actos fallidos", "Transferencia", "Contratransferencia (nota privada)", "Hipótesis de trabajo"],
    tecnicas: ["Asociación libre", "Señalamiento", "Clarificación", "Interpretación", "Análisis de sueños", "Análisis de la transferencia"] },
  { id: "humanista", nombre: "Humanista y Gestalt", enfasis: "Necesidades actuales, recursos e interrupciones del contacto.",
    secciones: ["Proceso experiencial", "Darse cuenta alcanzado", "Experimentos propuestos", "Asuntos inconclusos"],
    tecnicas: ["Escucha empática", "Silla vacía", "Experimentos gestálticos", "Focusing", "Trabajo con polaridades"] },
  { id: "sistemico", nombre: "Sistémico y familiar", enfasis: "Genograma, ciclo vital, límites y alianzas.",
    secciones: ["Asistentes y vínculo", "Pautas relacionales", "Hipótesis sistémica", "Intervenciones y prescripciones"],
    tecnicas: ["Genograma", "Preguntas circulares", "Reencuadre", "Connotación positiva", "Externalización del problema"] },
  { id: "logoterapia", nombre: "Logoterapia y existencial", enfasis: "Vacío existencial, proyecto de vida y recursos noéticos.",
    secciones: ["Dimensión noética trabajada", "Valores explorados", "Actitud ante el sufrimiento", "Tareas de sentido"],
    tecnicas: ["Diálogo socrático", "Derreflexión", "Intención paradójica", "Modificación de actitudes", "Autodistanciamiento"] },
];

export const POBLACIONES: Record<string, string[]> = {
  "Adultos": [],
  "Niños y adolescentes": ["Participación del acudiente", "Coordinación con colegio u otros profesionales"],
  "Parejas y familias": ["Registro por cada consultante presente"],
};
