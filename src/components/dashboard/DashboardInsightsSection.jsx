//contenedor DE ACTIVIDAD RECEINTE Y USO DIARIO DATOS A MANO DE MOMENTO
import RecentActivityFeed from "./RecentActivityFeed";
import DailyUsageSummary from "./DailyUsageSummary";

const activityItems = [
  { id: 1, type: "maintenance", description: "Mantenimiento completado en Máquina 04", relativeTime: "hace 2 horas" },
  { id: 2, type: "loan", description: "Préstamo de taladro a Juan Pérez", relativeTime: "hace 3 horas" },
  { id: 3, type: "diagnostic", description: "Diagnóstico registrado en Equipo 12", relativeTime: "hace 5 horas" },
];

const usageItems = [
  { label: "Máquinas en uso hoy", value: 6, icon: "fa-solid fa-industry" },
  { label: "Equipos utilizados", value: 4, icon: "fa-solid fa-toolbox" },
];

export default function DashboardInsightsSection() {
  return (
    <section className="dashboard-insights-section">
      <RecentActivityFeed items={activityItems} />
      <DailyUsageSummary items={usageItems} />
    </section>
  );
}