// CONTENEDOR DE ULTIMA SECCION UBICACIONES Y GASES
import LocationsSummary from "./LocationsSummary";
import GasesTrend from "./GasesTrend";

const locations = [
  { name: "Bodega Principal", total: 42 },
  { name: "Frente de Trabajo 1", total: 18 },
  { name: "Taller de Mantenimiento", total: 9 },
];

const gasReadings = [12, 14, 13, 15, 18, 16, 14];

export default function DashboardLookupSection() {
  return (
    <section className="dashboard-lookup-section">
      <LocationsSummary locations={locations} />
      <GasesTrend
        readings={gasReadings}
        latestStatus={{ status: "success", label: "Dentro de rango" }}
      />
    </section>
  );
}