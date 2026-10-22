// Pasarela mínima para la pila local alterna: hace lo que Kong en Supabase.
// /auth/v1/* → GoTrue   /rest/v1/* → PostgREST   (con CORS para el navegador)
import http from 'node:http'

const rutas = {
  '/auth/v1': `http://127.0.0.1:${process.env.PUERTO_AUTH ?? 59999}`,
  '/rest/v1': `http://127.0.0.1:${process.env.PUERTO_REST ?? 53000}`,
}
const puerto = Number(process.env.PUERTO_PASARELA ?? 54321)

const cors = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers':
    'authorization, apikey, content-type, x-client-info, prefer, range, accept-profile, content-profile, x-supabase-api-version',
  'access-control-allow-methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'access-control-expose-headers': 'content-range, x-total-count',
}

http
  .createServer((req, res) => {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, cors).end()
      return
    }
    const prefijo = Object.keys(rutas).find((p) => req.url?.startsWith(p))
    if (!prefijo) {
      res.writeHead(404, cors).end('{"message":"ruta desconocida"}')
      return
    }
    const destino = new URL(rutas[prefijo] + req.url.slice(prefijo.length))
    const salida = http.request(
      destino,
      { method: req.method, headers: { ...req.headers, host: destino.host } },
      (respuesta) => {
        res.writeHead(respuesta.statusCode ?? 502, { ...respuesta.headers, ...cors })
        respuesta.pipe(res)
      },
    )
    salida.on('error', (e) => res.writeHead(502, cors).end(JSON.stringify({ message: e.message })))
    req.pipe(salida)
  })
  .listen(puerto, () => console.log(`pasarela en http://127.0.0.1:${puerto}`))
