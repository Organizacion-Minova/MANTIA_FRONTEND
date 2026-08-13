import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import App from './App.jsx'
import Ubicaciones from "./pages/Ubicaciones/ubicaciones";
import CategoriasUbicacion from "./pages/Ubicaciones/categoriasubicacion.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App/>}>
          <Route path='ubicaciones' element={<Ubicaciones />} />
          <Route path='ubicaciones/categorias_ubicacion' element={<CategoriasUbicacion />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)