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
                                <td colSpan="2">SISTEMA DE GESTIÓN DE SEGURIDAD Y SALUD EN EL TRABAJO</td>
                                <td>CÓDIGO:</td>
                                <td>FT-SST 002</td>
                            </tr>
                            <tr>
                                <td colSpan="2">PROGRAMA DE MANTENIMIENTO</td>
                                <td>VERSIÓN:</td>
                                <td>1.0</td>
                            </tr>
                            <tr>
                                <td colSpan="2">FICHA TÉCNICA {equipo.name}</td>
                                <td>FECHA:</td>
                                <td>8/09/2021</td>
                            </tr>
                            <tr>
                                <td colSpan="6">IMAGEN:</td>
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
                                <td>CÓDIGO:</td>
                                <td>{equipo.code}</td>
                                <td>NOMBRE:</td>
                                <td>{equipo.name}</td>
                                <td>Placa:</td>
                                <td>{equipo.plate}</td>
                            </tr>
                            <tr>
                                <td>MODELO:</td>
                                <td>{equipo.model}</td>
                                <td>NÚMERO DE SERIE:</td>
                                <td>{equipo.serial_number}</td>
                                <td>FECHA DE INICIO:</td>
                                <td>{equipo.start_up_date}</td>
                            </tr>
                            <tr>
                                <td>UBICACIÓN:</td>
                                <td>{equipo.ubicacion.name}</td>
                                <td>RESPONSABLE:</td>
                                <td>{equipo.responsible}</td>
                                <td>ESTADO:</td>
                                <td>{equipo.status="active"?"Activo":"Inactivo"}</td>
                            </tr>
                            <tr>
                                <td>CONSUMIBLE:</td>
                                <td>{equipo.fuel}</td>
                                <td>POTENCIA:</td>
                                <td>{equipo.power}</td>
                                <td>VOLTAJE:</td>
                                <td>{equipo.voltage}</td>
                            </tr>
                            <tr>
                                <td colSpan="6"> DESCRIPCIÓN: </td>
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
                        link={`/equipment/${id}/inspection`}
                        clase="btn-azul"
                        icono="fas fa-wind"
                        texto="Inspección"
                    />
                    <Boton
                        clase="btn-azul"
                        icono="fa-solid fa-file-excel"
                        texto="Exportar Excel"
                        onClick={() => exportarFichaTecnicaEquipoExcelUnitario(equipo.id, equipo.name)}
                        titulo="Exportar ficha técnica en un archivo de Excel"
                    />
                    <Boton
                        clase="btn-azul"
                        icono="fa-solid fa-file-pdf"
                        texto="Exportar PDF"
                        onClick={() => exportarFichaTecnicaEquipoPdfUnitario(equipo.id, equipo.name)}
                        titulo="Exportar ficha técnica en un archivo PDF"
                    />
                    <BotonLink
                        link="/equipment"
                        clase="btn-2"
                        icono="fa-solid fa-arrow-left"
                        texto="Regresar"
                    />
                </div>

        </div>
     )
}
