import LocationsSummary from "./LocationsSummary";
import GasesTrend from "./GasesTrend";

export default function DashboardLookupSection({ data, sections }) {
  const verUbicaciones = sections.locations !== undefined;
  const verGases = sections.gases !== undefined;
  if (!verUbicaciones && !verGases) return null;

  return (
    <section className="dashboard-lookup-section">
      {verUbicaciones && <LocationsSummary locations={data.locations} state={sections.locations} />}
      {verGases && <GasesTrend gases={data.gases} state={sections.gases} />}
    </section>
  );
}