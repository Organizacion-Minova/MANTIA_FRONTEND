import { StrictMode } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import App from './App.jsx'
import Ubicaciones from "./pages/Ubications/ubications";
import CategoriasUbicacion from "./pages/Ubications/categories_ubications";
import Maquinas from "./pages/Machines/machines";
import { CardMachine } from './pages/Machines/card_machine';
// import AgregarInspeccion from './pages/Forms/inspection';
// import LlenarInspeccion from './pages/Forms/completeinspection';
// import MostrarInspeccion from './pages/Forms/showinspection';
import CategoriasMaquinas from './pages/Machines/categories_machines';
import { createRoot } from 'react-dom/client'
import Equipos from './pages/Equipment/equipments';
import { CardEquipment } from './pages/Equipment/card_Equipment';
import { Consumibles, No_Consumibles } from './pages/Tools/types';
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
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import EscuchaToasts from "./components/Alertas/EscuchaToasts.jsx";
import RutaPrivada from "./components/RutaPrivada.jsx";
import RutaConPermiso from "./components/RutaConPermiso.jsx";
import LoadingScreen from "./components/LoadingScreen.jsx";
import Dashboard from "./pages/Dashboard/dashboard.jsx";
import { ToastProvider } from './context/ToastContext.jsx';
import NotFound from './pages/Others/not_found.jsx';
import TermnsAndConditions from "./pages/Others/TermnsAndConditions.jsx";
import AdministrationPanel from "./pages/Role/administration panel.jsx";
import InspeccionEquipo from './pages/Forms/equipments/inspectionequipment.jsx';
import ConstructorFormato from './pages/Forms/equipments/questioninspectionequipment.jsx';
import LlenarInspeccion from './pages/Forms/equipments/completeinspectionequipment.jsx';
import RegistrosInspeccion from './pages/Forms/equipments/registersinspection.jsx';
import VerInspeccion from './pages/Forms/equipments/showinspectionequipment.jsx';
// import PoliticaPrivacidad from "./pages/PoliticaPrivacidad";



function LoadingGate({ children }) {
  const { cargando } = useAuth();
  if (cargando) return <LoadingScreen />;
  return children;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
  <ToastProvider>
    <EscuchaToasts />
    <AuthProvider>
      <LoadingGate>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MantiaInicio />} />
            <Route path="/" element={<RutaPrivada><App /></RutaPrivada>}>
              <Route path='dashboard' element={<Dashboard />} />
              <Route path='ubications' element={<RutaConPermiso permiso="location.update"><Ubicaciones /></RutaConPermiso>} />
              <Route path='ubications/categoriesubications' element={<RutaConPermiso permiso="location-category.update"><CategoriasUbicacion /></RutaConPermiso>} />
              <Route path='machines' element={<RutaConPermiso permiso="machine.view"><Maquinas /></RutaConPermiso>} />
              <Route path='machines/categoriesmachines' element={<RutaConPermiso permiso="machine-category.update"><CategoriasMaquinas /></RutaConPermiso>} />
              <Route path='machines/cardMachine/:id' element={<RutaConPermiso permiso="machine.view"><CardMachine /></RutaConPermiso>} />
              {/* <Route path='inspection' element={<RutaConPermiso permiso="inspection.view"><AgregarInspeccion /></RutaConPermiso>} />
              <Route path='inspection/completeinspection' element={<RutaConPermiso permiso="inspection.view"><LlenarInspeccion /></RutaConPermiso>} />
              <Route path='inspection/completeinspection/showinspection' element={<RutaConPermiso permiso="inspection.view"><MostrarInspeccion /></RutaConPermiso>} /> */}
              <Route path='equipment' element={<RutaConPermiso permiso="equipment.view"><Equipos /></RutaConPermiso>} />
              <Route path='equipment/cardequipment/:id' element={<RutaConPermiso permiso="equipment.view"><CardEquipment /></RutaConPermiso>} />
              <Route path="equipment/cardequipment/:id/inspection" element={<InspeccionEquipo />} />
              <Route path="equipment/cardequipment/:id/inspection/questions" element={<ConstructorFormato />} />
              <Route path="equipment/cardequipment/:id/inspection/complete" element={<LlenarInspeccion />} />
              <Route path="equipment/cardequipment/:id/inspection/records" element={<RegistrosInspeccion />} />
              <Route path="equipment/cardequipment/:id/inspection/records/:inspectionId" element={<VerInspeccion />} />              <Route path='consumables/tools/types' element={<RutaConPermiso permiso="category-tools.view"><Consumibles /></RutaConPermiso>} />
              <Route path='noconsumables/tools/types' element={<RutaConPermiso permiso="category-tools.view"><No_Consumibles /></RutaConPermiso>} />
              <Route path='consumables/tools' element={<RutaConPermiso permiso="tool.view"><ToolsConsumables /></RutaConPermiso>} />
              <Route path='noconsumables/tools' element={<RutaConPermiso permiso="tool.view"><ToolsNoConsumables /></RutaConPermiso>} />
              <Route path='dailyuse' element={<RutaConPermiso permiso="daily-use.view"><UsoDiario /></RutaConPermiso>} />
              <Route path='gases' element={<RutaConPermiso permiso="gas-measurements.view"><Gases /></RutaConPermiso>} />
              <Route path='gases/compare_gases' element={<RutaConPermiso permiso="gas-measurements.view"><CompararGases /></RutaConPermiso>} />
              <Route path='gases/gas_format/:id' element={<RutaConPermiso permiso="gas-measurements.view"><FormatoGases /></RutaConPermiso>} />
         
              <Route path='admin' element={<RutaConPermiso roles={["Jefe de mina"]}><AdministrationPanel /></RutaConPermiso>} />
              <Route path="*" element={<NotFound />} /> 
            </Route>
            <Route path="login" element={<Login />} />
            <Route path="ResetPassword" element={<ResetPassword />} />
            <Route path="register" element={<Register />} />
            <Route path='about' element={<AcercaDe />} />
            <Route path='help' element={<Ayuda />} />
            <Route
              path="/terms"
              element={<TermnsAndConditions />}
            />
          </Routes>
        </BrowserRouter>
      </LoadingGate>
    </AuthProvider>
  </ToastProvider>
  </StrictMode>,
)