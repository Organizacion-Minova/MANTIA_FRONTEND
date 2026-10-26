# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.js >> Registro de cuenta >> registro exitoso como Invitado muestra mensaje de pendiente de aprobación
- Location: tests\e2e\auth.spec.js:57:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/pendiente de aprobación/i)
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText(/pendiente de aprobación/i) with timeout 5000ms
  - waiting for getByText(/pendiente de aprobación/i)

```

```yaml
- img: SENA Servicio Nacional de Aprendizaje
- img "Mantia"
- heading "Crear Cuenta" [level=3]
- paragraph: Diligencia tus datos para solicitar una cuenta. Una vez creada, el administrador deberá aprobarla antes de que puedas iniciar sesión.
- paragraph: Los campos marcados con * son obligatorios.
- text: Nombre *
- textbox "Nombre *":
  - /placeholder: "Ej: Juan"
  - text: Ana
- text: Apellido *
- textbox "Apellido *":
  - /placeholder: "Ej: García"
  - text: Torres
- text: Correo electrónico *
- textbox "Correo electrónico *":
  - /placeholder: tucorreo@ejemplo.com
  - text: test.e2e.1792547614002@mantia.com
- text: Contraseña *
- textbox "Contraseña *":
  - /placeholder: Mínimo 8 caracteres
  - text: password123
- text: Confirmar contraseña *
- textbox "Confirmar contraseña *":
  - /placeholder: Repite tu contraseña
  - text: password123
- text: Tipo de documento *
- combobox "Tipo de documento *":
  - option "Selecciona..."
  - option "Cédula de ciudadanía" [selected]
  - option "Cédula de extranjería"
  - option "Tarjeta de identidad"
  - option "Pasaporte"
- text: Número de documento *
- textbox "Número de documento *":
  - /placeholder: "Ej: 1020304050"
  - text: "2547614002"
- text: Solicitar rol *
- combobox "Solicitar rol *":
  - option "Selecciona..."
  - option "Administrador"
  - option "Invitado" [selected]
  - option "Técnico"
- button "Registrando..." [disabled]
- text: ¿No recuerdas tu contraseña?
- link "Restablecer":
  - /url: /ResetPassword
- text: ¿Ya tienes cuenta?
- link "Iniciar sesión":
  - /url: /login
