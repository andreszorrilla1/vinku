# Aula Invertida · VinkU edu
Modelo pedagógico y de producto (borrador 1, 20 de noviembre de 2026)

## La idea en una frase
En el Aula Invertida no se toman cursos: **llegas con un encargo real y sales con un entregable real**. La IA hace el 60 % del recorrido (leer tu caso, enseñarte justo lo que la tarea pide y coproducir el borrador) y el 40 % humano se reserva para lo que la IA no puede dar: criterio, lectura del sector, ética, red de contactos y la validación con personas reales.

Se llama "invertida" por dos razones:
1. Invierte el aula tradicional: no hay temario que se recorra antes de hacer. Primero aparece la tarea; el contenido llega cuando la tarea lo necesita (just in time).
2. Invierte el rol de la IA en educación: no examina ni resume clases. Trabaja contigo sobre tu caso, y le entrega al consultor un brief para que la sesión humana empiece "en el minuto 60", no en el cero.

## Seis principios (lo que lo hace distinto)
1. **Encargos, no cursos.** La unidad no es la lección, es un encargo con un entregable verificable: una oferta, un precio, una propuesta, un modelo validado, un rediseño de programa.
2. **Contenido justo a tiempo.** Cada encargo tiene una biblioteca de cápsulas (3 a 7 min). La IA solo te entrega las que tu caso necesita, escritas sobre tu caso, y te dice por qué te llegan ahora.
3. **La IA coproduce, no califica.** Sin quices. La IA redacta contigo, tú editas y decides.
4. **El humano entra donde la IA no alcanza.** La Mesa (sesión con un consultor humanista de VinkU) trabaja sobre el brief que dejó la IA: decisiones abiertas, riesgos y lo que solo una persona con experiencia en el sector puede juzgar.
5. **Se evalúa con el mundo.** El cierre no es una nota: es evidencia de que el entregable funcionó con personas reales (clientes, usuarios, comités). Con esa evidencia, el consultor pone el **sello**.
6. **Las humanidades son el método.** Todo encargo sigue los cuatro momentos del Laboratorio de VinkU: Leer → Interpretar → Crear → Probar.

## La ruta de un encargo
| Momento | Qué pasa | Quién | Peso |
|---|---|---|---|
| 1. Leer | Diagnóstico conversacional del caso (máx. 4 preguntas). Sale un perfil del caso. | IA | 60 % IA |
| 2. Interpretar | Cápsulas justo a tiempo elegidas y escritas para el caso. | IA | |
| 3. Crear | Borrador del entregable por secciones; la persona edita y pide mejoras. | IA + persona | |
| 4. Mesa | Sesión 1:1 o grupal con consultor VinkU, que llega con el brief generado por la IA. | Humano | 40 % humano |
| 5. Probar | Se lleva el entregable a personas reales, se registra la evidencia y el consultor sella. | Humano + mundo | |

Toda la ruta queda en la **Bitácora**: el cuaderno de laboratorio de la persona, con sus casos, versiones, evidencias y sellos. Es su portafolio.

La regla 60/40 se mide en tiempo de trabajo del participante: por cada hora con un humano hay hora y media de trabajo guiado por IA.

## Cómo se aplica a cada servicio
Las horas son una propuesta para cumplir la regla 60/40 sin cambiar los precios vigentes.

### Personas (B2C)
| Servicio | 60 % IA | 40 % humano |
|---|---|---|
| 6 acompañamientos 1:1 ($190.000) | 2 h 15 min de encargo en el aula (Leer, Interpretar, Crear) | 90 min de Mesa 1:1 + sello |
| Masterclass ($59.000) | Antes: "tu pregunta" en 10 min. Después: "tu primer paso" con un mini encargo | La clase en vivo |
| Bootcamps de un día ($490.000) | 9 h en dos semanas: 3 h antes (caso y borrador) y 6 h después (aplicación) | 6 h de bootcamp presencial con Mesas por equipos |
| De Profesional a Emprendedor (6 semanas) | 4 h 30 min por semana: un encargo semanal (oferta, precio, propuesta, modelo, validación, lanzamiento) | Miércoles de 6 a 9 p. m.: Mesa grupal de cohorte de 5 + sello semanal |

Ruta consultor y ruta emprendedor usan los mismos encargos con plantillas distintas.

### Empresas (B2B)
- **Laboratorio de Innovación basado en Humanidades.** La IA hace el grueso de Leer e Interpretar: síntesis de entrevistas, análisis documental, mapas de actores, de normas y de comportamiento. Los talleres humanos hacen Crear y Probar con personas reales. Así, un Lab Express de 4 h llega con el diagnóstico listo, y un Lab Sprint dedica sus semanas a prototipar y probar.
- **Upskilling y reskilling.** Cada profesional trae un encargo de su propio puesto. El aula lo acompaña y el facilitador VinkU hace las Mesas in-company. La empresa ve un tablero de evidencias aplicadas (no de horas cursadas).

### Universidades y organizaciones
- **Transformación de programas académicos.** El aula es el mecanismo: VinkU convierte asignaturas en encargos con aliados del sector real. La IA hace el análisis de brecha entre el currículo y la demanda, y los docentes asumen el rol de la Mesa. Licencia del aula como parte de la consultoría.
- **Ruta de Empleabilidad Humanista y cupos patrocinados.** Las mismas rutas B2C; la entidad patrocina y recibe el reporte de evidencias.

## Roles en la plataforma
- **Participante:** trabaja sus encargos y lleva su bitácora.
- **Consultor VinkU:** recibe briefs, atiende Mesas y pone sellos.
- **Organización:** asigna encargos a su equipo y ve evidencias.

## Indicadores
- Encargos con entregable terminado
- Evidencias reales registradas
- Sellos otorgados
- Tiempo desde la entrada hasta el primer entregable
- Paso de acompañamiento o bootcamp al programa (abono de $250.000)

## Próximos pasos técnicos
1. Prototipo navegable (en `aula-invertida/`, este repo).
2. Persistir bitácora, encargos y Mesas en Supabase (esquema propuesto en `aula-invertida/supabase/schema.sql`).
3. La IA de la plataforma usa la Edge Function `diagnostico-ia` existente (la clave de Anthropic vive en el servidor).
4. Pagos con los links de Wompi y agendamiento de Mesas por WhatsApp mientras no haya calendario propio.
