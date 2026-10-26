import { useState, useEffect, useCallback } from "react";
import { PageWelcome } from "../../components/common/welcome";
import { Boton } from "../../components/common/Button";
import { Form, Text, Checkbox } from "../../components/common/forms";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import LoadingScreen from "../../components/LoadingScreen";
import {
    getPendingRequests, approveRequest, rejectRequest
} from "../../api/auth";
import {
    obtenerUsuarios, alternarActivoUsuario, cambiarPasswordUsuario, cambiarRolUsuario,
    obtenerRoles, crearRol, actualizarRol, alternarActivoRol, eliminarRol,
    obtenerOpcionesBackup, obtenerBackups, crearBackup, descargarBackup, eliminarBackup,
    obtenerPermisosDisponibles
} from "../../api/admin";

const TABS = [
    { id: "solicitudes", texto: "Solicitudes", icono: "fa-solid fa-user-clock" },
    { id: "usuarios", texto: "Usuarios", icono: "fa-solid fa-users" },
    { id: "roles", texto: "Roles", icono: "fa-solid fa-user-shield" },
    { id: "backups", texto: "Backups", icono: "fa-solid fa-database" },
];

// ---------- 1. Solicitudes de cuenta ----------
function PanelSolicitudes({ onCambioConteo }) {
    const [solicitudes, setSolicitudes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const { exito, peligro } = useToast();

    const cargar = useCallback(async () => {
        setCargando(true);
        setError(null);
        try {
            const data = await getPendingRequests();
            setSolicitudes(Array.isArray(data) ? data : []);
            onCambioConteo?.(Array.isArray(data) ? data.length : 0);
        } catch (err) {
            console.error("Error al cargar solicitudes:", err);
            setError(err.response?.data?.message || "No se pudieron cargar las solicitudes.");
            setSolicitudes([]);
        } finally {
            setCargando(false);
        }
    }, [onCambioConteo]);

    useEffect(() => { cargar(); }, [cargar]);

    const handleAprobar = async (id) => {
        try {
            await approveRequest(id);
            exito("Cuenta aprobada correctamente.");
            cargar();
        } catch (err) {
            peligro(err.response?.data?.message || "No se pudo aprobar la solicitud.");
        }
    };

    const handleRechazar = async (id) => {
        if (!window.confirm("¿Está seguro de rechazar esta solicitud?")) return;
        try {
            await rejectRequest(id);
            exito("Solicitud rechazada.");
            cargar();
        } catch (err) {
            peligro(err.response?.data?.message || "No se pudo rechazar la solicitud.");
        }
    };

    if (cargando) return <LoadingScreen indeterminado />;

    return (
        <>
            {error && <div style={{ color: "#d9534f", marginBottom: "1rem" }}>{error}</div>}
            <div className="table-responsive">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Correo</th>
                            <th>Documento</th>
                            <th>Rol solicitado</th>
                            <th>Fecha</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {solicitudes.length > 0 ? solicitudes.map((s) => (
                            <tr key={s.id}>
                                <td>{s.name} {s.last_name}</td>
                                <td>{s.email}</td>
                                <td>{s.document_type} {s.document_number}</td>
                                <td>
                                    <span className="badge badge-mantto">
                                        {s.requested_role}{s.technician_type ? ` · ${s.technician_type}` : ""}
                                    </span>
                                </td>
                                <td>{new Date(s.created_at).toLocaleDateString("es-CO")}</td>
                                <td>
                                    <div className="btn-container">
                                        <Boton clase="btn-azul" icono="fa-solid fa-check" titulo="Aprobar solicitud" onClick={() => handleAprobar(s.id)} />
                                        <Boton clase="btn-2" icono="fa-solid fa-xmark" titulo="Rechazar solicitud" onClick={() => handleRechazar(s.id)} />
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: "center" }}>No hay solicitudes pendientes.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
}

// ---------- 2. Usuarios ----------
function FormularioPassword({ usuario, onCancel, onSuccess }) {
    const [password, setPassword] = useState("");
    const [confirmar, setConfirmar] = useState("");
    const [error, setError] = useState(null);
    const [cargando, setCargando] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (password !== confirmar) {
            setError("Las contraseñas no coinciden.");
            return;
        }
        setCargando(true);
        try {
            await cambiarPasswordUsuario(usuario.id, password, confirmar);
            onSuccess();
            onCancel();
        } catch (err) {
            setError(err.response?.data?.message || "No se pudo cambiar la contraseña.");
        } finally {
            setCargando(false);
        }
    };

    return (
        <Form
            titulo={`Cambiar contraseña de ${usuario.name}`}
            descripcion="El usuario deberá usar esta nueva contraseña en su próximo inicio de sesión."
            onCancel={onCancel}
            onSubmit={handleSubmit}
            textoBoton={cargando ? "Guardando..." : "Actualizar"}
            iconoBoton="fa-solid fa-key"
        >
            {error && <div className="col-span-6">{error}</div>}
            <div className="col-span-3">
                <Text
                    label="Nueva contraseña:" id="password" name="password" type="password"
                    placeholder="Mínimo 8 caracteres" value={password}
                    onChange={(e) => setPassword(e.target.value)} required
                />
            </div>
            <div className="col-span-3">
                <Text
                    label="Confirmar contraseña:" id="confirmar" name="confirmar" type="password"
                    placeholder="Repite la contraseña" value={confirmar}
                    onChange={(e) => setConfirmar(e.target.value)} required
                />
            </div>
        </Form>
    );
}

function PanelUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [roles, setRoles] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [usuarioPassword, setUsuarioPassword] = useState(null);
    const { usuario: usuarioActual } = useAuth();
    const { exito, peligro } = useToast();

    const cargar = useCallback(async () => {
        setCargando(true);
        setError(null);
        try {
            const [listaUsuarios, listaRoles] = await Promise.all([obtenerUsuarios(), obtenerRoles()]);
            setUsuarios(Array.isArray(listaUsuarios) ? listaUsuarios : []);
            setRoles(Array.isArray(listaRoles) ? listaRoles.filter(r => r.is_active) : []);
        } catch (err) {
            console.error("Error al cargar usuarios:", err);
            setError(err.response?.data?.message || "No se pudieron cargar los usuarios.");
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => { cargar(); }, [cargar]);

    const handleToggleActivo = async (u) => {
        try {
            await alternarActivoUsuario(u.id);
            exito(u.is_active ? "Usuario desactivado." : "Usuario activado.");
            cargar();
        } catch (err) {
            peligro(err.response?.data?.message || "No se pudo cambiar el estado del usuario.");
        }
    };

    const handleCambiarRol = async (u, nuevoRol) => {
        if (!nuevoRol) return;
        try {
            await cambiarRolUsuario(u.id, nuevoRol);
            exito("Rol actualizado.");
            cargar();
        } catch (err) {
            peligro(err.response?.data?.message || "No se pudo cambiar el rol.");
        }
    };

    if (cargando) return <LoadingScreen indeterminado />;

    return (
        <>
            {error && <div style={{ color: "#d9534f", marginBottom: "1rem" }}>{error}</div>}
            <div className="table-responsive">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Correo</th>
                            <th>Rol</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios.length > 0 ? usuarios.map((u) => (
                            <tr key={u.id}>
                                <td>{u.name} {u.last_name}</td>
                                <td>{u.email}</td>
                                <td>
                                    <select
                                        className="form-select"
                                        value={u.roles?.[0]?.name || ""}
                                        onChange={(e) => handleCambiarRol(u, e.target.value)}
                                    >
                                        <option value="">Sin rol</option>
                                        {roles.map((r) => (
                                            <option key={r.id} value={r.name}>{r.name}</option>
                                        ))}
                                    </select>
                                </td>
                                <td>
                                    <span className={`badge ${u.is_active ? "badge-activo" : "badge-inactivo"}`}>
                                        {u.is_active ? "Activo" : "Inactivo"}
                                    </span>
                                </td>
                                <td>
                                    <div className="btn-container">
                                        <Boton
                                            clase="btn-azul"
                                            icono="fa-solid fa-key"
                                            titulo="Cambiar contraseña"
                                            onClick={() => setUsuarioPassword(u)}
                                        />
                                        <Boton
                                            clase={u.is_active ? "btn-2" : "btn-azul"}
                                            icono={u.is_active ? "fa-solid fa-ban" : "fa-solid fa-circle-check"}
                                            titulo={u.is_active ? "Desactivar usuario" : "Activar usuario"}
                                            disabled={u.id === usuarioActual?.id}
                                            onClick={() => handleToggleActivo(u)}
                                        />
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: "center" }}>No hay usuarios registrados.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {usuarioPassword && (
                <FormularioPassword
                    usuario={usuarioPassword}
                    onCancel={() => setUsuarioPassword(null)}
                    onSuccess={() => exito("Contraseña actualizada correctamente.")}
                />
            )}
        </>
    );
}

// ---------- 3. Roles ----------
function FormularioRol({ rolEditar, onCancel, onSuccess }) {
    const [nombre, setNombre] = useState(rolEditar?.name || "");
    const [grupos, setGrupos] = useState([]);
    const [permisosSeleccionados, setPermisosSeleccionados] = useState(
        rolEditar?.permissions?.map((p) => p.name) || []
    );
    const [error, setError] = useState(null);
    const [cargando, setCargando] = useState(false);
    const esEdicion = Boolean(rolEditar);
    const esRolProtegido = rolEditar?.name === "Jefe de mina";

    useEffect(() => {
        obtenerPermisosDisponibles().then(setGrupos).catch(() => setGrupos([]));
    }, []);

    const togglePermiso = (nombrePermiso) => {
        setPermisosSeleccionados((prev) =>
            prev.includes(nombrePermiso) ? prev.filter((p) => p !== nombrePermiso) : [...prev, nombrePermiso]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setCargando(true);
        try {
            if (esEdicion) {
                await actualizarRol(rolEditar.id, nombre, permisosSeleccionados);
            } else {
                await crearRol(nombre, permisosSeleccionados);
            }
            onSuccess();
            onCancel();
        } catch (err) {
            setError(err.response?.data?.message || "No se pudo guardar el rol.");
        } finally {
            setCargando(false);
        }
    };

    return (
        <Form
            titulo={esEdicion ? "Editar rol" : "Nuevo rol"}
            descripcion="Define el nombre del rol y qué puede hacer dentro del sistema."
            onCancel={onCancel}
            onSubmit={handleSubmit}
            textoBoton={cargando ? "Guardando..." : esEdicion ? "Actualizar" : "Crear"}
        >
            {error && <div className="col-span-6">{error}</div>}
            <div className="col-span-6">
                <Text
                    label="Nombre del rol:" id="nombre" name="nombre"
                    placeholder="Ej: Supervisor" value={nombre}
                    onChange={(e) => setNombre(e.target.value)} required
                />
            </div>

            <div className="col-span-6">
                <label className="form-label">¿Qué puede hacer este rol?</label>
                {esRolProtegido && (
                    <p className="form-help-text">El rol Jefe de mina siempre tiene acceso a todo el sistema.</p>
                )}
            </div>

            {!esRolProtegido && grupos.map((grupo) => (
                <div className="col-span-6" key={grupo.modulo}>
                    <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>{grupo.etiqueta}</p>
                    <div className="form-grid">
                        {grupo.permisos.map((permiso) => (
                            <div className="col-span-3" key={permiso.name}>
                                <Checkbox
                                    id={`permiso-${permiso.name}`}
                                    name={permiso.name}
                                    label={permiso.etiqueta}
                                    checked={permisosSeleccionados.includes(permiso.name)}
                                    onChange={() => togglePermiso(permiso.name)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </Form>
    );
}

function PanelRoles() {
    const [roles, setRoles] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [rolAEditar, setRolAEditar] = useState(null);
    const { exito, peligro } = useToast();

    const cargar = useCallback(async () => {
        setCargando(true);
        setError(null);
        try {
            const data = await obtenerRoles();
            setRoles(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error al cargar roles:", err);
            setError(err.response?.data?.message || "No se pudieron cargar los roles.");
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => { cargar(); }, [cargar]);

    const handleToggleActivo = async (r) => {
        try {
            await alternarActivoRol(r.id);
            exito(r.is_active ? "Rol desactivado." : "Rol activado.");
            cargar();
        } catch (err) {
            peligro(err.response?.data?.message || "No se pudo cambiar el estado del rol.");
        }
    };

    const handleEliminar = async (r) => {
        if (!window.confirm(`¿Eliminar el rol "${r.name}"? Esta acción no se puede deshacer.`)) return;
        try {
            await eliminarRol(r.id);
            exito("Rol eliminado.");
            cargar();
        } catch (err) {
            peligro(err.response?.data?.message || "No se pudo eliminar el rol.");
        }
    };

    if (cargando) return <LoadingScreen indeterminado />;

    return (
        <>
            {error && <div style={{ color: "#d9534f", marginBottom: "1rem" }}>{error}</div>}
            <div className="table-responsive">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Usuarios con este rol</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {roles.length > 0 ? roles.map((r) => (
                            <tr key={r.id}>
                                <td>{r.name}</td>
                                <td>{r.users_count}</td>
                                <td>
                                    <span className={`badge ${r.is_active ? "badge-activo" : "badge-inactivo"}`}>
                                        {r.is_active ? "Activo" : "Inactivo"}
                                    </span>
                                </td>
                                <td>
                                    <div className="btn-container">
                                        <Boton
                                            clase="btn-azul" icono="fa-solid fa-edit" titulo="Editar rol"
                                            onClick={() => { setRolAEditar(r); setMostrarFormulario(true); }}
                                        />
                                        <Boton
                                            clase={r.is_active ? "btn-2" : "btn-azul"}
                                            icono={r.is_active ? "fa-solid fa-ban" : "fa-solid fa-circle-check"}
                                            titulo={r.is_active ? "Desactivar rol" : "Activar rol"}
                                            onClick={() => handleToggleActivo(r)}
                                        />
                                        <Boton
                                            clase="btn-2" icono="fa-solid fa-trash" titulo="Eliminar rol"
                                            onClick={() => handleEliminar(r)}
                                        />
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" style={{ textAlign: "center" }}>No hay roles registrados.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="btn-container-page">
                <div className="btn-container">
                    <Boton
                        clase="btn-azul" texto="Nuevo rol" icono="fa-solid fa-plus"
                        onClick={() => { setRolAEditar(null); setMostrarFormulario(true); }}
                    />
                </div>
            </div>
            {mostrarFormulario && (
                <FormularioRol
                    rolEditar={rolAEditar}
                    onCancel={() => setMostrarFormulario(false)}
                    onSuccess={cargar}
                />
            )}
        </>
    );
}

// ---------- 4. Backups ----------
function PanelBackups() {
    const [opciones, setOpciones] = useState([]);
    const [seleccionadas, setSeleccionadas] = useState([]);
    const [backups, setBackups] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [generando, setGenerando] = useState(false);
    const { exito, peligro } = useToast();

    const cargar = useCallback(async () => {
        setCargando(true);
        setError(null);
        try {
            const [listaOpciones, listaBackups] = await Promise.all([obtenerOpcionesBackup(), obtenerBackups()]);
            setOpciones(Array.isArray(listaOpciones) ? listaOpciones : []);
            setBackups(Array.isArray(listaBackups) ? listaBackups : []);
        } catch (err) {
            console.error("Error al cargar backups:", err);
            setError(err.response?.data?.message || "No se pudieron cargar los backups.");
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => { cargar(); }, [cargar]);

    const toggleTabla = (tabla) => {
        setSeleccionadas((prev) =>
            prev.includes(tabla) ? prev.filter((t) => t !== tabla) : [...prev, tabla]
        );
    };

    const handleGenerar = async () => {
        if (seleccionadas.length === 0) {
            peligro("Selecciona al menos una tabla para respaldar.");
            return;
        }
        setGenerando(true);
        try {
            await crearBackup(seleccionadas);
            exito("Backup generado correctamente.");
            setSeleccionadas([]);
            cargar();
        } catch (err) {
            peligro(err.response?.data?.message || "No se pudo generar el backup.");
        } finally {
            setGenerando(false);
        }
    };

    const handleDescargar = async (archivo) => {
        try {
            await descargarBackup(archivo);
        } catch {
            peligro("No se pudo descargar el backup.");
        }
    };

    const handleEliminar = async (archivo) => {
        if (!window.confirm("¿Eliminar este backup? No se podrá recuperar.")) return;
        try {
            await eliminarBackup(archivo);
            exito("Backup eliminado.");
            cargar();
        } catch {
            peligro("No se pudo eliminar el backup.");
        }
    };

    if (cargando) return <LoadingScreen indeterminado />;

    return (
        <>
            {error && <div style={{ color: "#d9534f", marginBottom: "1rem" }}>{error}</div>}
            <div className="form-container" style={{ marginBottom: "1.5rem" }}>
                <h3 className="form-title">Generar nuevo backup</h3>
                <p className="form-description">Selecciona qué información quieres respaldar.</p>
                <div className="form-grid">
                    {opciones.map((op) => (
                        <div className="col-span-3" key={op.tabla}>
                            <Checkbox
                                id={`tabla-${op.tabla}`}
                                name={op.tabla}
                                label={`${op.etiqueta} (${op.registros} registros)`}
                                checked={seleccionadas.includes(op.tabla)}
                                onChange={() => toggleTabla(op.tabla)}
                            />
                        </div>
                    ))}
                </div>
                <div className="btn-container" style={{ marginTop: "1rem" }}>
                    <Boton
                        clase="btn-azul"
                        texto={generando ? "Generando..." : "Generar backup"}
                        icono="fa-solid fa-database"
                        disabled={generando}
                        onClick={handleGenerar}
                    />
                </div>
            </div>

            <div className="table-responsive">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Archivo</th>
                            <th>Contenido</th>
                            <th>Creado por</th>
                            <th>Fecha</th>
                            <th>Tamaño</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {backups.length > 0 ? backups.map((b) => (
                            <tr key={b.archivo}>
                                <td>{b.archivo}</td>
                                <td>{b.tablas?.join(", ")}</td>
                                <td>{b.creado_por}</td>
                                <td>{new Date(b.creado_en).toLocaleString("es-CO")}</td>
                                <td>{b.peso_kb} KB</td>
                                <td>
                                    <div className="btn-container">
                                        <Boton
                                            clase="btn-azul" icono="fa-solid fa-download" titulo="Descargar backup"
                                            onClick={() => handleDescargar(b.archivo)}
                                        />
                                        <Boton
                                            clase="btn-2" icono="fa-solid fa-trash" titulo="Eliminar backup"
                                            onClick={() => handleEliminar(b.archivo)}
                                        />
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: "center" }}>Aún no se ha generado ningún backup.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
}

// ---------- Panel principal ----------
function AdministrationPanel() {
    const { usuario } = useAuth();
    const [tabActiva, setTabActiva] = useState("solicitudes");
    const [conteoSolicitudes, setConteoSolicitudes] = useState(0);

    const esAdministrador = usuario?.roles?.some((r) => r.name === "Jefe de mina");

    if (!esAdministrador) {
        return (
            <div className="list-grid">
                <header className="bienvenida">
                    <PageWelcome
                        titulo="Panel de administración"
                        descripcion="No tienes permisos para ver esta sección."
                    />
                </header>
                <p>Esta sección es solo para usuarios con el rol <strong>Jefe de mina</strong>.</p>
            </div>
        );
    }

    return (
        <div className="list-grid">
            <header className="bienvenida">
                <PageWelcome
                    titulo="Panel de administración"
                    descripcion="Gestiona solicitudes de cuenta, usuarios, roles y backups del sistema."
                />
            </header>

            <div className="btn-container" style={{ marginBottom: "1.5rem" }}>
                {TABS.map((tab) => (
                    <Boton
                        key={tab.id}
                        clase={tabActiva === tab.id ? "btn-azul" : "btn-2"}
                        icono={tab.icono}
                        texto={
                            tab.id === "solicitudes" && conteoSolicitudes > 0
                                ? `${tab.texto} (${conteoSolicitudes})`
                                : tab.texto
                        }
                        onClick={() => setTabActiva(tab.id)}
                    />
                ))}
            </div>

            {tabActiva === "solicitudes" && <PanelSolicitudes onCambioConteo={setConteoSolicitudes} />}
            {tabActiva === "usuarios" && <PanelUsuarios />}
            {tabActiva === "roles" && <PanelRoles />}
            {tabActiva === "backups" && <PanelBackups />}
        </div>
    );
}

export default AdministrationPanel;