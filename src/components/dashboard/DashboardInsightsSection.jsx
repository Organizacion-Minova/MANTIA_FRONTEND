// Contenedor de elementos que requieren atención y uso diario.
import ItemsRequiringAttention from "./ItemsRequiringAttention";
import DailyUsageSummary from "./DailyUsageSummary";

export default function DashboardInsightsSection({ data, sections }) {
  // Si el rol no puede ver una sección, el backend no la envía y aquí no se dibuja
  const verActividad = sections.activity !== undefined;
  const verUsoDiario = sections.dailyUsage !== undefined;
  if (!verActividad && !verUsoDiario) return null;

  return (
    <section className="dashboard-insights-section">
      {verActividad && <ItemsRequiringAttention items={data.activity} state={sections.activity} />}
      {verUsoDiario && <DailyUsageSummary items={data.dailyUsage} state={sections.dailyUsage} />}
    </section>
  );
}