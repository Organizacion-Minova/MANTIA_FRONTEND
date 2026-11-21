import { useState, useEffect, useCallback } from "react";
import { Boton } from "../../components/common/Button";
import { Form, Text, Checkbox } from "../../components/common/forms";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import LoadingScreen from "../../components/LoadingScreen";
import {
    obtenerBackups, crearPrimerBackup, crearBackup,
    descargarBackup, eliminarBackup, restaurarBackup,
} from "../../api/admin";
import { usePaginacion, Paginacion } from "../../components/common/Paginacion";
import { erroresDelServidor } from "../../utils/validacionesUsuario";

const ACCIONES = {
    generar: {
        titulo: "Generar copia de seguridad general",
        descripcion: "Se respaldará TODA la información del sistema.",
        boton: "Generar",
        icono: "fa-solid fa-database",
    },
    descargar: {
        titulo: "Descargar copia de seguridad",
        descripcion: "Escribe la clave administrativa configurada en el servidor para descargar este archivo.",
        boton: "Descargar",
        icono: "fa-solid fa-download",
    },
    restaurar: {
        titulo: "Restaurar copia de seguridad",
        descripcion: "TODOS los datos actuales del sistema serán reemplazados por los de esta copia. Escribe la clave administrativa del servidor para continuar.",
        boton: "Restaurar",
        icono: "fa-solid fa-rotate-left",
    },
    eliminar: {
        titulo: "Eliminar copia de seguridad",
        descripcion: "La copia se borrará y no se podrá recuperar. Escribe la clave administrativa del servidor para continuar.",
        boton: "Eliminar",
        icono: "fa-solid fa-trash",
    },
};

function ErrorCampo({ mensaje }) {
    if (!mensaje) return null;
    return <p className="error-texto col-span-6" role="alert">{mensaje}</p>;
}

