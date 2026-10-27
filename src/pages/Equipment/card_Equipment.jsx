import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { PageWelcome } from "../../components/common/welcome"; 
import { BotonLink } from "../../components/common/Button";
import { GetEquipmentById } from "../../api/Equipmentsapi";
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
                <div className="card">
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
                </div>
            
                <div className="card" style={{ listStyle: "none", fontSize: "1.25rem" }}> 
                    <li><strong>CÓDIGO:</strong><span>{equipo.code}</span></li>
                    <li><strong>NOMBRE:</strong><span>{equipo.name}</span></li>
                    <li><strong>MARCA:</strong> <span>{equipo.brand}</span></li>
                    <li><strong>MODELO:</strong> <span>{equipo.model}</span></li>
                    <li><strong>NÚMERO DE SERIE:</strong> <span>{equipo.serial_number}</span></li>
                    <li><strong>RESPONSABLE:</strong> <span>{equipo.responsible}</span></li>
                    <li><strong>UBICACIÓN:</strong> <span>{equipo.ubicacion.name}</span></li>
                    <li><strong>ESTADO:</strong> <span>{equipo.status="active"?"Activo":"Inactivo"}</span></li>
                    <li><strong>FECHA DE REGISTRO:</strong> <span>{equipo.registration_date}</span></li>
                    <li><strong>DESCRIPCIÓN:</strong> <span>{equipo.description}</span></li>
                </div>
            </section>
                <div className="btn-container" >
                    <BotonLink
                        link="/equipment"
                        clase="btn-2"
                        icono="fa-solid fa-arrow-left"
                        texto="Regresar"
                    />
                    <BotonLink
                        link={`/equipment/${id}/inspection`}
                        clase="btn-azul"
                        icono="fas fa-wind"
                        texto="Inspeccion"
                    />
                </div>

        </div>
     )
}
