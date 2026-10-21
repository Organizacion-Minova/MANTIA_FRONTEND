import { Select } from '../../components/common/forms.jsx';

function PageWelcome({ titulo, descripcion }) {
    const fechaActual = new Date().toLocaleDateString("es-CO", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    return (
        <div className="welcome">
            <div>
                <h1 >
                    {titulo}
                </h1>
                <p>
                    {descripcion}
                </p>
            </div>

            <div className="date">
                <i className="fa-solid fa-calendar-days" ></i>
                <span id="fecha" > {fechaActual} </span>
            </div>
        </div>
    );
}

function Searcher({ value, onChange, placeholder = "Buscar...", rangoFecha, onRangoFechaChange, filtrosAdicionales = null, 
    filtrosFechas = [
        { valor: "", etiqueta: "Todas las fechas" },
        { valor: "hoy", etiqueta: "Hoy" },
        { valor: "7_dias", etiqueta: "Últimos 7 días" },
        { valor: "mes", etiqueta: "Este mes" },
        { valor: "anio", etiqueta: "Este año" }
    ] }) {
    return (
        <div className="search-main">
            <div className="search-wrapper">
                <i className="fa-solid fa-magnifying-glass"></i>
                <input
                    type="text"
                    id="q"
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                />
            </div>

            {onRangoFechaChange && (
                <div className="searcher-filters-container">
                    <Select
                        id=""
                        name=""
                        value={rangoFecha}
                        onChange={(e) => onRangoFechaChange(e.target.value)}
                        opciones={filtrosFechas}
                    />
                </div>
            )}

            {filtrosAdicionales && (
                <div className="searcher-filters-container">
                    {filtrosAdicionales}
                </div>
            )}
        </div>
    );
}

export { PageWelcome, Searcher };
