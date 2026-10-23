import LocationsSummary from "./LocationsSummary";
import GasesTrend from "./GasesTrend";

export default function DashboardLookupSection({ data, sections }) {
  return (
    <section className="dashboard-lookup-section">
      <LocationsSummary locations={data.locations} state={sections.locations} />
      <GasesTrend gases={data.gases} state={sections.gases} />
    </section>
  );
}