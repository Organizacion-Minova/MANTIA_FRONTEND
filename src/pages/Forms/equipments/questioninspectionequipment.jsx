import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Boton, BotonLink } from "../../../components/common/Button";
import { PageWelcome } from "../../../components/common/welcome";
import { Text, Select, Checkbox, Date as CampoFecha } from "../../../components/common/forms";
import LoadingScreen from "../../../components/LoadingScreen";
import { GetEquipmentInspectionFormat, CreateInspectionFormat } from "../../../api/Equipmentsapi";

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

let contador = 0;
const nuevoId = () => ++contador;
const nuevaPregunta = () => ({ id: nuevoId(), text: "" });
const nuevaSeccion = () => ({
    id: nuevoId(),
    title: "",
    mode: "daily",
    opciones: "B,M",
    instructions: "",
    has_observation: false,
    questions: [nuevaPregunta()],
});

export default function ConstructorFormato() {
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
    const [errores, setErrores] = useState([]);
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        GetEquipmentInspectionFormat(id)
            .then((datos) => {
                if (datos.format) {
                    navigate(`/equipment/${id}/inspection/complete`, { replace: true });
                } else {
                    setEquipment(datos.equipment);
                }
            })
            .catch((error) => {
                console.error("Error al cargar el equipo:", error);
                setErrorCarga(true);
            });
    }, [id]);

    const actualizarSeccion = (seccionId, campo, valor) =>
        setSecciones((prev) => prev.map((s) => (s.id === seccionId ? { ...s, [campo]: valor } : s)));

    const eliminarSeccion = (seccionId) =>
        setSecciones((prev) => prev.filter((s) => s.id !== seccionId));

    const agregarPregunta = (seccionId) =>
        setSecciones((prev) =>
            prev.map((s) =>
                s.id === seccionId ? { ...s, questions: [...s.questions, nuevaPregunta()] } : s
            )
        );

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

    const handleGuardar = async () => {
        if (enviando) return;

        const problemas = [];
        secciones.forEach((s, i) => {
            if (!s.title.trim()) problemas.push(`La sección ${i + 1} necesita un título.`);
            if (!s.questions.some((q) => q.text.trim())) {
                problemas.push(`La sección ${i + 1} necesita al menos una pregunta.`);
            }
        });
        if (problemas.length > 0) {
            setErrores(problemas);
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
                title: s.title.trim(),
                mode: s.mode,
                options: PRESETS_OPCIONES[s.opciones],
                instructions: s.instructions.trim() || null,
                has_observation: s.has_observation,
                questions: s.questions.map((q) => q.text.trim()).filter(Boolean),
            })),
        };

        setErrores([]);
        setEnviando(true);
        try {
            await CreateInspectionFormat(datos);
            navigate(`/equipment/${id}/inspection/complete`, { replace: true });
        } catch (error) {
            if (error.response?.status === 422) {
                setErrores(Object.values(error.response.data.errors).flat());
            } else {
                console.error("Error al guardar el formato:", error);
                setErrores(["No se pudo guardar el formato."]);
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
                    <BotonLink link="/equipment" clase="btn-2" icono="fa-solid fa-arrow-left" texto="Regresar" />
                </div>
            </div>
        );
    }
    if (!equipment) return <LoadingScreen indeterminado />;

    return (
        <div className="list-grid">
            <header className="bienvenida">
                <PageWelcome
                    titulo={`Nuevo formato: ${equipment.name}`}
                    descripcion="Este equipo aún no tiene formato de inspección. Arma el formato por secciones."
                />
            </header>

            <div className="form-grid">
                <div className="col-span-2">
                    <Text label="Código del formato:" id="codigo" name="codigo" placeholder="Ej: HSE-F-035"
                        value={code} onChange={(e) => setCode(e.target.value)} />
                </div>
                <div className="col-span-2">
                    <Text label="Versión:" id="version" name="version" placeholder="Ej: 01"
                        value={version} onChange={(e) => setVersion(e.target.value)} />
                </div>
                <div className="col-span-2">
                    <CampoFecha label="Vigente desde:" id="vigente" name="vigente"
                        value={validFrom} onChange={(e) => setValidFrom(e.target.value)} />
                </div>
            </div>

            <div className="seccion-card">
                <h3>Datos adicionales del encabezado</h3>
                <p>El nombre, la marca, el modelo y la ubicación se llenan solos desde el equipo. Marca lo que además debe escribir quien inspecciona:</p>
                {CAMPOS_ENCABEZADO.map((c) => (
                    <Checkbox key={c.key} label={c.label} id={`campo-${c.key}`} name={`campo-${c.key}`}
                        checked={camposEncabezado.includes(c.key)}
                        onChange={() => alternar(camposEncabezado, setCamposEncabezado, c.key)} />
                ))}
            </div>

            <div className="seccion-card">
                <h3>Firmantes</h3>
                <p>Siempre firma quien realiza la inspección. Marca quién más firma en este formato:</p>
                {FIRMANTES_OPCIONALES.map((f) => (
                    <Checkbox key={f.key} label={f.label} id={`firmante-${f.key}`} name={`firmante-${f.key}`}
                        checked={firmantesExtra.includes(f.key)}
                        onChange={() => alternar(firmantesExtra, setFirmantesExtra, f.key)} />
                ))}
            </div>

            {secciones.map((s, i) => (
                <div key={s.id} className="seccion-card">
                    <h3>Sección {i + 1}</h3>
                    <div className="form-grid">
                        <div className="col-span-6">
                            <Text label="Título de la sección:" id={`titulo-${s.id}`} name={`titulo-${s.id}`}
                                placeholder="Ej: Estado mecánico" value={s.title}
                                onChange={(e) => actualizarSeccion(s.id, "title", e.target.value)} />
                        </div>
                        <div className="col-span-3">
                            <Select label="Se marca:" id={`modo-${s.id}`} name={`modo-${s.id}`}
                                value={s.mode} onChange={(e) => actualizarSeccion(s.id, "mode", e.target.value)}
                                opciones={[
                                    { valor: "daily", etiqueta: "Todos los días" },
                                    { valor: "weekly", etiqueta: "Una vez por semana" },
                                ]} />
                        </div>
                        <div className="col-span-3">
                            <Select label="Opciones de respuesta:" id={`opciones-${s.id}`} name={`opciones-${s.id}`}
                                value={s.opciones} onChange={(e) => actualizarSeccion(s.id, "opciones", e.target.value)}
                                opciones={[
                                    { valor: "B,M", etiqueta: "B / M (bueno, malo)" },
                                    { valor: "C,NC,N/A", etiqueta: "C / NC / N/A (cumple, no cumple, no aplica)" },
                                    { valor: "SI,NO", etiqueta: "SI / NO" },
                                ]} />
                        </div>
                        <div className="col-span-6">
                            <Text label="Instrucciones (opcional):" id={`instrucciones-${s.id}`} name={`instrucciones-${s.id}`}
                                placeholder="Ej: Marque C (cumple), NC (no cumple) o N/A (no aplica)"
                                value={s.instructions}
                                onChange={(e) => actualizarSeccion(s.id, "instructions", e.target.value)} />
                        </div>
                        <div className="col-span-6">
                            <Checkbox label="Observación por pregunta" id={`obs-${s.id}`} name={`obs-${s.id}`}
                                checked={s.has_observation}
                                onChange={(e) => actualizarSeccion(s.id, "has_observation", e.target.checked)} />
                        </div>
                    </div>

                    {s.questions.map((q, j) => (
                        <div key={q.id} className="pregunta-fila">
                            <span className="pregunta-numero">{i + 1}.{j + 1}</span>
                            <input type="text" placeholder="Escribe la pregunta" value={q.text}
                                onChange={(e) => actualizarPregunta(s.id, q.id, e.target.value)} />
                            <Boton clase="btn-2" icono="fa-solid fa-trash" titulo="Eliminar pregunta"
                                onClick={() => eliminarPregunta(s.id, q.id)} />
                        </div>
                    ))}

                    <div className="btn-container">
                        <Boton clase="btn-azul" icono="fa-solid fa-plus" texto="Agregar pregunta"
                            onClick={() => agregarPregunta(s.id)} />
                        {secciones.length > 1 && (
                            <Boton clase="btn-2" icono="fa-solid fa-trash" texto="Eliminar sección"
                                onClick={() => eliminarSeccion(s.id)} />
                        )}
                    </div>
                </div>
            ))}

            {errores.map((mensaje, k) => (
                <p key={k} className="error-texto">{mensaje}</p>
            ))}

            <div className="btn-container">
                <Boton clase="btn-azul" icono="fa-solid fa-plus" texto="Agregar sección"
                    onClick={() => setSecciones((prev) => [...prev, nuevaSeccion()])} />
                <Boton clase="btn-azul" icono="fa-solid fa-floppy-disk"
                    texto={enviando ? "Guardando..." : "Guardar formato"} onClick={handleGuardar} />
                <BotonLink link={`/equipment/cardequipment/${id}`} clase="btn-2" icono="fa-solid fa-arrow-left" texto="Cancelar" />
            </div>
        </div>
    );
}