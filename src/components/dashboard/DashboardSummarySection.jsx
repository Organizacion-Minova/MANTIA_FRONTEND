// contenedor  con todas las cards y datos a mano de momento
import SummaryCard from "./SummaryCard";

export default function DashboardSummarySection() {
  return (
    <section className="dashboard-summary-section">
      <SummaryCard
        title="Máquinas"
        total={18}
        breakdown={[
          { label: "Activas", value: 14, status: "success" },
          { label: "Mantenimiento", value: 3, status: "warning" },
          { label: "Fuera de servicio", value: 1, status: "critical" },
        ]}
        highlight={{ icon: "fa-solid fa-clock", text: "3 preoperacionales próximos" }}
        to="/machines"
      />
      <SummaryCard
        title="Equipos"
        total={12}
        breakdown={[
          { label: "Activos", value: 9, status: "success" },
          { label: "Mantenimiento", value: 2, status: "warning" },
          { label: "Inactivos", value: 1, status: "critical" },
        ]}
        highlight={{ icon: "fa-solid fa-clock", text: "2 diagnósticos, 1 calibración" }}
        to="/equipment"
      />
      <SummaryCard
        title="Consumibles"
        total={40}
        breakdown={[
          { label: "Disponible", value: 33, status: "success" },
          { label: "Stock bajo", value: 5, status: "warning" },
          { label: "Mal estado", value: 2, status: "critical" },
        ]}
        to="/types/consumables"
      />
      <SummaryCard
        title="No consumibles"
        total={60}
        breakdown={[
          { label: "Disponible", value: 55, status: "success" },
          { label: "Stock bajo", value: 3, status: "warning" },
          { label: "Mal estado", value: 2, status: "critical" },
        ]}
        to="/types/noconsumables"
      />
    </section>
  );
}