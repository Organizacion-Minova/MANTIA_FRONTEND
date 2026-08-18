import { Boton } from "../../components/common/Button";
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

function Searcher() {
    return (
        <div className="search-main">
            <div className="search-wrapper">
                <i className="fa-solid fa-magnifying-glass "></i>
                <input
                    type="text"
                    id="q"
                    placeholder="Buscar por nombre, descripción, categoría"
                />
            </div>
            <Boton
                clase="btn-buscar"
                icono="fa-solid fa-magnifying-glass"
                texto="Buscar"
            />
        </div>
    );
}

export { PageWelcome, Searcher };
