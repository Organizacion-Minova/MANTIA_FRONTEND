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

function Searcher({ value, onChange, placeholder = "Buscar...", rangoFecha, onRangoFechaChange, filtrosAdicionales = null }) {
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
                <select
                    className="select-filtro-fecha"
                    value={rangoFecha}
                    onChange={(e) => onRangoFechaChange(e.target.value)}
                >
                    <option value="">Todas las fechas</option>
                    <option value="hoy">Hoy</option>
                    <option value="7_dias">Últimos 7 días</option>
                    <option value="mes">Este mes</option>
                    <option value="ano">Este año</option>
                </select>
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
