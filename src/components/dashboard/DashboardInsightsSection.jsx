//contenedor DE ACTIVIDAD RECEINTE Y USO DIARIO DATOS A MANO DE MOMENTO
import RecentActivityFeed from "./RecentActivityFeed";
import DailyUsageSummary from "./DailyUsageSummary";

// const activityItems = [
//   { id: 1, type: "maintenance", description: "Mantenimiento completado en Máquina 04", relativeTime: "hace 2 horas" },
//   { id: 2, type: "loan", description: "Préstamo de taladro a Juan Pérez", relativeTime: "hace 3 horas" },
//   { id: 3, type: "diagnostic", description: "Diagnóstico registrado en Equipo 12", relativeTime: "hace 5 horas" },
// ];

// const usageItems = [
//   { label: "Máquinas en uso hoy", value: 6, icon: "fa-solid fa-industry" },
//   { label: "Equipos utilizados", value: 4, icon: "fa-solid fa-toolbox" },
// ];

export default function DashboardInsightsSection({ data, sections }) {
  // Si el rol no puede ver una sección, el backend no la envía y aquí no se dibuja
  const verActividad = sections.activity !== undefined;
  const verUsoDiario = sections.dailyUsage !== undefined;
  if (!verActividad && !verUsoDiario) return null;

  return (
    <section className="dashboard-insights-section">
      {verActividad && <RecentActivityFeed items={data.activity} state={sections.activity} />}
      {verUsoDiario && <DailyUsageSummary items={data.dailyUsage} state={sections.dailyUsage} />}
    </section>
  );
}