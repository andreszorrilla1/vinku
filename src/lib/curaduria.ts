// ============================================================
// Campus Pass by VinkU — Motor de Curaduría
// Lógica determinista: PerfilBrecha + catálogo → 3 configuraciones de ruta.
// Sin secretos, sin red: corre 100% en el cliente.
// ============================================================

import type {
  Curso,
  CursoEnRuta,
  PerfilBrecha,
  Ruta,
  RutasGeneradas,
  ConfiguracionRuta,
} from "../types/etapa1";

// Normaliza texto para comparar en español (minúsculas, sin tildes).
function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

// ¿Alguno de `haystack` contiene o es contenido por `needle`?
function contieneAlguno(haystack: string[], needle: string): boolean {
  const n = norm(needle);
  if (!n) return false;
  return haystack.some((h) => {
    const hn = norm(h);
    return hn.includes(n) || n.includes(hn);
  });
}

// Intersección aproximada entre dos listas de habilidades.
function interseccionHabilidades(a: string[], b: string[]): string[] {
  const out: string[] = [];
  for (const item of a) {
    if (contieneAlguno(b, item)) out.push(item);
  }
  return out;
}

// Mapea el nivel_entrada del perfil (basico/intermedio/avanzado) a los
// niveles de curso que le corresponden.
function nivelCompatible(
  nivelEntrada: PerfilBrecha["perfil_brecha"]["nivel_entrada"],
  nivelCurso: Curso["nivel"]
): boolean {
  const basicos: Curso["nivel"][] = ["tecnico_laboral", "tecnico_profesional", "educacion_continua"];
  const intermedios: Curso["nivel"][] = ["tecnologico", "diplomado", "universitario"];
  const avanzados: Curso["nivel"][] = ["especializacion", "maestria"];
  if (nivelEntrada === "basico") return basicos.includes(nivelCurso);
  if (nivelEntrada === "intermedio") return intermedios.includes(nivelCurso);
  return avanzados.includes(nivelCurso);
}

interface CursoPuntuado {
  curso: Curso;
  score: number;
  habilidadesCubiertas: string[];
}

// Puntúa un curso contra el perfil de brecha.
function puntuarCurso(curso: Curso, perfil: PerfilBrecha["perfil_brecha"]): CursoPuntuado {
  let score = 0;

  // +40: habilita el rol objetivo
  if (contieneAlguno(curso.roles_que_habilita, perfil.rol_objetivo)) {
    score += 40;
  }

  // +30: intersección con habilidades críticas
  const cubiertas = interseccionHabilidades(
    curso.habilidades_que_desarrolla,
    perfil.habilidades_criticas
  );
  if (cubiertas.length > 0) {
    score += 30;
  }

  // +15: modalidad coincide
  if (curso.modalidad === perfil.modalidad_preferida) {
    score += 15;
  }

  // +10: nivel coincide con nivel de entrada
  if (nivelCompatible(perfil.nivel_entrada, curso.nivel)) {
    score += 10;
  }

  // +5: ciudad coincide (solo relevante si es presencial)
  if (
    curso.modalidad === "presencial" &&
    perfil.modalidad_preferida !== "virtual" &&
    norm(curso.ciudad) !== "" &&
    perfil.restricciones_especiales &&
    norm(perfil.restricciones_especiales).includes(norm(curso.ciudad))
  ) {
    score += 5;
  }

  // -20: excede claramente el presupuesto mensual estimado
  if (perfil.presupuesto_mes_cop > 0 && curso.duracion_semanas > 0) {
    const costoMensual = (curso.precio_vinku_cop || curso.precio_publico_cop) / (curso.duracion_semanas / 4);
    if (costoMensual > perfil.presupuesto_mes_cop) {
      score -= 20;
    }
  }

  return { curso, score, habilidadesCubiertas: cubiertas };
}

// Aplica diversidad institucional: no más del 60% de cursos de una institución.
function aplicarDiversidad(
  seleccion: CursoPuntuado[],
  reserva: CursoPuntuado[],
  n: number
): CursoPuntuado[] {
  const resultado = [...seleccion];
  const maxPorInstitucion = Math.max(1, Math.floor(n * 0.6));
  const cuenta = new Map<string, number>();
  for (const c of resultado) {
    const key = norm(c.curso.institucion);
    cuenta.set(key, (cuenta.get(key) ?? 0) + 1);
  }
  for (let i = 0; i < resultado.length; i++) {
    const key = norm(resultado[i].curso.institucion);
    if ((cuenta.get(key) ?? 0) > maxPorInstitucion) {
      // buscar reemplazo de otra institución en la reserva
      const idxReemplazo = reserva.findIndex(
        (r) => !resultado.some((x) => x.curso.id_curso === r.curso.id_curso) &&
          (cuenta.get(norm(r.curso.institucion)) ?? 0) < maxPorInstitucion
      );
      if (idxReemplazo >= 0) {
        const nuevo = reserva[idxReemplazo];
        cuenta.set(key, (cuenta.get(key) ?? 1) - 1);
        cuenta.set(norm(nuevo.curso.institucion), (cuenta.get(norm(nuevo.curso.institucion)) ?? 0) + 1);
        resultado[i] = nuevo;
      }
    }
  }
  return resultado;
}

