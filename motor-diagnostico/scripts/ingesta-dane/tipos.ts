// Tipos del pipeline de ingesta DANE.

export interface OcupacionNormalizada {
  codigo: string;
  nombre: string;
  descripcion: string;
  nivel_competencia: number | null;
  area_cualificacion: string;
  conocimientos: string[]; // → duras
  destrezas: string[]; // → transversales (soft por defecto)
  es_prioritaria: boolean; // exhibición inicial (sección 6.4)
  cluster: string | null;
}

// Tipo de habilidad propuesto por el script (revisable por VinkU).
export type TipoSkillPropuesto = 'hard' | 'soft' | 'power';

export interface SkillPropuesta {
  nombre_canonico: string;
  tipo_sugerido: TipoSkillPropuesto;
  origen: 'conocimientos' | 'destrezas';
  frecuencia: number;
  ejemplos_variantes: string;
}
