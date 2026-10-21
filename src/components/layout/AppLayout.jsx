//este componente es el dueño layout (estructura principal) de la aplicación,
//  que contiene el header, el sidebar, el contenido y el footer
import { Outlet, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Boton, BotonLink } from "../../components/common/Button";
import "../../styles/global.css";
import "../../styles/variables.css";
import "../../styles/Tables/table.css";
import "../../styles/Components.modules.css"
import "../../styles/grid_content.css";
import "../../styles/accessibility.css";
import '../../styles/Profile/profile.css';
import '../../styles/Alerts/alerts.css';
import '../../styles/Gases/gases.css';
import '../../styles/dashboard.css';
import '../../styles/IA.css';
import MantiaAI from '../IAMantia/IAMantia.jsx';
import { sendAiMessage } from '../../api/Ia.js';
import AccessibilityPanel from "../accessibility/AccessibilityPanel";
import { useAuth } from "../../context/AuthContext.jsx";
import { useCallback, useEffect, useRef, useState } from 'react';
import CampanaNotificaciones from '../Alertas/CampanaNotificaciones';
import { obtenerNotificaciones, marcarComoLeida, marcarTodasComoLeidas } from '../../api/notificaciones';
import { useToast } from '../../context/ToastContext.jsx';
import { mapearNotificacionBackend } from '../../utils/notificaciones';


