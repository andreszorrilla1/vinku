import { expect, test } from '@playwright/test'
import { revisarPantalla } from './ayudas'

test.describe('páginas públicas', () => {
  for (const [ruta, titulo, aviso] of [
    ['/privacidad', 'Cómo cuidamos tus datos', 'PENDIENTE DE REVISIÓN DEL ABOGADO'],
    ['/terminos', 'Reglas para participar', 'PENDIENTE DE REVISIÓN DEL ABOGADO'],
    ['/quienes-somos', 'Quiénes somos', 'PENDIENTE DE REVISIÓN DEL ABOGADO ELECTORAL'],
  ] as const) {
    test(`${ruta} se ve y avisa que falta revisión legal`, async ({ page }) => {
      await page.goto(ruta)
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(titulo)
      await expect(page.getByText(aviso, { exact: true })).toBeVisible()
      await revisarPantalla(page)
    })
  }

  test('quiénes somos dice con claridad quién lidera la iniciativa', async ({ page }) => {
    await page.goto('/quienes-somos')
    await expect(page.getByText(/iniciativa liderada por Juan Carlos Jaramillo Jara/)).toBeVisible()
  })

  test('/en-vivo es público y por ahora muestra «Muy pronto»', async ({ page }) => {
    await page.goto('/en-vivo')
    await expect(page).toHaveURL('/en-vivo')
    await expect(page.getByText('Muy pronto')).toBeVisible()
    await revisarPantalla(page)
  })

  for (const ruta of ['/contar', '/reparte', '/mi-cuadra', '/perfil', '/bienvenida']) {
    test(`${ruta} pide entrar y recuerda a dónde ibas`, async ({ page }) => {
      await page.goto(ruta)
      await expect(page).toHaveURL(`/ingresar?siguiente=${encodeURIComponent(ruta)}`)
    })
  }
})
