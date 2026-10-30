import { useState, useEffect } from "react";
import { Boton, BotonLink } from "../../components/common/Button";
import { PageWelcome, Searcher } from "../../components/common/welcome";
import { obtenerMedicionesGases, crearMedicionGases, eliminarMedicionGases } from "../../api/gasMeasurement";
import { useSearch } from "../../hooks/useSearch";
import LoadingScreen from "../../components/LoadingScreen";
import { usePaginacion, Paginacion } from "../../components/common/Paginacion";
import { exportarGasExcelRango, exportarGasPdfRango } from "../../api/gasMeasurement";
import { useToast } from "../../context/ToastContext.jsx";
import { Form, Date as InputDate } from "../../components/common/forms";

function RangoFormModal({ tipo, onCancel, onSuccess, mediciones }) {
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

        const existeRegistroEnRango = mediciones.some(m => {
            const fechaMedicion = m.measurement_date; 
            return fechaMedicion >= fecha_inicio && fechaMedicion <= fecha_fin;
        });

        if (!existeRegistroEnRango) {
            advertencia("No se encontraron registros de medición de gases en el rango de fechas seleccionado.");
            return;
        }

        try {
            if (tipo === 'excel') {
                await exportarGasExcelRango(fecha_inicio, fecha_fin);
            } else {
                await exportarGasPdfRango(fecha_inicio, fecha_fin);
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

function Gases() {
    const [mediciones, setMediciones] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [showRangoModal, setShowRangoModal] = useState(null);

    const { busqueda, setBusqueda, rangoFecha, setRangoFecha, itemsFiltrados: medicionesFiltradas } = useSearch(
        mediciones,
        ['id', 'measurement_date', 'measurement_time'],
        'measurement_date'
    );

    const { datosPagina, paginaActual, totalPaginas, setPaginaActual } = usePaginacion(medicionesFiltradas, 7);
    useEffect(() => {
        setPaginaActual(1);
    }, [busqueda, rangoFecha, setPaginaActual]);

    const cargarDatos = async () => {
        try {
            const respuesta = await obtenerMedicionesGases();
            setMediciones(Array.isArray(respuesta.data) ? respuesta.data : []);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const handleCrear = async () => {
        try {
            await crearMedicionGases({});
            cargarDatos();
       } catch (err) {
            // El aviso de error lo muestra api/axios.js; aquí solo se restaura lo guardado
            console.error("No se pudieron guardar los datos:", err);
            cargarDatos();
        }
    };

    const handleEliminar = async (id) => {
        if (window.confirm("¿Está seguro de eliminar este formato de medición?")) {
            try {
                await eliminarMedicionGases(id);
                cargarDatos();
            } catch (err) {
                setCargando(false);
            }
        }
    };

    if (cargando) return <LoadingScreen indeterminado/>
    return (
        <div className="list-grid">
            <header className="bienvenida">
                <PageWelcome
                    titulo="MEDICIÓN DE GASES"
                    descripcion="Este es el formato con el registro de gases."
                    mostrarHistorial={true}
                />
                <Searcher
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    rangoFecha={rangoFecha}
                    onRangoFechaChange={setRangoFecha}
                    placeholder="Buscar por código, fecha, hora"
                />
            </header>
            <div className="table-responsive">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Fecha</th>
                            <th>Hora</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cargando ? (
                            <tr>
                                <td colSpan="4" style={{ textAlign: "center" }}>Cargando mediciones...</td>
                            </tr>
                        ) : datosPagina.length > 0 ? (
                            datosPagina.map((m) => (
                                <tr key={m.id}>
                                    <td>{m.id}</td>
                                    <td>{m.measurement_date.split('-').reverse().join('/')}</td>
                                    <td>{m.measurement_time?.slice(0, 5)}</td>
                                    <td>
                                        <div className="btn-container">
                                            <BotonLink
                                                link={`/gases/gas_format/${m.id}`}
                                                clase="btn-azul"
                                                icono="fa-solid fa-eye"
                                                titulo="Ver registro"
                                            />
                                            <Boton
                                                clase="btn-2"
                                                icono="fa-solid fa-trash"
                                                onClick={() => handleEliminar(m.id)}
                                                titulo="Eliminar registro"
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" style={{ textAlign: "center" }}>
                                    {busqueda || rangoFecha ? "No se encontraron resultados" : "No hay mediciones registradas"}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="btn-container-page">
                <div className="btn-container">
                    <Boton
                        clase="btn-azul"
                        icono="fa-solid fa-plus"
                        texto="Nueva Medición"
                        onClick={handleCrear}
                        titulo="Registrar nueva medición de gases"
                    />
                    <Boton
                        clase="btn-azul"
                        icono="fa-solid fa-file-excel"
                        texto="Exportar Excel"
                        onClick={() => setShowRangoModal('excel')}
                        titulo="Exportar en un archivo de Excel"
                    />
                    <Boton
                        clase="btn-azul"
                        icono="fa-solid fa-file-pdf"
                        texto="Exportar PDF"
                        onClick={() => setShowRangoModal('pdf')}
                        titulo="Exportar en un archivo PDF"
                    />
                    <BotonLink
                        link="/gases/compare_gases"
                        clase="btn-azul"
                        icono="fa-solid fa-chart-line"
                        texto="Comparar mediciones"
                        titulo="Ir a la página de Comparación de gases"
                    />
                </div>
                {showRangoModal && (
                    <RangoFormModal
                        tipo={showRangoModal}
                        mediciones={mediciones} 
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

export default Gases;