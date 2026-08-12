//este componente es el dueño layout (estructura principal) de la aplicación,
//  que contiene el header, el sidebar, el contenido y el footer
import "../../styles/layout.css";
import { useState } from "react";

function AppLayout() {
    const [cerrado, setCerrado] = useState(false);
    const [herramientasAbierto, setHerramientasAbierto] = useState(false);
    return (
        <div className="app-layout">
            <header className="topbar">
                <div className="izquierda">
                    <div
                    className={`menu-contenedor`}
                    onClick={() => setCerrado(!cerrado)}
                >
                <div id="toggleSidebar" className={cerrado ? "cerrado" : ""}>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
                    </div>
                    <div className="logo">
                        <img src="/img/Mantia - logo.png" alt="MANTIA" />
                    </div>
                </div>

                <div className="centro">
                    <h2>SISTEMA DE MANTENIMIENTO E INVENTARIO</h2>
                </div>

                <nav className="derecha">
                    <button className="bell-btn" id="btnCampana" title="Alertas">
                        <i className="fa-solid fa-bell"></i>
                        <span className="bell-badge" id="bellBadge">5</span>
                    </button>

                    <button className="profile-btn" id="btnPerfil">
                        <img
                            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDnLesNChl-l86u_LACs0pBkjqaot3ramr_A&s"
                            alt="Foto de perfil"
                        />
                        <div>
                            <h4>PAPOI</h4>
                            <span className="role-tag">
                                <i className="fa-solid fa-shield-halved"></i> PAPOI
                            </span>
                        </div>
                    </button>

                    {/* Aquí el equipo conectará overlayAlertas y overlayPerfil (Tailwind) */}
                </nav>
            </header>
            <aside className={`sidebar ${cerrado ? "cerrado" : ""}`} id="sidebar">
                <ul>
                    <li>
                        <a href="/">
                            <i className="fa-solid fa-house"></i>
                            <span>Inicio</span>
                        </a>
                    </li>

                    <li className={`menu-desplegable ${herramientasAbierto ? "activo" : ""}`}>
                        
                        <a  className="menu-titulo"
                            onClick={() => setHerramientasAbierto(!herramientasAbierto)}
                        >
                            <i className="fa-solid fa-screwdriver-wrench"></i>
                            <span>Herramientas</span>
                        </a>

                        <ul className="submenu">
                            <li>
                                <a href="/herramientas/consumibles">
                                    <i className="fa-solid fa-wrench"></i>
                                    <span>Consumibles</span>
                                </a>
                            </li>
                            <li>
                                <a href="/herramientas/no-consumibles">
                                    <i className="fa-solid fa-tools"></i>
                                    <span>No consumibles</span>
                                </a>
                            </li>
                        </ul>
                    </li>

                    <li>
                        <a href="/equipos">
                            <i className="fa-solid fa-gears"></i>
                            <span>Equipos</span>
                        </a>
                    </li>
                    <li>
                        <a href="/maquinas">
                            <i className="fa-solid fa-industry"></i>
                            <span>Maquinas</span>
                        </a>
                    </li>
                    <li>
                        <a href="/ubicaciones">
                            <i className="fa-solid fa-map-marker-alt"></i>
                            <span>Ubicaciones</span>
                        </a>
                    </li>
                    <li>
                        <a href="/empresa">
                            <i className="fa-solid fa-clipboard-check"></i>
                            <span>Empresas</span>
                        </a>
                    </li>
                    <li>
                        <a href="/acerca-de">
                            <i className="fa-solid fa-info-circle"></i>
                            <span>Acerca de</span>
                        </a>
                    </li>
                    <li>
                        <a href="/ayuda">
                            <i className="fa-solid fa-circle-question"></i>
                            <span>Ayuda</span>
                        </a>
                    </li>
                    <li>
                        <a href="/iniciar-sesion">
                            <i className="fa-solid fa-right-from-bracket"></i>
                            <span>Iniciar sesión</span>
                        </a>
                    </li>
                </ul>
            </aside>
            

            <main id="contenido" className="contenido">
                <h1>Contenido de la página aquí</h1>
            </main>

            <button className="btn-accesibilidad">
                Accesibilidad (pendiente)
            </button>

            <footer className="footer">
                <div className="secFooterPrincipal">
                    <img className="logoSenaFooter" src="/img/logo-sena-blanco.png" alt="SENA" />
                    <img className="logoSmaqFooter" src="/img/Mantia - logo.png" alt="MANTIA" />
                    <div className="descripcion-logos">
                        <br />Mantenimiento e inventario de activos
                        <br /> Copyright © 2026. Todos los derechos reservados.
                    </div>
                </div>

                <div className="infoFooter">
                    <br /><strong>CONTACTANOS</strong>
                    <br />mantia@gmail.com
                </div>
            </footer>
        </div>
    );
}

export default AppLayout;