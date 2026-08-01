// ============================================================================
// Configuración de la ingesta DANE (CUOC 2025).
//
// El Excel oficial es un LIBRO RELACIONAL: cada uno de los once campos clave es
// su propia hoja, en formato largo, unida por "Código de la Ocupación".
// El encabezado real está en la fila 2 (la fila 1 es el título fusionado).
//
// Conocimientos y Destrezas ya vienen como valores atómicos CON un ID de DANE
// (catálogo ya deduplicado por la fuente). El ID es la llave de deduplicación.
// ============================================================================

// Cada hoja se localiza por una palabra clave en su nombre (tolerante a tildes),
// y cada columna lógica por candidatos de encabezado (normalizados).
export interface HojaConfig {
  clave_hoja: string[];                 // para ubicar la hoja por nombre
  columnas: Record<string, string[]>;   // campo lógico → encabezados candidatos
}

export const HOJAS = {
  ocupacion: {
    clave_hoja: ['ocupacion'],
    columnas: {
      gran_grupo_codigo: ['codigo del gran grupo'],
      gran_grupo_nombre: ['nombre del gran grupo'],
      codigo: ['codigo de la ocupacion'],
      nombre: ['nombre de la ocupacion'],
    },
  },
  nivel: {
    clave_hoja: ['nivel competencia', 'nivel de competencia'],
    columnas: {
      codigo: ['codigo de la ocupacion'],
      nivel: ['nivel de competencia'],
    },
  },
  descripcion: {
    clave_hoja: ['descripcion'],
    columnas: {
      codigo: ['codigo de la ocupacion'],
      descripcion: ['descripcion de la ocupacion'],
    },
  },
  area_principal: {
    clave_hoja: ['area cual. principal', 'area cualificacion principal', 'area cual principal'],
    columnas: {
      codigo: ['codigo de la ocupacion'],
      sigla: ['sigla'],
      area: ['area de cualificacion principal'],
    },
  },
  conocimientos: {
    clave_hoja: ['conocimientos'],
    columnas: {
      codigo: ['codigo de la ocupacion'],
      id: ['id'],
      nombre: ['nombre del conocimiento'],
    },
  },
  destrezas: {
    clave_hoja: ['destrezas'],
    columnas: {
      codigo: ['codigo de la ocupacion'],
      id: ['id'],
      nombre: ['nombre de la destreza'],
    },
  },
} as const satisfies Record<string, HojaConfig>;

// ---------------------------------------------------------------------------
// Clústeres de EXHIBICIÓN prioritaria (sección 6.4). Se cargan las 680
// ocupaciones; esto solo marca cuáles se muestran primero. Se detecta por
// palabras clave en el nombre de la ocupación (comparado SIN tildes).
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
      /auxiliar(es)? (de )?contab/i,
      /auxiliar(es)? (de )?(servicios )?(estadistic|financier)/i,
      /auxiliar(es)? (de )?(informacion|servicio al cliente)/i,
      /asistente(s)? administrativ/i,
    ],
  },
  {
    nombre: 'Tecnología (TI)',
    patrones: [/soporte (tecnico|informatic)/i, /(tecnico|especialista)(s)? (en|de) redes/i, /mesa de ayuda|help desk/i],
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

export const RUTAS = {
  excel: 'scripts/ingesta-dane/data/dane-cuoc-2025.xlsx',
  ocupaciones: 'scripts/ingesta-dane/data/ocupaciones.json',
  catalogo: 'scripts/ingesta-dane/data/catalogo.json',
  propuesta: 'scripts/ingesta-dane/data/propuesta-skills.csv',
  propuestaRevisada: 'scripts/ingesta-dane/data/propuesta-skills.revisada.csv',
  sqlSkills: 'supabase/migrations/010_dane_skills.sql',
  sqlPathways: 'supabase/migrations/011_dane_pathways.sql',
  sqlCualificaciones: 'supabase/migrations/012_dane_cualificaciones.sql',
} as const;