- button "Abrir accesibilidad": 
```

# Test source

```ts
  1   | // tests/e2e/auth.spec.js
  2   | // Pruebas del flujo de registro e inicio de sesión.
  3   | import { test, expect } from '@playwright/test';
  4   | 
  5   | // Genera datos únicos en cada corrida para no chocar con el unique
  6   | // de email y document_number en la base de datos.
  7   | function datosUnicos() {
  8   |   const sello = Date.now();
  9   |   return {
  10  |     email: `test.e2e.${sello}@mantia.com`,
  11  |     documento: String(sello).slice(-10), // 10 dígitos
  12  |   };
  13  | }
  14  | 
  15  | test.describe('Registro de cuenta', () => {
  16  |   test('muestra error si las contraseñas no coinciden', async ({ page }) => {
  17  |     const { email, documento } = datosUnicos();
  18  |     await page.goto('/register');
  19  | 
  20  |     await page.locator('#nombre').fill('Juan');
  21  |     await page.locator('#apellido').fill('Pérez');
  22  |     await page.locator('#email').fill(email);
  23  |     await page.locator('#password').fill('password123');
  24  |     await page.locator('#confirmPassword').fill('otra-password');
  25  |     await page.locator('#documentType').selectOption('CC');
  26  |     await page.locator('#documentNumber').fill(documento);
  27  |     await page.locator('#requestedRole').selectOption('Invitado');
  28  | 
  29  |     await page.getByRole('button', { name: /registrarse/i }).click();
  30  | 
  31  |     await expect(page.getByText('Las contraseñas no coinciden')).toBeVisible();
  32  |   });
  33  | 
  34  |   test('al elegir "Técnico" aparece el desplegable de tipo de técnico', async ({ page }) => {
  35  |     await page.goto('/register');
  36  | 
  37  |     await expect(page.locator('#technicianType')).toHaveCount(0);
  38  | 
  39  |     await page.locator('#requestedRole').selectOption('Tecnico');
  40  | 
  41  |     await expect(page.locator('#technicianType')).toBeVisible();
  42  |     await expect(page.locator('#technicianType')).toContainText('Electricista');
  43  |     await expect(page.locator('#technicianType')).toContainText('Minero');
  44  |     await expect(page.locator('#technicianType')).toContainText('Mecánico');
  45  |   });
  46  | 
  47  |   test('al cambiar de "Técnico" a otro rol, el desplegable de técnico desaparece', async ({ page }) => {
  48  |     await page.goto('/register');
  49  | 
  50  |     await page.locator('#requestedRole').selectOption('Tecnico');
  51  |     await expect(page.locator('#technicianType')).toBeVisible();
  52  | 
  53  |     await page.locator('#requestedRole').selectOption('Administrador');
  54  |     await expect(page.locator('#technicianType')).toHaveCount(0);
  55  |   });
  56  | 
  57  |   test('registro exitoso como Invitado muestra mensaje de pendiente de aprobación', async ({ page }) => {
  58  |     const { email, documento } = datosUnicos();
  59  |     await page.goto('/register');
  60  | 
  61  |     await page.locator('#nombre').fill('Ana');
  62  |     await page.locator('#apellido').fill('Torres');
  63  |     await page.locator('#email').fill(email);
  64  |     await page.locator('#password').fill('password123');
  65  |     await page.locator('#confirmPassword').fill('password123');
  66  |     await page.locator('#documentType').selectOption('CC');
  67  |     await page.locator('#documentNumber').fill(documento);
  68  |     await page.locator('#requestedRole').selectOption('Invitado');
  69  | 
  70  |     await page.getByRole('button', { name: /registrarse/i }).click();
  71  | 
> 72  |     await expect(page.getByText(/pendiente de aprobación/i)).toBeVisible();
      |                                                              ^ Error: expect(locator).toBeVisible() failed
  73  |   });
  74  | 
  75  |   test('registro exitoso como Técnico exige el tipo de técnico', async ({ page }) => {
  76  |     const { email, documento } = datosUnicos();
  77  |     await page.goto('/register');
  78  | 
  79  |     await page.locator('#nombre').fill('Carlos');
  80  |     await page.locator('#apellido').fill('Ruiz');
  81  |     await page.locator('#email').fill(email);
  82  |     await page.locator('#password').fill('password123');
  83  |     await page.locator('#confirmPassword').fill('password123');
  84  |     await page.locator('#documentType').selectOption('CC');
  85  |     await page.locator('#documentNumber').fill(documento);
  86  |     await page.locator('#requestedRole').selectOption('Tecnico');
  87  |     await page.locator('#technicianType').selectOption('Electricista');
  88  | 
  89  |     await page.getByRole('button', { name: /registrarse/i }).click();
  90  | 
  91  |     await expect(page.getByText(/pendiente de aprobación/i)).toBeVisible();
  92  |   });
  93  | });
  94  | 
  95  | test.describe('Inicio de sesión', () => {
  96  |   test('credenciales inválidas muestran un mensaje de error', async ({ page }) => {
  97  |     await page.goto('/login');
  98  | 
  99  |     await page.locator('#email').fill('usuario-que-no-existe@mantia.com');
  100 |     await page.locator('#password').fill('cualquier-cosa');
  101 |     await page.getByRole('button', { name: /iniciar sesión/i }).click();
  102 | 
  103 |     await expect(page.locator('.error-message')).toBeVisible();
  104 |   });
  105 | 
  106 |   // Este test solo funciona si el backend corre con APP_ENV=local
  107 |   // (habilita /dev-login/{letra}) y ya corriste el RoleAndAdminSeeder,
  108 |   // que crea al admin con dev_letter = 'A'.
  109 |   test('acceso rápido de desarrollo con letra "A" inicia sesión como admin', async ({ page }) => {
  110 |     await page.goto('/login');
  111 | 
  112 |     await page.locator('#email').fill('A');
  113 |     await page.getByRole('button', { name: /iniciar sesión/i }).click();
  114 | 
  115 |     // El login redirige a /machines tras autenticar
  116 |     await expect(page).toHaveURL(/\/machines/);
  117 |   });
  118 | });
  119 | 
```