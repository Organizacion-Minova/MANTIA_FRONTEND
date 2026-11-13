import { Link } from "react-router-dom";
import { getNoDataMessage } from "./sectionMessages";

function formatDate(date) {
  return date.split("-").reverse().join("/");
}

export default function DailyUsageSummary({ items, state }) {
  let content;

  if (items == null) {
    content = <p className="dashboard-block__empty">{getNoDataMessage(state)}</p>;
  } else if (items.length === 0) {
    content = <p className="dashboard-block__empty">Sin máquinas registradas</p>;
  } else {
    content = (
      <ul className="attention-items__list">
        {items.map((machine) => {
          const recordDates = machine.recordCount === 0
            ? "Esta máquina no tiene registros de uso diario."
            : `Primer registro: ${formatDate(machine.firstRecord.date)} · Último registro: ${formatDate(machine.lastRecord.date)}`;

          return (
            <li key={machine.id}>
              <Link to={`/machines/cardMachine/${machine.id}/dailyuse`} className="attention-items__item">
                <i className="fa-solid fa-industry" aria-hidden="true"></i>
                <span className="attention-items__content">
                  <strong className="attention-items__name">{machine.name}</strong>
                  <span className="attention-items__meta">
                    {machine.recordCount} {machine.recordCount === 1 ? "registro" : "registros"} de uso diario
                  </span>
                  <span className="attention-items__meta daily-usage-summary__dates">{recordDates}</span>
                </span>
                <i className="fa-solid fa-chevron-right attention-items__arrow" aria-hidden="true"></i>
              </Link>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className="daily-usage-summary">
      <h3 className="dashboard-block__title">Uso diario por máquina</h3>
      {content}
    </div>
  );
}