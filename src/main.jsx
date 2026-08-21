import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import App from './App.jsx'
import Ubicaciones from "./pages/Ubications/ubications";
import CategoriasUbicacion from "./pages/Ubications/categories_ubications.jsx";
import Maquinas from "./pages/Machines/machines";
import {CardMachine} from './pages/Machines/card_machine';
import Empresas from "./pages/Companies/companies"
import CategoriasMaquinas from './pages/Machines/categories_machines.jsx';
import Equipos from './pages/Equipment/equipments';
import {CardEquipment} from './pages/Equipment/card_Equipment';
import { Consumibles,No_Consumibles } from './pages/Tools/types';
import { UsoDiario } from './pages/Forms/daily_use';
import Gases from './pages/Gases/gases';
import CompararGases from './pages/Gases/comparegases';
import { FormatoGases } from './pages/Gases/gasformat.jsx';
import Login from './pages/login/login.jsx'
import ResetPassword from './pages/login/ResetPassword.jsx'
import Register from './pages/login/Register.jsx'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App/>}>
          <Route path='ubications' element={<Ubicaciones />} />
          <Route path='ubications/categoriesubications' element={<CategoriasUbicacion />} />
          <Route path='machines' element={<Maquinas />} />
          <Route path='machines/categoriesmachines' element={<CategoriasMaquinas/>}/> 
          <Route path='machines/cardMachine' element={<CardMachine/>}/> 
          <Route path='equipment' element={<Equipos/>}/>
          <Route path='equipments/cardEquipment' element={<CardEquipment/>}/>
          <Route path='companies' element={<Empresas />}/>
          <Route path='tools/consumables' element={<Consumibles/>}/>
          <Route path='tools/noconsumables' element={<No_Consumibles/>}/>
          <Route path='dailyuse' element={<UsoDiario/>}/>
          <Route path='gases' element={<Gases/>}/>
          <Route path='gases/compare_gases' element={<CompararGases/>}/>
          <Route path='gases/gas_format' element={<FormatoGases/>}/>
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/ResetPassword" element={<ResetPassword />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)