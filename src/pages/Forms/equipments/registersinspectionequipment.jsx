import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BotonLink, BotonAccion } from "../../../components/common/Button";
import { PageWelcome, Searcher } from "../../../components/common/welcome";
import LoadingScreen from "../../../components/LoadingScreen";
import { usePaginacion, Paginacion } from "../../../components/common/Paginacion";
import { GetEquipmentInspections } from "../../../api/Equipmentsapi";
import { formatearFechaCorta } from "../../../components/common/Validations";
import { useSearch } from "../../../hooks/useSearch";
import verIcono from "../../../assets/icons/ver.svg";
import agregarIcon from "../../../assets/icons/agregar.svg";
import izquierdaIcon from "../../../assets/icons/flecha-izquierda.svg";
import izquierdaIcon2 from "../../../assets/icons/flecha-izquierda2.svg";
import reestablecerFiltrosIcon from "../../../assets/icons/reestablecerFiltros.svg";

export default function RegistrosInspeccion() {
    const { id } = useParams();
    const [equipo, setEquipo] = useState(null);
    const [registros, setRegistros] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(false);
    const { busqueda, setBusqueda, rangoFecha, setRangoFecha, itemsFiltrados } = useSearch(
        registros,
        ['id', 'inspector', 'format_version', 'week_start', 'week_end'],
        'week_start'
    )
    const hayFiltros=
        busqueda.trim() !== "" ||
        (typeof rangoFecha === "string" ? rangoFecha.trim() !== "" : Object.values(rangoFecha || {}).some((v) => v !== "" && v != null));

    const handleBorrarFiltros = () => {
        setBusqueda("");
        setRangoFecha("");
        setPaginaActual(1);
    };
    const { datosPagina, paginaActual, totalPaginas, setPaginaActual } = usePaginacion(itemsFiltrados, 8);

    useEffect(() => {
        GetEquipmentInspections(id)
            .then((data) => {
                setEquipo(data.equipment);
                setRegistros(data.inspections);
            })
            .catch((err) => {
                console.error("Error al cargar los registros:", err);
                setError(true);
            })
            .finally(() => setCargando(false));
    }, [id]);

    if (cargando) return <LoadingScreen indeterminado />;
    if (error) return <p>No se pudieron cargar los formatos guardados.</p>;

    return (
        <div className="list-grid">
            <header className="bienvenida">
                <PageWelcome
                    titulo={`Formatos guardados: ${equipo.name}`}
                    descripcion="Inspecciones preoperacionales registradas, de la más reciente a la más antigua."
                />
                <Searcher
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    rangoFecha={rangoFecha}
                    onRangoFechaChange={setRangoFecha}
                    placeholder="Buscar por semana, por quien realizo la inspección o por versión del formato"
                    filtrosAdicionales={
                        hayFiltros && (
                            <BotonAccion
                                clase="btn-borrar"
                                icono={reestablecerFiltrosIcon}
                                texto="Borrar filtros"
                                onClick={handleBorrarFiltros}
                                titulo="Quitar la búsqueda y el filtro de fechas"
                            />
                        )
                    }
                />
            </header>

            <div className="table-responsive">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Semana</th>
                            <th>Realizada por</th>
                            <th>Versión del formato</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {registros.length === 0 ? (
                            <tr><td colSpan="4">Todavía no hay inspecciones guardadas.</td></tr>
                        ) : (
                            datosPagina.map((r) => (
                                <tr key={r.id}>
                                    <td>{formatearFechaCorta(r.week_start)} al {formatearFechaCorta(r.week_end)}</td>
                                    <td>{r.inspector || "—"}</td>
                                    <td>{r.format_version || "—"}</td>
                                    <td>
                                        <BotonLink
                                            link={`/equipment/cardequipment/${id}/inspection/records/${r.id}`}
                                            clase="btn-azul"
                                            img={verIcono}
                                            titulo="Ver inspección"
                                        />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="btn-container-page">
                <div className="btn-container">
                    <BotonLink 
                        link={`/equipment/cardequipment/${id}/inspection/complete`} 
                        clase="btn-azul"
                        img={agregarIcon}
                        texto="Nueva inspección" 
                        titulo="Crear nueva inspección" 
                    />
                    <div className="footer-btns">
                    <BotonLink 
                        link={`/equipment/cardequipment/${id}/inspection/complete`} 
                        clase="btn-regresar"
                        img={izquierdaIcon}
                        imgDark={izquierdaIcon2}
                        texto="Regresar al formato" 
                        titulo="Regresar al formato de inspección" 
                    />
                    </div>
                </div>
                <Paginacion 
                    paginaActual={paginaActual} 
                    totalPaginas={totalPaginas} 
                    setPaginaActual={setPaginaActual}
                />
            </div>
        </div>
    );
}