// contenedor  con todas las cards y datos a mano de momento
import SummaryCard from "./SummaryCard";

const CARDS = [
  { dataKey: "machines", title: "Máquinas", totalLabel: "registros", to: "/machines" },
  { dataKey: "equipments", title: "Equipos", totalLabel: "registros", to: "/equipment" },
  { dataKey: "consumables", title: "Consumibles", totalLabel: "unidades", to: "/consumables/tools" },
  { dataKey: "nonConsumables", title: "No consumibles", totalLabel: "unidades", to: "/noconsumables/tools" },
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