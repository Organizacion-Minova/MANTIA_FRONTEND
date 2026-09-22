![Vista previa de MANTIA](/src/assets/img/logo%20-%20Mantia_readme.png)

Sistema web de gestión de inventario y mantenimiento para elementos utilizados en entornos mineros: máquinas, equipos, herramientas, ubicaciones, usuarios, alertas, uso diario e inspecciones.

# Estado del proyecto

Actualmente esta desarrollado el borrador de como se espera que el Fronted quede este se a realizado con tecnologias como: 

## Tecnologias

- **React** + **Vite**
- **React Router DOM** — enrutamiento y navegación entre páginas
- **Chart.js** + **react-chartjs-2** + **chartjs-plugin-annotation** — gráficas y estadísticas
- **Heroicons** — íconos para los componentes de formularios

## Instalacion Frontend

Clona el repositorio e instala las dependencias:

```bash
git clone https://github.com/Organizacion-Minova/MANTIA_FRONTEND.git
cd MANTIA_FRONTEND
npm install 
```


### Dependencias principales instaladas manualmente

Si necesitas reinstalar alguna dependencia específica:

```bash
npm install react-router-dom
npm install @heroicons/react
npm install chartjs-plugin-annotation
npm install chart.js react-chartjs-2 chartjs-plugin-annotation
```
## Uso

Correr el servidor el servidor de desarrollo:

```bash
npm run dev
```

## Estructura del proyecto

```
src/
│
├── assets/                  # Imágenes, íconos y recursos estáticos
│
├── components/
│   ├── layout/               # AppLayout (Topbar + Sidebar + Footer + Main)
│   ├── common/                # Componentes reutilizables 
│   └── forms/                 # Componentes base de formularios (Text, Select, Textarea, Radio, etc.)
│
├── pages/                      # Diseño de todas las paginas realizadas
│
├── styles/                   # Hojas de estilo (global.css, módulos por componente)
│
├── App.jsx
└── main.jsx
```

