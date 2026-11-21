---
name: consultorio-enfoque
description: Personaliza el Consultorio de una psicóloga o psicólogo independiente según su enfoque clínico (TCC, ACT, psicodinámico, humanista o Gestalt, sistémico, logoterapia o existencial, integrativo) y su población. Úsala cuando quiera "ajustar el consultorio a mi enfoque", "personalizar mi consultorio", cambiar de enfoque o sumar técnicas propias, aunque no nombre la skill. Complementa a consultorio-psicologico; no la reemplaza.
---

# Consultorio · Personalización por enfoque
*VinkU edu · Aprendizaje Basado en Herramientas · versión piloto, noviembre de 2026*

Esta skill ajusta el Consultorio (plantilla de Notion + skill `consultorio-psicologico`) a la forma de trabajar de cada profesional. La psicóloga la ejecuta sola, cuando quiera, y puede volver a ejecutarla si cambia de enfoque. No toca la información clínica de nadie: solo la configuración y el catálogo de técnicas.

Escríbele en español, con calidez profesional y frases cortas.

## Qué personaliza
1. **El registro de sesión:** agrega a la estructura base las secciones propias del enfoque.
2. **La historia de ingreso:** indica qué explorar con más detalle.
3. **El catálogo de técnicas:** siembra la base "Técnicas y herramientas" con las técnicas del enfoque.
4. **El vocabulario:** cómo se nombra lo que pasa en sesión (por ejemplo, "tareas entre sesiones" o "material asociativo").
5. **Los instrumentos sugeridos:** los que suelen acompañar al enfoque.

## Lo que nunca cambia
Los principios de `consultorio-psicologico` se mantienen tal cual, cualquiera sea el enfoque:
- Todo registro nace como "Borrador IA" y lo aprueba la psicóloga.
- Riesgo primero.
- Lo ocurrido en sesión se documenta con sus palabras.
- Nada clínico en la bitácora ni en los mensajes.
- Los documentos son de ella.

Si una petición de personalización contradice alguno de estos principios, explícalo en una línea y no la apliques.

## Flujo
1. **Ubicar el consultorio.** Busca en Notion la página "Configuración del consultorio". Si no existe, dile que primero ejecute "configura mi consultorio" con la skill `consultorio-psicologico` y detente.
2. **Preguntar, en un solo mensaje:**
   - Enfoque principal (y secundario, si trabaja de forma integrativa).
   - Población: adultos, adolescentes, niños, parejas o familias.
   - Si quiere sembrar las técnicas sugeridas o solo cambiar la estructura.
   - Técnicas propias que use y no quiera perder.
3. **Mostrar la propuesta antes de escribir.** Resume en pantalla, en máximo 12 líneas, qué secciones se agregan al registro, qué se enfatiza en la historia y qué técnicas se siembran. Espera su "sí".
4. **Escribir en "Configuración del consultorio"** una sección `🧭 Enfoque clínico` (si ya existe, reemplázala y deja al final la línea "Enfoque anterior: «x», cambiado el «fecha»"). Debe incluir:
   - Enfoque y población.
   - Secciones adicionales del registro de sesión, en orden.
   - Énfasis de la historia de ingreso.
   - Vocabulario preferido.
   - Instrumentos sugeridos.
   La skill `consultorio-psicologico` lee esa página al empezar cada conversación, así que desde ese momento redacta con esta estructura.
5. **Sembrar técnicas.** Lee antes el esquema de la base "Técnicas y herramientas" (si la skill principal trae `references/esquema-notion.md`, úsalo) y crea solo con propiedades que existan. No dupliques técnicas que ya estén. Agrega las técnicas propias que ella nombró.
6. **Bitácora:** una entrada con Tipo "Otro", Acción "Consultorio personalizado · enfoque «x»", Origen "Instrucción de la psicóloga" y Detalle con el número de técnicas sembradas.
7. **Cerrar** en 3 líneas: qué cambió, cuántas técnicas se sembraron y una invitación a registrar la próxima sesión para ver la diferencia.

## Enfoques

### Cognitivo-conductual (TCC)
- **Registro de sesión, secciones adicionales:** Situación – pensamiento – emoción – conducta trabajados · Revisión de tareas entre sesiones · Distorsiones o creencias identificadas · Tareas acordadas con frecuencia y registro.
- **Historia de ingreso, énfasis:** conductas problema con frecuencia, intensidad y duración; antecedentes y consecuentes; creencias centrales hipotetizadas.
- **Técnicas base:** psicoeducación, registro de pensamientos, reestructuración cognitiva, activación conductual, exposición gradual, resolución de problemas, entrenamiento en respiración o relajación.
- **Vocabulario:** tareas entre sesiones, línea base, metas operacionalizadas.
- **Instrumentos sugeridos:** PHQ-9, GAD-7 (los dos con puntuación automática en la skill principal).

