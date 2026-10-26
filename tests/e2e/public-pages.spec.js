// tests/e2e/public-pages.spec.js
// Verifica que las páginas públicas cargan sin iniciar sesión.
import { test, expect } from '@playwright/test';

test.describe('Páginas públicas', () => {
  test('la página de inicio carga', async ({ page }) => {
    await page.goto('/');
    // No debe mostrar la pantalla de "no encontrada"
    await expect(page.getByText('Pagina no encontrada')).toHaveCount(0);
  });

  test('la página "Acerca de" carga', async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByText('¿Por qué existe MANTIA?')).toBeVisible();
  });

  test('la página de ayuda carga', async ({ page }) => {
    await page.goto('/help');
    await expect(page.getByRole('heading', { name: '¿En qué podemos ayudarte?' })).toBeVisible();
  });

  test('una ruta inexistente muestra la página 404', async ({ page }) => {
    await page.goto('/esta-ruta-no-existe');
    await expect(page.getByText('404')).toBeVisible();
    await expect(page.getByText('Pagina no encontrada')).toBeVisible();
  });

  test('una ruta privada sin sesión redirige a /login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
});
