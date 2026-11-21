import { MICRO, RUBRICA, NIVELES, CASO_DANIEL, GUIA_VIVO, DILEMAS, CONSENTIMIENTO, ENCUESTA, casoDanielMarkdown } from "../src/data/consultorio-micro";
import { HERRAMIENTAS } from "../src/data/herramientas";
const md = `# Consultorio · Microcertificación y recursos a profundidad
VinkU edu · Aprendizaje Basado en Herramientas · versión 1, 21 de noviembre de 2026
Todo el material clínico es ficticio y tiene fines formativos.

## 1. Habilidades certificables por herramienta
Cada herramienta queda amarrada a las habilidades que se pueden microcertificar con ella.
| Herramienta | Habilidad certificable | Estado |
|---|---|---|
${HERRAMIENTAS.flatMap((h) => h.certificables.map((c) => `| ${h.nombre} | ${c.nombre} | ${c.estado} |`)).join("\n")}

## 2. Ficha de la microcertificación
- **Nombre:** ${MICRO.nombre}
- **Tipo:** ${MICRO.nivel}
- **Competencia:** ${MICRO.competencia}
- **Resultados de aprendizaje:**
${MICRO.resultados.map((r) => `  - ${r}`).join("\n")}
- **Requisitos:**
${MICRO.requisitos.map((r) => `  - ${r}`).join("\n")}
- **Evidencias:**
${MICRO.evidencias.map((r) => `  - ${r}`).join("\n")}
- **Vigencia:** ${MICRO.vigencia}
- **Resultado posible:** ${MICRO.resultado}
- **Insignia:** imagen \`piloto/insignias/consultorio.png\` y metadatos Open Badges 3.0 en \`piloto/insignias/consultorio-openbadge.json\` (repo vinku). Hay que reemplazar «dominio-vinkuedu» por el dominio real y firmar la credencial al emitirla.

## 3. Rúbrica analítica
Se otorga con «Competente» o más en los cinco criterios.
${RUBRICA.map((r) => `### ${r.criterio} · ${r.peso}\n${r.niveles.map((n, i) => `- **${NIVELES[i]}:** ${n}`).join("\n")}`).join("\n\n")}

## 4. Caso de evaluación
${casoDanielMarkdown().split("\n").slice(3).join("\n").replace(/^## Rúbrica[\s\S]*$/m, "")}
### Respuestas esperadas (solo para evaluadores)
${CASO_DANIEL.claves.map((c) => `- ${c}`).join("\n")}

## 5. Guía de la evaluación en vivo
**Duración y formato:** ${GUIA_VIVO.duracion}

**Agenda:**
${GUIA_VIVO.agenda.map((a) => `- **${a.min} · ${a.bloque}:** ${a.texto}`).join("\n")}

**Frases para la simulación (el evaluador hace de rector del colegio):**
${GUIA_VIVO.simulacion.map((s) => `- ${s}`).join("\n")}

**Preguntas de la sustentación (se publican de antemano):**
${GUIA_VIVO.sustentacion.map((s, i) => `${i + 1}. ${s}`).join("\n")}

**Formulario de dictamen:** ${GUIA_VIVO.dictamen.join(" · ")}

## 6. Banco de dilemas (artefacto de práctica)
${DILEMAS.map((d, i) => `**${i + 1}. ${d.situacion}**\n${d.opciones.map((o, k) => `- ${k === d.correcta ? "✔" : "○"} ${o}`).join("\n")}\n*Por qué:* ${d.porque}`).join("\n\n")}

## 7. Consentimiento modelo con autorización de transcripción
\`\`\`
${CONSENTIMIENTO}
\`\`\`

## 8. Encuesta de cierre del piloto
${ENCUESTA.map((e, i) => `${i + 1}. ${e.p} *(${e.tipo})*`).join("\n")}

## 9. Inventario de recursos de Consultorio en la plataforma
- **Videos (6):** instalar, de la sesión a la historia, tu consultorio como negocio, horas a ingresos, precio sin miedo y alianzas.
- **Infografías (3):** en la web y como piezas descargables de 1080×1350.
- **Textos (2):** datos sensibles y elige tu enfoque. Se pueden adaptar al caso con IA.
- **Artefactos de práctica (10):**
  - Expediente de práctica Laura Prueba.
  - Seis decisiones difíciles.
  - Tres simuladores con IA: «está caro», presentarse a una médica y un taller para una empresa.
  - Calculadora «Mis números».
  - Consentimiento modelo.
  - Infografías descargables.
  - Checklist.
  - Mensajes listos.
  - Autoevaluación.
- **Microcertificación:**
  - La ficha, la rúbrica y el caso de evaluación Daniel Prueba.
  - La primera lectura con IA y la guía de la evaluación en vivo.
  - El dictamen del evaluador y la insignia con metadatos Open Badges.
`;
console.log(md);
