import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Boton, BotonAccion, BotonLink } from "../../../components/common/Button";
import { PageWelcome } from "../../../components/common/welcome";
import { Text, Select, Checkbox, Date  } from "../../../components/common/forms";
import LoadingScreen from "../../../components/LoadingScreen";
import { GetEquipmentInspectionFormat, CreateInspectionFormat, UpdateInspectionFormat } from "../../../api/Equipmentsapi";
import { capitalizarPrimeraLetra, sinCaracteresEspeciales, validarGroserias } from "../../../components/common/Validations";
import { useToast } from "../../../context/ToastContext";
import { mensajeDeError } from "../../../utils/errores";
import izquierdaIcon from "../../../assets/icons/flecha-izquierda.svg";
import izquierdaIcon2 from "../../../assets/icons/flecha-izquierda2.svg";

const PRESETS_OPCIONES = {
    "B,M": ["B", "M"],
    "C,NC,N/A": ["C", "NC", "N/A"],
    "SI,NO": ["SI", "NO"],
};

const CAMPOS_ENCABEZADO = [
    { key: "project", label: "Proyecto" },
    { key: "area", label: "Área" },
    { key: "work_group", label: "Grupo de trabajo" },
];

const FIRMANTE_BASE = { key: "inspector", label: "Realiza la inspección" };
const FIRMANTES_OPCIONALES = [
    { key: "collaborator", label: "Colaborador" },
    { key: "reviewer", label: "Revisó (Vo.Bo.)" },
];

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
const nuevaPregunta = () => ({ id: nuevoId(), text: "" });
const nuevaSeccion = () => ({
    id: nuevoId(),
    title: "",
    mode: "daily",
    opciones: "B,M",
    marking: "cell",
    instructions: "",
    has_observation: false,
    questions: [nuevaPregunta()],
});

