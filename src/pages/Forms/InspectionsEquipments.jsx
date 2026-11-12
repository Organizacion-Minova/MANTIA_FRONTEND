import { useEffect, useState } from "react";
import { BotonLink } from "../../components/common/Button";
import { PageWelcome, Searcher } from "../../components/common/welcome";
import { Select } from "../../components/common/forms";
import LoadingScreen from "../../components/LoadingScreen";
import { usePaginacion, Paginacion } from "../../components/common/Paginacion";
import { useSearch } from "../../hooks/useSearch";
import { GetInspectionOverviewEquipment } from "../../api/Equipmentsapi";
import verIcono  from "../../assets/icons/ver.svg";

export default function InspeccionesEquipos() {
    const [equipos, setEquipos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(false);
    const [estado, setEstado] = useState("");

    useEffect(() => {
        GetInspectionOverviewEquipment()
            .then((data) => setEquipos(Array.isArray(data) ? data : []))
            .catch((err) => {
                console.error("Error al cargar los equipos:", err);
                setError(true);
            })
            .finally(() => setCargando(false));
    }, []);

    const filtrados = equipos.filter((e) =>
        estado === "" ? true : estado === "con" ? e.has_format : !e.has_format
    );

    const { busqueda, setBusqueda, itemsFiltrados } = useSearch(filtrados, ["name", "code"]);
    const { datosPagina, paginaActual, totalPaginas, setPaginaActual } = usePaginacion(itemsFiltrados, 8);

    useEffect(() => {
        setPaginaActual(1);
    }, [busqueda, estado, setPaginaActual]);

    if (cargando) return <LoadingScreen indeterminado />;
    if (error) return <p>No se pudieron cargar los equipos.</p>;

    return (
        <div className="list-grid">
            <header className="bienvenida">
                <PageWelcome
                    titulo="INSPECCIONES DE EQUIPOS"
                    descripcion="Entra a un equipo para llenar su formato o, si aún no lo tiene, armarlo."
                    mostrarHistorial={true}
                />
                <Searcher
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar por nombre o código"
                    filtrosAdicionales={
                        <div className="btn-container">
                            <Select
                                id="filtro-estado"
                                name="filtro-estado"
                                value={estado}
                                onChange={(e) => setEstado(e.target.value)}
                                opciones={[
                                    { valor: "", etiqueta: "Todos" },
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
                            <th>Código</th>
                            <th>Nombre</th>
                            <th>Formato</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {itemsFiltrados.length === 0 ? (
                            <tr><td colSpan="4">No hay equipos para mostrar.</td></tr>
                        ) : (
                            datosPagina.map((e) => (
                                <tr key={e.id}>
                                    <td>{e.code || "—"}</td>
                                    <td>{e.name}</td>
                                    <td>{e.has_format ? "Con formato" : "Sin formato"}</td>
                                    <td>
                                        <BotonLink
                                            link={`/equipment/cardequipment/${e.id}/inspection`}
                                            clase="btn-azul"
                                            img={verIcono}
                                            titulo={e.has_format ? "Llenar formato" : "Armar formato"}
                                        />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="btn-container-page">
                <div className="btn-container"></div>
                <Paginacion paginaActual={paginaActual} totalPaginas={totalPaginas} setPaginaActual={setPaginaActual} />
            </div>
        </div>
    );
}