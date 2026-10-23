import { Link } from "react-router-dom";
import { STATUS_ICON } from "./statusIcons";
import { getHighlight } from "./highlights";
import { getNoDataMessage } from "./sectionMessages";
//cards individual para maquinas equipos y herramientas


export default function SummaryCard({ title, to, summary, state }) {
  const highlights = (summary?.highlights ?? [])
    .map((h) => getHighlight(h.key, h.value))
    .filter(Boolean);

  return (
    <Link to={to} className="summary-card">
      <h3 className="summary-card__title">{title}</h3>

      {summary ? (
        <>
          <p className="summary-card__total">{summary.total}</p>
          <ul className="summary-card__breakdown">
            {summary.breakdown.map((item) => (
              <li key={item.key} className={`summary-card__item summary-card__item--${item.status}`}>
                <i className={STATUS_ICON[item.status]} aria-hidden="true"></i>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </li>
            ))}
          </ul>
          {highlights.length > 0 && (
            <ul className="summary-card__highlights">
              {highlights.map((h) => (
                <li key={h.key} className="summary-card__highlight">
                  <i className={h.icon} aria-hidden="true"></i>
                  <span>{h.text}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <p className="summary-card__empty">
          {getNoDataMessage(state)}
        </p>
      )}
    </Link>
  );
}