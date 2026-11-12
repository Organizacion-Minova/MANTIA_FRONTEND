import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BotonLink, BotonAccion, Boton } from "../../../components/common/Button";
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
import excelIcon from "../../../assets/icons/excel.svg";
import excelIconDark from "../../../assets/icons/excel2.svg";
import reestablecerFiltrosIcon from "../../../assets/icons/reestablecerFiltros.svg";
import pdfIcon from "../../../assets/icons/pdf.svg";
import pdfIconDark from "../../../assets/icons/pdf2.svg";
import { useToast } from "../../../context/ToastContext.jsx";
import { Form, Date as InputDate } from "../../../components/common/forms";
import { exportarInspeccionMaquinaPdfRango, exportarInspeccionMaquinaExcelRango } from "../../../api/machinesapi";

function RangoFormModal({ tipo, onCancel, onSuccess, registros, machineId, machineName }) {
    const [formData, setFormData] = useState({ fecha_inicio: '', fecha_fin: '' });
    const { advertencia } = useToast();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        const { fecha_inicio, fecha_fin } = formData;
        if (!fecha_inicio || !fecha_fin) {
            advertencia("Debe seleccionar ambas fechas.");
            return;
        }
        const hoy = new Date().toISOString().split('T')[0];
        if (fecha_fin > hoy) {
            advertencia("La fecha final no puede ser mayor a la actual.");
            return;
        }
        if (fecha_fin < fecha_inicio) {
            advertencia("La fecha final no puede ser menor a la fecha de inicio.");
            return;
        }
        const diffTime = Math.abs(new Date(fecha_fin) - new Date(fecha_inicio));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        if (diffDays > 31) {
            advertencia("El rango máximo permitido es de 31 días.");
            return;
        }

        const existeRegistroEnRango = registros.some(r => {
            const fechaReg = r.date; 
            return fechaReg >= fecha_inicio && fechaReg <= fecha_fin;
        });

        if (!existeRegistroEnRango) {
            advertencia("No se encontraron registros de inspección en el rango de fechas seleccionado.");
            return;
        }

        try {
            if (tipo === 'excel') {
                await exportarInspeccionMaquinaExcelRango(machineId, machineName, fecha_inicio, fecha_fin);
            } else {
                await exportarInspeccionMaquinaPdfRango(machineId, machineName, fecha_inicio, fecha_fin);
            }
            onSuccess();
        } catch (err) {
            advertencia(err.response?.data?.message || "No se pudieron exportar los datos.");
        }
    };

    return (
        <Form
            titulo={`Exportar en archivo ${tipo}`}
            descripcion="Seleccione el rango de fechas para la exportación"
            onCancel={onCancel}
            onSubmit={handleSubmit}
            textoBoton="Descargar"
            iconoBoton="fa-solid fa-download"
            tituloBoton="Descargar"
        >
            <div className="col-span-6">
                <InputDate
                    label="Fecha Inicio:"
                    id="fecha_inicio"
                    name="fecha_inicio"
                    value={formData.fecha_inicio}
                    onChange={handleChange}
                />
            </div>
            <div className="col-span-6">
                <InputDate
                    label="Fecha Fin:"
                    id="fecha_fin"
                    name="fecha_fin"
                    value={formData.fecha_fin}
                    onChange={handleChange}
                />
            </div>
        </Form>
    );
}

function RegistrosMaquina() {
    const { id, kind } = useParams();
    const tipo = TIPOS[kind];
    const [maquina, setMaquina] = useState(null);
    const [registros, setRegistros] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(false);
    const [showRangoModal, setShowRangoModal] = useState(null);

    const { busqueda, setBusqueda, rangoFecha, setRangoFecha, itemsFiltrados } = useSearch(
        registros,
        ["inspector", "date", "week_end", "format_version"],
        "date"
    );
    const hayFiltros =
        busqueda.trim() !== "" ||
        (typeof rangoFecha === "string" ? rangoFecha.trim() !== "" : Object.values(rangoFecha || {}).some((v) => v !== "" && v != null));
    const handleBorrarFiltros = () => {
        setBusqueda("");
        setRangoFecha("");
        setPaginaActual(1);
    };

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
                    {kind === 'inspection' && (
                        <>
                            <Boton
                                clase="btn-3"
                                img={excelIcon}
                                imgDark={excelIconDark}
                                texto="Exportar Excel"
                                onClick={() => setShowRangoModal('excel')}
                                titulo="Exportar en un archivo de Excel"
                            />
                            <Boton
                                clase="btn-3"
                                img={pdfIcon}
                                imgDark={pdfIconDark}
                                texto="Exportar PDF"
                                onClick={() => setShowRangoModal('pdf')}
                                titulo="Exportar en un archivo PDF"
                            />
                        </>
                    )}
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
                {showRangoModal && (
                    <RangoFormModal
                        tipo={showRangoModal}
                        registros={registros}
                        machineId={id}
                        machineName={maquina.name}
                        onCancel={() => setShowRangoModal(null)}
                        onSuccess={() => setShowRangoModal(null)}
                    />
                )}
                <Paginacion 
                    paginaActual={paginaActual} 
                    totalPaginas={totalPaginas} 
                    setPaginaActual={setPaginaActual} 
                />
            </div>
        </div>
    );
}

export default RegistrosMaquina;