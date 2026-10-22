/**
 * Genera los PNG de la PWA desde public/marca/icono-app.svg.
 * Uso: npm run iconos (scripts/generar-iconos.mts)
 */
import { readFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const raiz = path.resolve(import.meta.dirname, '..')
const salida = path.join(raiz, 'public/iconos')

const icono = await readFile(path.join(raiz, 'public/marca/icono-app.svg'))

// Maskable: fondo a sangre (sin esquinas redondas) y el símbolo dentro de la zona segura (80 %).
const maskable = Buffer.from(
  (await readFile(path.join(raiz, 'public/marca/icono-app.svg'), 'utf-8'))
    .replace(
      '<rect width="200" height="200" rx="44" fill="#14532D"/>',
      '<rect width="200" height="200" fill="#14532D"/>',
    )
    .replace('translate(26 22) scale(0.74)', 'translate(42 38) scale(0.58)'),
)

await mkdir(salida, { recursive: true })

const tareas: [Buffer, number, string][] = [
  [icono, 192, 'icono-192.png'],
  [icono, 512, 'icono-512.png'],
  [maskable, 512, 'icono-maskable-512.png'],
  [maskable, 180, 'apple-touch-icon.png'],
]

for (const [svg, tamano, nombre] of tareas) {
  await sharp(svg, { density: 384 })
    .resize(tamano, tamano)
    .png({ compressionLevel: 9 })
    .toFile(path.join(salida, nombre))
  console.log(`✓ ${nombre} (${tamano}px)`)
}
