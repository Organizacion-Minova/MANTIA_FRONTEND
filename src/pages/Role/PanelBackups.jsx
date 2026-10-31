
import { useState, useEffect, useCallback } from "react";
import { Boton } from "../../components/common/Button";
import { Form, Text, Checkbox } from "../../components/common/forms";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import LoadingScreen from "../../components/LoadingScreen";
import {
    obtenerOpcionesBackup, obtenerBackups, crearBackup,
    descargarBackup, eliminarBackup, restaurarBackup,
} from "../../api/admin";

const ACCIONES = {
    descargar: {
        titulo: "Descargar copia de seguridad",
        descripcion: "Escribe tu contraseña para descargar este archivo.",
        boton: "Descargar",
        icono: "fa-solid fa-download",
    },
    restaurar: {
        titulo: "Restaurar copia de seguridad",
        descripcion: "Los datos actuales de las tablas incluidas serán reemplazados por los de la copia. Escribe tu contraseña para continuar.",
        boton: "Restaurar",
        icono: "fa-solid fa-rotate-left",
    },
    eliminar: {
        titulo: "Eliminar copia de seguridad",
        descripcion: "La copia se borrará y no se podrá recuperar. Escribe tu contraseña para continuar.",
        boton: "Eliminar",
        icono: "fa-solid fa-trash",
    },
};

function PanelBackups() {
    const [opciones, setOpciones] = useState([]);
    const [seleccionadas, setSeleccionadas] = useState([]);
    const [backups, setBackups] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [generando, setGenerando] = useState(false);
    const [accion, setAccion] = useState(null); // { tipo, archivo }
    const [password, setPassword] = useState("");
    const [confirmaRestaurar, setConfirmaRestaurar] = useState(false);
    const { peligro, advertencia } = useToast();
    const { cargarUsuarioActual } = useAuth();

    const cargar = useCallback(async () => {
        setCargando(true);
        setError(null);
        try {
            const [listaOpciones, listaBackups] = await Promise.all([obtenerOpcionesBackup(), obtenerBackups()]);
            setOpciones(Array.isArray(listaOpciones) ? listaOpciones : []);
            setBackups(Array.isArray(listaBackups) ? listaBackups : []);
        } catch (err) {
            console.error("Error al cargar copias de seguridad:", err);
            setError(err.response?.data?.message || "No se pudieron cargar las copias de seguridad.");
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

    // Los mensajes de éxito y de error de estas peticiones ya los muestra axios.
    const handleGenerar = async () => {
        if (seleccionadas.length === 0) {
            peligro("Selecciona al menos una tabla para respaldar.");
            return;
        }
        setGenerando(true);
        try {
            await crearBackup(seleccionadas);
            setSeleccionadas([]);
            cargar();
        } catch {
            // el aviso de error ya salió
        } finally {
            setGenerando(false);
        }
    };

    const abrirConfirmacion = (tipo, archivo) => {
        setPassword("");
        setConfirmaRestaurar(false);
        setAccion({ tipo, archivo });
    };

    const cerrarConfirmacion = () => {
        setAccion(null);
        setPassword("");
        setConfirmaRestaurar(false);
    };

    const handleConfirmar = async (e) => {
        e.preventDefault();

        if (!password) {
            advertencia("Escribe tu contraseña para continuar.", "Contraseña requerida");
            return;
        }
        if (accion.tipo === "restaurar" && !confirmaRestaurar) {
            advertencia("Marca la casilla para confirmar que quieres reemplazar los datos actuales.", "Confirmación requerida");
            return;
        }

        try {
            if (accion.tipo === "descargar") await descargarBackup(accion.archivo, password);
            if (accion.tipo === "eliminar") await eliminarBackup(accion.archivo, password);
            if (accion.tipo === "restaurar") {
                await restaurarBackup(accion.archivo, password);
                await cargarUsuarioActual(); // los usuarios o roles pudieron cambiar
            }
            cerrarConfirmacion();
            cargar();
        } catch {
            setPassword(""); // contraseña incorrecta u otro error: el aviso ya salió
        }
    };

    if (cargando) return <LoadingScreen indeterminado />;

    if (error) return <div className="col-span-6">{error}</div>;

    const info = accion ? ACCIONES[accion.tipo] : null;

    return (
        <>
            <div className="form-container" style={{ marginBottom: "1.5rem" }}>
                <h3 className="form-title">Generar nueva copia de seguridad</h3>
                <p className="form-description">
                    Selecciona qué información quieres respaldar. Se incluyen automáticamente los datos que dependen de lo que elijas.
                    La copia se guarda en JSON con los datos cifrados, y con una huella (hash) y una firma para detectar si alguien la modifica.
                </p>
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
                        texto={generando ? "Generando..." : "Generar copia de seguridad"}
                        icono="fa-solid fa-database"
                        disabled={generando}
                        onClick={(e) => { e.preventDefault(); handleGenerar(); }}
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
                            <th>Huella (SHA-256)</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {backups.length > 0 ? backups.map((b) => (
                            <tr key={b.archivo}>
                                <td>{b.archivo}</td>
                                <td>{(b.incluye ?? b.tablas)?.join(", ")}</td>
                                <td>{b.creado_por}</td>
                                <td>{new Date(b.creado_en).toLocaleString("es-CO")}</td>
                                <td>{b.peso_kb} KB</td>
                                <td title={b.hash}>{b.hash ? `${b.hash.slice(0, 12)}…` : "Sin huella (copia anterior)"}</td>
                                <td>
                                    <div className="btn-container">
                                        <Boton
                                            clase="btn-azul" icono="fa-solid fa-download" titulo="Descargar copia de seguridad"
                                            onClick={(e) => { e.preventDefault(); abrirConfirmacion("descargar", b.archivo); }}
                                        />
                                        {b.hash && (
                                            <Boton
                                                clase="btn-azul" icono="fa-solid fa-rotate-left" titulo="Restaurar copia de seguridad"
                                                onClick={(e) => { e.preventDefault(); abrirConfirmacion("restaurar", b.archivo); }}
                                            />
                                        )}
                                        <Boton
                                            clase="btn-2" icono="fa-solid fa-trash" titulo="Eliminar copia de seguridad"
                                            onClick={(e) => { e.preventDefault(); abrirConfirmacion("eliminar", b.archivo); }}
                                        />
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="7" style={{ textAlign: "center" }}>Aún no se ha generado ningún backup.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {accion && (
                <Form
                    titulo={info.titulo}
                    descripcion={info.descripcion}
                    onCancel={cerrarConfirmacion}
                    onSubmit={handleConfirmar}
                    textoBoton={info.boton}
                    iconoBoton={info.icono}
                    tituloBoton={info.boton}
                >
                    <div className="col-span-6">{accion.archivo}</div>
                    <div className="col-span-6">
                        <Text
                            label="Tu contraseña:"
                            id="password-backup"
                            name="password-backup"
                            type="password"
                            placeholder="Escribe tu contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {accion.tipo === "restaurar" && (
                        <div className="col-span-6">
                            <Checkbox
                                id="confirma-restaurar"
                                name="confirma-restaurar"
                                label="Entiendo que se reemplazarán los datos actuales"
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