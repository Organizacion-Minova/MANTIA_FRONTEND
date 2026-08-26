//este componente es el dueño layout (estructura principal) de la aplicación,
//  que contiene el header, el sidebar, el contenido y el footer
import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "../../styles/global.css";
import "../../styles/variables.css";
import "../../styles/Tables/table.css";
import "../../styles/Components.modules.css"
import "../../styles/Tables/form.css";
import { useAuth } from "../../context/AuthContext.jsx";

function AppLayout({ children }) {
    const [cerrado, setCerrado] = useState(false);
    const [herramientasAbierto, setHerramientasAbierto] = useState(false);
    const { isAuthenticated, usuario, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };
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
                        <img src="/src/assets/img/Mantia - logo.png" alt="MANTIA" />
                    </div>
                </div>

                <div className="centro">
                    <h2>MANTENIMIENTO E INVENTARIO DE ACTIVOS</h2>
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
                            <h4>{usuario?.nombre || "PAPOI"}</h4>
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

                    {isAuthenticated && (
                        <>
                            <li className={`menu-desplegable ${herramientasAbierto ? "activo" : ""}`}>

                                <a  className="menu-titulo"
                                    onClick={() => setHerramientasAbierto(!herramientasAbierto)}
                                >
                                    <i className="fa-solid fa-screwdriver-wrench"></i>
                                    <span>Herramientas</span>
                                </a>

                                <ul className="submenu">
                                    <li>
                                        <Link to="/tools/consumables">
                                            <i className="fa-solid fa-wrench"></i>
                                            <span>Consumibles</span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/tools/noconsumables">
                                            <i className="fa-solid fa-tools"></i>
                                            <span>No consumibles</span>
                                        </Link>
                                    </li>
                                </ul>
                            </li>

                            <li>
                                <Link to="/equipment">
                                    <i className="fa-solid fa-gears"></i>
                                    <span>Equipos</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/machines">
                                    <i className="fa-solid fa-industry"></i>
                                    <span>Maquinas</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/ubications">
                                    <i className="fa-solid fa-map-marker-alt"></i>
                                    <span>Ubicaciones</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/companies">
                                    <i className="fa-solid fa-clipboard-check"></i>
                                    <span>Empresas</span>
                                </Link>
                            </li>
                        </>
                    )}

                    <li>
                        <Link to="/acercade">
                            <i className="fa-solid fa-info-circle"></i>
                            <span>Acerca de</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/ayuda">
                            <i className="fa-solid fa-circle-question"></i>
                            <span>Ayuda</span>
                        </Link>
                    </li>
                    <li>
                        {isAuthenticated ? (
                            <a onClick={handleLogout} style={{ cursor: "pointer" }}>
                                <i className="fa-solid fa-right-from-bracket"></i>
                                <span>Cerrar sesión</span>
                            </a>
                        ) : (
                            <Link to="/login">
                                <i className="fa-solid fa-right-from-bracket"></i>
                                <span>Iniciar sesión</span>
                            </Link>
                        )}
                    </li>
                </ul>
            </aside>
            

            <main id="contenido" className={`contenido ${cerrado ? "cerrado" : ""}`}>
            {children ?? <Outlet/>}
                </main>
            <button className="btn-accesibilidad">
                Accesibilidad (pendiente)
            </button>

            <footer className="footer">
                <div className="secFooterPrincipal">
                    <img className="logoSenaFooter" src="/src/assets/img/logo-sena-blanco.png" alt="SENA" />
                    <img className="logoSmaqFooter" src="/src/assets/img/Mantia - logo.png" alt="MANTIA" />
                    <div className="descripcion-logos">
                        <br/>Mantenimiento e inventario de activos
                        <br/> Copyright © 2026. Todos los derechos reservados.
                    </div>
                </div>

                <div className="infoFooter">
                    <br/><strong>CONTACTANOS</strong>
                    <br/>mantiadso@gmail.com
                </div>
            </footer>
        </div>
    );
}

export default AppLayout;