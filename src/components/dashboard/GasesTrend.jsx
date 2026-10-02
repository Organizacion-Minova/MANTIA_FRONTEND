import { STATUS_ICON } from "./statusIcons";

export default function GasesTrend({ readings = [], latestStatus }) {
  const hasData = readings.length > 0;

  return (
    <div className="gases-trend">
      <h3 className="dashboard-block__title">Medición de gases</h3>

      {hasData ? (
        <>
          <svg viewBox="0 0 100 30" className="gases-trend__sparkline" preserveAspectRatio="none">
            <polyline
              points={readings
                .map((value, index) => {
                  const x = (index / (readings.length - 1)) * 100;
                  const y = 30 - (value / Math.max(...readings)) * 28;
                  return `${x},${y}`;
                })
                .join(" ")}
            />
          </svg>
          {latestStatus && (
            <div className={`gases-trend__latest gases-trend__latest--${latestStatus.status}`}>
              <i className={STATUS_ICON[latestStatus.status]} aria-hidden="true"></i>
              <span>{latestStatus.label}</span>
            </div>
          )}
        </>
      ) : (
        <p className="dashboard-block__empty">Sin mediciones registradas</p>
      )}
    </div>
  );
}