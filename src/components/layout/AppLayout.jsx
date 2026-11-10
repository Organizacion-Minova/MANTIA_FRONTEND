//este componente es el dueño layout (estructura principal) de la aplicación,
//  que contiene el header, el sidebar, el contenido y el footer
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Boton } from "../../components/common/Button";
import PerfilEditor from "./PerfilEditor.jsx";
import { avatarPorDefecto } from "../../utils/avatar";
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
import { NavigationHistoryProvider } from "../../context/NavigationHistoryContext.jsx";
import panelIcon from "../../assets/icons/panel.svg";
import adminIcon from "../../assets/icons/admin.svg";
import herramientasIcon from "../../assets/icons/herramientas.svg";
import equiposIcon from "../../assets/icons/equipos.svg";
import maquinasIcon from "../../assets/icons/maquinas.svg";
import ubicacionesIcon from "../../assets/icons/ubicaciones.svg";
import formatosIcon from "../../assets/icons/formatos.svg";
import diarioIcon from "../../assets/icons/diario.svg";
import gasesIcon from "../../assets/icons/gases.svg";
import inspeccionIcon from "../../assets/icons/inspeccion.svg";
import preoperacionalIcon from "../../assets/icons/preoperacional.svg";
import acercaIcon from "../../assets/icons/acerca.svg";
import ayudaIcon from "../../assets/icons/ayuda.svg";
import cerrarSesionIcon from "../../assets/icons/cerrar-sesion.svg";
import consumibleIcon from "../../assets/icons/consumibles.svg";
import noconsumibleIcon from "../../assets/icons/no-consumibles.svg";
import inspeccionMaquinaIcon from "../../assets/icons/InspeccionMaquina.svg";


