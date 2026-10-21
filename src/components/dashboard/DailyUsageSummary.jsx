import { getNoDataMessage } from "./sectionMessages";

const USAGE_ICON = {
  machines_in_use: "fa-solid fa-industry",
  equipment_used: "fa-solid fa-toolbox",
  default: "fa-solid fa-circle-info",
};

export default function DailyUsageSummary({ items, state }) {
  let content;

  if (items == null) {
    content = <p className="dashboard-block__empty">{getNoDataMessage(state)}</p>;
  } else if (items.length === 0) {
    content = <p className="dashboard-block__empty">Sin registros de uso hoy</p>;
  } else {
    content = (
      <ul className="daily-usage-summary__list">
        {items.map((item) => (
          <li key={item.key} className="daily-usage-summary__item">
            <i className={USAGE_ICON[item.key] || USAGE_ICON.default} aria-hidden="true"></i>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="daily-usage-summary">
      <h3 className="dashboard-block__title">Uso diario</h3>
      {content}
    </div>
  );
}