# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: navigation.spec.js >> cerrar sesión devuelve a /login y bloquea de nuevo las rutas privadas
- Location: tests\e2e\navigation.spec.js:52:1

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/login/
Received string:  "http://localhost:5173/machines"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    13 × locator resolved to <html lang="en">…</html>
       - unexpected value "http://localhost:5173/machines"

```

```yaml
- banner:
  - img "MANTIA"
  - heading "MANTENIMIENTO E INVENTARIO DE ACTIVOS" [level=2]
  - navigation:
    - button "Foto de perfil Administrador Mantia  Desarrollador":
      - img "Foto de perfil"
      - heading "Administrador Mantia" [level=4]
      - text:  Desarrollador
    - button ""
    - heading " Alertas del sistema" [level=3]
    - button "Marcar todas como leídas" [disabled]
    - tablist:
      - tab "Todas (0)" [selected]
      - tab "Sin leer (0)"
      - tab "Graves (0)"
    - text: 
    - paragraph: No hay notificaciones por ahora.
    - link " Ver todas las alertas":
      - /url: /Alerts
      - button " Ver todas las alertas"
    - img "Perfil"
    - heading "Administrador Mantia" [level=3]
    - text: Área de Desarrollo
    - paragraph:  mantiaadso@gmail.com
    - link " Ver mi perfil":
      - /url: /Profile
      - button " Ver mi perfil"
    - link " Panel Superadmin":
      - /url: /
      - button " Panel Superadmin"
    - link " Cerrar Sesion":
      - /url: /login
      - button " Cerrar Sesion"
- complementary:
  - list:
    - listitem:
      - link " Dashboard":
        - /url: /dashboard
    - listitem:  Herramientas
    - listitem:
      - link " Equipos":
        - /url: /equipment
    - listitem:
      - link " Maquinas":
        - /url: /machines
    - listitem:
      - link " Ubicaciones":
        - /url: /ubications
    - listitem:
      - link " Acerca de":
        - /url: /about
    - listitem:
      - link " Ayuda":
        - /url: /help
    - listitem:  Cerrar sesión
- main:
  - heading "MAQUINAS" [level=1]
  - paragraph: Este es el formato de las máquinas.
  - text:  martes, 20 de octubre de 2026 
  - textbox "Buscar por codigo, nombre, responsable, modelo o ubicacion"
  - combobox:
    - option "Todas las categorías" [selected]
  - combobox:
    - option "Todas las ubicaciones" [selected]
  - combobox:
    - option "Todas las marcas" [selected]
  - table:
    - rowgroup:
      - row "Código Nombre Número de serie Categoria Marca Ubicación Estado Acciones":
        - columnheader "Código"
        - columnheader "Nombre"
        - columnheader "Número de serie"
        - columnheader "Categoria"
        - columnheader "Marca"
        - columnheader "Ubicación"
        - columnheader "Estado"
        - columnheader "Acciones"
    - rowgroup
  - link " Categorias Maquinas":
    - /url: /machines/categoriesmachines
    - button " Categorias Maquinas"
  - button "+ Nueva Máquina"
- button "Abrir asistente": "1"
- dialog "Chat MANTIA IA":
  - text: 
  - heading "Asistente MANTIA" [level=4]
  - paragraph: en línea
  - button ""
  - button ""
  - text:  ¡Hola! Soy el asistente de MANTIA. Puedo resumir inspecciones, revisar mediciones de gases y decirte qué máquinas necesitan mantenimiento. 8:56 p. m.
  - button "Máquinas en mantenimiento"
  - button "Resumir última inspección"
  - textbox "Pregúntale algo a MANTIA IA…"
  - button ""
- button "Abrir accesibilidad": 
- contentinfo:
  - img "SENA"
  - img "MANTIA"
  - text: Mantenimiento e inventario de activos Copyright © 2026. Todos los derechos reservados.
  - strong: CONTACTANOS
  - text: mantiaadso@gmail.com
- img
- strong: Ocurrió un error
- text: Error del servidor. Intenta de nuevo.
- button "Cerrar": ✕
```

# Test source

```ts
  1  | // tests/e2e/navigation.spec.js
  2  | // Recorre el panel completo ya autenticado, módulo por módulo.
  3  | // Requiere backend en APP_ENV=local, con el admin sembrado (dev_letter 'A').
  4  | import { test, expect } from '@playwright/test';
  5  | 
  6  | // Inicia sesión como admin antes de cada test de este archivo.
  7  | test.beforeEach(async ({ page }) => {
  8  |   await page.goto('/login');
  9  |   await page.locator('#email').fill('A');
  10 |   await page.getByRole('button', { name: /iniciar sesión/i }).click();
  11 |   await expect(page).toHaveURL(/\/machines/);
  12 | });
  13 | 
  14 | // Rutas protegidas que debe poder abrir cualquier usuario autenticado.
  15 | const rutasDelPanel = [
  16 |   { path: '/dashboard', nombre: 'Dashboard' },
  17 |   { path: '/ubications', nombre: 'Ubicaciones' },
  18 |   { path: '/machines', nombre: 'Máquinas' },
  19 |   { path: '/equipment', nombre: 'Equipos' },
  20 |  
  21 |   { path: '/types/consumables', nombre: 'Consumibles' },
  22 |   { path: '/types/noconsumables', nombre: 'No consumibles' },
  23 |   { path: '/gases', nombre: 'Gases' },
  24 |   { path: '/alerts', nombre: 'Alertas' },
  25 |   { path: '/profile', nombre: 'Perfil' },
  26 | ];
  27 | 
  28 | for (const ruta of rutasDelPanel) {
  29 |   test(`el módulo "${ruta.nombre}" carga sin errores (${ruta.path})`, async ({ page }) => {
  30 |     await page.goto(ruta.path);
  31 | 
  32 |     // No debe caer en la 404 ni quedar en blanco por un error de React.
  33 |     await expect(page.getByText('Pagina no encontrada')).toHaveCount(0);
  34 |     await expect(page).toHaveURL(new RegExp(ruta.path.replace(/\//g, '\\/')));
  35 |   });
  36 | }
  37 | 
  38 | test('el menú lateral navega a cada módulo (clic real, no goto)', async ({ page }) => {
  39 |   await page.getByRole('link', { name: 'Equipos' }).click();
  40 |   await expect(page).toHaveURL(/\/equipment/);
  41 | 
  42 |   await page.getByRole('link', { name: 'Maquinas' }).click();
  43 |   await expect(page).toHaveURL(/\/machines/);
  44 | 
  45 |   await page.getByRole('link', { name: 'Ubicaciones' }).click();
  46 |   await expect(page).toHaveURL(/\/ubications/);
  47 | 
  48 | 
  49 |  
  50 | });
  51 | 
  52 | test('cerrar sesión devuelve a /login y bloquea de nuevo las rutas privadas', async ({ page }) => {
  53 |   await page.getByText('Cerrar sesión').first().click();
> 54 |   await expect(page).toHaveURL(/\/login/);
     |                      ^ Error: expect(page).toHaveURL(expected) failed
  55 | 
  56 |   // Intentar volver a una ruta privada debe mandar otra vez a /login
  57 |   await page.goto('/dashboard');
  58 |   await expect(page).toHaveURL(/\/login/);
  59 | });
  60 | 
```