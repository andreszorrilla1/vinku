import { expect, test } from '@playwright/test'
import { revisarPantalla, revisarTocables } from './ayudas'

test.describe('portada', () => {
  test('muestra la marca, los botones principales y cómo funciona', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle('Sabaneta Cuenta')
    await expect(page.getByRole('img', { name: 'Sabaneta Cuenta' }).first()).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Cuéntale a Sabaneta. Aquí tu barrio cuenta.')
    await expect(page.getByRole('link', { name: 'Contar algo de mi cuadra' })).toHaveAttribute('href', '/contar')
    await expect(page.getByRole('link', { name: 'Ver Cuentas en vivo' })).toHaveAttribute('href', '/en-vivo')
    await expect(page.getByRole('heading', { name: '¿Qué es esto?' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Así funciona' })).toBeVisible()
    await expect(page.getByRole('link', { name: /Dolor/ })).toHaveAttribute('href', '/contar?tipo=dolor')
  })

  test('pasa la revisión de accesibilidad y tamaños', async ({ page }) => {
    await page.goto('/')
    await revisarPantalla(page)
    await revisarTocables(page)
  })

  test('la barra inferior lleva a las 4 secciones', async ({ page }) => {
    await page.goto('/')
    const menu = page.getByRole('navigation', { name: 'Menú principal' })
    for (const [nombre, ruta] of [
      ['Contar', '/contar'],
      ['En vivo', '/en-vivo'],
      ['Mi barrio', '/mi-cuadra'],
      ['Yo', '/perfil'],
    ] as const) {
      await expect(menu.getByRole('link', { name: nombre })).toHaveAttribute('href', ruta)
    }
  })

  test('el botón Aa agranda la letra y se recuerda', async ({ page }) => {
    await page.goto('/')
    const boton = page.getByRole('button', { name: 'Letra más grande' })
    await boton.click()
    await expect(page.locator('html')).toHaveAttribute('data-letra', 'grande')
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-letra', 'grande')
    await page.getByRole('button', { name: 'Letra normal' }).click()
    await expect(page.locator('html')).not.toHaveAttribute('data-letra', 'grande')
  })
})

test.describe('PWA', () => {
  test('publica el manifiesto con íconos', async ({ request }) => {
    const respuesta = await request.get('/manifest.webmanifest')
    expect(respuesta.ok()).toBeTruthy()
    const manifiesto = await respuesta.json()
    expect(manifiesto.name).toBe('Sabaneta Cuenta')
    expect(manifiesto.lang).toBe('es-CO')
    for (const icono of manifiesto.icons) {
      expect((await request.get(icono.src)).ok(), icono.src).toBeTruthy()
    }
  })

  test('sirve el service worker y la pantalla sin conexión', async ({ page, request }) => {
    const sw = await request.get('/serwist/sw.js')
    expect(sw.ok()).toBeTruthy()
    expect(sw.headers()['content-type']).toContain('javascript')
    await page.goto('/~offline')
    await expect(page.getByRole('heading', { name: 'No hay internet' })).toBeVisible()
    await revisarPantalla(page)
  })

  test('registra el service worker', async ({ page }) => {
    await page.goto('/')
    const registrado = await page.evaluate(async () => {
      const registro = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise((r) => setTimeout(() => r(null), 10_000)),
      ])
      return !!registro
    })
    expect(registrado).toBe(true)
  })
})

test('página no encontrada en español', async ({ page }) => {
  const respuesta = await page.goto('/no-existe')
  expect(respuesta?.status()).toBe(404)
  await expect(page.getByRole('heading', { name: 'No encontramos esta página' })).toBeVisible()
})
