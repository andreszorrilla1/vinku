// ============================================================
// Campus Pass by VinkU — Tipos de la Etapa 1
// Diagnóstico DBR → Curaduría → Cotización
// TypeScript estricto — sin `any`.
// ============================================================

// ------------------------------------------------------------
// MÓDULO 1 — DIAGNÓSTICO DBR
// ------------------------------------------------------------

export type TipoUsuario = "particular" | "colaborador_empresa";

export type NivelEducativo =
  | "bachiller"
  | "tecnico"
  | "tecnologo"
  | "universitario_incompleto"
  | "universitario_completo"
  | "posgrado";

export type AnosExperiencia = "0-1" | "1-3" | "3-5" | "5-10" | "mas_de_10";

export type TiempoMeta = "3_meses" | "6_meses" | "1_ano" | "mas_de_1_ano" | "no_se";

export type HabilidadBrecha =
  | "tecnicas"
  | "liderazgo"
  | "comunicacion"
  | "datos"
  | "digitales"
  | "idiomas"
  | "otra";

export type IntentosPrevios = "si_exito" | "si_no_termine" | "no_empezado";

export type PresupuestoMes =
  | "menos_100k"
  | "100k_300k"
  | "300k_600k"
  | "mas_600k"
  | "no_se";

export interface DiagnosticoRespuestasParticular {
  tipo_usuario: "particular";
  nivel_educativo: NivelEducativo;
  area_trabajo: string;
  anos_experiencia: AnosExperiencia;
  ciudad: string;
  rol_deseado: string; // mínimo 10 chars
  proposito_vida: string; // mínimo 20 chars
  tiempo_meta: TiempoMeta;
  habilidades_brecha: HabilidadBrecha[];
  intentos_previos: IntentosPrevios;
  presupuesto_mes: PresupuestoMes;
}

export interface DiagnosticoRespuestasColaborador {
  tipo_usuario: "colaborador_empresa";
  nivel_educativo: NivelEducativo;
  area_trabajo: string;
  anos_experiencia: AnosExperiencia;
  ciudad: string;
  cargo_actual: string;
  proposito_estrategico_puesto: string;
  necesidad_empresa: string;
  rol_objetivo_empresa: string | null;
  habilidades_brecha: HabilidadBrecha[];
  intentos_previos: IntentosPrevios;
  presupuesto_empresa: string | null;
}

export type DiagnosticoRespuestas =
  | DiagnosticoRespuestasParticular
  | DiagnosticoRespuestasColaborador;

// Perfil de brecha — output del diagnóstico (lo genera la IA o la heurística)
export interface PerfilBrecha {
  perfil_brecha: {
    rol_objetivo: string;
    habilidades_criticas: string[];
    habilidades_complementarias: string[];
    nivel_entrada: "basico" | "intermedio" | "avanzado";
    modalidad_preferida: "virtual" | "presencial" | "hibrida";
    horas_disponibles_semana: number;
    tiempo_meta_meses: number;
    proposito_vida: string;
    proposito_empresa: string;
    presupuesto_mes_cop: number;
    restricciones_especiales: string;
  };
  score_completitud: number; // 0-100
}

export interface MensajeChat {
  role: "user" | "assistant";
  content: string;
}

// ------------------------------------------------------------
// MÓDULO 2 — CURADURÍA
// ------------------------------------------------------------

export type TipoInstitucion = "universidad" | "tecnologica" | "tecnica" | "IETDH";

export type NivelCurso =
  | "tecnico_laboral"
  | "tecnico_profesional"
  | "tecnologico"
  | "universitario"
  | "diplomado"
  | "especializacion"
  | "maestria"
  | "educacion_continua";

export type Modalidad = "virtual" | "presencial" | "hibrida";

