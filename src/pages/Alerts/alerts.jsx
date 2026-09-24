import { PageWelcome, Searcher } from "../../components/common/welcome";
import { Boton } from "../../components/common/Button";
function Alerts() {
    return (
        <div className="alerts-grid">
            <header className="bienvenida">
                <PageWelcome
                    titulo="ALERTAS"
                    descripcion="olisssssssss"
                />
                <Searcher placeholder="Buscar por nombre, código, número de serie, marca, ubicación"/>
            </header>
            <section className='cards'>
                <div className='card'>
                    <div className="icon blue"><i className="fa-solid fa-circle-exclamation"></i></div>
                    <h2 id="cntGrave">3</h2>
                    <p>Alertas graves</p>
                </div>
                <div className='card'>
                    <div className="icon blue"><i className="fa-solid fa-triangle-exclamation"></i></div>
                    <h2 id="cntImportante">5</h2>
                    <p>Alertas importantes</p>
                </div>
                <div className="card">
                    <div className="icon blue"><i className="fa-solid fa-circle-check"></i></div>
                    <h2 id="cntBien">12</h2>
                    <p>Equipos sin novedad</p>
                </div>
                <div className="card">
                    <div className="icon blue"><i className="fa-solid fa-wind"></i></div>
                    <h2>4</h2>
                    <p>Sensores de gases activos</p>
                </div>
            </section>       
           
            <section className="cards2">
                <table id="tablaAlertas">
                    <thead>
                        <tr>
                            <th>Nivel</th>
                            <th>Equipo</th>
                            <th>Descripción</th>
                            <th>Hora · Ubicación</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr data-nivel="grave">
                            <td><span className="nivel-badge badge-grave"><i className="fa-solid fa-circle-exclamation"></i> GRAVE</span></td>
                            <td >Excavadora CAT 323D</td>
                            <td >Falla hidráulica — presión bajo umbral mínimo (80 bar). Riesgo de parada inmediata.</td>
                            <td ><i className="fa-regular fa-clock"></i> hace 3 min &nbsp;·&nbsp; <i className="fa-solid fa-location-dot"></i> Zona A - Frente 2</td>
                            <td>
                            <div>
                                <Boton 
                                    clase="btn-atender"
                                    icono="fa-solid fa-check"
                                    texto="Atender"
                                />
                                <Boton 
                                    clase="btn-escalar"
                                    icono="fa-solid fa-arrow-up"
                                    texto="Escalar"
                                />
                            </div>
                            </td>
                        </tr>

                        <tr data-nivel="grave">
                            <td><span className="nivel-badge badge-grave"><i className="fa-solid fa-circle-exclamation"></i> GRAVE</span></td>
                            <td >Electrobomba EB-03</td>
                            <td >CO₂ al 4.2% vol. Supera límite de seguridad (1.5%). Evacuar área.</td>
                            <td ><i className="fa-regular fa-clock"></i> hace 20 min &nbsp;·&nbsp; <i className="fa-solid fa-location-dot"></i> Sala de bombas</td>
                            <td>
                            <div>
                                <Boton 
                                    clase="btn-atender"
                                    icono="fa-solid fa-check"
                                    texto="Atender"
                                />
                                <Boton 
                                    clase="btn-escalar"
                                    icono="fa-solid fa-arrow-up"
                                    texto="Escalar"
                                />
                            </div>
                            </td>
                        </tr>

                        <tr data-nivel="importante">
                            <td><span className="nivel-badge badge-importante"><i className="fa-solid fa-triangle-exclamation"></i> IMPORTANTE</span></td>
                            <td >Retroexcavadora JCB 3CX</td>
                            <td >Nivel de aceite hidráulico al 18%. Reponer antes del siguiente turno.</td>
                            <td ><i className="fa-regular fa-clock"></i> hace 1 h &nbsp;·&nbsp; <i className="fa-solid fa-location-dot"></i> Zona B - Frente 1</td>
                            <td>
                            <div>
                                <Boton 
                                    clase="btn-atender"
                                    icono="fa-solid fa-check"
                                    texto="Atender"
                                />
                                <Boton 
                                    clase="btn-escalar"
                                    icono="fa-solid fa-arrow-up"
                                    texto="Escalar"
                                />
                            </div>
                            </td>
                        </tr>

                        <tr data-nivel="importante">
                            <td><span className="nivel-badge badge-importante"><i className="fa-solid fa-triangle-exclamation"></i> IMPORTANTE</span></td>
                            <td >Cargador CAT 950H</td>
                            <td >Mantenimiento preventivo vence en 3 días (26/05/2026). Programar con jefe de taller.</td>
                            <td ><i className="fa-regular fa-clock"></i> hace 2 h &nbsp;·&nbsp; <i className="fa-solid fa-location-dot"></i> Patio de equipos</td>
                            <td>
                            <div>
                                <Boton 
                                    clase="btn-atender"
                                    icono="fa-solid fa-check"
                                    texto="Atender"
                                />
                                <Boton 
                                    clase="btn-escalar"
                                    icono="fa-solid fa-arrow-up"
                                    texto="Escalar"
                                />
                            </div>
                            </td>
                        </tr>

                        <tr data-nivel="importante">
                            <td><span className="nivel-badge badge-importante"><i className="fa-solid fa-triangle-exclamation"></i> IMPORTANTE</span></td>
                            <td >Banda Transportadora BT-02</td>
                            <td >Vibración anormal — 8.4 mm/s (umbral: 4.5 mm/s). Posible desalineación.</td>
                            <td ><i className="fa-regular fa-clock"></i> hace 3 h &nbsp;·&nbsp; <i className="fa-solid fa-location-dot"></i> Nivel -2</td>
                            <td>
                            <div>
                                <Boton 
                                    clase="btn-atender"
                                    icono="fa-solid fa-check"
                                    texto="Atender"
                                />
                                <Boton 
                                    clase="btn-escalar"
                                    icono="fa-solid fa-arrow-up"
                                    texto="Escalar"
                                />
                            </div>
                            </td>
                        </tr>

                        <tr data-nivel="importante">
                            <td><span className="nivel-badge badge-importante"><i className="fa-solid fa-triangle-exclamation"></i> IMPORTANTE</span></td>
                            <td >Malacate MA-01</td>
                            <td >Stock bajo de filtros de aceite — solo 2 unidades (mínimo recomendado: 10).</td>
                            <td ><i className="fa-regular fa-clock"></i> hace 5 h &nbsp;·&nbsp; <i className="fa-solid fa-location-dot"></i> Almacén central</td>
                            <td>
                            <div>
                                <Boton 
                                    clase="btn-atender"
                                    icono="fa-solid fa-check"
                                    texto="Atender"
                                />
                                <Boton 
                                    clase="btn-escalar"
                                    icono="fa-solid fa-arrow-up"
                                    texto="Escalar"
                                />
                            </div>
                            </td>
                        </tr>

                        <tr data-nivel="importante">
                            <td><span className="nivel-badge badge-importante"><i className="fa-solid fa-triangle-exclamation"></i> IMPORTANTE</span></td>
                            <td >Vagoneta VG-04</td>
                            <td >Freno de emergencia sin respuesta. Revisar antes de operar.</td>
                            <td ><i className="fa-regular fa-clock"></i> hace 6 h &nbsp;·&nbsp; <i className="fa-solid fa-location-dot"></i> Nivel -1</td>
                            <td>
                            <div>
                                <Boton 
                                    clase="btn-atender"
                                    icono="fa-solid fa-check"
                                    texto="Atender"
                                />
                                <Boton 
                                    clase="btn-escalar"
                                    icono="fa-solid fa-arrow-up"
                                    texto="Escalar"
                                />
                            </div>
                            </td>
                        </tr>
                        
                        <tr data-nivel="bien">
                            <td><span className="nivel-badge badge-bien"><i className="fa-solid fa-circle-check"></i> BIEN</span></td>
                            <td>Banda Transportadora BT-01</td>
                            <td>Sin novedades. Parámetros en rango normal. Última revisión hace 2 días.</td>
                            <td><i className="fa-regular fa-clock"></i> hace 2 h &nbsp;·&nbsp; <i className="fa-solid fa-location-dot"></i> Nivel -1</td>
                            <td>
                                <Boton 
                                    clase="btn-azul"
                                    icono="fa-solid fa-eye"
                                    texto="Ver"
                                />
                            </td>
                        </tr>

                        <tr data-nivel="bien">
                            <td><span className="nivel-badge badge-bien"><i className="fa-solid fa-circle-check"></i> BIEN</span></td>
                            <td>Excavadora CAT 320D</td>
                            <td>Sin novedades. Operando en parámetros normales. Mantenimiento realizado la semana pasada.</td>
                            <td><i className="fa-regular fa-clock"></i> hace 4 h &nbsp;·&nbsp; <i className="fa-solid fa-location-dot"></i> Zona C</td>
                            <td>
                                <Boton 
                                    clase="btn-azul"
                                    icono="fa-solid fa-eye"
                                    texto="Ver"
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </section>
        </div>
    );
}

export default Alerts;