// playwright.config.js
// Configuración de las pruebas end-to-end (E2E) para MANTIA_FRONTEND.
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: false, // los tests comparten sesión/base de datos, mejor en serie
  retries: 1,
  reporter: [['html', { open: 'never' }], ['list']],

  use: {
    baseURL: 'http://localhost:5173', // puerto por defecto de Vite
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Levanta automáticamente el frontend antes de correr los tests.
  // IMPORTANTE: el backend (php artisan serve) debes tenerlo corriendo tú, por aparte,
  // porque las pruebas de login/registro necesitan la API real respondiendo.
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
