import { useState } from "react";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import { Link } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import {
  formatearFecha,
  getChartData,
  getChartOptions,
  limitesGases,
} from "./gasChartConfig";
import { getNoDataMessage } from "./sectionMessages";
import paginacionDerecha from "../../assets/icons/paginacion-derecha.svg";
import paginacionIzquierda from "../../assets/icons/paginacion-izquierda.svg";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, annotationPlugin);

export default function GasesTrend({ gases, state }) {
  const [locationIndex, setLocationIndex] = useState(0);

  if (gases == null) {
    return (
      <div className="gases-trend">
        <h3 className="dashboard-block__title">Medición de gases</h3>
        <p className="dashboard-block__empty">{getNoDataMessage(state)}</p>
      </div>
    );
  }

  if (gases.length === 0) {
    return (
      <div className="gases-trend">
        <h3 className="dashboard-block__title">Medición de gases</h3>
        <p className="dashboard-block__empty">Sin mediciones registradas</p>
      </div>
    );
  }

  const currentLocationIndex = Math.min(locationIndex, gases.length - 1);
  const location = gases[currentLocationIndex];
  const registro = [{
    fecha: location.measurement.date,
    detalle: location.detail,
  }];

  return (
    <div className="gases-trend">
      <div className="gases-carousel__header">
        <h3 className="dashboard-block__title">Medición de gases por ubicación</h3>
        <nav className="gases-carousel__navigation" aria-label="Navegación de ubicaciones">
          <button
            type="button"
            onClick={() => setLocationIndex(Math.max(currentLocationIndex - 1, 0))}
            disabled={currentLocationIndex === 0}
            aria-label="Ubicación anterior"
          >
            <img src={paginacionIzquierda} alt="" aria-hidden="true" />
          </button>
          <span aria-live="polite">{currentLocationIndex + 1} / {gases.length}</span>
          <button
            type="button"
            onClick={() => setLocationIndex(Math.min(currentLocationIndex + 1, gases.length - 1))}
            disabled={currentLocationIndex === gases.length - 1}
            aria-label="Ubicación siguiente"
          >
            <img src={paginacionDerecha} alt="" aria-hidden="true" />
          </button>
        </nav>
      </div>
      <div className="gases-carousel__location">
        <strong>{location.name}</strong>
        <span>
          Último registro: {formatearFecha(location.measurement.date)}
          {location.measurement.time ? ` · ${location.measurement.time.slice(0, 5)}` : ""}
        </span>
      </div>
      <div className="gases-carousel__charts">
        {Object.entries(limitesGases).map(([gasKey, meta]) => (
          <Link
            className="gases-carousel__chart"
            key={meta.campo}
            to={`/gases/compare_gases?locationId=${location.id}&gas=${gasKey}`}
            aria-label={`Ver gráfica de ${meta.label} de ${location.name} en el módulo de gases`}
          >
            <h4>{meta.label} <span>[{meta.unidad}]</span></h4>
            <div className="gases-carousel__canvas">
              <Bar options={getChartOptions(meta)} data={getChartData(meta, registro)} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}