export default function ConstructorFormato({ editar = false }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [equipment, setEquipment] = useState(null);
    const [errorCarga, setErrorCarga] = useState(false);
    const [code, setCode] = useState("");
    const [version, setVersion] = useState("");
    const [validFrom, setValidFrom] = useState("");
    const [camposEncabezado, setCamposEncabezado] = useState([]);
    const [firmantesExtra, setFirmantesExtra] = useState([]);
    const [secciones, setSecciones] = useState([nuevaSeccion()]);
    const [errores, setErrores] = useState({});
    const [enviando, setEnviando] = useState(false);
    const [formatoId, setFormatoId] = useState(null); 
    const { advertencia, peligro } = useToast();

    useEffect(() => {
        GetEquipmentInspectionFormat(id)
            .then((datos) => {
                const f = datos.format;

                if (!editar && f) {
                    navigate(`/equipment/cardequipment/${id}/inspection/complete`, { replace: true });
                    return;
                }
                if (editar && !f) {
                    navigate(`/equipment/cardequipment/${id}/inspection/questions`, { replace: true });
                    return;
                }

                setEquipment(datos.equipment);

                if (editar) {
                    setFormatoId(f.id);
                    setCode(f.code || "");
                    setVersion(f.version || "");
                    setValidFrom(f.valid_from ? f.valid_from.slice(0, 10) : "");
                    setCamposEncabezado((f.header_fields || []).map((c) => c.key));
                    setFirmantesExtra(
                        (f.signers || []).map((x) => x.key).filter((k) => k !== "inspector")
                    );
                    setSecciones(
                        f.sections.map((s) => ({
                            id: nuevoId(),
                            dbId: s.id,
                            title: s.title,
                            mode: s.mode,
                            marking: s.marking || "cell",
                            opciones: s.options.join(","),
                            instructions: s.instructions || "",
                            has_observation: s.has_observation,
                            questions: s.questions.map((q) => ({
                                id: nuevoId(),
                                dbId: q.id,
                                text: q.text,
                            })),
                        }))
                    );
                }
            })
            .catch((error) => {
                console.error("Error al cargar el formato de inspección:", error);
                peligro(mensajeDeError(error, "No se pudo cargar el formato de inspección."), "No se pudo cargar");
                setErrorCarga(true);
            });
    }, [id, editar, navigate, peligro]);

    const actualizarSeccion = (seccionId, campo, valor) =>
        setSecciones((prev) => prev.map((s) => (s.id === seccionId ? { ...s, [campo]: valor } : s)));

    const eliminarSeccion = (seccionId) =>
        setSecciones((prev) => prev.filter((s) => s.id !== seccionId));

    const agregarPregunta = (seccionId) => {
        setSecciones((prev) =>
            prev.map((s) =>
                s.id === seccionId ? { ...s, questions: [...s.questions, nuevaPregunta()] } : s
            )
        );
        setErrores((prev) => {
            const siguientes = { ...prev };
            delete siguientes[`section-${seccionId}-questions`];
            return siguientes;
        });
    };

    const actualizarPregunta = (seccionId, preguntaId, texto) =>
        setSecciones((prev) =>
            prev.map((s) =>
                s.id === seccionId
                    ? { ...s, questions: s.questions.map((q) => (q.id === preguntaId ? { ...q, text: texto } : q)) }
                    : s
            )
        );

    const eliminarPregunta = (seccionId, preguntaId) =>
        setSecciones((prev) =>
            prev.map((s) =>
                s.id === seccionId ? { ...s, questions: s.questions.filter((q) => q.id !== preguntaId) } : s
            )
        );

    const alternar = (lista, setLista, key) =>
        setLista(lista.includes(key) ? lista.filter((k) => k !== key) : [...lista, key]);

    const cambiarCampo = (campo, valor) => {
        setErrores((prev) => {
            const siguientes = { ...prev };
            const error = (valor);
            if (error) siguientes[campo] = error;
            else delete siguientes[campo];
            return siguientes;
        });
    };

    const validarFormato = () => {
        const nuevosErrores = {};
        const agregarError = (campo, error) => {
            if (error) nuevosErrores[campo] = error;
        };

        agregarError("code", validarCodigo(code));
        agregarError("version", validarVersion(version));

        if (secciones.length === 0) {
            agregarError("sections", "Agrega al menos una sección al formato.");
        }

        secciones.forEach((seccion, seccionIndex) => {
            agregarError(
                `section-${seccion.id}-title`,
                validarTexto(seccion.title, `El título de la sección ${seccionIndex + 1}`, {
                    requerido: true,
                    soloTexto: true,
                })
            );
            if (seccion.questions.length === 0) {
                agregarError(
                    `section-${seccion.id}-questions`,
                    `Agrega al menos una pregunta a la sección ${seccionIndex + 1}.`
                );
            }
            seccion.questions.forEach((pregunta, preguntaIndex) => {
                agregarError(
                    `question-${pregunta.id}`,
                    validarTexto(pregunta.text, `La pregunta ${seccionIndex + 1}.${preguntaIndex + 1}`, {
                        requerido: true,
                    })
                );
            });
            agregarError(
                `instructions-${seccion.id}`,
                validarTexto(seccion.instructions, `Las instrucciones de la sección ${seccionIndex + 1}`)
            );
        });

        setErrores(nuevosErrores);
        return nuevosErrores;
    };

    const handleGuardar = async () => {
        if (enviando) return;

        const erroresFormato = validarFormato();
        if (Object.keys(erroresFormato).length > 0) {
            advertencia(Object.values(erroresFormato).join(" "), "Revisa los datos del formato");
            return;
        }

        const datos = {
            equipment_id: Number(id),
            code: code.trim() || null,
            version: version.trim() || null,
            valid_from: validFrom || null,
            header_fields: CAMPOS_ENCABEZADO.filter((c) => camposEncabezado.includes(c.key)),
            signers: [
                FIRMANTE_BASE,
                ...FIRMANTES_OPCIONALES.filter((f) => firmantesExtra.includes(f.key)),
            ],
            sections: secciones.map((s) => ({
                ...(s.dbId ? { id: s.dbId } : {}),
                title: s.title.trim(),
                mode: s.mode,
                options: PRESETS_OPCIONES[s.opciones],
                instructions: s.instructions.trim() || null,
                has_observation: s.has_observation,
                questions: editar
                    ? s.questions
                        .filter((q) => q.text.trim())
                        .map((q) => ({ ...(q.dbId ? { id: q.dbId } : {}), text: q.text.trim() }))
                    : s.questions.map((q) => q.text.trim()).filter(Boolean),
            })),
        };

        setEnviando(true);
        try {
            if (editar) {
                await UpdateInspectionFormat(formatoId, datos);
            } else {
                await CreateInspectionFormat(datos);
            }
            navigate(`/equipment/cardequipment/${id}/inspection/complete`, { replace: true });
        } catch (error) {
            if (error.response?.status === 422) {
                advertencia(mensajeDeError(error, "Revisa los datos del formato."), "No se pudo guardar");
            } else {
                console.error("Error al guardar el formato:", error);
                peligro(mensajeDeError(error, "No se pudo guardar el formato."), "No se pudo guardar");
            }
        } finally {
            setEnviando(false);
        }
    };

    if (errorCarga) {
        return (
            <div className="list-grid">
                <p>No se pudo cargar el equipo.</p>
                <div className="btn-container">
                    <BotonLink 
                        link="/equipment" 
                        clase="btn-regresar" 
                        img={izquierdaIcon}
                        imgDark={izquierdaIcon2}
                        texto="Regresar" 
                        titulo="Regresar a la página del equipo"
                    />
                        
                </div>
            </div>
        );
    }
    if (!equipment) return <LoadingScreen indeterminado />;

    return (
        <div className="equipment-format-grid">
            <header className="bienvenida">
                <PageWelcome
                    titulo={editar ? `Editar formato: ${equipment.name}` : `Nuevo formato: ${equipment.name}`}
                    mostrarHistorial={true}
                    descripcion={ editar ? "Modifica las secciones y preguntas del formato." : "Este equipo aún no tiene formato de inspección. Arma el formato por secciones."}
                />  

            </header>
            <div className="card equipment-format-grid__wide">
                <div className="form-grid">
                    
                    <div className="col-span-2">
                        <Text 
                            label="Código del formato:" 
                            id="codigo" 
                            name="codigo" 
                            placeholder="Ej: HSE-F-035"
                            value={code}
                            onChange={(e) => {
                                const valor = capitalizarPrimeraLetra(e.target.value);
                                setCode(valor);
                                cambiarCampo("code", valor, validarCodigo);
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
                            placeholder="Ej: 01"
                            type="number"
                            value={version} 
                            onChange={(e) => {
                                setVersion(e.target.value);
                                cambiarCampo("version", e.target.value, validarVersion);
                            }}
                            maxLength={20}
                            required
                        />
                    </div>
                    <div className="col-span-2">
                        <Date
                            label="Vigente desde:" 
                            id="vigente" 
                            name="vigente"
                            value={validFrom} 
                            onChange={(e) => {
                                setValidFrom(e.target.value);
                                cambiarCampo("validFrom", e.target.value);
                            }}
                            required
                        />
                    </div>
                </div>
            </div>
            <div className="card">
                <h3>Datos adicionales del encabezado</h3>
                <p>El nombre, la marca, el modelo y la ubicación se llenan solos desde el equipo. Marca lo que además debe escribir quien inspecciona:</p>
                {CAMPOS_ENCABEZADO.map((c) => (
                    <Checkbox 
                        key={c.key} 
                        label={c.label} 
                        id={`campo-${c.key}`} 
                        name={`campo-${c.key}`}
                        checked={camposEncabezado.includes(c.key)}
                        onChange={() => alternar(camposEncabezado, setCamposEncabezado, c.key)} 
                    />
                ))}
            </div>

            <div className="card">
                <h3>Firmantes</h3>
                <p>Siempre firma quien realiza la inspección. Marca quién más firma en este formato:</p>
                {FIRMANTES_OPCIONALES.map((f) => (
                    <Checkbox 
                        key={f.key} 
                        label={f.label} 
                        id={`firmante-${f.key}`} 
                        name={`firmante-${f.key}`}
                        checked={firmantesExtra.includes(f.key)}
                        onChange={() => alternar(firmantesExtra, setFirmantesExtra, f.key)} 
                        />
                ))}
            </div>

            {secciones.map((s, i) => (
                <div key={s.id} className="card equipment-format-grid__wide">
                    <h3>Sección {i + 1}</h3>
                    <div className="form-grid">
                        <div className="col-span-6">
                            <Text 
                                label="Título de la sección:" 
                                id={`titulo-${s.id}`} 
                                name={`titulo-${s.id}`}
                                placeholder="Ej: Estado mecánico" 
                                value={s.title}
                                onChange={(e) => {
                                    const valor = capitalizarPrimeraLetra(e.target.value);
                                    actualizarSeccion(s.id, "title", valor);
                                    cambiarCampo(
                                        `section-${s.id}-title`,
                                        valor,
                                        (texto) => validarTexto(texto, `El título de la sección ${i + 1}`, {
                                            requerido: true,
                                            soloTexto: true,
                                        })
                                    );
                                }}
                                maxLength={255}
                                required
                            />
                        </div>
                        <div className="col-span-3">
                            <Select 
                                label="Se marca:" 
                                id={`modo-${s.id}`} 
                                name={`modo-${s.id}`}
                                value={s.mode} 
                                onChange={(e) => {actualizarSeccion(s.id, "mode", e.target.value)}}
                                opciones={[
                                    { valor: "daily", etiqueta: "Todos los días" },
                                    { valor: "weekly", etiqueta: "Una vez por semana" },
                                ]} />
                        </div>
                        <div className="col-span-3">
                            <Select 
                                label="Opciones de respuesta:" 
                                id={`opciones-${s.id}`} 
                                name={`opciones-${s.id}`}
                                value={s.opciones} 
                                onChange={(e) => actualizarSeccion(s.id, "opciones", e.target.value)}
                                opciones={[
                                    { valor: "B,M", etiqueta: "B / M (bueno, malo)" },
                                    { valor: "C,NC,N/A", etiqueta: "C / NC / N/A (cumple, no cumple, no aplica)" },
                                    { valor: "SI,NO", etiqueta: "SI / NO" },
                                ]} />
                        </div>
                        <div className="col-span-6">
                            <Text 
                                label="Instrucciones (opcional):" 
                                id={`instrucciones-${s.id}`} 
                                name={`instrucciones-${s.id}`}
                                placeholder="Ej: Marque C (cumple), NC (no cumple) o N/A (no aplica)"
                                value={s.instructions}
                                onChange={(e) => {
                                    actualizarSeccion(s.id, "instructions", e.target.value);
                                    cambiarCampo(
                                        `instructions-${s.id}`,
                                        e.target.value,
                                        (texto) => validarTexto(texto, `Las instrucciones de la sección ${i + 1}`)
                                    );
                                }}
                                maxLength={255}
                            />
                        </div>
                        <div className="col-span-6">
                            <Checkbox 
                                label="Observación por pregunta (opcional)" 
                                id={`obs-${s.id}`} 
                                name={`obs-${s.id}`}
                                checked={s.has_observation}
                                onChange={(e) => actualizarSeccion(s.id, "has_observation", e.target.checked)} />
                        </div>
                        {s.questions.map((q, j) => (
                            <div key={q.id} className="col-span-3">
                                <div className="machine-question-row">
                                    <Text
                                        label={`Pregunta: ${i + 1}.${j + 1}`}
                                        id={`pregunta-${s.id}-${q.id}`}
                                        name={`pregunta-${s.id}-${q.id}`}
                                        type="text"
                                        placeholder="Escribe la pregunta"
                                        value={q.text}
                                        onChange={(e) => {
                                            const valor = capitalizarPrimeraLetra(e.target.value);
                                            actualizarPregunta(s.id, q.id, valor);
                                            cambiarCampo(
                                                `question-${q.id}`,
                                                valor,
                                                (texto) => validarTexto(texto, `La pregunta ${i + 1}.${j + 1}`, {
                                                    requerido: true,
                                                })
                                                
                                            );
                                        }} 
                                        maxLength={255}
                                        required
                                    />
                                    <div className="machine-question-actions">
                                        <BotonAccion
                                            clase="btn-borrar" 
                                            iconoFa="fa-solid fa-trash"
                                            titulo="Eliminar pregunta"
                                            onClick={() => eliminarPregunta(s.id, q.id)} 
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
                            texto="Agregar pregunta"
                            titulo="Agregar pregunta a la sección"
                            onClick={() => agregarPregunta(s.id)} />
                        {secciones.length > 1 && (
                            <Boton 
                                clase="btn-borrar" 
                                icono="fa-solid fa-trash" 
                                texto="Eliminar sección"
                                titulo="Eliminar sección"
                                onClick={() => eliminarSeccion(s.id)} />
                        )}
                    </div>
                </div>
            ))}

            <div className="btn-container">
                <Boton 
                    clase="btn-azul" 
                    icono="fa-solid fa-plus"
                    texto="Agregar sección"
                    onClick={() => setSecciones((prev) => [...prev, nuevaSeccion()])} 
                    titulo="Agregar sección"/>
                <Boton 
                    clase="btn-2" 
                    icono="fa-solid fa-floppy-disk"
                    texto={enviando ? "Guardando..." : "Guardar formato"} 
                    onClick={handleGuardar} 
                    titulo="Guardar el formato de inspección"/>
                <div className="footer-btns">
                    <BotonLink 
                        link={`/equipment/cardequipment/${id}/inspection/complete`} 
                        clase="btn-regresar" 
                        img={izquierdaIcon}
                        imgDark={izquierdaIcon2}
                        texto="Regresar al formato" 
                        titulo="Regresar al formato"/>
                </div>
            </div>
        </div>
    );
}