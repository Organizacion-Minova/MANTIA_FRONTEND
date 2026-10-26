# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: public-pages.spec.js >> Páginas públicas >> una ruta inexistente muestra la página 404
- Location: tests\e2e\public-pages.spec.js:22:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('404')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('404') with timeout 5000ms
  - waiting for getByText('404')

```

```yaml
- img: SENA Servicio Nacional de Aprendizaje
- img "Mantia"
- heading "Inicia Sesión" [level=3]
- text: "Correo electrónico:"
- textbox "Correo electrónico:":
  - /placeholder: usuario@sena.edu.co
- text: "Contraseña:"
- textbox "Contraseña:":
  - /placeholder: ••••••••
- button "Iniciar Sesión"
- text: ¿No recuerdas tu contraseña?
- link "Restablecer":
  - /url: /ResetPassword
- text: ¿No tienes una cuenta?
- link "Solicitar":
  - /url: /register
- strong:
  - link " Regresar al inicio":
    - /url: /
- button "Abrir accesibilidad": 
```

# Test source

```ts
  1  | // tests/e2e/public-pages.spec.js
  2  | // Verifica que las páginas públicas cargan sin iniciar sesión.
  3  | import { test, expect } from '@playwright/test';
  4  | 
  5  | test.describe('Páginas públicas', () => {
  6  |   test('la página de inicio carga', async ({ page }) => {
  7  |     await page.goto('/');
  8  |     // No debe mostrar la pantalla de "no encontrada"
  9  |     await expect(page.getByText('Pagina no encontrada')).toHaveCount(0);
  10 |   });
  11 | 
  12 |   test('la página "Acerca de" carga', async ({ page }) => {
  13 |     await page.goto('/about');
  14 |     await expect(page.getByText('¿Por qué existe MANTIA?')).toBeVisible();
  15 |   });
  16 | 
  17 |   test('la página de ayuda carga', async ({ page }) => {
  18 |     await page.goto('/help');
  19 |     await expect(page.getByRole('heading', { name: '¿En qué podemos ayudarte?' })).toBeVisible();
  20 |   });
  21 | 
  22 |   test('una ruta inexistente muestra la página 404', async ({ page }) => {
  23 |     await page.goto('/esta-ruta-no-existe');
> 24 |     await expect(page.getByText('404')).toBeVisible();
     |                                         ^ Error: expect(locator).toBeVisible() failed
  25 |     await expect(page.getByText('Pagina no encontrada')).toBeVisible();
  26 |   });
  27 | 
  28 |   test('una ruta privada sin sesión redirige a /login', async ({ page }) => {
  29 |     await page.goto('/dashboard');
  30 |     await expect(page).toHaveURL(/\/login/);
  31 |   });
  32 | });
  33 | 
```