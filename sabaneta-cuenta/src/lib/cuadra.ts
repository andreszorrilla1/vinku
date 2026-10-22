import { latLngToCell } from 'h3-js'

/** Resolución H3 de una «cuadra» (~65 m de lado). */
export const RESOLUCION_CUADRA = 10

export function cuadraH3(lat: number, lng: number): string {
  return latLngToCell(lat, lng, RESOLUCION_CUADRA)
}

/** Punto en formato EWKT para PostGIS. */
export function puntoEwkt(lat: number, lng: number): string {
  return `SRID=4326;POINT(${lng} ${lat})`
}
