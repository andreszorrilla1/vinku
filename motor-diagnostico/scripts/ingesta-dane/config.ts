// ============================================================================
// Configuración de la ingesta DANE (CUOC 2025).
//
// El Excel oficial de perfiles ocupacionales tiene ONCE campos clave por
// ocupación (metodología DANE): código, nombre, descripción, funciones,
// denominaciones ocupacionales, destrezas, conocimientos, ocupaciones afines,
// nivel de competencia, área de cualificación y equivalencias.
//
// Como los encabezados exactos pueden variar entre versiones del archivo, cada
// campo lógico se detecta por una lista de nombres candidatos (normalizados).
// Si el archivo real usa otros encabezados, ajústalos aquí — el parser falla
// en voz alta e imprime los encabezados encontrados para facilitarlo.
// ============================================================================

export interface MapeoColumnas {
  codigo: string[];
  nombre: string[];
  descripcion: string[];
  nivel_competencia: string[];
  area_cualificacion: string[];
  conocimientos: string[]; // → habilidades DURAS (áreas de conocimiento)
  destrezas: string[];     // → habilidades TRANSVERSALES (soft por defecto)
}

// Candidatos por campo, ya normalizados (minúsculas, sin tildes, sin dobles
// espacios). La detección compara contra estos.
export const COLUMNAS: MapeoColumnas = {
  codigo: ['codigo', 'codigo cuoc', 'codigo ocupacion', 'cod', 'codigo de la ocupacion'],
  nombre: ['nombre', 'nombre ocupacion', 'denominacion', 'titulo', 'ocupacion', 'nombre de la ocupacion'],
  descripcion: ['descripcion', 'descripcion de la ocupacion'],
  nivel_competencia: ['nivel de competencia', 'nivel competencia', 'nivel'],
  area_cualificacion: ['area de cualificacion', 'area cualificacion', 'area de conocimiento', 'sector'],
  conocimientos: ['conocimientos', 'conocimiento', 'areas de conocimiento'],
  destrezas: ['destrezas', 'destreza', 'habilidades transversales', 'habilidades'],
};

// Delimitadores comunes dentro de una celda multi-valor (una celda de
// "conocimientos" suele traer varios ítems). Se prueban en orden.
export const DELIMITADORES = /\r?\n|;|•|·|•|(?:^|\s)[-–*]\s|\|/;

// Marcadores de lista a limpiar al inicio de cada ítem.
export const PREFIJOS_LISTA = /^\s*(?:\d+[.)]\s*|[-–*•·]\s*)/;

// ---------------------------------------------------------------------------
// Clústeres de EXHIBICIÓN prioritaria (sección 6.4). OJO: se cargan las 676
// ocupaciones; esto solo marca cuáles se muestran primero en el producto.
// Se detecta por palabras clave en el nombre de la ocupación (robusto ante
// cambios de código entre versiones).
// ---------------------------------------------------------------------------
export interface ClusterPrioritario {
  nombre: string;
  patrones: RegExp[];
}

export const CLUSTERES_PRIORITARIOS: ClusterPrioritario[] = [
  {
    nombre: 'Administrativo',
    patrones: [
      /oficinist/i,
      /auxiliar(es)? (de )?contab/i, // contabilidad / contable(s)
      /auxiliar(es)? (de )?(servicios )?(estadistic|financier)/i,
      /auxiliar(es)? (de )?(informacion|servicio al cliente)/i,
      /asistente administrativ/i,
    ],
  },
  {
    nombre: 'Tecnología (TI)',
    patrones: [/soporte (tecnico|informatic)/i, /(tecnico|especialista) (en|de) redes/i, /mesa de ayuda|help desk/i],
  },
  {
    nombre: 'Ventas',
    patrones: [/vendedor/i, /auxiliar(es)? (de )?venta/i, /asesor(es)? (comercial|de venta)/i],
  },
  {
    nombre: 'Transporte',
    patrones: [/conductor/i, /transporte/i, /operador(es)? de vehicul/i, /chofer/i],
  },
];

// Rutas de trabajo del pipeline.
export const RUTAS = {
  excel: 'scripts/ingesta-dane/data/dane-cuoc-2025.xlsx',
  ocupaciones: 'scripts/ingesta-dane/data/ocupaciones.json',
  propuesta: 'scripts/ingesta-dane/data/propuesta-skills.csv',
  // El revisor guarda su versión aprobada con este nombre (nunca se sobrescribe).
  propuestaRevisada: 'scripts/ingesta-dane/data/propuesta-skills.revisada.csv',
  sqlSkills: 'supabase/migrations/010_dane_skills.sql',
  sqlPathways: 'supabase/migrations/011_dane_pathways.sql',
} as const;
