import { existsSync } from 'node:fs'
import { defineConfig, devices } from '@playwright/test'

// Las pruebas de ingreso leen las mismas variables que la app.
if (existsSync('.env.local')) process.loadEnvFile('.env.local')

const puerto = Number(process.env.PUERTO_E2E ?? 3100)

export default defineConfig({
  testDir: 'pruebas/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${puerto}`,
    locale: 'es-CO',
    trace: 'retain-on-failure',
    // En la nube de Claude Code el Chromium viene preinstalado; en CI lo instala Playwright.
    launchOptions: process.env.CHROMIUM_RUTA ? { executablePath: process.env.CHROMIUM_RUTA } : {},
  },
  projects: [
    {
      name: 'celular-claro',
      use: { ...devices['Pixel 5'], viewport: { width: 360, height: 740 }, colorScheme: 'light' },
    },
    {
      name: 'celular-oscuro',
      use: { ...devices['Pixel 5'], viewport: { width: 360, height: 740 }, colorScheme: 'dark' },
    },
  ],
  webServer: {
    command: `npm run start -- -p ${puerto}`,
    url: `http://localhost:${puerto}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
