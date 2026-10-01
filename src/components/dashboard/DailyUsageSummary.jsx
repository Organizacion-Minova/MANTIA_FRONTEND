export default function DailyUsageSummary({ items = [] }) {
  const hasItems = items.length > 0;
//SECCION DE PROTOCOLO USO DAIRIOOO DE MOMENTO
  return (
    <div className="daily-usage-summary">
      <h3 className="dashboard-block__title">Uso diario</h3>

      {hasItems ? (
        <ul className="daily-usage-summary__list">
          {items.map((item) => (
            <li key={item.label} className="daily-usage-summary__item">
              <i className={item.icon} aria-hidden="true"></i>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </li>
          ))}
        </ul>
      ) : (
        <p className="dashboard-block__empty">Sin registros de uso hoy</p>
      )}
    </div>
  );
}