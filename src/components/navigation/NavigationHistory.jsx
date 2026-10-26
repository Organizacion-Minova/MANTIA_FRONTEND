import { useNavigationHistory } from "../../context/NavigationHistoryContext.jsx";
import "../../styles/navigation-history.css";

function NavigationHistory() {
    const {
        entradas,
        indiceActual,
        navegarAlHistorial,
    } = useNavigationHistory();

    if (entradas.length === 0) {
        return null;
    }

    return (
        <nav
            className="navigation-history"
            aria-label="Historial de navegación"
        >
            <div className="navigation-history__header">
                {/* <span className="navigation-history__label">
                    <i
                        className="fa-solid fa-clock-rotate-left"
                        aria-hidden="true"
                    ></i>

                    Recorrido reciente
                    <span className="navigation-history__counter">
                    {indiceActual + 1} de {entradas.length}
                </span>
                </span> */}

                
            </div>

            <ol className="navigation-history__list">
                {entradas.map((entrada, indice) => {
                    const esActual = indice === indiceActual;

                    return (
                        <li
                            key={entrada.locationKey ?? entrada.pathname}
                            className="navigation-history__item"
                        >
                            {indice > 0 && (
                                <span
                                    className="navigation-history__separator"
                                    aria-hidden="true"
                                >
                                    <i className="fa-solid fa-chevron-right"></i>
                                </span>
                            )}

                            {esActual ? (
                                <span
                                    className="navigation-history__current"
                                    aria-current="page"
                                >
                                    <i
                                        className="fa-solid fa-location-dot"
                                        aria-hidden="true"
                                    ></i>

                                    <span>{entrada.titulo}</span>
                                </span>
                            ) : (
                                <button
                                    type="button"
                                    className="navigation-history__link"
                                    onClick={() =>
                                        navegarAlHistorial(entrada)
                                    }
                                    aria-label={`Regresar a ${entrada.titulo}`}
                                    title={`Regresar a ${entrada.titulo}`}
                                >
                                    <span>{entrada.titulo}</span>
                                </button>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}

export default NavigationHistory;

