// tests/e2e/auth.spec.js
// Pruebas del registro, la recuperación de contraseña y el inicio de sesión.
// Las validaciones del navegador se prueban sin backend; el backend vuelve a validar todo
// (ver MANTIA_BACKEND/tests/Feature/SeguridadCuentasTest.php).
import { test, expect } from '@playwright/test';

test.describe('Crear cuenta: validaciones', () => {
  test('la cédula no deja escribir letras y se corta en 10 números', async ({ page }) => {
    await page.goto('/register');
    await page.locator('#documentType').selectOption('CC');

    await page.locator('#documentNumber').fill('12ab34cd567890123');
    await expect(page.locator('#documentNumber')).toHaveValue('1234567890');
  });

  test('el pasaporte sí acepta letras (en mayúscula)', async ({ page }) => {
    await page.goto('/register');
    await page.locator('#documentType').selectOption('PA');

    await page.locator('#documentNumber').fill('ab12-34 56');
    await expect(page.locator('#documentNumber')).toHaveValue('AB123456');
  });

  test('al pasar de pasaporte a cédula se quitan las letras', async ({ page }) => {
    await page.goto('/register');
    await page.locator('#documentType').selectOption('PA');
    await page.locator('#documentNumber').fill('AB123456');

    await page.locator('#documentType').selectOption('CC');
    await expect(page.locator('#documentNumber')).toHaveValue('123456');
  });

  test('el nombre no deja escribir números ni símbolos', async ({ page }) => {
    await page.goto('/register');

    await page.locator('#nombre').fill('Juan123$');
    await expect(page.locator('#nombre')).toHaveValue('Juan');
  });

  test('muestra error si las contraseñas no coinciden', async ({ page }) => {
    await page.goto('/register');

    await page.locator('#nombre').fill('Juan');
    await page.locator('#apellido').fill('Pérez');
    await page.locator('#email').fill('juan.e2e@mantia.com');
    await page.locator('#password').fill('Segura123');
    await page.locator('#confirmPassword').fill('Otra12345');
    await page.locator('#documentType').selectOption('CC');
    await page.locator('#documentNumber').fill('1020304050');

    await page.getByRole('button', { name: /registrarse/i }).click();

    await expect(page.locator('#confirmPassword-error')).toHaveText('Las contraseñas no coinciden.');
  });

  test('exige contraseña segura', async ({ page }) => {
    await page.goto('/register');

    await page.locator('#password').fill('sololetras');
    await expect(page.getByText('Una letra mayúscula')).toBeVisible();
    await expect(page.getByText('Un número')).toBeVisible();
  });
});

test.describe('Recuperar contraseña: validaciones', () => {
  test('el correo inválido muestra error personalizado', async ({ page }) => {
    await page.goto('/ResetPassword');

    await page.locator('#email').fill('correo-malo');
    await page.getByRole('button', { name: /enviar código/i }).click();

    await expect(page.locator('#email-error')).toBeVisible();
  });
});

test.describe('Inicio de sesión', () => {
  test('la página de login no hace peticiones que respondan 401', async ({ page }) => {
    const errores = [];
    page.on('response', (r) => {
      if (r.url().includes('/api/') && r.status() === 401) errores.push(r.url());
    });

    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    expect(errores).toEqual([]);
  });
});
