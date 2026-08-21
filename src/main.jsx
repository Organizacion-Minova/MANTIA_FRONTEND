import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Index from "./pages/Index/index.jsx";
// import Ubicaciones from "./pages/Ubications/ubicaciones";
// import CategoriasUbicacion from "./pages/Ubications/categoriasubicacion.jsx";
import AcercaDe from "./pages/Others/acerca_de.jsx";
import Ayuda from "./pages/Others/ayuda.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/" element={<App/>}>
          {/* <Route path='ubicaciones' element={<Ubicaciones />} />
          <Route path='ubicaciones/categorias_ubicacion' element={<CategoriasUbicacion />} /> */}
          <Route path='acercade' element={<AcercaDe />} />
          <Route path='ayuda' element={<Ayuda />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