export interface Curso {
  id_curso: string;
  institucion: string;
  tipo_institucion: TipoInstitucion;
  nombre_curso: string;
  nivel: NivelCurso;
  modalidad: Modalidad;
  duracion_horas: number;
  duracion_semanas: number;
  precio_publico_cop: number;
  precio_vinku_cop: number; // 0 si no hay descuento (Caso B)
  descuento_disponible: boolean;
  ciudad: string;
  habilidades_que_desarrolla: string[];
  roles_que_habilita: string[];
  prerequisitos: string[];
  cupos_disponibles: number;
  proxima_fecha_inicio: string;
  categoria: string;
  palabras_clave: string[];
  activo: boolean;
}

export type CasoComercial = "A" | "B";

export interface CursoEnRuta extends Curso {
  orden: number;
  caso_comercial: CasoComercial; // A = con descuento, B = sin descuento
  precio_cliente_cop: number; // precio final que paga el cliente
  margen_vinku_cop: number;
}

export type ConfiguracionRuta = "express" | "estandar" | "completa";

export interface Ruta {
  id_ruta: string;
  nombre_ruta: string;
  usuario_id: string;
  fecha_generacion: string;
  configuracion: ConfiguracionRuta;
  duracion_total_semanas: number;
  cursos: CursoEnRuta[];
  habilidades_cubiertas: string[];
  habilidades_no_cubiertas: string[];
  cobertura_brecha_porcentaje: number;
}

export interface RutasGeneradas {
  rutas: {
    express: Ruta;
    estandar: Ruta;
    completa: Ruta;
  };
  recomendada: ConfiguracionRuta;
}

// ------------------------------------------------------------
// MÓDULO 3 — COTIZACIÓN
// ------------------------------------------------------------

export interface ConfiguracionComercial {
  desc_cliente_default: number; // 0.20 = 20%
  fee_gestion_default: number; // 0.10 = 10%
  margen_minimo_cop: number; // 50000
  descuento_gremial?: number; // ej: 0.05 para CTU
  descuento_volumen_b2b?: number; // 0.05 para 10+ personas
}

export interface LineaCotizacion {
  orden: number;
  nombre_curso: string;
  institucion: string;
  caso_comercial: CasoComercial;
  precio_publico_cop: number;
  precio_cliente_cop: number;
  margen_vinku_cop: number;
}

export type EstadoCotizacion = "emitida" | "vencida" | "aprobada" | "rechazada";

export interface Cotizacion {
  numero: string; // CP-2026-XXXXX
  fecha_emision: string;
  fecha_vencimiento: string; // +15 días hábiles
  cliente_nombre: string;
  tipo_cliente: "particular" | "empresa";
  asesor: string; // 'Campus Pass Automático' o nombre asesor
  ruta_nombre: string;
  configuracion: ConfiguracionRuta;
  lineas: LineaCotizacion[];
  subtotal_precio_publico_cop: number;
  subtotal_precio_cliente_cop: number;
  ahorro_cop: number;
  margen_total_vinku_cop: number;
  valida: boolean;
  estado: EstadoCotizacion;
}

// ------------------------------------------------------------
// MÁQUINA DE ESTADOS — flujo Etapa 1
// ------------------------------------------------------------

export type EstadoEtapa1 =
  | "seleccion_tipo" // bifurcación inicial
  | "preguntas_fijas" // Momento 1
  | "chat_ia" // Momento 2
  | "derivacion_asesor" // score < 70
  | "perfil_completo" // tarjeta de perfil
  | "curaduria_cargando" // spinner mientras cura
  | "ruta_generada" // VistaRuta
  | "cotizacion_generada" // VistaCotizacion
  | "cotizacion_aprobada"; // inicio Etapa 2

// Snapshot persistido en localStorage para reanudar el flujo
export interface Etapa1Persistencia {
  estado: EstadoEtapa1;
  respuestas: Partial<DiagnosticoRespuestas> | null;
  historialChat: MensajeChat[];
  perfilBrecha: PerfilBrecha | null;
  rutaSeleccionada: ConfiguracionRuta | null;
  actualizado: string;
}

export const WHATSAPP_ASESOR = "https://wa.me/573206621546";

export const CONFIG_COMERCIAL_DEFAULT: ConfiguracionComercial = {
  desc_cliente_default: 0.2,
  fee_gestion_default: 0.1,
  margen_minimo_cop: 50000,
};
