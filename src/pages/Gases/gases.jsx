import { useState, useEffect } from "react";
import { Boton, BotonLink } from "../../components/common/Button";
import { PageWelcome, Searcher } from "../../components/common/welcome";
import { obtenerMedicionesGases, crearMedicionGases, eliminarMedicionGases } from "../../api/gasMeasurement";
import { useSearch } from "../../hooks/useSearch";
import LoadingScreen from "../../components/LoadingScreen";
import { usePaginacion, Paginacion } from "../../components/common/Paginacion";
import { useToast } from "../../context/ToastContext.jsx";

function Gases() {
    const [mediciones, setMediciones] = useState([]);
    const [cargando, setCargando] = useState(true);
    const { advertencia } = useToast();

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
        const hoy = new Date().toLocaleDateString('en-CA');
        if (mediciones.some((m) => m.measurement_date === hoy)) {
            advertencia("Ya existe una medición de gases registrada para el día de hoy.", "Medición duplicada");
            return;
        }
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
                alert(err.response?.data?.message || "No se pudo eliminar la medición de gases.");
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
                                                title="Ver detalle"
                                            />
                                            <Boton
                                                clase="btn-2"
                                                icono="fa-solid fa-trash"
                                                title="Eliminar"
                                                onClick={() => handleEliminar(m.id)}
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
                        title="Crear el formato de hoy"
                        onClick={handleCrear}
                    />
                    <BotonLink
                        link="/gases/compare_gases"
                        clase="btn-azul"
                        icono="fa-solid fa-chart-line"
                        texto="Comparar mediciones"
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

export default Gases;