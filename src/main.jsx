import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import App from './App.jsx'
import Ubicaciones from "./pages/Ubications/ubications";
import CategoriasUbicacion from "./pages/Ubications/categories_ubications";
import Maquinas from "./pages/Machines/machines";
import {CardMachine} from './pages/Machines/card_machine';
import AgregarInspeccion from './pages/Forms/inspection';
import LlenarInspeccion from './pages/Forms/completeinspection';
import MostrarInspeccion from './pages/Forms/showinspection';
import Empresas from "./pages/Companies/companies"
import CategoriasMaquinas from './pages/Machines/categories_machines';
import Equipos from './pages/Equipment/equipments';
import {CardEquipment} from './pages/Equipment/card_Equipment';
import { Consumibles,No_Consumibles } from './pages/Tools/types';
import ToolsConsumables from './pages/Tools/toolsconsumables'
import ToolsNoConsumables from './pages/Tools/toolsnoconsumables';
import { UsoDiario } from './pages/Forms/daily_use';
import Gases from './pages/Gases/gases';
import CompararGases from './pages/Gases/comparegases';
import { FormatoGases } from './pages/Gases/gasformat';
import Login from './pages/login/login.jsx'
import ResetPassword from './pages/login/ResetPassword'
import Register from './pages/login/Register'
import AcercaDe from "./pages/Others/acerca_de";
import Ayuda from "./pages/Others/ayuda";
import MantiaInicio from "./pages/Index/index";
import Profile from './pages/Profile/profile.jsx'
import Alerts from './pages/Alerts/alerts.jsx';
import { AuthProvider } from "./context/AuthContext.jsx";
import RutaPrivada from "./components/RutaPrivada.jsx";
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MantiaInicio />} />
          <Route path="/" element={<RutaPrivada><App/></RutaPrivada>}>
            <Route path='ubications' element={<Ubicaciones />} />
            <Route path='ubications/categoriesubications' element={<CategoriasUbicacion />} />
            <Route path='machines' element={<Maquinas />} />
            <Route path='machines/categoriesmachines' element={<CategoriasMaquinas/>}/> 
            <Route path='machines/cardMachine' element={<CardMachine/>}/> 
            <Route path='machines/cardMachine/inspection' element={<AgregarInspeccion/>}/>
            <Route path='machines/cardMachine/completeinspection' element={<LlenarInspeccion/>}/>
            <Route path='machines/cardMachine/showinspection' element={<MostrarInspeccion/>}/>
            <Route path='equipment' element={<Equipos/>}/>
            <Route path='equipment/cardequipment' element={<CardEquipment/>}/>
            <Route path='companies' element={<Empresas />}/>
            <Route path='types/consumables' element={<Consumibles/>}/>
            <Route path='types/noconsumables' element={<No_Consumibles/>}/>
            <Route path='types/consumables/tools' element={<ToolsConsumables/>}/>
            <Route path='types/noconsumables/tools' element={<ToolsNoConsumables/>}/>
            <Route path='dailyuse' element={<UsoDiario/>}/>
            <Route path='gases' element={<Gases/>}/>
            <Route path='gases/compare_gases' element={<CompararGases/>}/>
            <Route path='gases/gas_format' element={<FormatoGases/>}/>
            <Route path='profile' element={<Profile/>}/>
            <Route path='alerts' element={<Alerts/>}/>
          </Route>
          <Route path="login" element={<Login />} />
          <Route path="ResetPassword" element={<ResetPassword />} />
          <Route path="register" element={<Register />} />
          <Route path='about' element={<AcercaDe />} />
          <Route path='help' element={<Ayuda />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)