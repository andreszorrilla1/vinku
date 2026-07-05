// ============================================================
// Campus Pass by VinkU — Motor de Cotización Dinámica
// Caso A (con descuento) / Caso B (sin descuento, fee de gestión).
// Lógica determinista y pura. Sin red, sin secretos.
// ============================================================

import type {
  CursoEnRuta,
  Ruta,
  Cotizacion,
  LineaCotizacion,
  ConfiguracionComercial,
} from "../types/etapa1";
import { CONFIG_COMERCIAL_DEFAULT } from "../types/etapa1";

// Suma N días hábiles (excluye sábados y domingos) a una fecha.
export function sumarDiasHabiles(desde: Date, dias: number): Date {
  const d = new Date(desde.getTime());
  let restantes = dias;
  while (restantes > 0) {
    d.setDate(d.getDate() + 1);
    const dow = d.getDay(); // 0=domingo, 6=sábado
    if (dow !== 0 && dow !== 6) restantes--;
  }
  return d;
}

// CASO B — sin descuento: el cliente paga precio público + fee de gestión.
function calcularLineaCasoB(
  curso: CursoEnRuta,
  config: ConfiguracionComercial
): LineaCotizacion {
  const precioCliente = Math.round(curso.precio_publico_cop * (1 + config.fee_gestion_default));
  const margen = Math.round(curso.precio_publico_cop * config.fee_gestion_default);
  return {
    orden: curso.orden,
    nombre_curso: curso.nombre_curso,
    institucion: curso.institucion,
    caso_comercial: "B",
    precio_publico_cop: curso.precio_publico_cop,
    precio_cliente_cop: precioCliente,
    margen_vinku_cop: margen,
  };
}

// CASO A — con descuento VinkU: el cliente paga precio público con descuento.
// Si el margen resultante es menor al mínimo, se fuerza Caso B.
function calcularLinea(
  curso: CursoEnRuta,
  config: ConfiguracionComercial
): LineaCotizacion {
  if (curso.descuento_disponible && curso.precio_vinku_cop > 0) {
    const precioCliente = Math.round(curso.precio_publico_cop * (1 - config.desc_cliente_default));
    const margen = precioCliente - curso.precio_vinku_cop;
    if (margen < config.margen_minimo_cop) {
      // margen insuficiente → forzar Caso B
      return calcularLineaCasoB(curso, config);
    }
    return {
      orden: curso.orden,
      nombre_curso: curso.nombre_curso,
      institucion: curso.institucion,
      caso_comercial: "A",
      precio_publico_cop: curso.precio_publico_cop,
      precio_cliente_cop: precioCliente,
      margen_vinku_cop: margen,
    };
  }
  return calcularLineaCasoB(curso, config);
}

// Genera un número de cotización legible. `timestampCorto` se inyecta
// (no se usa Date.now interno) para mantener la función determinista.
function generarNumero(anio: number, timestampCorto: string): string {
  return `CP-${anio}-${timestampCorto}`;
}

export interface ParamsCotizacion {
  ruta: Ruta;
  clienteNombre: string;
  tipoCliente: "particular" | "empresa";
  configComercial?: Partial<ConfiguracionComercial>;
  personasCount?: number;
  asesor?: string;
  // Inyectados por el caller (sin Date.now/Math.random dentro del motor):
  fechaEmision: Date;
  timestampCorto: string;
}

/**
 * Motor de cotización. Recibe una ruta seleccionada y genera la cotización
 * con el detalle por línea (Caso A/B), totales, ahorro y vencimiento a
 * 15 días hábiles.
 */
export function cotizarRuta(params: ParamsCotizacion): Cotizacion {
  const {
    ruta,
    clienteNombre,
    tipoCliente,
    configComercial,
    personasCount = 1,
    asesor = "Campus Pass Automático",
    fechaEmision,
    timestampCorto,
  } = params;

  const config: ConfiguracionComercial = { ...CONFIG_COMERCIAL_DEFAULT, ...configComercial };

  let lineas = ruta.cursos.map((c) => calcularLinea(c, config));

  // Descuento por volumen B2B (10+ personas) sobre el precio cliente.
  const aplicaVolumen = tipoCliente === "empresa" && personasCount >= 10 && config.descuento_volumen_b2b;
  if (aplicaVolumen && config.descuento_volumen_b2b) {
    const factor = 1 - config.descuento_volumen_b2b;
    lineas = lineas.map((l) => {
      const nuevoPrecio = Math.round(l.precio_cliente_cop * factor);
      return {
        ...l,
        precio_cliente_cop: nuevoPrecio,
        margen_vinku_cop: nuevoPrecio - (l.precio_cliente_cop - l.margen_vinku_cop),
      };
    });
  }

  const subtotalPublico = lineas.reduce((s, l) => s + l.precio_publico_cop, 0);
  const subtotalCliente = lineas.reduce((s, l) => s + l.precio_cliente_cop, 0);
  const margenTotal = lineas.reduce((s, l) => s + l.margen_vinku_cop, 0);
  const ahorro = Math.max(0, subtotalPublico - subtotalCliente);

  const vencimiento = sumarDiasHabiles(fechaEmision, 15);
  const anio = fechaEmision.getFullYear();

  return {
    numero: generarNumero(anio, timestampCorto),
    fecha_emision: fechaEmision.toISOString(),
    fecha_vencimiento: vencimiento.toISOString(),
    cliente_nombre: clienteNombre,
    tipo_cliente: tipoCliente,
    asesor,
    ruta_nombre: ruta.nombre_ruta,
    configuracion: ruta.configuracion,
    lineas,
    subtotal_precio_publico_cop: subtotalPublico,
    subtotal_precio_cliente_cop: subtotalCliente,
    ahorro_cop: ahorro,
    margen_total_vinku_cop: margenTotal,
    valida: true,
    estado: "emitida",
  };
}

// Utilidad de formato COP: $3.200.000
export function formatCOP(n: number): string {
  return `$${Math.round(n).toLocaleString("es-CO")}`;
}
