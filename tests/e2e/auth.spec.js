// tests/e2e/auth.spec.js
// Pruebas del flujo de registro e inicio de sesión.
import { test, expect } from '@playwright/test';

// Genera datos únicos en cada corrida para no chocar con el unique
// de email y document_number en la base de datos.
function datosUnicos() {
  const sello = Date.now();
  return {
    email: `test.e2e.${sello}@mantia.com`,
    documento: String(sello).slice(-10), // 10 dígitos
  };
}

test.describe('Registro de cuenta', () => {
  test('muestra error si las contraseñas no coinciden', async ({ page }) => {
    const { email, documento } = datosUnicos();
    await page.goto('/register');

    await page.locator('#nombre').fill('Juan');
    await page.locator('#apellido').fill('Pérez');
    await page.locator('#email').fill(email);
    await page.locator('#password').fill('password123');
    await page.locator('#confirmPassword').fill('otra-password');
    await page.locator('#documentType').selectOption('CC');
    await page.locator('#documentNumber').fill(documento);
    await page.locator('#requestedRole').selectOption('Invitado');

    await page.getByRole('button', { name: /registrarse/i }).click();

    await expect(page.getByText('Las contraseñas no coinciden')).toBeVisible();
  });

  test('al elegir "Técnico" aparece el desplegable de tipo de técnico', async ({ page }) => {
    await page.goto('/register');

    await expect(page.locator('#technicianType')).toHaveCount(0);

    await page.locator('#requestedRole').selectOption('Tecnico');

    await expect(page.locator('#technicianType')).toBeVisible();
    await expect(page.locator('#technicianType')).toContainText('Electricista');
    await expect(page.locator('#technicianType')).toContainText('Minero');
    await expect(page.locator('#technicianType')).toContainText('Mecánico');
  });

  test('al cambiar de "Técnico" a otro rol, el desplegable de técnico desaparece', async ({ page }) => {
    await page.goto('/register');

    await page.locator('#requestedRole').selectOption('Tecnico');
    await expect(page.locator('#technicianType')).toBeVisible();

    await page.locator('#requestedRole').selectOption('Administrador');
    await expect(page.locator('#technicianType')).toHaveCount(0);
  });

  test('registro exitoso como Invitado muestra mensaje de pendiente de aprobación', async ({ page }) => {
    const { email, documento } = datosUnicos();
    await page.goto('/register');

    await page.locator('#nombre').fill('Ana');
    await page.locator('#apellido').fill('Torres');
    await page.locator('#email').fill(email);
    await page.locator('#password').fill('password123');
    await page.locator('#confirmPassword').fill('password123');
    await page.locator('#documentType').selectOption('CC');
    await page.locator('#documentNumber').fill(documento);
    await page.locator('#requestedRole').selectOption('Invitado');

    await page.getByRole('button', { name: /registrarse/i }).click();

    await expect(page.getByText(/pendiente de aprobación/i)).toBeVisible();
  });

  test('registro exitoso como Técnico exige el tipo de técnico', async ({ page }) => {
    const { email, documento } = datosUnicos();
    await page.goto('/register');

    await page.locator('#nombre').fill('Carlos');
    await page.locator('#apellido').fill('Ruiz');
    await page.locator('#email').fill(email);
    await page.locator('#password').fill('password123');
    await page.locator('#confirmPassword').fill('password123');
    await page.locator('#documentType').selectOption('CC');
    await page.locator('#documentNumber').fill(documento);
    await page.locator('#requestedRole').selectOption('Tecnico');
    await page.locator('#technicianType').selectOption('Electricista');

    await page.getByRole('button', { name: /registrarse/i }).click();

    await expect(page.getByText(/pendiente de aprobación/i)).toBeVisible();
  });
});

test.describe('Inicio de sesión', () => {
  test('credenciales inválidas muestran un mensaje de error', async ({ page }) => {
    await page.goto('/login');

    await page.locator('#email').fill('usuario-que-no-existe@mantia.com');
    await page.locator('#password').fill('cualquier-cosa');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    await expect(page.locator('.error-message')).toBeVisible();
  });

  // Este test solo funciona si el backend corre con APP_ENV=local
  // (habilita /dev-login/{letra}) y ya corriste el RoleAndAdminSeeder,
  // que crea al admin con dev_letter = 'A'.
  test('acceso rápido de desarrollo con letra "A" inicia sesión como admin', async ({ page }) => {
    await page.goto('/login');

    await page.locator('#email').fill('A');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    // El login redirige a /machines tras autenticar
    await expect(page).toHaveURL(/\/machines/);
  });
});