function PanelBackups() {
    const [backups, setBackups] = useState([]);
    const [primerBackup, setPrimerBackup] = useState(true);
    const [claveAdminConfigurada, setClaveAdminConfigurada] = useState(false);
    const [resumen, setResumen] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [accion, setAccion] = useState(null); // { tipo, archivo }
    const [credencial, setCredencial] = useState("");
    const [errorCredencial, setErrorCredencial] = useState(null);
    const [confirmaRestaurar, setConfirmaRestaurar] = useState(false);
    const { advertencia } = useToast();
    const { cargarUsuarioActual } = useAuth();

    const { datosPagina, paginaActual, totalPaginas, setPaginaActual } = usePaginacion(backups, 7);

    const cargar = useCallback(async () => {
        setCargando(true);
        setError(null);
        try {
            const data = await obtenerBackups();
            setBackups(Array.isArray(data.backups) ? data.backups : []);
            setPrimerBackup(Boolean(data.primer_backup));
            setClaveAdminConfigurada(Boolean(data.clave_admin_configurada));
            setResumen(data.resumen ?? null);
        } catch (err) {
            console.error("Error al cargar copias de seguridad:", err);
            setError(err.response?.data?.message || "No se pudieron cargar las copias de seguridad.");
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => { cargar(); }, [cargar]);

    const abrirAccion = (tipo, archivo = null) => {
        setCredencial("");
        setErrorCredencial(null);
        setConfirmaRestaurar(false);
        setAccion({ tipo, archivo });
    };

    const cerrarAccion = () => {
        setAccion(null);
        setCredencial("");
        setErrorCredencial(null);
        setConfirmaRestaurar(false);
    };

    // Los avisos de éxito y de error de estas peticiones ya los muestra axios.
    const handleConfirmar = async (e) => {
        e.preventDefault();

        const esPrimerBackup = accion.tipo === "generar" && primerBackup;
        const campoCredencial = esPrimerBackup ? "password" : "clave_admin";
        const mensajeRequerido = esPrimerBackup
            ? "Escribe la contraseña de inicio de sesión."
            : "Escribe la clave administrativa configurada en el servidor.";

        if (!credencial) {
            setErrorCredencial(mensajeRequerido);
            advertencia(mensajeRequerido, "Credencial requerida");
            return;
        }
        if (accion.tipo === "restaurar" && !confirmaRestaurar) {
            advertencia("Marca la casilla para confirmar que quieres reemplazar los datos actuales.", "Confirmación requerida");
            return;
        }

        try {
            if (accion.tipo === "generar") {
                if (esPrimerBackup) await crearPrimerBackup(credencial);
                else await crearBackup(credencial);
            }
            if (accion.tipo === "descargar") await descargarBackup(accion.archivo, credencial);
            if (accion.tipo === "eliminar") await eliminarBackup(accion.archivo, credencial);
            if (accion.tipo === "restaurar") {
                await restaurarBackup(accion.archivo, credencial);
                await cargarUsuarioActual(); // los usuarios o roles pudieron cambiar
            }
            cerrarAccion();
            await cargar();
        } catch (err) {
            setCredencial("");
            const erroresServidor = erroresDelServidor(err);
            setErrorCredencial(erroresServidor[campoCredencial] ?? err.response?.data?.message ?? null);
        }
    };

    if (cargando) return <LoadingScreen indeterminado />;

    if (error) return <p className="error-texto" role="alert">{error}</p>;

    const info = accion
        ? {
            ...ACCIONES[accion.tipo],
            descripcion: accion.tipo === "generar"
                ? (primerBackup
                    ? "Se respaldará TODA la información del sistema. Confirma con la contraseña de inicio de sesión de tu cuenta."
                    : "Se respaldará TODA la información del sistema. Escribe la clave administrativa configurada en el servidor.")
                : ACCIONES[accion.tipo].descripcion,
        }
        : null;
    const requierePasswordCuenta = accion?.tipo === "generar" && primerBackup;

    return (
        <>
            <div className="form-container" style={{ marginBottom: "1.5rem" }}>
                <h3 className="form-title">Copia de seguridad general</h3>
                <p className="form-description">
                    Respalda TODA la información del sistema en un solo archivo: usuarios, roles, máquinas, equipos, herramientas,
                    ubicaciones, formatos, inspecciones, mediciones de gases y uso diario.
                    {resumen && ` Ahora mismo: ${resumen.tablas} tablas y ${resumen.registros} registros.`}
                    {" "}La copia se guarda cifrada, con una huella (hash) y una firma para detectar si alguien la modifica.
                </p>

                {primerBackup ? (
                    <p className="form-description" role="status">
                        <i className="fa-solid fa-lock" aria-hidden="true" /> La primera copia requiere tu contraseña de inicio de sesión. Después, las acciones de copia de seguridad pedirán la clave interna del servidor.
                    </p>
                ) : claveAdminConfigurada ? (
                    <p className="form-description" role="status">
                        <i className="fa-solid fa-shield-halved" aria-hidden="true" /> Clave administrativa configurada. Se pedirá para crear copias adicionales, descargarlas, restaurarlas o eliminarlas.
                    </p>
                ) : (
                    <p className="form-description error-texto" role="alert">
                        La variable BACKUP_ADMIN_KEY no está configurada en el servidor. Configúrala en el .env para administrar copias después de generar la primera.
                    </p>
                )}

                <div className="btn-container" style={{ marginTop: "1rem" }}>
                    <Boton
                        clase="btn-azul" icono="fa-solid fa-database" texto={primerBackup ? "Generar primera copia" : "Generar copia general"}
                        titulo="Generar una copia de seguridad de todo el sistema"
                        onClick={(e) => { e.preventDefault(); abrirAccion("generar"); }}
                    />
                </div>
            </div>

            <div className="table-responsive">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Archivo</th>
                            <th>Tipo</th>
                            <th>Creado por</th>
                            <th>Fecha</th>
                            <th>Tamaño</th>
                            <th>Huella (SHA-256)</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {datosPagina.length > 0 ? datosPagina.map((b) => (
                            <tr key={b.archivo}>
                                <td>{b.archivo}</td>
                                <td>
                                    <span className={`badge ${b.tipo === "general" ? "badge-activo" : "badge-inactivo"}`}>
                                        {b.tipo === "general" ? "General" : "Parcial (anterior)"}
                                    </span>
                                    {b.registros != null && <div className="form-help-text">{b.registros} registros</div>}
                                </td>
                                <td>{b.creado_por}</td>
                                <td>{new Date(b.creado_en).toLocaleString("es-CO")}</td>
                                <td>{b.peso_kb} KB</td>
                                <td title={b.hash}>{b.hash ? `${b.hash.slice(0, 12)}…` : "Sin huella (copia anterior)"}</td>
                                <td>
                                    <div className="btn-container">
                                        <Boton
                                            clase="btn-azul" icono="fa-solid fa-download" titulo="Descargar copia de seguridad"
                                            onClick={(e) => { e.preventDefault(); abrirAccion("descargar", b.archivo); }}
                                        />
                                        {b.hash && (
                                            <Boton
                                                clase="btn-azul" icono="fa-solid fa-rotate-left" titulo="Restaurar copia de seguridad"
                                                onClick={(e) => { e.preventDefault(); abrirAccion("restaurar", b.archivo); }}
                                            />
                                        )}
                                        <Boton
                                            clase="btn-2" icono="fa-solid fa-trash" titulo="Eliminar copia de seguridad"
                                            onClick={(e) => { e.preventDefault(); abrirAccion("eliminar", b.archivo); }}
                                        />
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="7" style={{ textAlign: "center" }}>Aún no se ha generado ninguna copia de seguridad.</td>
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

            {accion && (
                <Form
                    titulo={info.titulo}
                    descripcion={info.descripcion}
                    onCancel={cerrarAccion}
                    onSubmit={handleConfirmar}
                    textoBoton={info.boton}
                    iconoBoton={info.icono}
                    tituloBoton={info.boton}
                    noValidate
                >
                    {accion.archivo && <div className="col-span-6">{accion.archivo}</div>}
                    <div className="col-span-6">
                        <Text
                            label={requierePasswordCuenta ? "Contraseña de inicio de sesión:" : "Clave administrativa del servidor:"}
                            id="credencial-backup"
                            name={requierePasswordCuenta ? "password" : "clave_admin"}
                            type="password"
                            placeholder={requierePasswordCuenta ? "Tu contraseña de inicio de sesión" : "BACKUP_ADMIN_KEY"}
                            maxLength={requierePasswordCuenta ? 64 : 255}
                            value={credencial}
                            onChange={(e) => { setCredencial(e.target.value); setErrorCredencial(null); }}
                            required
                        />
                        <ErrorCampo mensaje={errorCredencial} />
                    </div>
                    {accion.tipo === "restaurar" && (
                        <div className="col-span-6">
                            <Checkbox
                                id="confirma-restaurar"
                                name="confirma-restaurar"
                                label="Entiendo que se reemplazarán TODOS los datos actuales"
                                checked={confirmaRestaurar}
                                onChange={() => setConfirmaRestaurar((v) => !v)}
                            />
                        </div>
                    )}
                </Form>
            )}
        </>
    );
}

export default PanelBackups;
