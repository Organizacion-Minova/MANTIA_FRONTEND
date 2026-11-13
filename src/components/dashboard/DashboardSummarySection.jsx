// contenedor  con todas las cards y datos a mano de momento
import SummaryCard from "./SummaryCard";

const CARDS = [
  { dataKey: "machines", title: "Máquinas", totalLabel: "registros", to: "/machines" },
  { dataKey: "equipmentsConsumables", title: "Equipos consumibles", totalLabel: "registros", to: "/equipment/consumables" },
  { dataKey: "equipmentsNonConsumables", title: "Equipos no consumibles", totalLabel: "registros", to: "/equipment/noconsumables" },
  { dataKey: "consumables", title: "Herramientas consumibles", totalLabel: "unidades", to: "/consumables/tools" },
  { dataKey: "nonConsumables", title: "Herramientas no consumibles", totalLabel: "unidades", to: "/noconsumables/tools" },
];

export default function DashboardSummarySection({ data, sections }) {
  return (
    <section className="dashboard-summary-section">
      {CARDS.filter(({ dataKey }) => sections[dataKey] !== undefined).map(({ dataKey, title, totalLabel, to }) => (
        <SummaryCard
          key={dataKey}
          title={title}
          to={to}
          summary={data[dataKey]}
          state={sections[dataKey]}
          totalLabel={totalLabel}
        />
      ))}
    </section>
  );
}