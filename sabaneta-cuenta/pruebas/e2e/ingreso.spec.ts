import { createClient } from '@supabase/supabase-js'
import { expect, test, type Page } from '@playwright/test'
import { revisarPantalla, revisarTocables } from './ayudas'

// Necesita Supabase (CLI o pruebas/pila/pila.sh) y la llave de servicio para limpiar usuarios de prueba.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const servicio = process.env.SUPABASE_SERVICE_ROLE_KEY
test.skip(!url || !servicio, 'Sin Supabase local: se omite el flujo de ingreso')

// Los números de prueba se reparten por proyecto (claro/oscuro) para que corran en paralelo sin chocar.
const NUMEROS: Record<string, { nuevo: string; invitador: string; invitado: string }> = {
  'celular-claro': { nuevo: '3001112233', invitador: '3004445566', invitado: '3007778899' },
  'celular-oscuro': { nuevo: '3001112244', invitador: '3004445577', invitado: '3007778800' },
}

async function borrarUsuario(celular: string) {
  const admin = createClient(url!, servicio!, { auth: { persistSession: false } })
  const { data } = await admin.auth.admin.listUsers({ perPage: 1000 })
  const usuario = data.users.find((u) => u.phone === `57${celular}`)
  if (usuario) await admin.auth.admin.deleteUser(usuario.id)
}

async function entrar(page: Page, celular: string) {
  await page.getByLabel('Tu número de celular').fill(celular)
  await page.getByRole('button', { name: 'Enviarme el código' }).click()
  await expect(page.getByRole('heading', { name: 'Escribe el código' })).toBeVisible()
  await page.getByLabel('Código de 6 números').fill('123456')
}

async function registrarse(page: Page, nombre: string, barrio: string) {
  await page.getByText('Acepto que usen mis datos').click()
  await page.getByRole('button', { name: 'Acepto y sigo' }).click()
  await page.getByLabel('¿Cómo quieres que te llamemos?').fill(nombre)
  await page.getByText(barrio).click()
  await page.getByRole('button', { name: 'Listo, seguir' }).click()
  await expect(page).toHaveURL(/\/bienvenida\/lista/)
}

test.describe('ingreso, consentimiento y perfil', () => {
  test('un vecino nuevo entra, acepta, elige barrio y ve su bienvenida', async ({ page }, info) => {
    const { nuevo } = NUMEROS[info.project.name]!
    await borrarUsuario(nuevo)

    // Sin sesión, «Contar» lleva a entrar y recuerda a dónde iba
    await page.goto('/contar')
    await expect(page).toHaveURL(/\/ingresar\?siguiente=%2Fcontar/)
    await revisarPantalla(page)

    // Número que no es celular
    await page.getByLabel('Tu número de celular').fill('604 444 5555')
    await page.getByRole('button', { name: 'Enviarme el código' }).click()
    await expect(page.getByRole('main').getByRole('alert')).toContainText('no parece de celular')

    // Código equivocado y luego el bueno
    await page.getByLabel('Tu número de celular').fill(nuevo)
    await page.getByRole('button', { name: 'Enviarme el código' }).click()
    await expect(page.getByText('Te lo enviamos por WhatsApp al')).toBeVisible()
    await revisarPantalla(page)
    await page.getByLabel('Código de 6 números').fill('000000')
    await expect(page.getByRole('main').getByRole('alert')).toContainText('no sirve')
    await page.getByLabel('Código de 6 números').fill('123456')

    // Consentimiento: casillas sin marcar y la primera es obligatoria
    await expect(page).toHaveURL(/\/bienvenida$/)
    await expect(page.getByRole('heading', { name: 'Antes de empezar' })).toBeVisible()
    for (const casilla of await page.getByRole('checkbox').all()) await expect(casilla).not.toBeChecked()
    await revisarPantalla(page)
    await revisarTocables(page)
    await page.getByRole('button', { name: 'Acepto y sigo' }).click()
    await expect(page.getByRole('main').getByRole('alert')).toContainText('marca la primera casilla')
    await page.getByText('Acepto que usen mis datos').click()
    await page.getByText('Quiero que mi nombre aparezca').click()
    await page.getByRole('button', { name: 'Acepto y sigo' }).click()

    // Perfil mínimo
    await expect(page.getByRole('heading', { name: 'Cuéntanos de ti' })).toBeVisible()
    await revisarPantalla(page)
    await page.getByRole('button', { name: 'Listo, seguir' }).click()
    await expect(page.getByRole('main').getByRole('alert')).toContainText('Escribe un nombre')
    await page.getByLabel('¿Cómo quieres que te llamemos?').fill('Doña Prueba')
    await page.getByRole('button', { name: 'Listo, seguir' }).click()
    await expect(page.getByRole('main').getByRole('alert')).toContainText('Elige tu barrio')
    await page.getByText('Barrio Demo Centro [DEMO]').click()
    await page.getByText('60 o más').click()
    await page.getByRole('button', { name: 'Listo, seguir' }).click()

    // Bienvenida
    await expect(page).toHaveURL(/\/bienvenida\/lista/)
    await expect(page.getByRole('heading', { name: '¡Hola, Doña Prueba!' })).toBeVisible()
    await expect(page.getByText('Vecino', { exact: true })).toBeVisible()
    await revisarPantalla(page)

    // Perfil: datos, letra grande guardada y salir
    await page.goto('/perfil')
    await expect(page.getByText('Doña Prueba')).toBeVisible()
    await expect(page.getByText('Barrio Demo Centro [DEMO]')).toBeVisible()
    await expect(page.getByText(/^[A-HJ-NP-Z2-9]{6}$/)).toBeVisible()
    await revisarPantalla(page)
    await page.getByRole('radio', { name: 'Grande' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-letra', 'grande')

    // Con sesión, /ingresar lleva al perfil
    await page.goto('/ingresar')
    await expect(page).toHaveURL(/\/perfil/)

    await page.getByRole('button', { name: 'Salir' }).click()
    await expect(page).toHaveURL('/')
    await page.goto('/perfil')
    await expect(page).toHaveURL(/\/ingresar/)
  })

  test('quien llega por un enlace de invitación queda sumado a quien lo invitó', async ({ page, browser }, info) => {
    const { invitador, invitado } = NUMEROS[info.project.name]!
    await borrarUsuario(invitador)
    await borrarUsuario(invitado)

    // El invitador se registra y toma su código
    await page.goto('/ingresar')
    await entrar(page, invitador)
    await registrarse(page, 'Invitadora', 'Barrio Demo Norte [DEMO]')
    await page.goto('/perfil')
    const codigo = (await page.getByText(/^[A-HJ-NP-Z2-9]{6}$/).innerText()).trim()

    // El invitado abre el enlace en otro celular
    const otro = await browser.newContext({ viewport: { width: 360, height: 740 } })
    const pagina = await otro.newPage()
    await pagina.goto(`/s/${codigo.toLowerCase()}`)
    await expect(pagina).toHaveURL(/\/ingresar$/)
    await expect(pagina.getByText('Un vecino te invitó')).toBeVisible()
    await entrar(pagina, invitado)
    await registrarse(pagina, 'Invitado', 'Vereda Demo Sur [DEMO]')
    await otro.close()

    const admin = createClient(url!, servicio!, { auth: { persistSession: false } })
    const { data } = await admin
      .from('perfiles')
      .select('nombre_mostrar, referido_por(nombre_mostrar)')
      .eq('nombre_mostrar', 'Invitado')
      .order('creado_en', { ascending: false })
      .limit(1)
      .single()
    expect(data?.referido_por).toEqual({ nombre_mostrar: 'Invitadora' })
  })
})
