// tests/e2e/navigation.spec.js
// Recorre el panel completo ya autenticado, módulo por módulo.
// Requiere backend en APP_ENV=local, con el admin sembrado (dev_letter 'A').
import { test, expect } from '@playwright/test';

// Inicia sesión como admin antes de cada test de este archivo.
test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.locator('#email').fill('A');
  await page.getByRole('button', { name: /iniciar sesión/i }).click();
  await expect(page).toHaveURL(/\/machines/);
});

// Rutas protegidas que debe poder abrir cualquier usuario autenticado.
const rutasDelPanel = [
  { path: '/dashboard', nombre: 'Dashboard' },
  { path: '/ubications', nombre: 'Ubicaciones' },
  { path: '/machines', nombre: 'Máquinas' },
  { path: '/equipment', nombre: 'Equipos' },
  { path: '/companies', nombre: 'Empresas' },
  { path: '/types/consumables', nombre: 'Consumibles' },
  { path: '/types/noconsumables', nombre: 'No consumibles' },
  { path: '/gases', nombre: 'Gases' },
  { path: '/alerts', nombre: 'Alertas' },
  { path: '/profile', nombre: 'Perfil' },
];

for (const ruta of rutasDelPanel) {
  test(`el módulo "${ruta.nombre}" carga sin errores (${ruta.path})`, async ({ page }) => {
    await page.goto(ruta.path);

    // No debe caer en la 404 ni quedar en blanco por un error de React.
    await expect(page.getByText('Pagina no encontrada')).toHaveCount(0);
    await expect(page).toHaveURL(new RegExp(ruta.path.replace(/\//g, '\\/')));
  });
}

test('el menú lateral navega a cada módulo (clic real, no goto)', async ({ page }) => {
  await page.getByRole('link', { name: 'Equipos' }).click();
  await expect(page).toHaveURL(/\/equipment/);

  await page.getByRole('link', { name: 'Maquinas' }).click();
  await expect(page).toHaveURL(/\/machines/);

  await page.getByRole('link', { name: 'Ubicaciones' }).click();
  await expect(page).toHaveURL(/\/ubications/);

  await page.getByRole('link', { name: 'Empresas' }).click();
  await expect(page).toHaveURL(/\/companies/);
});

test('cerrar sesión devuelve a /login y bloquea de nuevo las rutas privadas', async ({ page }) => {
  await page.getByText('Cerrar sesión').first().click();
  await expect(page).toHaveURL(/\/login/);

  // Intentar volver a una ruta privada debe mandar otra vez a /login
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login/);
});
