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
            />
                <section className="cards">
                    <div className="card">
                        <div className="equipment-image-container">
                            <img
                                src={obtenerUrlImagen(maquina.image)}
                                alt="Imagen de la máquina"
                                onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = imagenPorDefecto;
                                }}
                            />
                        </div>
                    </div>
                    <div className="card" style={{ listStyle: 'none', fontSize: '1.25rem' }}>

                            <li><strong>NOMBRE:</strong> <span >{maquina.name}</span></li>
                            <li><strong>CÓDIGO PROGRAMA:</strong> <span>{maquina.code}</span></li>
                            <li><strong>MARCA:</strong> <span id="eb_marca">{maquina.company?.name||""}</span></li>
                            <li><strong>MODELO:</strong> <span id="eb_modelo">{maquina.model}</span></li>
                            <li><strong>GARANTIA:</strong> <span id="eb_garantia">{maquina.warranty}</span></li>
                            <li><strong>USO:</strong> <span id="eb_uso"> {maquina.machine_usage} </span></li>

                    </div>
                </section>
                <section className="cards2">
                    <div className="card" style={{ listStyle: 'none', fontSize: '1.25rem' }}>        
                            <li><strong>EMPRESA:</strong> <span id="eb_empresaPrincipal">Sena Centro Minero</span></li>
                            <li><strong>LUGAR DE TRABAJO:</strong> <span id="eb_lugarTrabajo">Mina didactica</span></li>
                            <li><strong>UBICACIÓN:</strong> <span id="eb_ubicacionGeneral">{maquina.location}</span></li>
                            <li><strong>CIUDAD:</strong> <span id="eb_ciudad">Sogamoso</span></li>
                            <li><strong>FECHA ADQUISICION:</strong> <span id="eb_fecha">{maquina.acquisition_date}</span></li>
                            <li><strong>EQUIPO EN OPERACIÓN:</strong> <span id="eb_equipoOperacion">{maquina.in_operation}</span></li>
                            <li><strong>ESTADO:</strong> <span id="eb_estado">{maquina.status==="active"?"Activo":maquina.status==="inactive"?"Inactivo":maquina.status==="maintenance"?"En mantenimiento":"Desconocido"}</span></li>
                        </div>
                    <div className="card" style={{ listStyle: 'none', fontSize: '1.25rem' }}>
                            <li><strong>RESPONSABLE:</strong> <span id="eb_responsable">{maquina.responsible}</span></li>
                            <li><strong>SERIAL:</strong> <span id="eb_serial">{maquina.serial_number}</span></li>
                            <li><strong>CARACTERÍSTICAS:</strong> <span id="eb_caracteristicas">{maquina.characteristics}</span></li>
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

