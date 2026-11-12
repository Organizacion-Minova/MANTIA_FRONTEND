import { PageWelcome } from "../../components/common/welcome";
import useDashboard from "../../hooks/useDashboard";
import DashboardSummarySection from "../../components/dashboard/DashboardSummarySection";
import DashboardInsightsSection from "../../components/dashboard/DashboardInsightsSection";
import DashboardLookupSection from "../../components/dashboard/DashboardLookupSection";
import LoadingScreen from "../../components/LoadingScreen";

export default function Dashboard() {
  const { data, meta, loading, error, reload } = useDashboard();

  if (loading) {
    return (
      <LoadingScreen indeterminado />
    );
  }

  if (error) {
    const sessionExpired = error.response?.status === 401;

    return (
      <div className="dashboard-state" role="alert">
        <p>
          {sessionExpired
            ? "Tu sesión expiró. Inicia sesión de nuevo."
            : "No se pudo cargar el dashboard."}
        </p>
        {!sessionExpired && (
          <button type="button" className="dashboard-state__retry" onClick={reload}>
            Reintentar
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="dashboard-grid">
      <PageWelcome 
        titulo="Panel poderoso de control OMG"
        descripcion="Monitorea todas tus actividades 100% real no fake"
        mostrarHistorial={true}
      />
   
      <DashboardSummarySection data={data} sections={meta.sections} />
      <DashboardInsightsSection data={data} sections={meta.sections} />
      <DashboardLookupSection data={data} sections={meta.sections} />
    </div>
  );
}
