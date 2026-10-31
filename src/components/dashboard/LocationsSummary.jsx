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
            <div className="locations-summary__header">
              <span>{loc.name}</span>
              <strong>{loc.total} elementos</strong>
            </div>
            <ul className="locations-summary__breakdown">
              {(loc.items ?? [])
                .filter((item) => item.quantity > 0)
                .map((item) => (
                  <li key={item.key} className="locations-summary__breakdown-item">
                    <span>{item.label}</span>
                    <strong>{item.quantity}</strong>
                  </li>
                ))}
            </ul>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="locations-summary">
      <h3 className="dashboard-block__title">Total de elementos en ubicaciones</h3>
      {content}
    </div>
  );
}