import { useState, useEffect, useMemo } from "react";
import { Boton, BotonAccion, BotonLink } from "../../components/common/Button";
import { PageWelcome, Searcher } from "../../components/common/welcome";
import { Form, Date as InputDate, Select } from "../../components/common/forms";
import { useSearch } from "../../hooks/useSearch";
import LoadingScreen from "../../components/LoadingScreen";
import { usePaginacion, Paginacion } from "../../components/common/Paginacion";
import { useToast } from "../../context/ToastContext.jsx";
import {
    obtenerHistorialNotificaciones,
    marcarComoLeida,
    marcarTodasComoLeidas,
    exportarAlertasExcelRango,
    exportarAlertasPdfRango,
} from "../../api/notificaciones";
import { mapearNotificacionBackend, rutaDeAlerta } from "../../utils/notificaciones";
import verIcono from "../../assets/icons/ver.svg";
import reestablecerFiltrosIcon from "../../assets/icons/reestablecerFiltros.svg";
import excelIcon from "../../assets/icons/excel.svg"
import pdfIcon from "../../assets/icons/pdf.svg"
import excelIcon2 from "../../assets/icons/excel2.svg"
import pdfIcon2 from "../../assets/icons/pdf2.svg"
import marcarComoLeidaIconDark from "../../assets/icons/marcarcomoleidas.svg"
import completarIcon from "../../assets/icons/confirmado2.svg"

const NIVELES = [
    { valor: "danger", etiqueta: "Grave", clase: "badge-grave" },
    { valor: "warning", etiqueta: "Advertencia", clase: "badge-importante" },
    { valor: "info", etiqueta: "Informativa", clase: "badge-info" },
    { valor: "success", etiqueta: "Éxito", clase: "badge-bien" },
];
const NIVEL_POR_CLAVE = Object.fromEntries(NIVELES.map((n) => [n.valor, n]));

const CAMPOS_BUSQUEDA = ["titulo", "mensaje", "nivelTexto"];
const DIAS_MAXIMOS = 31;

const fechaLocalHoy = () => {
    const hoy = new Date();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");
    return `${hoy.getFullYear()}-${mes}-${dia}`;
};

const formatearFecha = (iso) =>
    new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" });

const formatearHora = (iso) =>
    new Date(iso).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: false });

const prepararAlerta = (registro) => {
    const n = mapearNotificacionBackend(registro);
    return {
        ...n,
        nivelTexto: NIVEL_POR_CLAVE[n.tipo]?.etiqueta ?? n.tipo,
        estado: n.leida ? "leida" : "sin_leer",
    };
};

function RangoFormModal({ tipo, onCancel, onSuccess }) {
    const [formData, setFormData] = useState({ fecha_inicio: "", fecha_fin: "", nivel: "" });
    const { advertencia } = useToast();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        const { fecha_inicio, fecha_fin, nivel } = formData;
        if (!fecha_inicio || !fecha_fin) {
            advertencia("Debe seleccionar ambas fechas.");
            return;
        }
        if (fecha_fin > fechaLocalHoy()) {
            advertencia("La fecha final no puede ser mayor a la actual.");
            return;
        }
        if (fecha_fin < fecha_inicio) {
            advertencia("La fecha final no puede ser menor a la fecha de inicio.");
            return;
        }
        const diffTime = Math.abs(new Date(fecha_fin) - new Date(fecha_inicio));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        if (diffDays > DIAS_MAXIMOS) {
            advertencia(`El rango máximo permitido es de ${DIAS_MAXIMOS} días.`);
            return;
        }

        try {
            if (tipo === "excel") {
                await exportarAlertasExcelRango(fecha_inicio, fecha_fin, nivel);
            } else {
                await exportarAlertasPdfRango(fecha_inicio, fecha_fin, nivel);
            }
            onSuccess();
        } catch (err) {
            advertencia(err.mensajeServidor || "No se pudieron exportar las alertas.");
        }
    };

    return (
        <Form
            titulo={`Exportar en archivo ${tipo}`}
            descripcion="Seleccione el rango de fechas de las alertas que desea exportar"
            onCancel={onCancel}
            onSubmit={handleSubmit}
            textoBoton="Descargar"
            iconoBoton='fa-solid fa-download'
            tituloBoton="Descargar"
        >
            <div className="col-span-3">
                <InputDate 
                    label="Fecha Inicio:" 
                    id="fecha_inicio" 
                    name="fecha_inicio" 
                    value={formData.fecha_inicio} onChange={handleChange} 
                />
            </div>
            <div className="col-span-3">
                <InputDate 
                    label="Fecha Fin:" 
                    id="fecha_fin" 
                    name="fecha_fin" 
                    value={formData.fecha_fin} 
                    onChange={handleChange} 
                />
            </div>
            <div className="col-span-6">
                <Select
                    label="Nivel:"
                    id="nivel"
                    name="nivel"
                    value={formData.nivel}
                    onChange={handleChange}
                    opciones={[
                        { valor: "", etiqueta: "Todos los niveles" },
                        ...NIVELES.map(({ valor, etiqueta }) => ({ valor, etiqueta })),
                    ]}
                />
            </div>
        </Form>
    );
}