function AppLayout({ children }) {
    const { usuario, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [cerrado, setCerrado] = useState(false);
    const [herramientasAbierto, setHerramientasAbierto] = useState(false);
    const [openAlertas, setOpenAlertas] = useState(false);
    const [openPerfil, setOpenPerfil] = useState(false);

    const { notificar } = useToast();
    const [notificaciones, setNotificaciones] = useState([]);
    const conocidas = useRef(null); // null = todavía no se hizo la primera carga

    const cargarNotificaciones = useCallback(async () => {
        try {
            const datos = await obtenerNotificaciones();
            const lista = datos.map(mapearNotificacionBackend);

            if (conocidas.current === null) {
                // Primera carga: solo se memorizan las que ya existían, sin avisar
                conocidas.current = new Set(lista.map((n) => n.id));
            } else {
                lista.forEach((n) => {
                    if (conocidas.current.has(n.id)) return;
                    conocidas.current.add(n.id);
                    // Las informativas ya las avisa cada acción (api/axios.js);
                    // aquí solo se avisan las de peligro y las advertencias nuevas
                    if (n.tipo === 'danger') notificar('danger', n.mensaje, 'Alerta de peligro', 8000);
                    if (n.tipo === 'warning') notificar('warning', n.mensaje, 'Advertencia', 6000);
                });
            }

            setNotificaciones(lista);
        } catch (error) {
            console.error('No se pudieron cargar las notificaciones', error);
        }
    }, [notificar]);

    useEffect(() => {
        cargarNotificaciones();
        const intervalo = setInterval(cargarNotificaciones, 15000);
        return () => clearInterval(intervalo);
    }, [cargarNotificaciones]);

    // Se refresca al instante cuando cualquier acción termina bien (lo avisa api/axios.js)
    useEffect(() => {
        window.addEventListener('notificaciones:actualizar', cargarNotificaciones);
        return () => window.removeEventListener('notificaciones:actualizar', cargarNotificaciones);
    }, [cargarNotificaciones]);

    const marcarTodas = async () => {
        try {
            await marcarTodasComoLeidas();
        } catch (error) {
            console.error('No se pudieron marcar como leídas', error);
        }
        cargarNotificaciones();
    };

    const marcarUna = async (id) => {
        setNotificaciones((prev) => prev.map((n) => (n.id === id ? { ...n, leida: true } : n)));
        try {
            await marcarComoLeida(id);
        } catch (error) {
            console.error('No se pudo marcar como leída', error);
            cargarNotificaciones();
        }
    };

    return (
        <div className="app-layout" onClick={() => { setOpenPerfil(false); setOpenAlertas(false); }}>
            <header className="topbar">
                <div className="izquierda">
                    <div
                        className={`menu-contenedor`}
                        onClick={() => setCerrado(!cerrado)}
                    >
                        <div id="toggleSidebar" className={cerrado ? "cerrado" : ""} title={cerrado ? "Abrir menú lateral" : "Cerrar menú lateral"}>
                            <div></div>
                            <div></div>
                            <div></div>
                        </div>
                    </div>
                    <div className="logo">
                        <img src="/src/assets/img/mantia-cm.jpg" alt="MANTIA" />
                    </div>
                </div>

                <div className="centro">
                    <h2>MANTENIMIENTO E INVENTARIO DE ACTIVOS</h2>
                </div>

                <nav className="derecha">

                    <button className="profile-btn" id="btnPerfil" title="Perfil" onClick={(e) => { e.stopPropagation(); setOpenPerfil(!openPerfil); setOpenAlertas(false); }}>
                        <img
                            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDnLesNChl-l86u_LACs0pBkjqaot3ramr_A&s"
                            alt="Foto de perfil"
                        />
                        <div>
                            <h4>{usuario?.name || "Invitado"}</h4>
                            <span className="role-tag">
                                <i className="fa-solid fa-code"></i> Desarrollador
                            </span>
                        </div>
                    </button>

                    <CampanaNotificaciones
                    notificaciones={notificaciones}
                    abierto={openAlertas}
                    onToggle={() =>  { setOpenAlertas(!openAlertas); setOpenPerfil(false); }}
                    onCerrar={() => setOpenAlertas(false)}
                    onMarcarTodas={marcarTodas}
                    onMarcarUna={marcarUna}
                    />

                    {/* OVERLAY PERFIL */}
                    <div className={`overlay-panel ${openPerfil ? "open" : ""}`} id="overlayPerfil">
                        <div className="perfil-header">
                            <img
                                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDnLesNChl-l86u_LACs0pBkjqaot3ramr_A&s"
                                alt="Perfil"
                                className="perfil-avatar"
                            />
                            <h3>{usuario?.name || "Invitado"}</h3>
                            <span>Área de Desarrollo</span>
                        </div>
                        <div className="perfil-info">
                            <p>
                                <i className="fa-solid fa-envelope"></i>
                                {usuario?.email || "sin-correo@mantia.dev"}
                            </p>
                        </div>
                        <div className="perfil-actions">
                            <BotonLink
                                link="/Profile"
                                clase="btn-azul"
                                icono="fa-solid fa-user"
                                texto="Ver mi perfil"
                                title="Ver el perfil"
                            />
                            <BotonLink
                                link=""
                                clase="btn-azul"
                                icono="fa-solid fa-shield-halved"
                                texto="Panel Superadmin"
                                title="Panel de superadministrador"
                            />
                        </div>
                        <div className="perfil-footer">
                            <BotonLink
                                link="/login"
                                clase="btn-azul"
                                icono="fa-solid fa-right-from-bracket"
                                texto="Cerrar Sesion"
                                title="Cerrar sesión"
                            />
                        </div>
                    </div>
                </nav>
            </header>
            <aside className={`sidebar ${cerrado ? "cerrado" : ""}`} id="sidebar">
                <ul>
                    <li>
                        <Link 
                            to="/dashboard"
                            title="Ir al panel de control"
                        >
                            <i className="fa-solid fa-solar-panel"></i>
                            <span>Dashboard</span>
                        </Link>
                    </li>

                    {isAuthenticated && (
                        <>
                            <li className={`menu-desplegable ${herramientasAbierto ? "activo" : ""}`}>

                                <a className="menu-titulo"
                                    onClick={() => setHerramientasAbierto(!herramientasAbierto)}
                                >
                                    <i className="fa-solid fa-screwdriver-wrench"></i>
                                    <span>Herramientas</span>
                                </a>

                                <ul className="submenu">
                                    <li>
                                        <Link 
                                            to="/types/consumables"
                                            title="Ir a consumibles"
                                        >
                                            <i className="fa-solid fa-wrench"></i>
                                            <span>Consumibles</span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link 
                                            to="/types/noconsumables"
                                            title="Ir a no consumibles"
                                        >
                                            <i className="fa-solid fa-tools"></i>
                                            <span>No consumibles</span>
                                        </Link>
                                    </li>
                                </ul>
                            </li>

                            <li>
                                <Link 
                                    to="/equipment"
                                    title="Ir a equipos"
                                >
                                    <i className="fa-solid fa-gears"></i>
                                    <span>Equipos</span>
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    to="/machines"
                                    title="Ir a maquinas"
                                >
                                    <i className="fa-solid fa-industry"></i>
                                    <span>Maquinas</span>
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    to="/ubications"
                                    title="Ir a ubicaciones"
                                >
                                    <i className="fa-solid fa-map-marker-alt"></i>
                                    <span>Ubicaciones</span>
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    to="/companies"
                                    title="Ir a empresas"
                                >
                                    <i className="fa-solid fa-clipboard-check"></i>
                                    <span>Empresas</span>
                                </Link>
                            </li>
                        </>
                    )}

                    <li>
                        <Link to="/about" title="Ir a acerca de">
                            <i className="fa-solid fa-info-circle"></i>
                            <span>Acerca de</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/help" title="Ir a ayuda">
                            <i className="fa-solid fa-circle-question"></i>
                            <span>Ayuda</span>
                        </Link>
                    </li>
                    <li>
                        {isAuthenticated ? (
                            <a onClick={async () => { await logout(); navigate("/login"); }} style={{ cursor: "pointer" }}
                            title="Cerrar sesión">
                                <i className="fa-solid fa-right-from-bracket"></i>
                                <span>Cerrar sesión</span>
                            </a>
                        ) : (
                            <Link to="/login" title="Ir a iniciar sesión">
                                <i className="fa-solid fa-right-from-bracket"></i>
                                <span>Iniciar sesión</span>
                            </Link>
                        )}
                    </li>
                </ul>
            </aside>

            <main id="contenido" className={`contenido ${cerrado ? "cerrado" : ""}`}>
                {children ?? <Outlet />}
            </main>
            <MantiaAI onSend={sendAiMessage} />
            <AccessibilityPanel />

            <footer className="footer">
                <div className="secFooterPrincipal">
                    <img className="logoSenaFooter" src="/src/assets/img/logo-sena-blanco.png" alt="SENA" />
                    <img className="logoSmaqFooter" src="/src/assets/img/mantia-cm.jpg" alt="MANTIA" />
                    <div className="descripcion-logos">
                        <br />Mantenimiento e inventario de activos
                        <br /> Copyright © {new Date().getFullYear()}. Todos los derechos reservados. 
                    </div>
                </div>

                <div className="infoFooter"
                     title="Información de contacto">
                    <br /><strong>CONTACTANOS</strong>
                    <br />mantiaadso@gmail.com
                </div>
            </footer>
        </div>
    );
}

export default AppLayout;