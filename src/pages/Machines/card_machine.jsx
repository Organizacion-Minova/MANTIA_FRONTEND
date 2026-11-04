import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { PageWelcome } from "../../components/common/welcome"; 
import { Boton,BotonLink } from "../../components/common/Button";
import { GetMachineById } from "../../api/machinesapi";
import api from "../../api/axios";
import LoadingScreen from "../../components/LoadingScreen";
import imagenPorDefecto from "../../assets/img/Mantia - logo.png";

function obtenerUrlImagen(imagen) {
    if (!imagen) return imagenPorDefecto;
    if (/^https?:\/\//i.test(imagen)) return imagen;

    const ruta = imagen.replace(/^\/+/, "").replace(/^storage\//, "");
    const baseUrl = api.defaults.baseURL.replace(/\/+$/, "");
    return `${baseUrl}/storage/${ruta}`;
}

export function CardMachine() {
    const { id } = useParams();
    const [maquina, setMaquina] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        setCargando(true);
            setError(false);
            GetMachineById(id)
                .then((data) => setMaquina(data))
            .catch((err) => {
                console.error("Error al cargar el equipo:", err);
                setError(true);
            })
            .finally(() => setCargando(false));
    }, [id]);

    if (cargando) return <LoadingScreen indeterminado/>;

    return (
        <div className="cards-grid">

            <PageWelcome
                titulo={`Detalles de ${maquina.name}`}
                descripcion="Hoja de vida de la máquina."
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
                                    <th colSpan="2">FICHA TÉCNICA {maquina.name}</th>
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
                                                src={obtenerUrlImagen(maquina.image)}
                                                alt="Imagen de la maquina"
                                                onError={(m) => {
                                                    m.currentTarget.onerror = null;
                                                    m.currentTarget.src = imagenPorDefecto;
                                                }}
                                            />
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <th>CÓDIGO:</th>
                                    <td>{maquina.code}</td>
                                    <th>NOMBRE:</th>
                                    <td>{maquina.name}</td>
                                    <th>Placa:</th>
                                    <td>{maquina.plate}</td>
                                </tr>
                                <tr>
                                    <th>MODELO:</th>
                                    <td>{maquina.model}</td>
                                    <th>NÚMERO DE SERIE:</th>
                                    <td>{maquina.serial_number}</td>
                                    <th>FECHA DE INICIO:</th>
                                    <td>{maquina.start_up_date}</td>
                                </tr>
                                <tr>
                                    <th>UBICACIÓN:</th>
                                    <td>{maquina.ubicacion.name}</td>
                                    <th>RESPONSABLE:</th>
                                    <td>{maquina.responsible}</td>
                                    <th>ESTADO:</th>
                                    <td>{maquina.status="active"?"Activo":"Inactivo"}</td>
                                </tr>
                                <tr>
                                    <th>CONSUMIBLE:</th>
                                    <td>{maquina.fuel}</td>
                                    <th>POTENCIA:</th>
                                    <td>{maquina.power}</td>
                                    <th>VOLTAJE:</th>
                                    <td>{maquina.voltage}</td>
                                </tr>
                                <tr>
                                    <th colSpan="6"> DESCRIPCIÓN: </th>
                                </tr>
                                <tr>
                                    <td colSpan="6">{maquina.characteristics}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
                
                    <div className="btn-container">
                        <BotonLink
                            link="/dailyuse"
                            clase="btn-azul"
                            icono="fas fa-home"
                            texto="Uso diario"
                        />
                        <Boton
                            clase="btn-azul"
                            icono="fas fa-cog"
                            texto="Pre operacional"
                        />
                        <BotonLink
                            link="/machines/cardMachine/inspection"
                            clase="btn-azul"
                            icono="fas fa-search"
                            texto="Inspeccion"
                        />
                        <BotonLink
                            link="/machines"
                            clase="btn-2"
                            icono="fa-solid fa-arrow-left"
                            texto="Regresar"
                        />
                    </div>
        </div>
    )
}
