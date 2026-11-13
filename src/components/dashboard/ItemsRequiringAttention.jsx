import { Link } from "react-router-dom";
import { getNoDataMessage } from "./sectionMessages";
const ITEM_TYPE = {
  machine: { icon: "fa-solid fa-industry", label: "Máquina" },
  equipment: { icon: "fa-solid fa-toolbox", label: "Equipo" },
  consumable: { icon: "fa-solid fa-screwdriver-wrench", label: "Herramienta consumible" },
  nonConsumable: { icon: "fa-solid fa-screwdriver-wrench", label: "Herramienta no consumible" },
  default: { icon: "fa-solid fa-circle-info", label: "Elemento" },
};

function getItemDetail(item) {
  if (item.type === "machine" || item.type === "equipment") {
    return item.status === "maintenance" ? "En mantenimiento" : "Fuera de servicio";
  }

  const details = [];
  if (item.badStock > 0) details.push(`Malas: ${item.badStock}`);
  if (item.lowStock) details.push(`Utilizables: ${item.usableStock} (stock bajo)`);
  return details.join(" · ");
}

export default function ItemsRequiringAttention({ items, state }) {
  let content;

  if (items == null) {
    content = <p className="dashboard-block__empty">{getNoDataMessage(state)}</p>;
  } else if (items.length === 0) {
    content = <p className="dashboard-block__empty">No hay elementos que requieran atención</p>;
  } else {
    content = (
      <ul className="attention-items__list">
        {items.map((item) => {
          const itemType = ITEM_TYPE[item.type] ?? ITEM_TYPE.default;
          const detail = getItemDetail(item);

          return (
            <li key={item.id}>
              <Link to={item.href} className="attention-items__item">
                <i className={itemType.icon} aria-hidden="true"></i>
                <span className="attention-items__content">
                  <strong className="attention-items__name">{item.name}</strong>
                  <span className="attention-items__meta">
                    {itemType.label}
                    {item.code ? ` · ${item.code}` : ""}
                  </span>
                  <span className="attention-items__detail">{detail}</span>
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
    <div className="attention-items">
      <h3 className="dashboard-block__title">Elementos que requieren atención</h3>
      {content}
    </div>
  );
}