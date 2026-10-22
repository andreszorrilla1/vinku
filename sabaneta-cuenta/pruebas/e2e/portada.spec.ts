import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { buscarPalabrasProhibidas } from '../../src/textos/prohibidas'

test.describe('portada', () => {
  test('muestra la marca y los dos botones principales', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle('Sabaneta Cuenta')
    await expect(page.getByRole('img', { name: 'Sabaneta Cuenta' }).first()).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Cuéntale a Sabaneta. Aquí tu barrio cuenta.')
    await expect(page.getByRole('link', { name: 'Contar algo de mi cuadra' })).toHaveAttribute('href', '/contar')
    await expect(page.getByRole('link', { name: 'Ver Cuentas en vivo' })).toHaveAttribute('href', '/en-vivo')
    await expect(page.getByRole('heading', { name: '¿Qué es esto?' })).toBeVisible()
  })

  test('los botones y enlaces miden al menos 56 px de alto', async ({ page }) => {
    await page.goto('/')
    for (const enlace of await page.getByRole('link').all()) {
      const caja = await enlace.boundingBox()
      expect(caja?.height, await enlace.innerText()).toBeGreaterThanOrEqual(56)
    }
  })

  test('cabe en 360 px sin desplazamiento horizontal', async ({ page }) => {
    await page.goto('/')
    const ancho = await page.evaluate(() => document.documentElement.scrollWidth)
    expect(ancho).toBeLessThanOrEqual(360)
  })

  test('ningún texto mide menos de 16 px', async ({ page }) => {
    await page.goto('/')
    const pequenos = await page.evaluate(() =>
      [...document.querySelectorAll('body *')]
        .filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent?.trim()))
        .filter((el) => parseFloat(getComputedStyle(el).fontSize) < 16)
        .map((el) => el.textContent?.trim()),
    )
    expect(pequenos).toEqual([])
  })

  test('no pide el voto ni promete premios', async ({ page }) => {
    await page.goto('/')
    expect(buscarPalabrasProhibidas(await page.locator('body').innerText())).toEqual([])
  })

  test('pasa axe sin errores', async ({ page }) => {
    await page.goto('/')
    const resultado = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
    expect(resultado.violations).toEqual([])
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
    const resultado = await new AxeBuilder({ page }).analyze()
    expect(resultado.violations).toEqual([])
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
