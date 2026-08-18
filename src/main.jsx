import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import App from './App.jsx'
import Ubicaciones from "./pages/Ubications/ubications";
import CategoriasUbicacion from "./pages/Ubications/categoriesubications";
import Maquinas from "./pages/Machines/machines";
import Empresas from "./pages/Companies/companies"
import CategoriasMaquinas from './pages/Machines/categoriesmachines';
import Equipos from './pages/Equipment/equipments';
import { Consumibles,No_Consumibles } from './pages/Tools/types_consumables';
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App/>}>
          <Route path='ubications' element={<Ubicaciones />} />
          <Route path='ubications/categories_ubications' element={<CategoriasUbicacion />} />
          <Route path='machines' element={<Maquinas />} />
          <Route path='machines/categories_machines' element={<CategoriasMaquinas/>}/> 
          <Route path='equipment' element={<Equipos/>}/>
          <Route path='companies' element={<Empresas />}/>
          <Route path='tools/consumables' element={<Consumibles/>}/>
          <Route path='tools/noconsumables' element={<No_Consumibles/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)