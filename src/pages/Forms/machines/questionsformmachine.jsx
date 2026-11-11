import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Boton, BotonAccion, BotonLink } from "../../../components/common/Button";
import { PageWelcome } from "../../../components/common/welcome";
import { Text } from "../../../components/common/forms";
import LoadingScreen from "../../../components/LoadingScreen";
import { GetMachineFormat, CreateMachineFormat, UpdateMachineFormat } from "../../../api/machinesapi";
import { TIPOS, rutaForm, rutaMaquina, letraSeccion, numerarPreguntas } from "../../../components/common/Formarchine";
import borrarIcono from "../../../assets/icons/borrar.svg"
import {
    capitalizarPrimeraLetra,
    sinCaracteresEspeciales,
    validarGroserias,
} from "../../../components/common/Validations";
import { useToast } from "../../../context/ToastContext";
import { mensajeDeError } from "../../../utils/errores";

const validarCodigo = (valor) => {
    const texto = valor.trim();
    if (!texto) return "El código del formato es obligatorio.";
    if (texto.length > 50) return "El código no puede superar los 50 caracteres.";
    if (!/^[\p{L}\p{N}]+(?:[ -][\p{L}\p{N}]+)*$/u.test(texto)) {
        return "Usa solo letras, números, espacios y guiones en el código.";
    }
    if (Object.keys(validarGroserias({ codigo: texto })).length > 0) {
        return "El código contiene palabras inapropiadas.";
    }
    return "";
};

const validarVersion = (valor) => {
    const texto = valor.trim();
    if (!texto) return "La versión del formato es obligatoria.";
    if (texto.length > 20) return "La versión no puede superar los 20 caracteres.";
    if (!/^\d+(?:\.\d+)*$/.test(texto)) {
        return "La versión debe contener números, opcionalmente separados por puntos.";
    }
    return "";
};

const validarTexto = (valor, etiqueta, { requerido = false, soloTexto = false } = {}) => {
    const texto = valor.trim();
    if (requerido && !texto) return `Completa ${etiqueta.toLocaleLowerCase("es")}.`;
    if (texto.length > 255) return `${etiqueta} no puede superar los 255 caracteres.`;
    if (soloTexto && texto && !sinCaracteresEspeciales(texto)) {
        return `${etiqueta} solo puede contener letras, números y espacios.`;
    }
    if (texto && Object.keys(validarGroserias({ texto })).length > 0) {
        return `${etiqueta} contiene palabras inapropiadas.`;
    }
    return "";
};

let contador = 0;
const nuevoId = () => ++contador;
const nuevaFila = (type = "item") => ({ id: nuevoId(), type, text: "" });
const nuevaSeccion = () => ({ id: nuevoId(), title: "", rows: [nuevaFila("item")] });

