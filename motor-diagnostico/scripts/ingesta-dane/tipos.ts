// Tipos del pipeline de ingesta DANE (libro relacional CUOC 2025).
// Se captura el perfil COMPLETO de cada ocupación — ningún componente se excluye.

export interface SkillRef {
  id: string;      // ID de DANE (llave de deduplicación)
  nombre: string;  // nombre canónico del conocimiento/destreza
}

export interface CodNombre {
  codigo: string;
  nombre: string;
}

export interface AreaRef {
  sigla: string;
  nombre: string;
}

export interface FuncionRef {
  consecutivo: number | null;
  texto: string;
}

export interface EquivalenciaRef {
  ciuo08_codigo: string;
  ciuo08_obs: string;
  cno_codigo: string;
  cno_obs: string;
}

// Perfil ocupacional COMPLETO (los 11 campos clave del CUOC).
export interface OcupacionNormalizada {
  codigo: string;               // Código de la Ocupación (5 dígitos)
  nombre: string;
  descripcion: string;
  nivel_competencia: number | null;
  jerarquia: {
    gran_grupo: CodNombre;
    subgrupo_principal: CodNombre;
    subgrupo: CodNombre;
    grupo_primario: CodNombre;
  };
  funciones: FuncionRef[];
  denominaciones: CodNombre[];
  conocimientos: SkillRef[];    // → duras
  destrezas: SkillRef[];        // → transversales
  ocupaciones_afines: CodNombre[];
  area_principal: AreaRef | null;
  areas_complementarias: AreaRef[];
  equivalencias: EquivalenciaRef[];
  // Derivados de VinkU (no vienen del DANE):
  area_cualificacion: string;   // nombre canónico del área principal (para sector)
  es_prioritaria: boolean;      // exhibición inicial (sección 6.4)
  cluster: string | null;
}

export type TipoSkillPropuesto = 'hard' | 'soft' | 'power';

export interface EntradaCatalogo {
  dane_id: string;
  nombre_canonico: string;
  origen: 'conocimientos' | 'destrezas';
  frecuencia: number;
}

export interface Catalogo {
  conocimientos: EntradaCatalogo[];
  destrezas: EntradaCatalogo[];
  areas: AreaRef[];
}
