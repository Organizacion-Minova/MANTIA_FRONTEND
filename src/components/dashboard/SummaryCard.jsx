import { Link } from "react-router-dom";
import { STATUS_ICON } from "./statusIcons";
import { getHighlight } from "./highlights";
import { getNoDataMessage } from "./sectionMessages";
import DonutChart from "./DonutChart";
//cards individual para maquinas equipos y herramientas


export default function SummaryCard({ title, to, summary, state, totalLabel }) {
  const highlights = (summary?.highlights ?? [])
    .map((h) => getHighlight(h.key, h.value))
    .filter(Boolean);

  return (
    <Link to={to} className="summary-card">
      <h3 className="summary-card__title">{title}</h3>

      {summary ? (
        <>
          <div className="summary-card__body">
            <DonutChart
              segments={summary.breakdown}
              label={`Total: ${summary.total}${totalLabel ? ` ${totalLabel}` : ""}`}
            >
              <strong>{summary.total}</strong>
              {totalLabel && <span>{totalLabel}</span>}
            </DonutChart>

            <ul className="summary-card__breakdown">
              {summary.breakdown.map((item) => (
                <li key={item.key} className={`summary-card__item summary-card__item--${item.status}`}>
                  <img
                    className="summary-card__status-icon"
                    src={STATUS_ICON[item.status]}
                    alt=""
                    aria-hidden="true"
                  />
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </li>
              ))}
            </ul>
          </div>

          {highlights.length > 0 && (
            <ul className="summary-card__highlights">
              {highlights.map((h) => (
                <li
                  key={h.key}
                  className={`summary-card__highlight${h.status ? ` summary-card__highlight--${h.status}` : ""}`}
                >
                  <i className={h.icon} aria-hidden="true"></i>
                  <span>{h.text}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <p className="summary-card__empty">{getNoDataMessage(state)}</p>
      )}
    </Link>
  );
}