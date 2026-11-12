import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BotonLink } from "../../../components/common/Button";
import { PageWelcome, Searcher } from "../../../components/common/welcome";
import { useSearch } from "../../../hooks/useSearch";
import LoadingScreen from "../../../components/LoadingScreen";
import { usePaginacion, Paginacion } from "../../../components/common/Paginacion";
import { GetMachineRecords } from "../../../api/machinesapi";
import { TIPOS, rutaForm, rutaMaquina } from "../../../components/common/Formarchine";
import { formatearFechaCorta } from "../../../components/common/Validations";
import agregarIcon from "../../../assets/icons/agregar.svg";
import izquierdaIcon from "../../../assets/icons/flecha-izquierda.svg";
import izquierdaIcon2 from "../../../assets/icons/flecha-izquierda2.svg";

export default function RegistrosMaquina() {
    const { id, kind } = useParams();
    const tipo = TIPOS[kind];
    const [maquina, setMaquina] = useState(null);
    const [registros, setRegistros] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(false);

    const { busqueda, setBusqueda, rangoFecha, setRangoFecha, itemsFiltrados } = useSearch(
        registros,
        ["id", "inspector", "date", "week_end", "format_version"],
        "date"
    );

    const { datosPagina, paginaActual, totalPaginas, setPaginaActual } = usePaginacion(itemsFiltrados, 7);

    useEffect(() => {
        GetMachineRecords(id, kind)
            .then((data) => {
                setMaquina(data.machine);
                setRegistros(data.records);
            })
            .catch((err) => {
                console.error("Error al cargar los registros:", err);
                setError(true);
            })
            .finally(() => setCargando(false));
    }, [id, kind]);

    useEffect(() => {
        setPaginaActual(1);
    }, [busqueda, rangoFecha, setPaginaActual]);

    if (!tipo) return <p>Tipo de formato no válido.</p>;
    if (cargando) return <LoadingScreen indeterminado />;
    if (error) return <p>No se pudieron cargar los formatos guardados.</p>;

    return (
        <div className="list-grid">
            <header className="bienvenida">
                <PageWelcome
                    titulo={`${tipo.titulo}: ${maquina.name}`}
                    descripcion="Registros guardados, del más reciente al más antiguo."
                    mostrarHistorial={true}
                />
                <Searcher
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    rangoFecha={rangoFecha}
                    onRangoFechaChange={setRangoFecha}
                    placeholder="Buscar por código, fecha o inspector"
                />
            </header>

            <div className="table-responsive">
                <table className="table">
                    <thead>
                        <tr>
                            <th>{tipo.diario ? "Semana" : "Fecha"}</th>
                            <th>Realizado por</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {datosPagina.length === 0 ? (
                            <tr>
                                <td colSpan="3">
                                    {registros.length === 0
                                        ? "Todavía no hay registros guardados."
                                        : "No se encontraron registros con esos criterios."}
                                </td>
                            </tr>
                        ) : (
                            datosPagina.map((r) => (
                                <tr key={r.id}>
                                    <td>
                                        {tipo.diario
                                            ? `${formatearFechaCorta(r.date)} al ${formatearFechaCorta(r.week_end)}`
                                            : formatearFechaCorta(r.date)}
                                    </td>
                                    <td>{r.inspector || "—"}</td>
                                    <td>
                                        <BotonLink
                                            link={rutaForm(id, kind, `/records/${r.id}`)}
                                            clase="btn-azul"
                                            icono="fa-solid fa-eye"
                                            titulo="Ver registro"
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
                        link={rutaForm(id, kind, "/complete")} 
                        clase="btn-azul"
                        img={agregarIcon}
                        texto="Nuevo registro" 
                        titulo="Crear un nuevo registro"
                    />
                    <div className="footer-btns">
                        <BotonLink 
                            link={rutaMaquina(id)} 
                            clase="btn-regresar"
                            img={izquierdaIcon}
                            imgDark={izquierdaIcon2}
                            texto="Regresar" 
                            titulo="Regresar a la máquina"
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