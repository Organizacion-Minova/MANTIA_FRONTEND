import { StrictMode, Suspense, lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import MantiaInicio from "./pages/Index/index";
import Login from './pages/login/login.jsx'
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import EscuchaToasts from "./components/Alertas/EscuchaToasts.jsx";
import RutaPrivada from "./components/RutaPrivada.jsx";
import RutaConPermiso from "./components/RutaConPermiso.jsx";
import LoadingScreen from "./components/LoadingScreen.jsx";
import { ToastProvider } from './context/ToastContext.jsx';
import { ConfirmProvider } from './context/ConfirmContext.jsx';

// Pantallas que se descargan solo cuando se visitan
const nombrada = (cargar, nombre) => lazy(() => cargar().then((m) => ({ default: m[nombre] })));

const Dashboard = lazy(() => import("./pages/Dashboard/dashboard.jsx"));
const Ubicaciones = lazy(() => import("./pages/Ubications/ubications"));
const CategoriasUbicacion = lazy(() => import("./pages/Ubications/categories_ubications"));
const Maquinas = lazy(() => import("./pages/Machines/machines"));
const CategoriasMaquinas = lazy(() => import('./pages/Machines/categories_machines'));
const CardMachine = nombrada(() => import('./pages/Machines/card_machine'), 'CardMachine');
const Equipos = lazy(() => import('./pages/Equipment/equipments'));
const CardEquipment = nombrada(() => import('./pages/Equipment/card_Equipment'), 'CardEquipment');
const Consumibles = nombrada(() => import('./pages/Tools/types'), 'Consumibles');
const No_Consumibles = nombrada(() => import('./pages/Tools/types'), 'No_Consumibles');
const ToolsConsumables = lazy(() => import('./pages/Tools/toolsconsumables'));
const ToolsNoConsumables = lazy(() => import('./pages/Tools/toolsnoconsumables'));
const UsoDiario = nombrada(() => import('./pages/Forms/daily_use'), 'UsoDiario');
const Gases = lazy(() => import('./pages/Gases/gases'));
const CompararGases = lazy(() => import('./pages/Gases/comparegases'));
const FormatoGases = nombrada(() => import('./pages/Gases/gasformat'), 'FormatoGases');
const ResetPassword = lazy(() => import('./pages/login/ResetPassword'));
const Register = lazy(() => import('./pages/login/Register'));
const AcercaDe = lazy(() => import("./pages/Others/acerca_de"));
const Ayuda = lazy(() => import("./pages/Others/ayuda"));
const NotFound = lazy(() => import('./pages/Others/not_found.jsx'));
const TermnsAndConditions = lazy(() => import("./pages/Others/TermnsAndConditions.jsx"));
const AdministrationPanel = lazy(() => import("./pages/Role/administration panel.jsx"));
const InspeccionEquipo = lazy(() => import('./pages/Forms/equipments/inspectionequipment.jsx'));
const ConstructorFormato = lazy(() => import('./pages/Forms/equipments/questioninspectionequipment.jsx'));
const LlenarInspeccion = lazy(() => import('./pages/Forms/equipments/completeinspectionequipment.jsx'));
const RegistrosInspeccion = lazy(() => import('./pages/Forms/equipments/registersinspectionequipment.jsx'));
const VerInspeccion = lazy(() => import('./pages/Forms/equipments/showinspectionequipment.jsx'));
const LlenarRegistroMaquina = lazy(() => import('./pages/Forms/machines/completeformmachine.jsx'));
const ConstructorFormatoMaquina = lazy(() => import('./pages/Forms/machines/questionsformmachine.jsx'));
const RegistrosMaquina = lazy(() => import('./pages/Forms/machines/registersformsmachine.jsx'));
const VerRegistroMaquina = lazy(() => import('./pages/Forms/machines/showformmachine.jsx'));
const InspeccionesEquipos = lazy(() => import('./pages/Forms/InspectionsEquipments.jsx'))
const InspeccionesMaquinas = lazy(() => import('./pages/Forms/InspecionsMachines.jsx'))
const EquiposConsumibles = lazy(() => import('./pages/Equipment/equipments'));
const EquiposNoConsumibles = lazy(() => import('./pages/Equipment/equipmentnoconsumables'));

function LoadingGate({ children }) {
  const { cargando } = useAuth();
  if (cargando) return <LoadingScreen />;
  return children;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
  <ToastProvider>
    <EscuchaToasts />
    <ConfirmProvider>
    <AuthProvider>
      <LoadingGate>
        <BrowserRouter>
          <Suspense fallback={<LoadingScreen indeterminado />}>
          <Routes>
            <Route path="/" element={<MantiaInicio />} />
            <Route path="/login" element={<Login />} />
            <Route path="/ResetPassword" element={<ResetPassword />} />
            <Route path="/register" element={<Register />} />
            <Route path='/about' element={<AcercaDe />} />
            <Route path='/help' element={<Ayuda />} />
            <Route path="/terms" element={<TermnsAndConditions />} />

            <Route path="/*" element={<RutaPrivada><App /></RutaPrivada>}>
              <Route path='dashboard' element={<Dashboard />} />
              <Route path='ubications' element={<RutaConPermiso permiso="location.update"><Ubicaciones /></RutaConPermiso>} />
              <Route path='ubications/categoriesubications' element={<RutaConPermiso permiso="location-category.update"><CategoriasUbicacion /></RutaConPermiso>} />
              <Route path='machines' element={<RutaConPermiso permiso="machine.view"><Maquinas /></RutaConPermiso>} />
              <Route path='machines/categoriesmachines' element={<RutaConPermiso permiso="machine-category.update"><CategoriasMaquinas /></RutaConPermiso>} />
              <Route path='machines/cardMachine/:id' element={<RutaConPermiso permiso="machine.view"><CardMachine /></RutaConPermiso>} />
              <Route path="machines/cardMachine/:id/:kind/complete" element={<LlenarRegistroMaquina />} />
              <Route path="machines/cardMachine/:id/:kind/questions" element={<ConstructorFormatoMaquina />} />
              <Route path="machines/cardMachine/:id/:kind/edit" element={<ConstructorFormatoMaquina editar />} />
              <Route path="machines/cardMachine/:id/:kind/records" element={<RegistrosMaquina />} />
              <Route path="machines/cardMachine/:id/:kind/records/:recordId" element={<VerRegistroMaquina />} />
              <Route path='equipment/consumables' element={<RutaConPermiso permiso="equipment.view"><EquiposConsumibles /></RutaConPermiso>} />
              <Route path='equipment/noconsumables' element={<RutaConPermiso permiso="equipment.view"><EquiposNoConsumibles /></RutaConPermiso>} />
              <Route path='equipment/cardequipment/:id' element={<RutaConPermiso permiso="equipment.view"><CardEquipment /></RutaConPermiso>} />
              <Route path="equipment/cardequipment/:id/inspection" element={<InspeccionEquipo />} />
              <Route path="equipment/cardequipment/:id/inspection/questions" element={<ConstructorFormato />} />
              <Route path="equipment/cardequipment/:id/inspection/edit" element={<ConstructorFormato editar />} />
              <Route path="equipment/cardequipment/:id/inspection/complete" element={<LlenarInspeccion />} />
              <Route path="equipment/cardequipment/:id/inspection/records" element={<RegistrosInspeccion />} />
              <Route path="equipment/cardequipment/:id/inspection/records/:inspectionId" element={<VerInspeccion />} />
              <Route path="inspections/machines" element={<InspeccionesMaquinas kind="inspection" />} />
              <Route path="preoperational/machines" element={<InspeccionesMaquinas kind="preoperational" />} />
              <Route path="inspections/equipment" element={<InspeccionesEquipos />} />
              <Route path='consumables/tools/types' element={<RutaConPermiso permiso="category-tools.view"><Consumibles /></RutaConPermiso>} />
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
          </Routes>
          </Suspense>
        </BrowserRouter>
      </LoadingGate>
    </AuthProvider>
    </ConfirmProvider>
  </ToastProvider>
  </StrictMode>,
)