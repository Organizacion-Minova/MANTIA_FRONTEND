# Pruebas automatizadas end-to-end — MANTIA_FRONTEND

Pruebas con [Playwright](https://playwright.dev) que abren un navegador real y
recorren la página completa: inicio, "Acerca de", ayuda, registro, login,
y todos los módulos del panel (dashboard, máquinas, equipos, ubicaciones,
herramientas, gases, alertas, perfil), más el cierre de sesión.

## 1. Instalación (una sola vez)

Copia estos 4 archivos a la raíz de `MANTIA_FRONTEND`, respetando la carpeta:

```
MANTIA_FRONTEND/
├── playwright.config.js
├── tests/
│   └── e2e/
│       ├── public-pages.spec.js
│       ├── auth.spec.js
│       └── navigation.spec.js
└── README-tests.md
```

Luego instala Playwright:

```bash
npm install -D @playwright/test
npx playwright install chromium
```

Agrega este script a tu `package.json` (dentro de `"scripts"`):

```json
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui"
```

## 2. Antes de correr los tests

Los tests pegan contra tu backend real, así que necesitas:

1. **Backend corriendo en local** (`php artisan serve`), con `APP_ENV=local`
   en el `.env` (esto habilita `/dev-login/{letra}`, que usan los tests
   de navegación para loguearse sin escribir contraseña cada vez).
2. **Migraciones y semilla corridas**, para que exista el admin con
   `dev_letter = 'A'`:
   ```bash
   php artisan migrate
   php artisan db:seed --class=RoleAndAdminSeeder
   ```
3. El frontend **no hace falta que lo levantes tú**: `playwright.config.js`
   ya lo levanta solo con `npm run dev` antes de correr los tests.

## 3. Correr los tests

```bash
npm run test:e2e
```

Para verlos correr paso a paso en una ventana (muy útil para depurar):

```bash
npm run test:e2e:ui
```

Para ver el reporte HTML después de una corrida:

```bash
npx playwright show-report
```

## 4. Qué cubre cada archivo

| Archivo | Qué prueba |
|---|---|
| `public-pages.spec.js` | Inicio, Acerca de, Ayuda, 404, y que una ruta privada sin sesión redirige a `/login` |
| `auth.spec.js` | Validación de contraseñas, el desplegable dinámico de "tipo de técnico", registro exitoso (Invitado y Técnico), login con credenciales inválidas, login rápido de desarrollo |
| `navigation.spec.js` | Que cada módulo del panel cargue estando logueado, navegación real por el menú, y cierre de sesión |

## 5. Siguientes pasos (opcional)

- Agregar pruebas de **CRUD** por módulo (crear/editar/borrar
  una ubicación, una máquina), una vez el equipo confirme que los
  formularios de cada módulo ya están estables.
- Agregar `@playwright/test` al pipeline de CI (GitHub Actions) para que
  los tests corran automáticamente en cada Pull Request.
- Complementar esto con pruebas del **backend** (Pest o PHPUnit, en
  `MANTIA_BACKEND`) para probar la API sin depender del navegador —
  más rápidas, ideales para validar reglas de negocio puntuales.
