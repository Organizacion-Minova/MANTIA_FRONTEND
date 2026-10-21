import { Link } from "react-router-dom";
import { getNoDataMessage } from "./sectionMessages";
import { formatRelativeTime } from "./formatRelativeTime";
//SECCION ACTIVIDAD RECIENTE
const EVENT_ICON = {
  maintenance: "fa-solid fa-screwdriver-wrench",
  loan: "fa-solid fa-arrow-right-arrow-left",
  usage: "fa-solid fa-gauge",
  diagnostic: "fa-solid fa-stethoscope",
  calibration: "fa-solid fa-sliders",
  default: "fa-solid fa-circle-info",
};

export default function RecentActivityFeed({ items, state, maxItems = 6, viewMoreTo }) {
  let content;

  if (items == null) {
    content = <p className="dashboard-block__empty">{getNoDataMessage(state)}</p>;
  } else if (items.length === 0) {
    content = <p className="dashboard-block__empty">Sin actividad reciente</p>;
  } else {
    content = (
      <>
        <ul className="recent-activity-feed__list">
          {items.slice(0, maxItems).map((item) => (
            <li key={item.id} className="recent-activity-feed__item">
              <i className={EVENT_ICON[item.type] || EVENT_ICON.default} aria-hidden="true"></i>
              <div className="recent-activity-feed__content">
                <p>{item.description}</p>
                <time dateTime={item.timestamp}>{formatRelativeTime(item.timestamp)}</time>
              </div>
            </li>
          ))}
        </ul>
        {viewMoreTo && items.length > maxItems && (
          <Link to={viewMoreTo} className="recent-activity-feed__more">
            Ver toda la actividad
          </Link>
        )}
      </>
    );
  }

  return (
    <div className="recent-activity-feed">
      <h3 className="dashboard-block__title">Actividad reciente</h3>
      {content}
    </div>
  );
}