import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { PageWelcome } from "../../components/common/welcome"; 
import { Boton, BotonLink } from "../../components/common/Button";
import { GetEquipmentById } from "../../api/Equipmentsapi";
import api from "../../api/axios";
import LoadingScreen from "../../components/LoadingScreen";
import imagenPorDefecto from "../../assets/img/Mantia - logo.png";
import { exportarFichaTecnicaEquipoExcelUnitario, exportarFichaTecnicaEquipoPdfUnitario } from "../../api/Equipmentsapi";

function obtenerUrlImagen(imagen) {
    if (!imagen) return imagenPorDefecto;
    if (/^https?:\/\//i.test(imagen)) return imagen;

    const ruta = imagen.replace(/^\/+/, "").replace(/^storage\//, "");
    const baseUrl = api.defaults.baseURL.replace(/\/+$/, "");
    return `${baseUrl}/storage/${ruta}`;
}

export function CardEquipment() {
    const { id } = useParams();
    const [equipo, setEquipo] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        setCargando(true);
        setError(false);
        GetEquipmentById(id)
            .then((data) => setEquipo(data))
            .catch((err) => {
                console.error("Error al cargar el equipo:", err);
                setError(true);
            })
            .finally(() => setCargando(false));
    }, [id]);

    if (cargando) return <LoadingScreen indeterminado />;

    return(
        <div className="cards-grid">
       
            <PageWelcome
                titulo={`Detalles de ${equipo.name}`}
                descripcion="Detalles del equipo."
                mostrarHistorial={true}
            />
            <section className="cards">
                <div className="table-responsive">
                    <table className="form">
                        <tbody>
                            <tr>
                                <td colSpan="2" rowSpan="4">
                                    <img className="logoSena" src="/src/assets/img/sena-logo-naranja.png" alt="SENA" />
                                </td>
                            </tr>
                            <tr>
                                <th colSpan="2">SISTEMA DE GESTIÓN DE SEGURIDAD Y SALUD EN EL TRABAJO</th>
                                <th>CÓDIGO:</th>
                                <td>FT-SST 002</td>
                            </tr>
                            <tr>
                                <th colSpan="2">PROGRAMA DE MANTENIMIENTO</th>
                                <th>VERSIÓN:</th>
                                <td>1.0</td>
                            </tr>
                            <tr>
                                <th colSpan="2">FICHA TÉCNICA {equipo?.name?.toUpperCase()}</th>
                                <th>FECHA:</th>
                                <td>8/09/2021</td>
                            </tr>
                            <tr>
                                <th colSpan="6">IMAGEN:</th>
                            </tr>
                            <tr>
                                <td colSpan="6">
                                    <div className="equipment-image-container">
                                        <img
                                            src={obtenerUrlImagen(equipo.image)}
                                            alt="Imagen del equipo"
                                            onError={(e) => {
                                                e.currentTarget.onerror = null;
                                                e.currentTarget.src = imagenPorDefecto;
                                            }}
                                        />
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <th>CÓDIGO:</th>
                                <td>{equipo.code}</td>
                                <th>NOMBRE:</th>
                                <td>{equipo.name}</td>
                                <th>PLACA:</th>
                                <td>{equipo.plate}</td>
                            </tr>
                            <tr>
                                <th>MODELO:</th>
                                <td>{equipo.model}</td>
                                <th>NÚMERO DE SERIE:</th>
                                <td>{equipo.serial_number}</td>
                                <th>FECHA DE INICIO:</th>
                                <td>{equipo.start_up_date}</td>
                            </tr>
                            <tr>
                                <th>UBICACIÓN:</th>
                                <td>{equipo.ubicacion.name}</td>
                                <th>RESPONSABLE:</th>
                                <td>{equipo.responsible}</td>
                                <th>ESTADO:</th>
                                <td>{equipo.status="active"?"Activo":"Inactivo"}</td>
                            </tr>
                            <tr>
                                <th>CONSUMIBLE:</th>
                                <td>{equipo.fuel}</td>
                                <th>POTENCIA:</th>
                                <td>{equipo.power}</td>
                                <th>VOLTAJE:</th>
                                <td>{equipo.voltage}</td>
                            </tr>
                            <tr>
                                <th colSpan="6"> DESCRIPCIÓN: </th>
                            </tr>
                            <tr>
                                <td colSpan="6">{equipo.description}</td>
                            </tr>
                        </tbody>
                    </table>
                    </div>

            </section>
                <div className="btn-container">
                    <BotonLink
                        link={`/equipment/cardequipment/${id}/inspection`}
                        clase="btn-azul"
                        icono="fas fa-wind"
                        texto="Inspección"
                        titulo="Ir a la inspección del equipo"
                    />
                    <Boton
                        clase="btn-3"
                        icono="fa-solid fa-file-excel"
                        texto="Exportar Excel"
                        onClick={() => exportarFichaTecnicaEquipoExcelUnitario(equipo.id, equipo.name)}
                        titulo="Exportar ficha técnica en un archivo de Excel"
                    />
                    <Boton
                        clase="btn-3"
                        icono="fa-solid fa-file-pdf"
                        texto="Exportar PDF"
                        onClick={() => exportarFichaTecnicaEquipoPdfUnitario(equipo.id, equipo.name)}
                        titulo="Exportar ficha técnica en un archivo PDF"
                    />
                    <div className="footer-btns">
                        <BotonLink
                            link={equipo.category === "Consumible" ? "/equipment/consumables" : "/equipment/noconsumables"}
                            clase="btn-regresar"
                            icono="fa-solid fa-arrow-left"
                            texto="Regresar"
                            titulo={`Regresar a la lista de equipos ${equipo.category === "Consumible" ? "consumibles" : "no consumibles"}`}
                        />
                    </div>
                </div>

        </div>
     )
}
