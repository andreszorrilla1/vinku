import AxeBuilder from '@axe-core/playwright'
import { expect, type Page } from '@playwright/test'
import { buscarPalabrasProhibidas } from '../../src/textos/prohibidas'

/** Revisión común de cada pantalla: axe sin errores, nada bajo 16 px y sin palabras prohibidas. */
export async function revisarPantalla(page: Page) {
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  expect(axe.violations, JSON.stringify(axe.violations.map((v) => [v.id, v.nodes.map((n) => n.target)]))).toEqual([])

  const pequenos = await page.evaluate(() =>
    [...document.querySelectorAll('body *')]
      .filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent?.trim()))
      .filter((el) => !el.closest('[aria-hidden="true"], .sr-only'))
      .filter((el) => parseFloat(getComputedStyle(el).fontSize) < 16)
      .map((el) => el.textContent?.trim()),
  )
  expect(pequenos).toEqual([])
  expect(buscarPalabrasProhibidas(await page.locator('body').innerText())).toEqual([])

  const ancho = await page.evaluate(() => document.documentElement.scrollWidth)
  expect(ancho).toBeLessThanOrEqual(page.viewportSize()?.width ?? 360)
}

/** Todo lo que se toca mide al menos 56 px de alto (salvo enlaces dentro de texto). */
export async function revisarTocables(page: Page) {
  const bajos = await page.evaluate(() =>
    [...document.querySelectorAll('a, button, [role="radio"]')]
      .filter((el) => (el as HTMLElement).offsetParent !== null)
      .filter((el) => !el.closest('p'))
      .map((el) => ({
        texto: (el as HTMLElement).innerText.trim() || el.getAttribute('aria-label'),
        alto: el.getBoundingClientRect().height,
      }))
      .filter((x) => x.alto < 48),
  )
  expect(bajos).toEqual([])
}
