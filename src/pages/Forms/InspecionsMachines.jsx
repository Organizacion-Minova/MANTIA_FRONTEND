import { useEffect, useState } from "react";
import { BotonLink } from "../../components/common/Button";
import { PageWelcome, Searcher } from "../../components/common/welcome";
import { Select } from "../../components/common/forms";
import LoadingScreen from "../../components/LoadingScreen";
import { usePaginacion, Paginacion } from "../../components/common/Paginacion";
import { useSearch } from "../../hooks/useSearch";
import { GetInspectionOverviewMachines } from "../../api/machinesapi";
import { TIPOS, rutaForm } from "../../components/common/Formarchine";

export default function InspeccionesMaquinas({ kind = "inspection" }) {
    const [maquinas, setMaquinas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(false);
    const [estado, setEstado] = useState("");
    const tipo = TIPOS[kind];

    useEffect(() => {
        GetInspectionOverviewMachines()
            .then((data) => setMaquinas(Array.isArray(data) ? data : []))
            .catch((err) => {
                console.error("Error al cargar las máquinas:", err);
                setError(true);
            })
            .finally(() => setCargando(false));
    }, []);

    const filtradas = maquinas.filter((m) =>
        estado === "" ? true : estado === "con" ? m.has_format : !m.has_format
    );

    const { busqueda, setBusqueda, itemsFiltrados } = useSearch(filtradas, ["name", "category"]);
    const { datosPagina, paginaActual, totalPaginas, setPaginaActual } = usePaginacion(itemsFiltrados, 7);

    useEffect(() => {
        setPaginaActual(1);
    }, [busqueda, estado, setPaginaActual]);

    if (cargando) return <LoadingScreen indeterminado />;
    if (error) return <p>No se pudieron cargar las máquinas.</p>;

    return (
        <div className="list-grid">
            <header className="bienvenida">
                <PageWelcome
                    titulo={`${tipo.titulo.toUpperCase()} DE MÁQUINAS`}
                    descripcion="Entra a una máquina para llenar el formato o, si su categoría aún no tiene formato, armarlo."
                    mostrarHistorial={true}
                />
                <Searcher
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar por nombre o categoría"
                    filtrosAdicionales={
                        <div className="btn-container">
                            <Select
                                id="filtro-estado"
                                name="filtro-estado"
                                value={estado}
                                onChange={(e) => setEstado(e.target.value)}
                                opciones={[
                                    { valor: "", etiqueta: "Todas" },
                                    { valor: "con", etiqueta: "Con formato" },
                                    { valor: "sin", etiqueta: "Sin formato" },
                                ]}
                            />
                        </div>
                    }
                />
            </header>

            <div className="table-responsive">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Máquina</th>
                            <th>Categoría</th>
                            <th>Formato</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {itemsFiltrados.length === 0 ? (
                            <tr><td colSpan="4">No hay máquinas para mostrar.</td></tr>
                        ) : (
                            datosPagina.map((m) => (
                                <tr key={m.id}>
                                    <td>{m.name}</td>
                                    <td>{m.category || "Sin categoría"}</td>
                                    <td>{m.category ? (m.has_format ? "Con formato" : "Sin formato") : "—"}</td>
                                    <td>
                                        {m.category ? (
                                            <BotonLink
                                                link={rutaForm(m.id, kind, "/complete")}
                                                clase="btn-azul"
                                                icono="fa-solid fa-eye"
                                                titulo={m.has_format ? "Llenar formato" : "Armar formato"}
                                            />
                                        ) : (
                                            "Asígnale una categoría"
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="btn-container-page">
                <div className="btn-container"></div>
                <Paginacion 
                    paginaActual={paginaActual} 
                    totalPaginas={totalPaginas} 
                    setPaginaActual={setPaginaActual} 
                />
            </div>
        </div>
    );
}