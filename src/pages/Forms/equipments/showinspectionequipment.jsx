import {useEffect, useState} from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { PageWelcome } from "../../../components/common/welcome";
import { Boton, BotonLink } from "../../../components/common/Button";
import LoadingScreen from "../../../components/LoadingScreen";
import { GetEquipmentInspections, GetEquipmentInspectionById } from "../../../api/Equipmentsapi";
import api from "../../../api/axios";

const FORMATO = { codigo: "SST", version: "01", fecha: "11/06/2024" };
const estiloCuadroFirma = {
    display: "grid",
    placeItems: "center",
    width: "100%",
    height: "110px",
    margin: "0 auto 8px",
    padding: "6px",
    boxSizing: "border-box",
    overflow: "hidden",
    border: "1px solid #cbd5e1",
    borderRadius: "4px",
    backgroundColor: "#fff",
};
const estiloImagenFirma = {
    display: "block",
    width: "100%",
    height: "100%",
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain",
    objectPosition: "center",
};

function urlFirma(ruta) {
    if (!ruta) return null;
    const limpia = ruta.replace(/^\/+/, "").replace(/^storage\//, "");
    return `${api.defaults.baseURL.replace(/\/+$/, "")}/storage/${limpia}`;
}
function formatearFecha(fecha) {
    if (!fecha) return "";
    const [y, m, d] = fecha.slice(0, 10).split("-");
    return `${d}/${m}/${y}`;
}

function ListaInspecciones({ equipmentId }) {
    const [inspecciones, setInspecciones] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        setCargando(true);
        setError("");
        GetEquipmentInspections(equipmentId)
            .then((res) => setInspecciones(res.data ?? res)) 
            .catch(() => setError("No se pudieron cargar las inspecciones."))
            .finally(() => setCargando(false));
    }, [equipmentId]);

    if (cargando) return <LoadingScreen indeterminado />;

    return(
        <div className="list-grid">
            <header>
                <PageWelcome
                    titulo="INSPECCIONES REALIZADAS"
                    descripcion="Selecciona una inspección para ver su formato."
                />
            </header>

            <div className="btn-container">
                <BotonLink
                    link={`/equipment/${equipmentId}/inspection/complete`}
                    clase="btn-azul"
                    icono="fa-solid fa-plus"
                    texto="Nueva inspección"
                />
            </div>
            {inspecciones.length > 0 && (
                <div className="table-responsive">
                    <table className="form">
                        <thead>
                            <tr>
                                <th>FECHA</th>
                                <th>EQUIPO</th>
                                <th>RESPONSABLE</th>
                                <th>ÁREA</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {inspecciones.map((i) => (
                                <tr key={i.id}>
                                    <td>{formatearFecha(i.inspection_date)}</td>
                                    <td>{i.equipo?.name}</td>
                                    <td>{i.inspector_name}</td>
                                    <td>{i.area}</td>
                                    <td>
                                        <Link to={`/equipment/${equipmentId}/inspection/show/${i.id}`}>
                                            Ver formato
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

function FormatoInspeccion({ equipmentId, inspectionId }) {
    const [inspeccion, setInspeccion] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        setCargando(true);
        setError("");
        GetEquipmentInspectionById(inspectionId)
            .then(setInspeccion)
            .catch(() => setError("No se pudo cargar la inspección."))
            .finally(() => setCargando(false));
    }, [inspectionId]);

    if (cargando) return <LoadingScreen indeterminado />;
    if (error || !inspeccion) {
        return (
            <div>
                <PageWelcome titulo="INSPECCIÓN" descripcion="No se pudo cargar el resumen de la inspección." />
                <p role="alert">{error || "No se encontró la inspección."}</p>
            </div>
        );
    }

    const respuestas = [...inspeccion.answers].sort(
        (a, b) => (a.question?.position ?? 0) - (b.question?.position ?? 0)
    );
    const firmaResp = urlFirma(inspeccion.responsible_signature);
    const firmaAlm = urlFirma(inspeccion.warehouse_manager_signature);
    const nombreEquipo = (inspeccion.equipo?.name ?? "").toUpperCase();

    return (
        <div className="list-grid">
            <header>
                <PageWelcome
                    titulo="INSPECCIÓN REALIZADA"
                    descripcion="Resumen del formulario diligenciado."
                />
            </header>

            <div className="btn-container">
                <BotonLink
                    link={`/equipment/${equipmentId}/inspection/show`}
                    clase="btn-2"
                    icono="fa-solid fa-list"
                    texto="Todas las inspecciones"
                />
                <BotonLink
                    link={`/equipment/${equipmentId}/inspection/complete`}
                    clase="btn-2"
                    icono="fa-solid fa-plus"
                    texto="Nueva inspección"
                />
                <Boton clase="btn-azul" icono="fa-solid fa-print" texto="Imprimir" onClick={() => window.print()} />
            </div>

            <div className="table-responsive">
                <table className="form">
                    <tbody>
                        <tr>
                            <td rowSpan="3">
                                <img className="logoSenaFooter" src="/src/assets/img/logo-sena-blanco.png" alt="SENA" />
                            </td>
                            <td rowSpan="3">INSPECCIÓN {nombreEquipo}</td>
                            <td><strong>FORMATO</strong> {FORMATO.codigo}</td>
                        </tr>
                        <tr>
                            <td><strong>VERSIÓN</strong> {FORMATO.version}</td>
                        </tr>
                        <tr>
                            <td><strong>FECHA DE REALIZACIÓN:</strong> {FORMATO.fecha}</td>
                        </tr>
                    </tbody>
                </table>

                <table className="form">
                    <tbody>
                        <tr>
                            <td colSpan="2">
                                <strong>NOMBRE DEL RESPONSABLE DE LA INSPECCIÓN:</strong> {inspeccion.inspector_name}
                            </td>
                            <td><strong>FECHA:</strong> {formatearFecha(inspeccion.inspection_date)}</td>
                            <td><strong>HORA:</strong> {inspeccion.inspection_time?.slice(0, 5)}</td>
                        </tr>
                        <tr>
                            <td><strong>MARCA DE LA HERRAMIENTA:</strong> {inspeccion.equipment_brand}</td>
                            <td><strong>VOLTAJE:</strong> {inspeccion.voltage}</td>
                            <td colSpan="2"><strong>SERIAL:</strong> {inspeccion.serial_number}</td>
                        </tr>
                        <tr>
                            <td colSpan="4"><strong>ÁREA:</strong> {inspeccion.area}</td>
                        </tr>
                    </tbody>
                </table>

                <table className="form">
                    <thead>
                        <tr>
                            <th>ASPECTOS A EVALUAR</th>
                            <th>SI</th>
                            <th>NO</th>
                            <th>N/A</th>
                            <th>OBSERVACIONES</th>
                        </tr>
                    </thead>
                    <tbody>
                        {respuestas.map((r) => (
                            <tr key={r.id}>
                                <td>{r.question?.text}</td>
                                <td className="fmt-centro">{r.answer === "yes" && "X"}</td>
                                <td className="fmt-centro">{r.answer === "no" && "X"}</td>
                                <td className="fmt-centro">{r.answer === "na" && "X"}</td>
                                <td>{r.observation}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <table className="form">
                    <tbody>
                        <tr>
                            <td colSpan="2" className="fmt-obs">
                                <strong>OBSERVACIONES:</strong> {inspeccion.general_observations}
                            </td>
                        </tr>
                        <tr>
                            <td className="fmt-firma" style={{ textAlign: "center", verticalAlign: "middle" }}>
                                <div className="fmt-firma-img" style={estiloCuadroFirma}>
                                    {firmaResp && <img src={firmaResp} alt="Firma del responsable" style={estiloImagenFirma} />}
                                </div>
                                <strong>FIRMA Y CARGO RESPONSABLE</strong>
                                <div>{inspeccion.inspector_name}</div>
                                <div>{inspeccion.responsible_position}</div>
                            </td>
                            <td className="fmt-firma" style={{ textAlign: "center", verticalAlign: "middle" }}>
                                <div className="fmt-firma-img" style={estiloCuadroFirma}>
                                    {firmaAlm && <img src={firmaAlm} alt="Firma del responsable de almacén" style={estiloImagenFirma} />}
                                </div>
                                <strong>FIRMA DE RESPONSABLE ALMACÉN</strong>
                                <div>{inspeccion.warehouse_manager_name}</div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function MostrarInspeccionEquipo() {
    const { id, inspectionId } = useParams();
    
    return inspectionId
        ? <FormatoInspeccion equipmentId={id} inspectionId={inspectionId} />
        : <ListaInspecciones equipmentId={id} />;
}

export default MostrarInspeccionEquipo