export default function ConstructorFormatoMaquina({ editar = false }) {
    const { id, kind } = useParams();
    const navigate = useNavigate();
    const [maquina, setMaquina] = useState(null);
    const [categoria, setCategoria] = useState(null);
    const [formatoId, setFormatoId] = useState(null);
    const [errorCarga, setErrorCarga] = useState(false);
    const [code, setCode] = useState("");
    const [version, setVersion] = useState("");
    const [validFrom, setValidFrom] = useState("");
    const [secciones, setSecciones] = useState([nuevaSeccion()]);
    const [errores, setErrores] = useState([]);
    const [enviando, setEnviando] = useState(false);
    const { advertencia, peligro } = useToast();

    useEffect(() => {
        GetMachineFormat(id)
            .then((datos) => {
                const f = datos.format;

                if (!editar && f) {
                    navigate(rutaForm(id, kind, "/complete"), { replace: true });
                    return;
                }
                if (editar && !f) {
                    navigate(rutaForm(id, kind, "/questions"), { replace: true });
                    return;
                }

                setMaquina(datos.machine);
                setCategoria(datos.category);

                if (editar) {
                    setFormatoId(f.id);
                    setCode(f.code || "");
                    setVersion(f.version || "");
                    setValidFrom(f.valid_from ? f.valid_from.slice(0, 10) : "");
                    setSecciones(
                        f.sections.map((s) => ({
                            id: nuevoId(),
                            dbId: s.id,
                            title: s.title,
                            rows: s.questions.map((q) => ({
                                id: nuevoId(),
                                dbId: q.id,
                                type: q.type,
                                text: q.text,
                            })),
                        }))
                    );
                }
            })
            .catch((error) => {
                console.error("Error al cargar la máquina:", error);
                peligro(mensajeDeError(error, "No se pudo cargar el formato de la máquina."), "No se pudo cargar");
                setErrorCarga(true);
            });
    }, [id, kind, editar, navigate, peligro]);

    const actualizarSeccion = (sid, campo, valor) =>
        setSecciones((prev) => prev.map((s) => (s.id === sid ? { ...s, [campo]: valor } : s)));

    const eliminarSeccion = (sid) =>
        setSecciones((prev) => prev.filter((s) => s.id !== sid));

    const agregarFila = (sid, type) =>
        setSecciones((prev) =>
            prev.map((s) => (s.id === sid ? { ...s, rows: [...s.rows, nuevaFila(type)] } : s))
        );

    const actualizarFila = (sid, fid, texto) =>
        setSecciones((prev) =>
            prev.map((s) =>
                s.id === sid
                    ? { ...s, rows: s.rows.map((r) => (r.id === fid ? { ...r, text: texto } : r)) }
                    : s
            )
        );

    const eliminarFila = (sid, fid) =>
        setSecciones((prev) =>
            prev.map((s) => (s.id === sid ? { ...s, rows: s.rows.filter((r) => r.id !== fid) } : s))
        );

    const handleGuardar = async () => {
        if (enviando) return;

        const problemas = [];
        const agregarProblema = (problema) => {
            if (problema) problemas.push(problema);
        };
        agregarProblema(validarCodigo(code));
        agregarProblema(validarVersion(version));
        if (!validFrom) problemas.push("Selecciona la fecha desde la que el formato está vigente.");
        if (secciones.length === 0) problemas.push("Agrega al menos una sección al formato.");

        secciones.forEach((s, i) => {
            agregarProblema(validarTexto(s.title, `El título de la sección ${i + 1}`, {
                requerido: true,
                soloTexto: true,
            }));
            if (!s.rows.some((r) => r.type === "item" && r.text.trim())) {
                problemas.push(`La sección ${letraSeccion(i + 1)} necesita al menos una pregunta.`);
            }
            s.rows.forEach((r, j) => {
                agregarProblema(validarTexto(
                    r.text,
                    r.type === "group"
                        ? `El título del grupo ${i + 1}.${j + 1}`
                        : `La pregunta ${i + 1}.${j + 1}`,
                    { requerido: true }
                ));
            });
        });
        if (problemas.length > 0) {
            setErrores(problemas);
            advertencia(problemas.join(" "), "Revisa los datos del formato");
            return;
        }

        const datos = {
            category_id: categoria.id,
            code: code.trim() || null,
            version: version.trim() || null,
            valid_from: validFrom || null,
            sections: secciones.map((s) => ({
                ...(s.dbId ? { id: s.dbId } : {}),
                title: s.title.trim(),
                questions: s.rows
                    .filter((r) => r.text.trim())
                    .map((r) => ({
                        ...(r.dbId ? { id: r.dbId } : {}),
                        type: r.type,
                        text: r.text.trim(),
                    })),
            })),
        };

        setErrores([]);
        setEnviando(true);
        try {
            if (editar) {
                await UpdateMachineFormat(formatoId, datos);
            } else {
                await CreateMachineFormat(datos);
            }
            navigate(rutaForm(id, kind, "/complete"), { replace: true });
        } catch (error) {
            if (error.response?.status === 422) {
                const erroresServidor = Object.values(error.response.data.errors || {}).flat();
                setErrores(erroresServidor);
                advertencia(mensajeDeError(error, "Revisa los datos del formato."), "No se pudo guardar");
            } else {
                console.error("Error al guardar el formato:", error);
                const mensaje = mensajeDeError(error, "No se pudo guardar el formato.");
                setErrores([mensaje]);
                peligro(mensaje, "No se pudo guardar");
            }
        } finally {
            setEnviando(false);
        }
    };

    if (!TIPOS[kind]) return <p>Tipo de formato no válido.</p>;

    if (errorCarga) {
        return (
            <div className="list-grid">
                <p>No se pudo cargar la máquina.</p>
                <div className="btn-container">
                    <BotonLink 
                        link="/machines" 
                        clase="btn-2" 
                        icono="fa-solid fa-arrow-left" 
                        texto="Regresar" 
                        titulo="Regresar a la lista de máquinas"
                    />
                </div>
            </div>
        );
    }

    if (!maquina) return <LoadingScreen indeterminado />;

    if (!categoria) {
        return (
            <div className="list-grid">
                <p>Esta máquina no tiene categoría asignada. Asígnale una para poder armar su formato.</p>
                <div className="btn-container">
                    <BotonLink 
                        link={rutaMaquina(id)} 
                        clase="btn-2" 
                        icono="fa-solid fa-arrow-left" 
                        texto="Regresar" 
                        titulo="Regresar a la máquina"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="machine-format-grid">
            <header className="bienvenida">
                <PageWelcome
                    titulo={`${editar ? "Editar" : "Nuevo"} formato: ${categoria.name}`}
                    descripcion={`Este formato aplica a todas las máquinas de la categoría ${categoria.name}, tanto para el preoperacional como para la inspección.`}
                    mostrarHistorial={true}
                />
            </header>

            <div className="card machine-format-grid__wide">
                <div className="form-grid">
                    <div className="col-span-2">
                        <Text 
                            label="Código del formato:" 
                            id="codigo" 
                            name="codigo" 
                            placeholder="Ej: SST-FT-003"
                            value={code} 
                            onChange={(e) => {
                                const entrada = e.target.value;
                                if (entrada === "" || /^[\p{L}\p{N} -]*$/u.test(entrada)) {
                                    setCode(capitalizarPrimeraLetra(entrada));
                                }
                            }}
                            maxLength={50}
                            required
                            />
                    </div>
                    <div className="col-span-2">
                        <Text 
                            label="Versión:" 
                            id="version" 
                            name="version" 
                            placeholder="Ej: 0.1"
                            type="text"
                            value={version} 
                            maxLength={20}
                            onChange={(e) => {
                                const valor = e.target.value;
                                if (valor === "" || /^\d*(?:\.\d*)*$/.test(valor)) setVersion(valor);
                            }}
                            required
                        />
                    </div>
                    <div className="col-span-2">
                        <Text label="Vigente desde:" id="vigente" name="vigente" type="date"
                            value={validFrom} onChange={(e) => setValidFrom(e.target.value)} required />
                    </div>
                </div>
            </div>

            {secciones.map((s, i) => (
                <div key={s.id} className="card machine-format-grid__wide">
                    <h3>Sección {letraSeccion(i + 1)}</h3>
                    <div className="form-grid">
                        <div className="col-span-6">
                            <Text
                                label="Título de la sección:"
                                id={`titulo-${s.id}`}
                                name={`titulo-${s.id}`}
                                placeholder="Ej: Verificación del estado de la máquina"
                                value={s.title}
                                onChange={(e) => {
                                    const valor = e.target.value;
                                    if (valor === "" || sinCaracteresEspeciales(valor)) {
                                        actualizarSeccion(s.id, "title", capitalizarPrimeraLetra(valor));
                                    }
                                }}
                                maxLength={255}
                                required
                            />
                        </div>
                        
                        {numerarPreguntas(s.rows).map((r) => (
                            <div key={r.id} className="col-span-3">
                                <div className="machine-question-row">
                                    <Text
                                        label={r.numero}
                                        placeholder={r.type === "group" ? "Título del grupo (ej: ¿Se encuentra en buen estado la base?)" : "Escribe la pregunta"}
                                        value={r.text}
                                        onChange={(e) => actualizarFila(s.id, r.id, capitalizarPrimeraLetra(e.target.value))}
                                        maxLength={255}
                                        required
                                    />
                                    <div className="machine-question-actions">
                                        <BotonAccion
                                            clase="btn-borrar" 
                                            icono={borrarIcono}
                                            titulo="Eliminar"
                                            onClick={() => eliminarFila(s.id, r.id)} 
                                        />
                                    </div>

                                </div>
                            </div>
                        ))}
                        
                    </div>
                    <br />

                    <div className="btn-container">
                        <Boton 
                            clase="btn-azul" 
                            icono="fa-solid fa-plus" 
                            texto="Agregar grupo"
                            onClick={() => agregarFila(s.id, "group")} 
                            titulo="Agregar un grupo de preguntas (con título y varias preguntas dentro)"
                        />
                        <Boton 
                            clase="btn-2" 
                            icono="fa-solid fa-plus" 
                            texto="Agregar pregunta"
                            onClick={() => agregarFila(s.id, "item")} 
                            titulo="Agregar una pregunta individual (sin título de grupo)"
                        />
                        {secciones.length > 1 && (
                            <Boton 
                                clase="btn-borrar" 
                                icono="fa-solid fa-trash-can" 
                                texto="Eliminar sección"
                                onClick={() => eliminarSeccion(s.id)} 
                                titulo="Eliminar esta sección y todas sus preguntas"
                            />
                        )}
                    </div>
                </div>
            ))}

            {editar && (
                <p className="machine-format-grid__wide">
                    Si quitas una pregunta que ya tiene respuestas guardadas, no se borra: se desactiva
                    para no perder los registros anteriores.
                </p>
            )}


            <div className="btn-container">
                <Boton 
                    clase="btn-azul" 
                    icono="fa-solid fa-plus" 
                    texto="Agregar sección"
                    onClick={() => setSecciones((prev) => [...prev, nuevaSeccion()])} 
                    titulo="Agregar una nueva sección de preguntas"
                />
                <Boton 
                    clase="btn-2" 
                    icono="fa-solid fa-floppy-disk"
                    texto={enviando ? "Guardando..." : editar ? "Guardar cambios" : "Guardar formato"}
                    onClick={handleGuardar} 
                    titulo="Guardar los cambios realizados"
                />
                <div className="footer-btns">
                    <BotonLink 
                        link={rutaMaquina(id)} 
                        clase="btn-regresar" 
                        icono="fa-solid fa-arrow-left"
                        texto="Regresar" 
                        titulo="Cancelar y regresar" 
                    />
                </div>
            </div>
        </div>
    );
}