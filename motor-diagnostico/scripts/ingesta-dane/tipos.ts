// Tipos del pipeline de ingesta DANE (libro relacional CUOC 2025).

export interface SkillRef {
  id: string;      // ID de DANE (llave de deduplicación)
  nombre: string;  // nombre canónico del conocimiento/destreza
}

export interface OcupacionNormalizada {
  codigo: string;               // Código de la Ocupación (5 dígitos)
  nombre: string;
  descripcion: string;
  nivel_competencia: number | null;
  gran_grupo_codigo: string;
  gran_grupo_nombre: string;
  area_cualificacion: string;   // nombre canónico del área
  area_sigla: string;           // SIGLA del área (llave estable)
  conocimientos: SkillRef[];    // → duras
  destrezas: SkillRef[];        // → transversales
  es_prioritaria: boolean;      // exhibición inicial (sección 6.4)
  cluster: string | null;
}

export type TipoSkillPropuesto = 'hard' | 'soft' | 'power';

// Entrada del catálogo deduplicado por ID de DANE.
export interface EntradaCatalogo {
  dane_id: string;
  nombre_canonico: string;
  origen: 'conocimientos' | 'destrezas';
  frecuencia: number;           // en cuántas ocupaciones aparece
}

export interface AreaCualificacion {
  sigla: string;
  nombre: string;
}

export interface Catalogo {
  conocimientos: EntradaCatalogo[];
  destrezas: EntradaCatalogo[];
  areas: AreaCualificacion[];
}
