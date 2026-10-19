export default function LocationsSummary({ locations = [] }) {
  const hasData = locations.length > 0;
  const sorted = [...locations].sort((a, b) => b.total - a.total);

  return (
    <div className="locations-summary">
      <h3 className="dashboard-block__title">Ubicaciones</h3>
      {hasData ? (
        <ul className="locations-summary__list">
          {sorted.map((loc) => (
            <li key={loc.name} className="locations-summary__item">
              <span>{loc.name}</span>
              <strong>{loc.total}</strong>
            </li>
          ))}
        </ul>
      ) : (
        <p className="dashboard-block__empty">Sin ubicaciones registradas</p>
      )}
    </div>
  );
}