### Terapia de aceptación y compromiso (ACT) y terceras generaciones
- **Registro de sesión, secciones adicionales:** Procesos trabajados (aceptación, defusión, presente, yo como contexto, valores, acción comprometida) · Valores explorados · Acción comprometida acordada · Ejercicios experienciales usados.
- **Historia de ingreso, énfasis:** evitación experiencial, fusión con pensamientos, áreas de valor y su vivencia actual.
- **Técnicas base:** defusión cognitiva, ejercicios de aceptación, clarificación de valores, acción comprometida, atención plena, metáforas experienciales.
- **Vocabulario:** procesos, flexibilidad psicológica, valores, compromiso.
- **Instrumentos sugeridos:** PHQ-9, GAD-7. Otros, como AAQ-II, se registran como "Otro" con el puntaje que ella dé.

### Psicodinámico y psicoanalítico
- **Registro de sesión, secciones adicionales:** Material asociativo relevante · Sueños o actos fallidos referidos · Transferencia observada · Contratransferencia (nota privada de la psicóloga) · Hipótesis de trabajo.
- **Historia de ingreso, énfasis:** historia vincular temprana, conflictos recurrentes, defensas predominantes.
- **Técnicas base:** asociación libre, señalamiento, clarificación, confrontación, interpretación, análisis de sueños, análisis de la transferencia.
- **Vocabulario:** encuadre, material, hipótesis, elaboración. Las "tareas acordadas" pasan a ser opcionales.
- **Regla adicional:** la contratransferencia se escribe solo si ella la dicta, nunca se infiere, y no sale en documentos para terceros.

### Humanista y Gestalt
- **Registro de sesión, secciones adicionales:** Proceso experiencial · Darse cuenta (awareness) alcanzado · Experimentos propuestos · Asuntos inconclusos trabajados.
- **Historia de ingreso, énfasis:** necesidades actuales, recursos personales, interrupciones del contacto.
- **Técnicas base:** escucha empática, silla vacía, experimentos gestálticos, focusing, trabajo con polaridades, trabajo corporal consciente.
- **Vocabulario:** aquí y ahora, contacto, darse cuenta, figura y fondo.

### Sistémico y familiar
- **Registro de sesión, secciones adicionales:** Asistentes a la sesión y vínculo · Pautas relacionales observadas · Hipótesis sistémica · Intervenciones y prescripciones.
- **Historia de ingreso, énfasis:** genograma (tres generaciones), ciclo vital familiar, límites, alianzas y triangulaciones.
- **Técnicas base:** genograma, preguntas circulares, reencuadre, connotación positiva, prescripciones, externalización del problema, escultura familiar.
- **Vocabulario:** sistema consultante, pauta, demanda, hipótesis.
- **Regla adicional:** en sesiones con varios consultantes, la sesión se vincula a cada persona que tenga carpeta y lo dicho por cada una se registra sin mezclar.

### Logoterapia y existencial
- **Registro de sesión, secciones adicionales:** Dimensión noética trabajada · Valores de creación, experiencia o actitud explorados · Actitud ante el sufrimiento · Tareas de sentido.
- **Historia de ingreso, énfasis:** vacío existencial, proyecto de vida, recursos noéticos (la sección de síntomas noéticos de la plantilla toma más peso).
- **Técnicas base:** diálogo socrático, derreflexión, intención paradójica, modificación de actitudes, autodistanciamiento, logoautobiografía.
- **Vocabulario:** sentido, voluntad de sentido, autotrascendencia, libertad y responsabilidad.

### Integrativo
Pregunta qué dos enfoques combina y en qué proporción. Toma las secciones de ambos, sin repetir, en un máximo de 5 secciones adicionales. Siembra las técnicas de los dos.

## Población
- **Niños y adolescentes:** agrega al registro "Participación del acudiente" y "Coordinación con colegio u otros profesionales", y recuerda que el consentimiento lo firma el acudiente, con el asentimiento del menor.
- **Parejas y familias:** aplica la regla de varios consultantes del enfoque sistémico, aunque el enfoque sea otro.

## Cuando algo falla
- Si no hay permiso de escritura en Notion o falta la página de configuración, dilo y no sigas.
- Si una técnica no se pudo crear, sigue con las demás y lístalas al final.
