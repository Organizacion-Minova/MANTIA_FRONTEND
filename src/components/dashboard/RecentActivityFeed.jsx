import { Link } from "react-router-dom";
//SECCION ACTIVIDAD RECIENTE
const EVENT_ICON = {
  maintenance: "fa-solid fa-screwdriver-wrench",
  loan: "fa-solid fa-arrow-right-arrow-left",
  usage: "fa-solid fa-gauge",
  diagnostic: "fa-solid fa-stethoscope",
  calibration: "fa-solid fa-sliders",
  default: "fa-solid fa-circle-info",
};

export default function RecentActivityFeed({ items = [], maxItems = 6, viewMoreTo = "/activity" }) {
  const hasItems = items.length > 0;
  const visibleItems = items.slice(0, maxItems);

  return (
    <div className="recent-activity-feed">
      <h3 className="dashboard-block__title">Actividad reciente</h3>

      {hasItems ? (
        <>
          <ul className="recent-activity-feed__list">
            {visibleItems.map((item) => (
              <li key={item.id} className="recent-activity-feed__item">
                <i className={EVENT_ICON[item.type] || EVENT_ICON.default} aria-hidden="true"></i>
                <div className="recent-activity-feed__content">
                  <p>{item.description}</p>
                  <time>{item.relativeTime}</time>
                </div>
              </li>
            ))}
          </ul>
          {items.length > maxItems && (
            <Link to={viewMoreTo} className="recent-activity-feed__more">
              Ver toda la actividad
            </Link>
          )}
        </>
      ) : (
        <p className="dashboard-block__empty">Sin actividad reciente</p>
      )}
    </div>
  );
}