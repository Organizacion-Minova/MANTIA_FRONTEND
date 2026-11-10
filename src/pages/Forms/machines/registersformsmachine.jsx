import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BotonLink } from "../../../components/common/Button";
import { PageWelcome } from "../../../components/common/welcome";
import LoadingScreen from "../../../components/LoadingScreen";
import { usePaginacion, Paginacion } from "../../../components/common/Paginacion";
import { GetMachineRecords } from "../../../api/machinesapi";
import { TIPOS, rutaForm, rutaMaquina } from "../../../components/common/Formarchine";
import { formatearFechaCorta } from "../../../components/common/Validations";

export default function RegistrosMaquina() {
    const { id, kind } = useParams();
    const tipo = TIPOS[kind];
    const [maquina, setMaquina] = useState(null);
    const [registros, setRegistros] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(false);
    const { datosPagina, paginaActual, totalPaginas, setPaginaActual } = usePaginacion(registros, 7);

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
                        {registros.length === 0 ? (
                            <tr><td colSpan="3">Todavía no hay registros guardados.</td></tr>
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
                        icono="fa-solid fa-plus" 
                        texto="Nuevo registro" 
                        titulo="Crear un nuevo registro"
                    />
                    <BotonLink 
                        link={rutaMaquina(id)} 
                        clase="btn-2"
                        icono="fa-solid fa-arrow-left" 
                        texto="Regresar" 
                        titulo="Regresar a la máquina"
                    />
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