import { getNoDataMessage } from "./sectionMessages";

export default function LocationsSummary({ locations, state }) {
  let content;

  if (locations == null) {
    content = <p className="dashboard-block__empty">{getNoDataMessage(state)}</p>;
  } else if (locations.length === 0) {
    content = <p className="dashboard-block__empty">Sin ubicaciones registradas</p>;
  } else {
    content = (
      <ul className="locations-summary__list">
        {locations.map((loc) => (
          <li key={loc.id} className="locations-summary__item">
            <span>{loc.name}</span>
            <strong>{loc.total}</strong>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="locations-summary">
      <h3 className="dashboard-block__title">Ubicaciones</h3>
      {content}
    </div>
  );
}