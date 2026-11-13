import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BotonLink, BotonAccion, Boton } from "../../../components/common/Button";
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
import excelIcon from "../../../assets/icons/excel.svg";
import excelIconDark from "../../../assets/icons/excel2.svg";
import pdfIcon from "../../../assets/icons/pdf.svg";
import pdfIconDark from "../../../assets/icons/pdf2.svg";
import { useToast } from "../../../context/ToastContext.jsx";
import { Form, Date as InputDate } from "../../../components/common/forms";
import { exportarInspeccionEquipoPdfRango, exportarInspeccionEquipoExcelRango } from "../../../api/Equipmentsapi";

function RangoFormModal({ tipo, onCancel, onSuccess, registros, equipmentId, equipmentName }) {
    const [formData, setFormData] = useState({ week_start: '', week_end: '' });
    const { advertencia } = useToast();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        const { week_start, week_end } = formData;
        if (!week_start || !week_end) {
            advertencia("Debe seleccionar ambas fechas.");
            return;
        }
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hoy = `${year}-${month}-${day}`;
        if (week_end > hoy) {
            advertencia("La fecha final no puede ser mayor a la actual.");
            return;
        }
        if (week_end < week_start) {
            advertencia("La fecha final no puede ser menor a la fecha de inicio.");
            return;
        }
        const diffTime = Math.abs(new Date(week_end) - new Date(week_start));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        if (diffDays > 28) {
            advertencia("El rango máximo permitido es de 28 días.");
            return;
        }

        const existeRegistroEnRango = registros.some(r => {
            const fechaReg = r.week_start;
            return fechaReg >= week_start && fechaReg <= week_end;
        });

        if (!existeRegistroEnRango) {
            advertencia("No se encontraron registros de inspección en el rango de fechas seleccionado.");
            return;
        }

        try {
            if (tipo === 'excel') {
                await exportarInspeccionEquipoExcelRango(equipmentId, equipmentName, week_start, week_end);
            } else {
                await exportarInspeccionEquipoPdfRango(equipmentId, equipmentName, week_start, week_end);
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
                    id="week_start"
                    name="week_start"
                    value={formData.week_start}
                    onChange={handleChange}
                />
            </div>
            <div className="col-span-6">
                <InputDate
                    label="Fecha Fin:"
                    id="week_end"
                    name="week_end"
                    value={formData.week_end}
                    onChange={handleChange}
                />
            </div>
        </Form>
    );
}

function RegistrosInspeccion() {
    const { id } = useParams();
    const [equipo, setEquipo] = useState(null);
    const [registros, setRegistros] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(false);
    const [showRangoModal, setShowRangoModal] = useState(null);
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
                {showRangoModal && (
                    <RangoFormModal
                        tipo={showRangoModal}
                        registros={registros}
                        equipmentId={id}
                        equipmentName={equipo.name}
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

export default RegistrosInspeccion;