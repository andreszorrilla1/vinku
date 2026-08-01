// ============================================================================
// Configuración de la ingesta DANE (CUOC 2025).
//
// El Excel oficial es un LIBRO RELACIONAL: cada uno de los once campos clave es
// su propia hoja, en formato largo, unida por "Código de la Ocupación".
// El encabezado real está en la fila 2 (la fila 1 es el título fusionado).
//
// La ingesta captura TODAS las hojas — no se excluye ningún componente del CUOC.
// Conocimientos y Destrezas traen un ID de DANE (llave de deduplicación).
// ============================================================================

export interface HojaConfig {
  clave_hoja: string[];                 // para ubicar la hoja por nombre
  columnas: Record<string, string[]>;   // campo lógico → encabezados candidatos
}

export const HOJAS = {
  // Maestro + jerarquía completa (gran grupo → subgrupo ppal → subgrupo → grupo primario)
  ocupacion: {
    clave_hoja: ['ocupacion'],
    columnas: {
      gran_grupo_codigo: ['codigo del gran grupo'],
      gran_grupo_nombre: ['nombre del gran grupo'],
      subgrupo_principal_codigo: ['codigo del subgrupo principal'],
      subgrupo_principal_nombre: ['nombre del subgrupo principal'],
      subgrupo_codigo: ['codigo del subgrupo'],
      subgrupo_nombre: ['nombre del subgrupo'],
      grupo_primario_codigo: ['codigo del grupo primario'],
      grupo_primario_nombre: ['nombre del grupo primario'],
      codigo: ['codigo de la ocupacion'],
      nombre: ['nombre de la ocupacion'],
    },
  },
  nivel: {
    clave_hoja: ['nivel competencia', 'nivel de competencia'],
    columnas: { codigo: ['codigo de la ocupacion'], nivel: ['nivel de competencia'] },
  },
  descripcion: {
    clave_hoja: ['descripcion'],
    columnas: { codigo: ['codigo de la ocupacion'], descripcion: ['descripcion de la ocupacion'] },
  },
  funciones: {
    clave_hoja: ['funciones'],
    columnas: {
      codigo: ['codigo de la ocupacion'],
      consecutivo: ['consecutivo de la funcion'],
      texto: ['funciones de la ocupacion'],
    },
  },
  denominaciones: {
    clave_hoja: ['denominaciones'],
    columnas: {
      codigo: ['codigo de la ocupacion'],
      denom_codigo: ['codigo de la denominacion'],
      denom_nombre: ['nombre de la denominacion'],
    },
  },
  conocimientos: {
    clave_hoja: ['conocimientos'],
    columnas: { codigo: ['codigo de la ocupacion'], id: ['id'], nombre: ['nombre del conocimiento'] },
  },
  destrezas: {
    clave_hoja: ['destrezas'],
    columnas: { codigo: ['codigo de la ocupacion'], id: ['id'], nombre: ['nombre de la destreza'] },
  },
  afines: {
    clave_hoja: ['ocupaciones afines', 'afines'],
    columnas: {
      codigo: ['codigo de la ocupacion'],
      afin_codigo: ['codigo de la ocupacion afin'],
      afin_nombre: ['nombre de la ocupacion afin'],
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
  area_complementaria: {
    clave_hoja: ['area cual. complementaria', 'area cualificacion complementaria', 'area cual complementaria'],
    columnas: {
      codigo: ['codigo de la ocupacion'],
      sigla: ['sigla'],
      area: ['area de cualificacion complementaria'],
    },
  },
  equivalencias: {
    clave_hoja: ['equivalencias'],
    columnas: {
      codigo: ['codigo de la ocupacion'],
      ciuo_codigo: ['codigo ciuo-08', 'codigo ciuo 08'],
      ciuo_obs: ['observaciones sobre la ciuo-08', 'observaciones sobre la ciuo 08'],
      cno_codigo: ['codigo cno'],
      cno_obs: ['observaciones sobre la cno'],
    },
  },
} as const satisfies Record<string, HojaConfig>;

// ---------------------------------------------------------------------------
// Clústeres de EXHIBICIÓN prioritaria (sección 6.4). Se cargan las 680
// ocupaciones; esto solo marca cuáles se muestran primero. Se compara SIN tildes.
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