// Determina caso comercial y precio cliente de un curso dentro de la ruta.
function toCursoEnRuta(cp: CursoPuntuado, orden: number): CursoEnRuta {
  const curso = cp.curso;
  const casoA = curso.descuento_disponible && curso.precio_vinku_cop > 0;
  // Precio de referencia para mostrar en la ruta (la cotización recalcula el detalle).
  const precioCliente = casoA
    ? Math.round(curso.precio_publico_cop * 0.8)
    : Math.round(curso.precio_publico_cop * 1.1);
  const margen = casoA
    ? precioCliente - curso.precio_vinku_cop
    : Math.round(curso.precio_publico_cop * 0.1);
  return {
    ...curso,
    orden,
    caso_comercial: casoA ? "A" : "B",
    precio_cliente_cop: precioCliente,
    margen_vinku_cop: margen,
  };
}

// Construye una ruta con los N cursos mejor puntuados.
function construirRuta(
  puntuados: CursoPuntuado[],
  n: number,
  perfil: PerfilBrecha["perfil_brecha"],
  configuracion: ConfiguracionRuta,
  usuarioId: string,
  fecha: string
): Ruta {
  const top = puntuados.slice(0, n);
  const reserva = puntuados.slice(n);
  const diversificados = aplicarDiversidad(top, reserva, n);

  const cursos: CursoEnRuta[] = diversificados.map((cp, i) => toCursoEnRuta(cp, i + 1));

  // Cobertura de brecha
  const criticas = perfil.habilidades_criticas;
  const cubiertasSet = new Set<string>();
  for (const cp of diversificados) {
    for (const h of cp.habilidadesCubiertas) cubiertasSet.add(norm(h));
  }
  const cubiertas = criticas.filter((h) => cubiertasSet.has(norm(h)));
  const noCubiertas = criticas.filter((h) => !cubiertasSet.has(norm(h)));
  const cobertura = criticas.length > 0
    ? Math.round((cubiertas.length / criticas.length) * 100)
    : 0;

  const semanas = cursos.reduce((s, c) => s + (c.duracion_semanas || 0), 0);

  const nombres: Record<ConfiguracionRuta, string> = {
    express: "Ruta Express",
    estandar: "Ruta Estándar",
    completa: "Ruta Completa",
  };

  return {
    id_ruta: `ruta-${configuracion}-${fecha}`,
    nombre_ruta: `${nombres[configuracion]} — ${perfil.rol_objetivo}`,
    usuario_id: usuarioId,
    fecha_generacion: fecha,
    configuracion,
    duracion_total_semanas: semanas,
    cursos,
    habilidades_cubiertas: cubiertas,
    habilidades_no_cubiertas: noCubiertas,
    cobertura_brecha_porcentaje: cobertura,
  };
}

/**
 * Motor de curaduría. Recibe el perfil de brecha y el catálogo completo,
 * devuelve las tres configuraciones de ruta (3/5/7 cursos) y cuál recomienda.
 * `fechaISO` y `usuarioId` se inyectan (sin Date.now interno) para ser deterministas.
 */
export function curarRutas(
  perfil: PerfilBrecha["perfil_brecha"],
  catalogo: Curso[],
  usuarioId: string,
  fechaISO: string
): RutasGeneradas {
  // 1. Filtrar catálogo
  const disponibles = catalogo.filter((c) => c.activo && c.cupos_disponibles > 0);

  // 2-3. Puntuar y ordenar
  const puntuados = disponibles
    .map((c) => puntuarCurso(c, perfil))
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score);

  // 4-6. Construir tres rutas
  const express = construirRuta(puntuados, 3, perfil, "express", usuarioId, fechaISO);
  const estandar = construirRuta(puntuados, 5, perfil, "estandar", usuarioId, fechaISO);
  const completa = construirRuta(puntuados, 7, perfil, "completa", usuarioId, fechaISO);

  // Recomendación según tiempo meta y cobertura
  let recomendada: ConfiguracionRuta = "estandar";
  if (perfil.tiempo_meta_meses > 0 && perfil.tiempo_meta_meses <= 3) {
    recomendada = "express";
  } else if (estandar.cobertura_brecha_porcentaje < 70 && completa.cursos.length > estandar.cursos.length) {
    recomendada = "completa";
  }

  return { rutas: { express, estandar, completa }, recomendada };
}
