import { Link } from "react-router-dom";
import { PageWelcome, Searcher } from "../../components/common/welcome"; 
import { Boton,BotonLink } from "../../components/common/Button";

export function CardEquipment() {
     return(
        <div className="page-layout">
       
            <PageWelcome
                titulo="Equipo"
                descripcion="Hoja de vida del equipo."
            />
            <section className="cards">
                <div className="card">
                    <div className="cont-img">
                        <img src="<?php echo htmlspecialchars($imagenEquipo); ?>" alt="Imagen del equipo"/>
                    </div>
                </div>
            
                <div className="card" style={{ listStyle: "none", fontSize: "1.25rem" }}> 
                    <li><strong>NOMBRE:</strong> <span id="eb_nombre"></span></li>
                    <li><strong>CÓDIGO:</strong> <span id="eb_codigoPrograma"></span></li>
                    <li><strong>MARCA:</strong> <span id="eb_marca"></span></li>
                    <li><strong>MODELO:</strong> <span id="eb_modelo"></span></li>
                    <li><strong>DESCRIPCIÓN:</strong> <span id="eb_descripcion"></span></li>
                    <li><strong>NÚMERO DE SERIE:</strong> <span id="eb_serie"></span></li>
                    <li><strong>RESPONSABLE:</strong> <span id="eb_responsable"></span></li>
                    <li><strong>UBICACIÓN:</strong> <span id="eb_ubicacion"></span></li>
                    <li><strong>ESTADO:</strong> <span id="eb_estado"></span></li>
                    <li><strong>FECHA DE REGISTRO:</strong> <span id="eb_fecha"></span></li>
                </div>
            </section>
                <div className="btn-container" >
                    <button className="btn-azul"><i className="fas fa-wind"></i> Medición gases</button>
                    <button className="btn-azul"><i className="fas fa-calendar-alt"></i> Calibración</button>
                    <button className="btn-azul"><i className="fas fa-stethoscope"></i> Diagnóstico</button>
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
