import { Link } from "react-router-dom";
import { PageWelcome} from "../../components/common/welcome"; 
import { Boton,BotonLink } from "../../components/common/Button";

export function CardMachine() {
    return (
        <div className="page-layout">

            <PageWelcome
                titulo="Maquina"
                descripcion="Hoja de vida de la maquina."
            />
                <section className="cards">
                    <div className="card">
                        <div className="cont-img">
                            <img src="<?php echo htmlspecialchars($imagenmaquina); ?>" alt="Imagen de la máquina"/>
                        </div>
                    </div>
                    <div className="card" style={{ listStyle: 'none', fontSize: '1.25rem' }}>

                            <li><strong>NOMBRE:</strong> <span id="eb_nombre"></span></li>
                            <li><strong>CÓDIGO PROGRAMA:</strong> <span id="eb_codigoPrograma"></span></li>
                            <li><strong>MARCA:</strong> <span id="eb_marca"></span></li>
                            <li><strong>MODELO:</strong> <span id="eb_modelo"></span></li>
                            <li><strong>GARANTIA:</strong> <span id="eb_garantia"></span></li>
                            <li><strong>USO:</strong> <span id="eb_uso"> </span></li>
                    </div>
                </section>
                <section className="cards2">
                    <div className="card" style={{ listStyle: 'none', fontSize: '1.25rem' }}>        
                            <li><strong>EMPRESA:</strong> <span id="eb_empresaPrincipal">Sena Centro Minero</span></li>
                            <li><strong>LUGAR DE TRABAJO:</strong> <span id="eb_lugarTrabajo"></span></li>
                            <li><strong>UBICACIÓN:</strong> <span id="eb_ubicacionGeneral">Sena Centro Minero - Morca</span></li>
                            <li><strong>CIUDAD:</strong> <span id="eb_ciudad">Sogamoso</span></li>
                            <li><strong>FECHA ADQUISICION:</strong> <span id="eb_fecha"></span></li>
                            <li><strong>EQUIPO EN OPERACIÓN:</strong> <span id="eb_equipoOperacion"></span></li>
                            <li><strong>ESTADO:</strong> <span id="eb_estado"></span></li>
                        </div>
                    <div className="card" style={{ listStyle: 'none', fontSize: '1.25rem' }}>
                            <li><strong>RESPONSABLE:</strong> <span id="eb_responsable"></span></li>
                            <li><strong>SERIAL:</strong> <span id="eb_serial"></span></li>
                            <li><strong>CARACTERÍSTICAS:</strong> <span id="eb_caracteristicas"></span></li>
                    </div>
                </section>
                <section className="middle">
                    <div className="btn-container">
                        <button className="btn-azul" type="button"> 
                            <i className="fas fa-home"></i> Uso diario
                        </button>
                        <button className="btn-azul"><i className="fas fa-cog"></i> Pre operacional</button>
                        <a href="agregar_inspeccion.php"><button className="btn-azul"><i className="fas fa-search"></i> Inspeccion</button></a>
                        <BotonLink
                                                        link="/machines"
                                                        clase="btn-2"
                                                        icono="fa-solid fa-arrow-left"
                                                        texto="Regresar"
                                                    />
                    </div>
                </section>
        </div>
    )
}

