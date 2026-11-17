import { useState, useEffect, useCallback } from "react";
import { PageWelcome } from "../../components/common/welcome";
import { Boton, BotonAccion } from "../../components/common/Button";
import { Form, Text, Select } from "../../components/common/forms";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import LoadingScreen from "../../components/LoadingScreen";
import contrasenaIcono from "../../assets/icons/contrasena.svg";
import borrarIcono from "../../assets/icons/borrar.svg";
import editarIcono from "../../assets/icons/editar.svg";
import agregarIcon from "../../assets/icons/agregar.svg";
import {
    getPendingRequests, approveRequest, rejectRequest
} from "../../api/auth";
import {
    obtenerUsuarios, alternarActivoUsuario, cambiarPasswordUsuario, cambiarRolUsuario,
    obtenerRoles, crearRol, actualizarRol, alternarActivoRol, eliminarRol,
    obtenerPermisosDisponibles, crearUsuario
} from "../../api/admin";
import PanelBackups from "./PanelBackups";
import PanelHistorial from "./PanelHistorial";
import PanelPruebas from "./PanelPruebas";
import RequisitosContrasena from "../../components/common/RequisitosContrasena.jsx";
import {
    TIPOS_DOCUMENTO, REGLAS_DOCUMENTO,
    filtrarNombre, filtrarDocumento, filtrarCorreo, filtrarContrasena,
    validarNombre, validarCorreo, validarDocumento, validarContrasena, validarConfirmacion,
    soloErrores, erroresDelServidor,
} from "../../utils/validacionesUsuario";
import { tieneGroserias } from "../../components/common/Validations";
import { useConfirm } from "../../context/ConfirmContext.jsx";
import { usePaginacion,Paginacion } from "../../components/common/Paginacion";

const SUPERADMIN = "Superadministrador";
const JEFE = "Jefe de mina";
// No se renombran, desactivan ni eliminan
const ROLES_PROTEGIDOS = [SUPERADMIN, JEFE, "Visitante"];
// Siempre tienen todos los permisos
const ROLES_TODO_ACCESO = [SUPERADMIN, JEFE];

const TABS = [
    { id: "solicitudes", texto: "Solicitudes", icono: "fa-solid fa-user-clock",titulo:"Gestionar solicitudes" },
    { id: "usuarios", texto: "Usuarios", icono: "fa-solid fa-users", titulo:"Gestionar usuarios" },
    { id: "roles", texto: "Roles", icono: "fa-solid fa-user-shield", titulo:"Gestionar de roles" },
    { id: "historial", texto: "Historial de cambios", icono: "fa-solid fa-code-branch", titulo:"Ver el historial de cambios de los usuarios" },
    { id: "copias-seguridad", texto: "Copias de seguridad", icono: "fa-solid fa-cloud", titulo:"Gestionar backups" },
    { id: "pruebas", texto: "Pruebas", icono: "fa-solid fa-vial", titulo:"Correr pruebas automatizadas", soloSuperadmin: true },
];

function ErrorCampo({ mensaje }) {
    if (!mensaje) return null;
    return <p className="error-texto" role="alert">{mensaje}</p>;
}