function AppLayout({ children }) {
   const { usuario, isAuthenticated, logout, tienePermiso, tieneRol } = useAuth();
    const nombreRol = usuario?.roles?.[0]?.name || "Sin rol";
    const veFormatos = tienePermiso("daily-use.view") || tienePermiso("gas-measurements.view") || tienePermiso("inspection.view");
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [cerrado, setCerrado] = useState(false);
    const [herramientasAbierto, setHerramientasAbierto] = useState(false);
    const [formatosAbierto, setFormatosAbierto] = useState(false);
    const [openAlertas, setOpenAlertas] = useState(false);
    const [openPerfil, setOpenPerfil] = useState(false);
    const [editandoPerfil, setEditandoPerfil] = useState(false);
    const [vistaPerfil, setVistaPerfil] = useState("datos");
    const fotoPerfil = usuario?.photo_url || avatarPorDefecto(`${usuario?.name ?? ""} ${usuario?.last_name ?? ""}`);
    const [inspeccionesAbierto, setInspeccionesAbierto] = useState(false);

    const abrirPerfil = (vista) => {
        setVistaPerfil(vista);
        setEditandoPerfil(true);
        setOpenPerfil(false);
    };
    const herramientasRutaActiva = pathname.startsWith("/consumables/tools")
        || pathname.startsWith("/noconsumables/tools");
    const formatosRutaActiva = ["/dailyuse", "/gases", "/inspection"].some((ruta) => pathname.startsWith(ruta));

    const { notificar } = useToast();
    const [notificaciones, setNotificaciones] = useState([]);


    const conocidas = useRef(null);

    
    const solicitudEnCurso = useRef(false);


    const refrescoPendiente = useRef(false);
    const cargarNotificacionesRef = useRef(null);

    
    const temporizadorActualizacion = useRef(null);

    useEffect(() => {
        if (window.matchMedia("(max-width: 767px)").matches) {
            setCerrado(false);
        }
    }, [pathname]);

    const cargarNotificaciones = useCallback(async (encolarSiEstaOcupada = false) => {
        if (!isAuthenticated) return;

        if (solicitudEnCurso.current) {
            if (encolarSiEstaOcupada) refrescoPendiente.current = true;
            return;
        }

        solicitudEnCurso.current = true;

        try {
            const datos = await obtenerNotificaciones();
            const lista = datos.map(mapearNotificacionBackend);

            if (conocidas.current === null) {
                
                conocidas.current = new Set(lista.map((n) => n.id));
            } else {
                lista.forEach((n) => {
                    if (conocidas.current.has(n.id)) return;
                    conocidas.current.add(n.id);


                    if (n.tipo === 'danger') {
                        notificar('danger', n.mensaje, 'Alerta de peligro', 8000);
                    }

                    if (n.tipo === 'warning') {
                        notificar('warning', n.mensaje, 'Advertencia', 6000);
                    }
                });
            }

            setNotificaciones(lista);
        } catch (error) {
            console.error('No se pudieron cargar las notificaciones', error);
        } finally {
            solicitudEnCurso.current = false;


            if (refrescoPendiente.current) {
                refrescoPendiente.current = false;
                Promise.resolve().then(() => cargarNotificacionesRef.current?.());
            }
        }
    }, [isAuthenticated, notificar]);

    
    cargarNotificacionesRef.current = cargarNotificaciones;

    
    const solicitarActualizacionNotificaciones = useCallback(() => {
        if (temporizadorActualizacion.current) {
            window.clearTimeout(temporizadorActualizacion.current);
        }

        temporizadorActualizacion.current = window.setTimeout(() => {
            temporizadorActualizacion.current = null;
            cargarNotificaciones(true);
        }, 300);
    }, [cargarNotificaciones]);

    useEffect(() => {
        if (!isAuthenticated) {
            setNotificaciones([]);
            conocidas.current = null;
            return undefined;
        }

        
        cargarNotificaciones();

        
        const intervalo = window.setInterval(() => {
            if (document.visibilityState === 'visible') {
                cargarNotificaciones();
            }
        }, 30000);


        const actualizarAlVolver = () => {
            if (document.visibilityState === 'visible') {
                solicitarActualizacionNotificaciones();
            }
        };

        // Las operaciones exitosas siguen actualizando la campana mediante
        // el evento que ya emite api/axios.js.
        window.addEventListener(
            'notificaciones:actualizar',
            solicitarActualizacionNotificaciones
        );
        document.addEventListener('visibilitychange', actualizarAlVolver);

        return () => {
            window.clearInterval(intervalo);
            window.removeEventListener(
                'notificaciones:actualizar',
                solicitarActualizacionNotificaciones
            );
            document.removeEventListener('visibilitychange', actualizarAlVolver);

            if (temporizadorActualizacion.current) {
                window.clearTimeout(temporizadorActualizacion.current);
                temporizadorActualizacion.current = null;
            }
        };
    }, [isAuthenticated, cargarNotificaciones, solicitarActualizacionNotificaciones]);

    const marcarTodas = async () => {
        try {
            await marcarTodasComoLeidas();
        } catch (error) {
            console.error('No se pudieron marcar como leídas', error);
        }

        // Se conserva la actualización de la campana después de marcar todas.
        cargarNotificaciones(true);
    };

    const marcarUna = async (id) => {
        setNotificaciones((prev) => prev.map((n) => (n.id === id ? { ...n, leida: true } : n)));
        try {
            await marcarComoLeida(id);
        } catch (error) {
            console.error('No se pudo marcar como leída', error);
            cargarNotificaciones(true);
        }
    };

    return (
         <NavigationHistoryProvider>
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
                            src={fotoPerfil}
                            alt="Foto de perfil"
                        />
                        <div>
                            <h4>{usuario?.name || "Invitado"}</h4>
                            <span className="role-tag">
                                <i className="fa-solid fa-user-shield"></i> {nombreRol}
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
                                src={fotoPerfil}
                                alt="Perfil"
                                className="perfil-avatar"
                            />
                            <h3>{usuario?.name || "Invitado"}</h3>
                            <span>{nombreRol}</span>
                        </div>
                        <div className="perfil-info">
                            <p>
                                <i className="fa-solid fa-envelope"></i>
                                {usuario?.email || "sin-correo@mantia.dev"}
                            </p>
                        </div>
                        <div className="perfil-actions">
                            <Boton
                                clase="btn-azul"
                                icono="fa-solid fa-user-pen"
                                texto="Editar mi perfil"
                                titulo="Editar mis datos y mi foto"
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); abrirPerfil("datos"); }}
                            />
                            <Boton
                                clase="btn-2"
                                icono="fa-solid fa-key"
                                texto="Cambiar contraseña"
                                titulo="Cambiar mi contraseña"
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); abrirPerfil("password"); }}
                            />
                        </div>
                    </div>
                </nav>
            </header>
            {editandoPerfil && <PerfilEditor vista={vistaPerfil} onCerrar={() => setEditandoPerfil(false)} />}
            <aside className={`sidebar ${cerrado ? "cerrado" : ""}`} id="sidebar">
                  <ul>
                    <li>
                        <NavLink 
                            to="/dashboard"
                            title="Ir al panel de control"
                        >
                            <img className="sidebar__icon" src={panelIcon} alt="" aria-hidden="true" />
                            <span>Panel de control</span>
                        </NavLink>
                    </li>
                    {tieneRol("Jefe de mina") && (
                        <li>
                            <NavLink
                                to="/admin"
                                title="Ir al panel de administración"
                            >
                                <img className="sidebar__icon" src={adminIcon} alt="" aria-hidden="true" />
                                <span>Panel administración</span>
                            </NavLink>
                        </li>
                    )}
                    {isAuthenticated && (
                        <>
                            {tienePermiso("tool.view") && (
                            <li className={`menu-desplegable ${herramientasAbierto || herramientasRutaActiva ? "activo" : ""}`}>

                                <a className={`menu-titulo ${herramientasRutaActiva ? "active" : ""}`}
                                    onClick={() => setHerramientasAbierto(!herramientasAbierto)}
                                >
                                    <img className="sidebar__icon" src={herramientasIcon} alt="" aria-hidden="true" />
                                    <span>Herramientas</span>
                                </a>

                                <ul className="submenu">
                                    <li>
                                        <NavLink 
                                             to="/consumables/tools"
                                            title="Ir a consumibles"
                                        >
                                            <img className="sidebar__icon" src={consumibleIcon} alt="" aria-hidden="true" />
                                            <span>Consumibles</span>
                                        </NavLink>
                                    </li>
                                    <li>
                                        <NavLink 
                                            to="/noconsumables/tools"
                                            title="Ir a no consumibles"
                                        >
                                            <img className="sidebar__icon" src={noconsumibleIcon} alt="" aria-hidden="true" />
                                            <span>No consumibles</span>
                                        </NavLink>
                                    </li>
                                </ul>
                            </li>
                            )}

                            {tienePermiso("equipment.view") && (
                            <li>
                                <NavLink 
                                    to="/equipment"
                                    title="Ir a equipos"
                                >
                                    <img className="sidebar__icon" src={equiposIcon} alt="" aria-hidden="true" />
                                    <span>Equipos</span>
                                </NavLink>
                            </li>
                            )}
                            {tienePermiso("machine.view") && (
                            <li>
                                <NavLink 
                                    to="/machines"
                                    title="Ir a máquinas"
                                >
                                    <img className="sidebar__icon" src={maquinasIcon} alt="" aria-hidden="true" />
                                    <span>Máquinas</span>
                                </NavLink>
                                
                            </li>
                            )}
                            {tienePermiso("location.update") && (
                            <li>
                                <NavLink 
                                    to="/ubications"
                                    title="Ir a ubicaciones"
                                >
                                    <img className="sidebar__icon" src={ubicacionesIcon} alt="" aria-hidden="true" />
                                    <span>Ubicaciones</span>
                                </NavLink>
                            </li>
                            )}
                        </>
                    )}
                    <li>
                        {tienePermiso("gas-measurements.view") && (
                                <NavLink
                                    to="/gases"
                                    title="Ir al formato de medicion de gases"
                                >
                                    <img className="sidebar__icon" src={gasesIcon} alt="" aria-hidden="true" />
                                    <span>Medición de gases</span>
                                </NavLink>
                        )}
                    </li>
                    {tienePermiso("inspection.view") && (
                        <li className={`menu-desplegable ${inspeccionesAbierto ? "activo" : ""}`}>
                            <a
                                className="menu-titulo"
                                onClick={() => setInspeccionesAbierto(!inspeccionesAbierto)}
                            >
                                <img
                                    className="sidebar__icon"
                                    src={inspeccionMaquinaIcon}
                                    alt=""
                                    aria-hidden="true"
                                />
                                <span>Formatos Maquinas</span>
                            </a>

                            <ul className="submenu">
                                <li>
                                    <Link to="/inspections/machines">
                                        <img
                                            className="sidebar__icon"
                                            src={inspeccionIcon}
                                            alt=""
                                            aria-hidden="true"
                                        />
                                        <span>Inspeccion</span>
                                    </Link>
                                </li>

                                {tienePermiso("daily-use.view") && (
                                    <li>
                                        <NavLink
                                            to="/dailyuse"
                                            title="Ir al formato de uso diario"
                                        >
                                            <img className="sidebar__icon" src={diarioIcon} alt="" aria-hidden="true" />
                                            <span>Uso diario</span>
                                        </NavLink>
                                    </li>
                                )}
                                {tienePermiso("inspection.view") && (
                                    <li>
                                        <Link
                                            to="/preoperational/machines"
                                            title="Ir al formato preoperacional"
                                        >
                                            <img className="sidebar__icon" src={preoperacionalIcon} alt="" aria-hidden="true" />
                                            <span>Preoperacional</span>
                                        </Link>
                                    </li>
                                )}
                            </ul>
                        </li>
                    )}
                    {tienePermiso("inspection.view") && (
                    <li className={`menu-desplegable ${inspeccionesAbierto ? "activo" : ""}`}>
                            <a
                                className="menu-titulo"
                                onClick={() => setInspeccionesAbierto(!inspeccionesAbierto)}
                            >
                                <img
                                    className="sidebar__icon"
                                    src={inspeccionMaquinaIcon}
                                    alt=""
                                    aria-hidden="true"
                                />
                                <span>Formatos Equipos</span>
                            </a>

                            <ul className="submenu">
                                <li>
                                    <Link to="/inspections/equipment">
                                        <img
                                            className="sidebar__icon"
                                            src={inspeccionIcon}
                                            alt=""
                                            aria-hidden="true"
                                        />
                                        <span>Inspeccion</span>
                                    </Link>
                                </li>
                            </ul>
                        </li>
                    )}

                    <li>
                        <NavLink to="/about" title="Ir a acerca de">
                            <img className="sidebar__icon" src={acercaIcon} alt="" aria-hidden="true" />
                            <span>Acerca de</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/help" title="Ir a ayuda">
                            <img className="sidebar__icon" src={ayudaIcon} alt="" aria-hidden="true" />
                            <span>Ayuda</span>
                        </NavLink>
                    </li>
                    <li>
                        {isAuthenticated ? (
                            <a onClick={async () => { await logout(); navigate("/login"); }} style={{ cursor: "pointer" }}
                            title="Cerrar sesión">
                                <img className="sidebar__icon" src={cerrarSesionIcon} alt="" aria-hidden="true" />
                                <span>Cerrar sesión</span>
                            </a>
                        ) : (
                            <Link to="/login" title="Ir a iniciar sesión">
                                <img className="sidebar__icon" src={cerrarSesionIcon} alt="" aria-hidden="true" />
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
            </footer>
        </div>
        </NavigationHistoryProvider>
    );
}

export default AppLayout;