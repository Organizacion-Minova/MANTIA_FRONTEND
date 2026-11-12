import { STATUS_ICON } from "./statusIcons";
import { getNoDataMessage } from "./sectionMessages";

function buildPoints(values) {
  const max = Math.max(...values);
  const scale = max > 0 ? max : 1;

  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 30 - (value / scale) * 28;
      return `${x},${y}`;
    })
    .join(" ");
}

export default function GasesTrend({ gases, state }) {
  let content;

  if (gases == null) {
    content = <p className="dashboard-block__empty">{getNoDataMessage(state)}</p>;
  } else {
    const values = (gases.readings ?? []).map(Number);
    const latestStatus = gases.latestStatus;

    if (values.length === 0) {
      content = <p className="dashboard-block__empty">Sin mediciones registradas</p>;
    } else {
      content = (
        <>
          {values.length >= 2 ? (
            <svg
              viewBox="0 0 100 30"
              className="gases-trend__sparkline"
              preserveAspectRatio="none"
              role="img"
              aria-label={`Tendencia de las últimas ${values.length} mediciones de gases`}
            >
              <polyline points={buildPoints(values)} />
            </svg>
          ) : (
            <p className="dashboard-block__empty">
              Se necesitan al menos 2 mediciones para mostrar la tendencia
            </p>
          )}
          {latestStatus && (
            <div className={`gases-trend__latest gases-trend__latest--${latestStatus.status}`}>
              <i className={STATUS_ICON[latestStatus.status]} aria-hidden="true"></i>
              <span>{latestStatus.label}</span>
            </div>
          )}
        </>
      );
    }
  }

  return (
    <div className="gases-trend">
      <h3 className="dashboard-block__title">Medición de gases</h3>
      {content}
    </div>
  );
}