// ---------- 1. Solicitudes de cuenta ----------
function PanelSolicitudes({ onCambioConteo }) {
    const [solicitudes, setSolicitudes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    const {datosPagina, paginaActual, totalPaginas, setPaginaActual} = usePaginacion(solicitudes, 7);

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
            await approveRequest(id); // el aviso de éxito o error lo muestra axios
            cargar();
        } catch {
            // aviso ya mostrado
        }
    };

    const pedirConfirmacion = useConfirm();
    const handleRechazar = async (id) => {
        if (!(await pedirConfirmacion({
            titulo: "Rechazar solicitud",
            mensaje: "¿Está seguro de rechazar esta solicitud?",
            textoConfirmar: "Rechazar",
            tipo: "warning",
        }))) return;
        try {
            await rejectRequest(id); // el aviso de éxito o error lo muestra axios
            cargar();
        } catch {
            // aviso ya mostrado
        }
    };

    if (cargando) return <LoadingScreen indeterminado />;

    return (
        <>
            {error && <p className="error-texto" role="alert">{error}</p>}
            <div className="table-responsive">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Correo</th>
                            <th>Documento</th>
                            <th>Rol</th>
                            <th>Correo verificado</th>
                            <th>Fecha</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {datosPagina.length > 0 ? datosPagina.map((s) => (
                            <tr key={s.id}>
                                <td>{s.name} {s.last_name}</td>
                                <td>{s.email}</td>
                                <td>{s.document_type} {s.document_number}</td>
                                <td>
                                    {/* Toda cuenta nueva entra como Visitante; el rol se cambia en la pestaña Usuarios */}
                                    <span className="badge badge-inactivo">{s.rol || "Visitante"}</span>
                                </td>
                                <td>
                                    <span className={`badge ${s.correo_verificado ? "badge-activo" : "badge-mantto"}`}>
                                        {s.correo_verificado ? "Sí" : "Pendiente"}
                                    </span>
                                </td>
                                <td>{new Date(s.created_at).toLocaleDateString("es-CO")}</td>
                                <td>
                                    <div className="btn-container">
                                        <Boton clase="btn-azul" icono="fa-solid fa-check" titulo="Aprobar solicitud" texto="Aprobar"onClick={() => handleAprobar(s.id)} />
                                        <Boton clase="btn-borrar" icono="fa-solid fa-xmark" texto="Rechazar" titulo="Rechazar solicitud" onClick={() => handleRechazar(s.id)} />
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="7" style={{ textAlign: "center" }}>No hay solicitudes pendientes.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <div className="roles-actions">
                    <Paginacion
                        paginaActual={paginaActual}
                        totalPaginas={totalPaginas}
                        setPaginaActual={setPaginaActual}
                    />
                </div>
            </div>
        </>
    );
}

// ---------- 2. Usuarios ----------
function FormularioPassword({ usuario, onCancel }) {
    const [password, setPassword] = useState("");
    const [confirmar, setConfirmar] = useState("");
    const [errores, setErrores] = useState({});
    const { advertencia } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const encontrados = soloErrores({
            password: validarContrasena(password, "La nueva contraseña"),
            confirmar: validarConfirmacion(password, confirmar),
        });
        setErrores(encontrados);
        const primero = Object.values(encontrados)[0];
        if (primero) {
            advertencia(primero, "Revisa la contraseña");
            return;
        }
        try {
            await cambiarPasswordUsuario(usuario.id, password, confirmar); // aviso de éxito: axios
            onCancel();
        } catch (err) {
            setErrores(erroresDelServidor(err));
        }
    };

    return (
        <Form
            titulo={`Cambiar contraseña de ${usuario.name}`}
            descripcion="El usuario deberá usar esta nueva contraseña en su próximo inicio de sesión. Sus sesiones abiertas se cerrarán."
            onCancel={onCancel}
            onSubmit={handleSubmit}
            textoBoton="Actualizar"
            iconoBoton="fa-solid fa-key"
            noValidate
        >
            <div className="col-span-3">
                <Text
                    label="Nueva contraseña:" id="password" name="password" type="password"
                    placeholder="Mínimo 8 caracteres" value={password} maxLength={64}
                    onChange={(e) => setPassword(filtrarContrasena(e.target.value))} required
                />
                <ErrorCampo mensaje={errores.password} />
                <RequisitosContrasena valor={password} />
            </div>
            <div className="col-span-3">
                <Text
                    label="Confirmar contraseña:" id="confirmar" name="confirmar" type="password"
                    placeholder="Repite la contraseña" value={confirmar} maxLength={64}
                    onChange={(e) => setConfirmar(filtrarContrasena(e.target.value))} required
                />
                <ErrorCampo mensaje={errores.confirmar} />
            </div>
        </Form>
    );
}

// Crear un usuario desde el panel (queda activo con el rol elegido)
function FormularioUsuario({ roles, onCancel, onSuccess }) {
    const [datos, setDatos] = useState({
        name: "", last_name: "", email: "", document_type: "", document_number: "",
        password: "", password_confirmation: "", role: "",
    });
    const [errores, setErrores] = useState({});
    const { advertencia } = useToast();
    const regla = REGLAS_DOCUMENTO[datos.document_type];

    const cambiar = (campo, valor) => {
        let limpio = valor;
        if (campo === "name" || campo === "last_name") limpio = filtrarNombre(valor);
        if (campo === "email") limpio = filtrarCorreo(valor);
        if (campo === "password" || campo === "password_confirmation") limpio = filtrarContrasena(valor);
        if (campo === "document_number") limpio = filtrarDocumento(valor, datos.document_type);

        setDatos((prev) => {
            const nuevo = { ...prev, [campo]: limpio };
            if (campo === "document_type") nuevo.document_number = filtrarDocumento(prev.document_number, valor);
            return nuevo;
        });
        setErrores((prev) => ({ ...prev, [campo]: undefined }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const encontrados = soloErrores({
            name: validarNombre(datos.name, "El nombre") || (tieneGroserias(datos.name) ? "El nombre no puede tener palabras inapropiadas." : null),
            last_name: validarNombre(datos.last_name, "El apellido") || (tieneGroserias(datos.last_name) ? "El apellido no puede tener palabras inapropiadas." : null),
            email: validarCorreo(datos.email),
            document_type: datos.document_type ? null : "Selecciona el tipo de documento.",
            document_number: datos.document_type ? validarDocumento(datos.document_type, datos.document_number) : null,
            password: validarContrasena(datos.password),
            password_confirmation: validarConfirmacion(datos.password, datos.password_confirmation),
            role: datos.role ? null : "Selecciona el rol del usuario.",
        });
        setErrores(encontrados);
        const primero = Object.values(encontrados)[0];
        if (primero) {
            advertencia(primero, "Revisa el formulario");
            return;
        }

        try {
            await crearUsuario({ ...datos, name: datos.name.trim(), last_name: datos.last_name.trim(), email: datos.email.trim().toLowerCase() });
            onSuccess();
            onCancel();
        } catch (err) {
            setErrores(erroresDelServidor(err)); // el aviso general lo muestra axios
        }
    };

    return (
        <Form
            titulo="Nuevo usuario"
            descripcion="La cuenta queda activa de inmediato con el rol que elijas. Comparte la contraseña con la persona de forma segura."
            onCancel={onCancel}
            onSubmit={handleSubmit}
            textoBoton="Crear usuario"
            iconoBoton="fa-solid fa-user-plus"
            noValidate
        >
            <div className="col-span-3">
                <Text label="Nombre:" id="nu-nombre" name="name" placeholder="Ej: Juan" value={datos.name} maxLength={50}
                    onChange={(e) => cambiar("name", e.target.value)} required />
                <ErrorCampo mensaje={errores.name} />
            </div>
            <div className="col-span-3">
                <Text label="Apellido:" id="nu-apellido" name="last_name" placeholder="Ej: García" value={datos.last_name} maxLength={50}
                    onChange={(e) => cambiar("last_name", e.target.value)} required />
                <ErrorCampo mensaje={errores.last_name} />
            </div>
            <div className="col-span-6">
                <Text label="Correo electrónico:" id="nu-correo" name="email" type="email" placeholder="usuario@correo.com"
                    value={datos.email} maxLength={100} onChange={(e) => cambiar("email", e.target.value)} required />
                <ErrorCampo mensaje={errores.email} />
            </div>
            <div className="col-span-3">
                <Select label="Tipo de documento:" id="nu-tipo" name="document_type" value={datos.document_type}
                    onChange={(e) => cambiar("document_type", e.target.value)} required
                    opciones={[{ valor: "", etiqueta: "Selecciona..." }, ...TIPOS_DOCUMENTO]} />
                <ErrorCampo mensaje={errores.document_type} />
            </div>
            <div className="col-span-3">
                <Text label="Número de documento:" id="nu-documento" name="document_number"
                    placeholder={regla ? regla.ejemplo : "Primero elige el tipo"} value={datos.document_number}
                    maxLength={regla?.max ?? 12} disabled={!datos.document_type}
                    onChange={(e) => cambiar("document_number", e.target.value)} required />
                <ErrorCampo mensaje={errores.document_number} />
            </div>
            <div className="col-span-3">
                <Text label="Contraseña:" id="nu-password" name="password" type="password" placeholder="Mínimo 8 caracteres"
                    value={datos.password} maxLength={64} onChange={(e) => cambiar("password", e.target.value)} required />
                <ErrorCampo mensaje={errores.password} />
                <RequisitosContrasena valor={datos.password} />
            </div>
            <div className="col-span-3">
                <Text label="Confirmar contraseña:" id="nu-password2" name="password_confirmation" type="password" placeholder="Repite la contraseña"
                    value={datos.password_confirmation} maxLength={64} onChange={(e) => cambiar("password_confirmation", e.target.value)} required />
                <ErrorCampo mensaje={errores.password_confirmation} />
            </div>
            <div className="col-span-6">
                <Select label="Rol:" id="nu-rol" name="role" value={datos.role} onChange={(e) => cambiar("role", e.target.value)} required
                    opciones={[{ valor: "", etiqueta: "Selecciona un rol..." }, ...roles.map((r) => ({ valor: r.name, etiqueta: r.name }))]} />
                <ErrorCampo mensaje={errores.role} />
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
    const [creando, setCreando] = useState(false);
    const { usuario: usuarioActual, tieneRol } = useAuth();
    const esSuperadmin = tieneRol(SUPERADMIN);

    const { datosPagina, paginaActual, totalPaginas, setPaginaActual } = usePaginacion(usuarios, 7);

    const cargar = useCallback(async () => {
        setCargando(true);
        setError(null);
        try {
            const [listaUsuarios, listaRoles] = await Promise.all([obtenerUsuarios(), obtenerRoles()]);
            setUsuarios(Array.isArray(listaUsuarios) ? listaUsuarios : []);
            // Solo un Superadministrador puede dar el rol Superadministrador
            setRoles(Array.isArray(listaRoles)
                ? listaRoles.filter((r) => r.is_active && (esSuperadmin || r.name !== SUPERADMIN))
                : []);
        } catch (err) {
            console.error("Error al cargar usuarios:", err);
            setError(err.response?.data?.message || "No se pudieron cargar los usuarios.");
        } finally {
            setCargando(false);
        }
    }, [esSuperadmin]);

    useEffect(() => { cargar(); }, [cargar]);

    const pedirConfirmacion = useConfirm();

    // Los avisos de éxito y error de estas peticiones los muestra axios
    const handleToggleActivo = async (u) => {
        if (u.is_active && !(await pedirConfirmacion({
            titulo: "Desactivar usuario",
            mensaje: `¿Desactivar la cuenta de ${u.name} ${u.last_name ?? ""}? Se cerrarán sus sesiones abiertas.`,
            textoConfirmar: "Desactivar",
            tipo: "warning",
        }))) return;
        try {
            await alternarActivoUsuario(u.id);
            cargar();
        } catch {
            // aviso ya mostrado
        }
    };

    const handleCambiarRol = async (u, nuevoRol) => {
        if (!nuevoRol || nuevoRol === u.roles?.[0]?.name) return;
        if (!(await pedirConfirmacion({
            titulo: "Cambiar rol",
            mensaje: `¿Cambiar el rol de ${u.name} a "${nuevoRol}"? Sus permisos cambiarán de inmediato.`,
            textoConfirmar: "Cambiar rol",
            tipo: "warning",
        }))) return;
        try {
            await cambiarRolUsuario(u.id, nuevoRol);
            cargar();
        } catch {
            // aviso ya mostrado
        }
    };

    if (cargando) return <LoadingScreen indeterminado />;

    return (
        <>
            {error && <p className="error-texto" role="alert">{error}</p>}
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
                        {datosPagina.length > 0 ? datosPagina.map((u) => (
                            <tr key={u.id}>
                                <td>{u.name} {u.last_name}</td>
                                <td>{u.email}</td>
                                <td>
                                    {u.id === usuarioActual?.id || u.editable === false || (!esSuperadmin && u.roles?.some((r) => r.name === SUPERADMIN)) ? (
                                        // Nadie cambia su propio rol, y el Jefe de mina no toca cuentas de Superadministrador
                                        <span className="badge badge-inactivo" title="No se puede cambiar desde tu cuenta">
                                            {u.roles?.map((r) => r.name).join(", ") || "Sin rol"}
                                        </span>
                                    ) : (
                                        <Select
                                            id={`rol-${u.id}`}
                                            name={`rol-${u.id}`}
                                            value={u.roles?.[0]?.name || ""}
                                            onChange={(e) => handleCambiarRol(u, e.target.value)}
                                            opciones={[
                                                ...(u.roles?.length ? [] : [{ valor: "", etiqueta: "Sin rol" }]),
                                                ...roles.map(r => ({ valor: r.name, etiqueta: r.name }))
                                            ]}
                                        />
                                    )}
                                </td>
                                <td>
                                    <span className={`badge ${u.is_active ? "badge-activo" : "badge-inactivo"}`}>
                                        {u.is_active ? "Activo" : "Inactivo"}
                                    </span>
                                </td>
                                <td>
                                    <div className="btn-container">
                                        <BotonAccion
                                            clase="btn-azul"
                                            icono={contrasenaIcono}
                                            titulo="Cambiar contraseña"
                                            texto="Cambiar"
                                            disabled={u.editable === false}
                                            onClick={() => setUsuarioPassword(u)}
                                        />
                                        <Boton
                                            clase={u.is_active ? "btn-borrar" : "btn-2"}
                                            icono={u.is_active ? "fa-solid fa-ban" : "fa-solid fa-circle-check"}
                                            titulo={u.is_active ? "Desactivar usuario" : "Activar usuario"}
                                            texto={u.is_active ? "Desactivar" : "Activar"}
                                            disabled={u.id === usuarioActual?.id || u.editable === false}
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
            <div className="roles-actions btn-container-page">
                <Boton
                    clase="btn-azul"
                    texto="Nuevo usuario"
                    img={agregarIcon}
                    titulo="Crear un usuario con su rol"
                    onClick={(e) => { e.preventDefault(); setCreando(true); }}
                />
                <Paginacion
                    paginaActual={paginaActual}
                    totalPaginas={totalPaginas}
                    setPaginaActual={setPaginaActual}
                />
            </div>
            {usuarioPassword && (
                <FormularioPassword
                    usuario={usuarioPassword}
                    onCancel={() => setUsuarioPassword(null)}
                />
            )}
            {creando && (
                <FormularioUsuario
                    roles={roles}
                    onCancel={() => setCreando(false)}
                    onSuccess={cargar}
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
    const [cargandoPermisos, setCargandoPermisos] = useState(true);
    const [errorPermisos, setErrorPermisos] = useState(null);
    const { advertencia } = useToast();
    const esEdicion = Boolean(rolEditar);
    const esRolProtegido = ROLES_TODO_ACCESO.includes(rolEditar?.name);
    const nombreFijo = ROLES_PROTEGIDOS.includes(rolEditar?.name);

    useEffect(() => {
        let activo = true;
        obtenerPermisosDisponibles()
            .then((disponibles) => {
                if (!activo) return;
                const nombresDisponibles = new Set(disponibles.flatMap((grupo) => grupo.permisos.map((permiso) => permiso.name)));
                setGrupos(disponibles);
                setPermisosSeleccionados((prev) => prev.filter((nombrePermiso) => nombresDisponibles.has(nombrePermiso)));
            })
            .catch((err) => {
                console.error("Error al cargar los permisos de roles:", err);
                if (activo) setErrorPermisos("No se pudieron cargar las funciones disponibles. Cierra y vuelve a abrir el formulario.");
            })
            .finally(() => { if (activo) setCargandoPermisos(false); });
        return () => { activo = false; };
    }, []);

    const togglePermiso = (nombrePermiso) => {
        setPermisosSeleccionados((prev) =>
            prev.includes(nombrePermiso) ? prev.filter((p) => p !== nombrePermiso) : [...prev, nombrePermiso]
        );
    };

    const seleccionarTodos = () => {
        setPermisosSeleccionados(
            grupos.flatMap((grupo) => grupo.permisos)
                .filter((permiso) => !permiso.solo_superadmin && !permiso.name.startsWith("superadmin."))
                .map((permiso) => permiso.name)
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (cargandoPermisos || errorPermisos || grupos.length === 0) {
            advertencia(errorPermisos || "Espera a que se carguen las funciones del sistema.", "Funciones no disponibles");
            return;
        }

        const limpio = nombre.trim().replace(/\s+/g, " ");
        const errorNombre = !limpio
            ? "El nombre del rol es obligatorio."
            : limpio.length < 3
                ? "El nombre del rol debe tener al menos 3 letras."
                : !/^\p{L}+( \p{L}+)*$/u.test(limpio)
                    ? "El nombre del rol solo puede tener letras y espacios."
                    : tieneGroserias(limpio) ? "El nombre del rol no puede tener palabras inapropiadas." : null;
        if (errorNombre) {
            setError(errorNombre);
            advertencia(errorNombre, "Revisa el nombre del rol");
            return;
        }
        if (!esRolProtegido && permisosSeleccionados.length === 0) {
            advertencia("Selecciona al menos un permiso para el rol.", "Sin permisos");
            return;
        }
        // Ver es la base de las demás acciones: si puede crear, editar o borrar, también debe poder ver
        const sinVer = [...new Set(permisosSeleccionados
            .filter((p) => !p.endsWith(".view"))
            .map((p) => p.split(".")[0]))]
            .filter((modulo) => !permisosSeleccionados.includes(`${modulo}.view`));
        if (!esRolProtegido && sinVer.length > 0) {
            advertencia("Si el rol puede crear, editar o eliminar en un módulo, también debe poder Ver ese módulo.", "Permisos incompletos");
            return;
        }

        setCargando(true);
        try {
            if (esEdicion) {
                await actualizarRol(rolEditar.id, limpio, permisosSeleccionados);
            } else {
                await crearRol(limpio, permisosSeleccionados);
            }
            onSuccess();
            onCancel();
        } catch (err) {
            const delServidor = erroresDelServidor(err);
            setError(delServidor.name || Object.values(delServidor)[0] || err.response?.data?.message || "No se pudo guardar el rol.");
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
            noValidate
        >
            <div className="col-span-6">
                <Text
                    label="Nombre del rol:" id="nombre" name="nombre"
                    placeholder="Ej: Supervisor" value={nombre} maxLength={50}
                    disabled={nombreFijo}
                    onChange={(e) => { setNombre(filtrarNombre(e.target.value)); setError(null); }} required
                />
                {error && <p className="error-texto" role="alert">{error}</p>}
            </div>

            <div className="col-span-6">
                <label className="form-label">¿Qué puede hacer este rol?</label>
                {esRolProtegido && (
                    <details className="permiso-detalle">
                        <summary>Detalle</summary>
                        <p>El rol {rolEditar.name} siempre tiene acceso a todo el sistema.</p>
                    </details>
                )}
                {!esRolProtegido && (
                    <>
                        <details className="permiso-detalle">
                            <summary>Detalle de funciones administrativas</summary>
                            <p>
                                Las solicitudes, usuarios, roles, historial y copias de seguridad son funciones administrativas reservadas a Jefe de mina y Superadministrador. Las pruebas automatizadas son exclusivas de Superadministrador.
                            </p>
                        </details>
                        {errorPermisos && <p className="error-texto" role="alert">{errorPermisos}</p>}
                    </>
                )}
            </div>

            {!esRolProtegido && grupos.map((grupo) => (
                <div className="col-span-6" key={grupo.modulo}>
                    <div className="permiso-grupo-heading">
                        <p>{grupo.etiqueta}</p>
                        <details className="permiso-detalle">
                            <summary>Detalle</summary>
                            <div className="permiso-detalle-contenido">
                                {grupo.descripcion && <p>{grupo.descripcion}</p>}
                                <ul>
                                    {grupo.permisos.map((permiso) => (
                                        <li key={permiso.name}><strong>{permiso.etiqueta}:</strong> {permiso.descripcion}</li>
                                    ))}
                                </ul>
                            </div>
                        </details>
                    </div>
                    <div className="permisos-acciones-grid">
                        {grupo.permisos.map((permiso) => (
                            <div className="permiso-accion" key={permiso.name}>
                                <span className="permiso-accion-label">{permiso.etiqueta}</span>
                                <label className="permiso-switch">
                                    <input
                                        id={`permiso-${permiso.name}`}
                                        name={permiso.name}
                                        type="checkbox"
                                        role="switch"
                                        aria-label={`${grupo.etiqueta}: ${permiso.etiqueta}`}
                                        checked={permisosSeleccionados.includes(permiso.name)}
                                        onChange={() => togglePermiso(permiso.name)}
                                    />
                                    <span className="permiso-switch-slider" aria-hidden="true" />
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
            {!esRolProtegido && (
                <div className="col-span-6 permisos-acciones-controles">
                    <button type="button" className="btn-2" onClick={seleccionarTodos} disabled={cargandoPermisos || grupos.length === 0}>
                        Seleccionar todas las funciones
                    </button>
                    <button type="button" className="btn-2" onClick={() => setPermisosSeleccionados([])} disabled={permisosSeleccionados.length === 0}>
                        Limpiar selección
                    </button>
                </div>
            )}
        </Form>
    );
}

function PanelRoles() {
    const [roles, setRoles] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [rolAEditar, setRolAEditar] = useState(null);
    const pedirConfirmacion = useConfirm();

    const { datosPagina, paginaActual, totalPaginas, setPaginaActual } = usePaginacion(roles, 7);

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
        if (r.is_active && !(await pedirConfirmacion({
            titulo: "Desactivar rol",
            mensaje: `¿Desactivar el rol "${r.name}"? Los ${r.users_count} usuario(s) con este rol perderán el acceso.`,
            textoConfirmar: "Desactivar",
            tipo: "warning",
        }))) return;
        try {
            await alternarActivoRol(r.id); // avisos: axios
            cargar();
        } catch {
            // aviso ya mostrado
        }
    };

    const handleEliminar = async (r) => {
        if (!(await pedirConfirmacion({
            titulo: "Eliminar rol",
            mensaje: `¿Eliminar el rol "${r.name}"? Esta acción no se puede deshacer.`,
        }))) return;
        try {
            await eliminarRol(r.id); // avisos: axios
            cargar();
        } catch {
            // aviso ya mostrado
        }
    };

    if (cargando) return <LoadingScreen indeterminado />;

    return (
        <>
            {error && <p className="error-texto" role="alert">{error}</p>}
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
                        {datosPagina.length > 0 ? datosPagina.map((r) => (
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
                                         
                                        <BotonAccion
                                            clase="btn-editar" icono={editarIcono} titulo="Editar rol"
                                            onClick={() => { setRolAEditar(r); setMostrarFormulario(true); }}
                                        />

                                       
                                        <BotonAccion
                                            clase="btn-borrar" icono={borrarIcono} titulo={ROLES_PROTEGIDOS.includes(r.name) ? "Este rol no se puede eliminar" : "Eliminar rol"}
                                            disabled={ROLES_PROTEGIDOS.includes(r.name) || r.users_count > 0}
                                            onClick={() => handleEliminar(r)}
                                        />

                                        <Boton
                                            clase={r.is_active ? "btn-borrar" : "btn-azul"}
                                            icono={r.is_active ? "fa-solid fa-ban" : "fa-solid fa-circle-check"}
                                            titulo={ROLES_PROTEGIDOS.includes(r.name) ? "Este rol no se puede desactivar" : r.is_active ? "Desactivar rol" : "Activar rol"}
                                            disabled={ROLES_PROTEGIDOS.includes(r.name)}
                                            onClick={() => handleToggleActivo(r)}
                                            texto={r.is_active ? "Desactivar" : "Activar"}
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
            <div className="roles-actions btn-container-page">
                <Boton
                    clase="btn-azul" 
                    texto="Nuevo rol" 
                    img={agregarIcon}
                    onClick={() => { setRolAEditar(null); setMostrarFormulario(true); }}
                    titulo="Añadir nuevo rol"
                />
                <Paginacion
                    paginaActual={paginaActual}
                    totalPaginas={totalPaginas}
                    setPaginaActual={setPaginaActual}
                />
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
// (ahora vive en PanelBackups.jsx)

// ---------- Panel principal ----------
function AdministrationPanel() {
    const { tieneRol } = useAuth();
    const [tabActiva, setTabActiva] = useState("solicitudes");
    const [conteoSolicitudes, setConteoSolicitudes] = useState(0);

    const esSuperadmin = tieneRol(SUPERADMIN);
    const esAdministrador = esSuperadmin || tieneRol(JEFE);

    if (!esAdministrador) {
        return (
            <div className="list-grid administration-grid">
                <header className="bienvenida">
                    <PageWelcome
                        titulo="Panel de administración"
                        descripcion="No tienes permisos para ver esta sección."
                    />
                </header>
                <p>Esta sección es solo para los roles <strong>Superadministrador</strong> y <strong>Jefe de mina</strong>.</p>
            </div>
        );
    }

    const tabs = TABS.filter((t) => !t.soloSuperadmin || esSuperadmin);

    return (
        <div className="list-grid administration-grid">
            <header className="bienvenida">
                <PageWelcome
                    titulo="Panel de administración"
                    descripcion={esSuperadmin
                        ? "Acceso completo: solicitudes, usuarios, roles, historial de cambios con reversión, backups y pruebas automatizadas."
                        : "Gestiona solicitudes de cuenta, usuarios, roles, historial de cambios y backups del sistema."}
                    mostrarHistorial={true}
                />
            </header>

            <div className="btn-container admin-tabs" role="tablist">
                {tabs.map((tab) => (
                    <Boton
                        key={tab.id}
                        clase={tabActiva === tab.id ? "btn-azul" : "btn-2"}
                        icono={tab.icono}
                        texto={
                            tab.id === "solicitudes" && conteoSolicitudes > 0
                                ? `${tab.texto} (${conteoSolicitudes})`
                                : tab.texto
                        }
                        titulo={tab.titulo}
                        onClick={() => setTabActiva(tab.id)}
                    />
                ))}
            </div>

            <div className="admin-content">
                {tabActiva === "solicitudes" && <PanelSolicitudes onCambioConteo={setConteoSolicitudes} />}
                {tabActiva === "usuarios" && <PanelUsuarios />}
                {tabActiva === "roles" && <PanelRoles />}
                {tabActiva === "historial" && <PanelHistorial />}
                {tabActiva === "copias-seguridad" && <PanelBackups />}
                {tabActiva === "pruebas" && esSuperadmin && <PanelPruebas />}
            </div>
        </div>
    );
}

export default AdministrationPanel;