function Alertas() {
    const [alertas, setAlertas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [showRangoModal, setShowRangoModal] = useState(null);

    const {
        busqueda, setBusqueda, rangoFecha, setRangoFecha,
        filtrosEspeciales, setFiltroEspecial, itemsFiltrados: alertasFiltradas,
    } = useSearch(alertas, CAMPOS_BUSQUEDA, "fecha");
    const hayRangoFechaActivo = typeof rangoFecha === "string"
        ? rangoFecha.trim() !== ""
        : Object.values(rangoFecha || {}).some((v) => v !== "" && v != null);
    const hayFiltros =
        busqueda.trim() !== "" ||
        hayRangoFechaActivo ||
        Object.values(filtrosEspeciales).some((v) => v !== "" && v != null);

    const handleBorrarFiltros = () => {
        setBusqueda("");
        setRangoFecha({ fecha_inicio: "", fecha_fin: "" });
        Object.keys(filtrosEspeciales).forEach((campo) => setFiltroEspecial(campo, ""));
        setPaginaActual(1);
    };

    const { datosPagina, paginaActual, totalPaginas, setPaginaActual } = usePaginacion(alertasFiltradas, 7);
    useEffect(() => {
        setPaginaActual(1);
    }, [busqueda, rangoFecha, filtrosEspeciales, setPaginaActual]);

    useEffect(() => {
        let activo = true;
        obtenerHistorialNotificaciones()
            .then((datos) => { if (activo) setAlertas(datos.map(prepararAlerta)); })
            .catch((error) => console.error("No se pudieron cargar las alertas", error))
            .finally(() => { if (activo) setCargando(false); });
        return () => { activo = false; };
    }, []);

    const avisarALaCampana = () => window.dispatchEvent(new Event("notificaciones:actualizar"));

    const handleMarcarLeida = async (id) => {
        try {
            await marcarComoLeida(id);
            setAlertas((prev) => prev.map((n) => (n.id === id ? { ...n, leida: true, estado: "leida" } : n)));
            avisarALaCampana();
        } catch (error) {
            console.error("No se pudo marcar la alerta como leída", error);
        }
    };

    const handleMarcarTodas = async () => {
        try {
            await marcarTodasComoLeidas();
            setAlertas((prev) => prev.map((n) => ({ ...n, leida: true, estado: "leida" })));
            avisarALaCampana();
        } catch (error) {
            console.error("No se pudieron marcar las alertas como leídas", error);
        }
    };

    const categoriasUnicas = useMemo(() => {
        const mapa = new Map();
        alertas.forEach((n) => mapa.set(n.categoria, n.titulo));
        return [...mapa].map(([valor, etiqueta]) => ({ valor, etiqueta })).sort((a, b) => a.etiqueta.localeCompare(b.etiqueta));
    }, [alertas]);

    const sinLeer = alertas.filter((n) => !n.leida).length;

    if (cargando) return <LoadingScreen indeterminado />;
    return (
        <div className="list-grid">
            <header className="bienvenida">
                <PageWelcome titulo="ALERTAS" descripcion="Este es el historial de alertas del sistema." mostrarHistorial={true} />
                <Searcher
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    rangoFecha={rangoFecha}
                    onRangoFechaChange={setRangoFecha}
                    placeholder="Buscar por categoría, nivel o mensaje"
                    filtrosAdicionales={
                        <>
                            <Select
                                id="filtro-nivel" name="filtro-nivel"
                                value={filtrosEspeciales.tipo || ""}
                                onChange={(e) => setFiltroEspecial("tipo", e.target.value)}
                                opciones={[{ valor: "", etiqueta: "Todos los niveles" }, ...NIVELES.map(({ valor, etiqueta }) => ({ valor, etiqueta }))]}
                            />
                            <Select
                                id="filtro-categoria" name="filtro-categoria"
                                value={filtrosEspeciales.categoria || ""}
                                onChange={(e) => setFiltroEspecial("categoria", e.target.value)}
                                opciones={[{ valor: "", etiqueta: "Todas las categorías" }, ...categoriasUnicas]}
                            />
                            <Select
                                id="filtro-estado" name="filtro-estado"
                                value={filtrosEspeciales.estado || ""}
                                onChange={(e) => setFiltroEspecial("estado", e.target.value)}
                                opciones={[
                                    { valor: "", etiqueta: "Todos los estados" },
                                    { valor: "sin_leer", etiqueta: "Sin leer" },
                                    { valor: "leida", etiqueta: "Leídas" },
                                ]}
                            />
                            {hayFiltros && (
                                <BotonAccion
                                    clase='btn-borrar'
                                    icono={reestablecerFiltrosIcon}
                                    texto="Borrar filtros"
                                    onClick={handleBorrarFiltros}
                                    titulo="Quitar la búsqueda y todos los filtros"
                                />
                            )}
                        </>
                    }
                />
            </header>
            <div className="table-responsive">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Fecha</th><th>Hora</th><th>Categoría</th><th>Nivel</th>
                            <th>Mensaje</th><th>Estado</th><th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {datosPagina.length > 0 ? (
                            datosPagina.map((n) => {
                                const nivel = NIVEL_POR_CLAVE[n.tipo] ?? NIVEL_POR_CLAVE.info;
                                const ruta = rutaDeAlerta(n);
                                return (
                                    <tr key={n.id}>
                                        <td>{formatearFecha(n.fecha)}</td>
                                        <td>{formatearHora(n.fecha)}</td>
                                        <td>{n.titulo}</td>
                                        <td><span className={`nivel-badge ${nivel.clase}`}>{nivel.etiqueta}</span></td>
                                        <td>{n.mensaje}</td>
                                        <td>{n.leida ? "Leída" : "Sin leer"}</td>
                                        <td>
                                            <div className="btn-container__acciones">
                                                {ruta && (
                                                    <BotonLink 
                                                        link={ruta} 
                                                        clase="btn-azul" 
                                                        img={verIcono} 
                                                        titulo="Ir a la pantalla de esta alerta" 
                                                    />
                                                )}
                                                {!n.leida && (
                                                    <BotonAccion
                                                        clase="btn-editar"
                                                        icono={completarIcon}
                                                        onClick={() => handleMarcarLeida(n.id)}
                                                        titulo="Marcar como leída"
                                                    />
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="7" style={{ textAlign: "center" }}>
                                    {hayFiltros
                                        ? "No se encontraron resultados"
                                        : "No hay alertas registradas"}
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
 
                        img={marcarComoLeidaIconDark}
                        texto="Marcar todas como leídas"
                        onClick={handleMarcarTodas} 
                        disabled={sinLeer === 0} 
                        titulo="Marcar todas las alertas como leídas" 
                    />
                    <Boton 
                        clase="btn-3" 
                        img={excelIcon}
                        imgDark={excelIcon2}
                        texto="Exportar Excel"
                        onClick={() => setShowRangoModal("excel")} 
                        titulo="Exportar en un archivo de Excel" 
                    />
                    <Boton 
                        clase="btn-3" 
                        img={pdfIcon}
                        imgDark={pdfIcon2}
                        texto="Exportar PDF"
                        onClick={() => setShowRangoModal("pdf")} 
                        titulo="Exportar en un archivo PDF" 
                    />
                    
                </div>
                {showRangoModal && (
                    <RangoFormModal 
                        tipo={showRangoModal} 
                        onCancel={() => setShowRangoModal(null)} 
                        onSuccess={() => setShowRangoModal(null)} 
                    />
                )}
                <Paginacion paginaActual={paginaActual} totalPaginas={totalPaginas} setPaginaActual={setPaginaActual} />
            </div>
        </div>
    );
}

export default Alertas;