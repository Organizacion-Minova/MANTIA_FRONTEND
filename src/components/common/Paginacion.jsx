import { useState } from "react";
import { Boton, BotonLink } from "./Button";

export function usePaginacion(datos, elementosPorPagina = 6) {
    const [paginaActual, setPaginaActual] = useState(1);

    const totalPaginas = Math.ceil(datos.length / elementosPorPagina);

    const indiceInicio = (paginaActual - 1) * elementosPorPagina;
    const indiceFin = indiceInicio + elementosPorPagina;
    const datosPagina = datos.slice(indiceInicio, indiceFin);

    return {
        datosPagina,
        paginaActual,
        totalPaginas,
        setPaginaActual,
    };
}
function Paginacion({ paginaActual, totalPaginas, setPaginaActual, maxBotonesVisibles=4 }) {
    if (totalPaginas <= 1) return null;
    let inicio = Math.max(1, paginaActual - Math.floor(maxBotonesVisibles / 2));
    let fin = inicio + maxBotonesVisibles - 1;

    if (fin > totalPaginas) {
        fin = totalPaginas;
        inicio = Math.max(1, fin - maxBotonesVisibles + 1);
    }

    const numerosVisibles = [];
    for (let i = inicio; i <= fin; i++) {
        numerosVisibles.push(i);
    }

    return (
        <div className="paginacion-container">
            <Boton
                onClick={() => setPaginaActual(paginaActual - 1)}
                disabled={paginaActual === 1}
                clase="btn-2"
                icono="fa-solid fa-chevron-left"
            />

            {numerosVisibles.map((numero) => (
                <Boton
                    key={numero}
                    onClick={() => setPaginaActual(numero)}
                    clase={numero === paginaActual ? "btn-azul" : "btn-2"}
                    texto={numero}
                />
            ))}

            <Boton
                onClick={() => setPaginaActual(paginaActual + 1)}
                disabled={paginaActual === totalPaginas}
                clase="btn-2"
                icono="fa-solid fa-chevron-right"
            />
        </div>
    );
}

export default Paginacion;