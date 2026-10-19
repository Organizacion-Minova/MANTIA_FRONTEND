import { Link } from "react-router-dom";
import {STATUS_ICON} from "./statusIcons"
//cards individual para maquinas equipos y herramientas


export default function SummaryCard({ title, total, breakdown = [], highlight, to }) {
  const hasData = total !== null && total !== undefined;

  return (
    <Link to={to} className="summary-card">
      <h3 className="summary-card__title">{title}</h3>

      {hasData ? (
        <>
          <p className="summary-card__total">{total}</p>
          <ul className="summary-card__breakdown">
            {breakdown.map((item) => (
              <li key={item.label} className={`summary-card__item summary-card__item--${item.status}`}>
                <i className={STATUS_ICON[item.status]} aria-hidden="true"></i>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </li>
            ))}
          </ul>
          {highlight && (
            <div className="summary-card__highlight">
              <i className={highlight.icon} aria-hidden="true"></i>
              <span>{highlight.text}</span>
            </div>
          )}
        </>
      ) : (
        <p className="summary-card__empty">Sin datos disponibles</p>
      )}
    </Link>
  );
}