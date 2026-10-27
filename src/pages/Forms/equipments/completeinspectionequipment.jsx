import { useEffect,useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageWelcome } from "../../../components/common/welcome";
import { Text,  Radio, Dropzone } from "../../../components/common/forms";
import { Boton, BotonLink } from "../../../components/common/Button";
import LoadingScreen from "../../../components/LoadingScreen";
import { GetEquipmentQuestions, CreateEquipmentInspection } from "../../../api/Equipmentsapi";

const ANSWER_MAP = { SI: "yes", NO: "no", "N/A": "na" };
const TIPOS_IMAGEN_FIRMA = ["image/png", "image/jpeg", "image/webp"];
const TAMANO_MAXIMO_FIRMA = 2 * 1024 * 1024;

const initialHeader = {
    inspector_name: "",
    inspection_date: "",
    inspection_time: "",
    equipment_brand: "",
    voltage: "",
    serial_number: "",
    area: "",
    general_observations: "",
    responsible_position: "",
    warehouse_manager_name: "",
};

function LlenarInspeccionEquipo() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [preguntas, setPreguntas] = useState([]);
    const [respuestas, setRespuestas] = useState({});
    const [header, setHeader] = useState(initialHeader);
    const [firmas, setFirmas] = useState({
        responsible_signature: null,
        warehouse_manager_signature: null,
    });
    const [previews, setPreviews] = useState({});
    const [erroresFirma, setErroresFirma] = useState({});
    const [cargando, setCargando] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState("");
    const [erroresCampos, setErroresCampos] = useState({});

    useEffect(() => {
        setCargando(true);
        GetEquipmentQuestions(id)
            .then(setPreguntas)
            .catch((err) => {
                console.error("Error al cargar las preguntas de inspección:", err);
                setPreguntas([]);
                setError("No se pudieron cargar las preguntas. Verifica la conexión con el servidor.");
            })
            .finally(() => setCargando(false));
    }, [id]);

    const actualizarHeader = (campo, valor) =>
        setHeader((prev) => ({ ...prev, [campo]: valor }));

    const actualizarRespuesta = (idPregunta, campo, valor) => {
        setRespuestas((prev) => ({
            ...prev,
            [idPregunta]: { ...prev[idPregunta], [campo]: valor },
        }));
    };

    const seleccionarFirma = (campo, archivo) => {
        if (!archivo) return;

        if (!TIPOS_IMAGEN_FIRMA.includes(archivo.type)) {
            setErroresFirma((prev) => ({
                ...prev,
                [campo]: "La firma debe ser una imagen PNG, JPG o WEBP.",
            }));
            return;
        }

        if (archivo.size > TAMANO_MAXIMO_FIRMA) {
            setErroresFirma((prev) => ({
                ...prev,
                [campo]: "La firma no puede superar los 2 MB.",
            }));
            return;
        }

        const lector = new FileReader();
        lector.onload = () => {
            if (typeof lector.result !== "string") {
                setErroresFirma((prev) => ({
                    ...prev,
                    [campo]: "No se pudo generar la vista previa de la firma.",
                }));
                return;
            }

            setFirmas((prev) => ({ ...prev, [campo]: archivo }));
            setPreviews((prev) => ({ ...prev, [campo]: lector.result }));
            setErroresFirma((prev) => ({ ...prev, [campo]: "" }));
        };
        lector.onerror = () => {
            setErroresFirma((prev) => ({
                ...prev,
                [campo]: "No se pudo leer la imagen. Intenta seleccionarla de nuevo.",
            }));
        };
        lector.readAsDataURL(archivo);
    };

    const quitarFirma = (campo) => {
        setFirmas((prev) => ({ ...prev, [campo]: null }));
        setPreviews((prev) => ({ ...prev, [campo]: "" }));
        setErroresFirma((prev) => ({ ...prev, [campo]: "" }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setErroresCampos({});

        // Todas las preguntas deben tener respuesta (el backend también lo exige)
        const sinResponder = preguntas.filter((p) => !respuestas[p.id]?.valor);
        if (sinResponder.length > 0) {
            setError(`Faltan ${sinResponder.length} pregunta(s) por responder.`);
            return;
        }

        // Armar el FormData
        const formData = new FormData();
        formData.append("equipment_id", id);

        Object.entries(header).forEach(([campo, valor]) => {
            if (valor !== "") formData.append(campo, valor); // los vacíos no se envían (son nullable)
        });

        Object.entries(firmas).forEach(([campo, archivo]) => {
            if (archivo) formData.append(campo, archivo);
        });

        preguntas.forEach((p, i) => {
            formData.append(`answers[${i}][question_id]`, p.id);
            formData.append(`answers[${i}][answer]`, ANSWER_MAP[respuestas[p.id].valor]);
            const obs = respuestas[p.id]?.observacion?.trim();
            if (obs) formData.append(`answers[${i}][observation]`, obs);
        });

        setEnviando(true);
        try {
            await CreateEquipmentInspection(formData);
            navigate(`/equipment/${id}/inspection/show`);
        } catch (err) {
            const errors = err.response?.data?.errors;
            if (errors) {
                setErroresCampos(errors);
                setError(err.response.data.message || "Revisa los campos marcados.");
            } else {
                setError("No se pudo guardar la inspección.");
            }
        } finally {
            setEnviando(false);
        }
    };

    if (cargando) return <LoadingScreen indeterminado />;

    
    return (
        <div>
            <PageWelcome
                titulo="LLENAR INSPECCIÓN"
                descripcion="Completa el formato de inspeccion de la maquina."
            />
            <form onSubmit={handleSubmit}>
                <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: '16px' }}>
                    <div className="col-span-3">
                        <Text 
                            id="inspector_name" 
                            name="inspector_name" 
                            label="Nombre del responsable de la inspección" 
                            required
                            value={header.inspector_name}
                            onChange={(e) => actualizarHeader("inspector_name", e.target.value)} 
                        />
                    </div>
                    <div className="col-span-3">
                        <Text 
                            id="inspection_date" 
                            name="inspection_date" 
                            type="date" 
                            label="Fecha" 
                            required
                            value={header.inspection_date}
                            onChange={(e) => actualizarHeader("inspection_date", e.target.value)} 
                        />
                    </div>
                    <div className="col-span-3">
                        <Text 
                            id="equipment_brand" 
                            name="equipment_brand" 
                            label="Marca de la herramienta" 
                            required
                            value={header.equipment_brand}
                            onChange={(e) => actualizarHeader("equipment_brand", e.target.value)} 
                        />
                    </div>
                    <div className="col-span-3">
                        <Text 
                            id="voltage" 
                            name="voltage" 
                            label="Voltaje"    
                            value={header.voltage}
                            onChange={(e) => actualizarHeader("voltage", e.target.value)} 
                        />
                    </div>
                    <div className="col-span-3">
                        <Text 
                            id="serial_number" 
                            name="serial_number" 
                            label="Serial"
                            value={header.serial_number}
                            onChange={(e) => actualizarHeader("serial_number", e.target.value)} 
                        />
                    </div>
                    <div className="col-span-3">
                        <Text 
                            id="area" 
                            name="area" 
                            label="Área" 
                            required
                            value={header.area}
                            onChange={(e) => actualizarHeader("area", e.target.value)} 
                        />
                    </div>
                </div>
                <br />
                {preguntas.map((pregunta) => (
                    
                    <div key={pregunta.id} className="card" style={{ marginBottom: "16px" }}>
                        <label>{pregunta.text}</label>

                        <Radio
                            id={`pregunta-${pregunta.id}`}
                            name={`pregunta-${pregunta.id}`}
                            value={respuestas[pregunta.id]?.valor || ""}
                            onChange={(e) => actualizarRespuesta(pregunta.id, "valor", e.target.value)}
                            opciones={["SI", "NO", "N/A"]}
                        />
                        <br />

                        <Text
                            id={`obs-${pregunta.id}`}
                            name={`obs-${pregunta.id}`}
                            label="Observaciones"
                            placeholder="Escribe una observación (opcional)"
                            value={respuestas[pregunta.id]?.observacion || ""}
                            onChange={(e) => actualizarRespuesta(pregunta.id, "observacion", e.target.value)}
                        />
                    </div>
                    
                ))}
                <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: '16px'}}>
                    <div className="col-span-3">
                        <Text 
                            id="general_observations" 
                            name="general_observations" 
                            label="Observaciones generales"
                            value={header.general_observations}
                            onChange={(e) => actualizarHeader("general_observations", e.target.value)} 
                        />
                    </div>
                    <div className="col-span-3">
                        <Text 
                            id="responsible_position" 
                            name="responsible_position" 
                            label="Cargo del responsable"
                            value={header.responsible_position}
                            onChange={(e) => actualizarHeader("responsible_position", e.target.value)} 
                            required
                        />
                    </div>
                    <div className="col-span-6">
                        <Dropzone
                            label="Firma del responsable"
                            id="responsible_signature"
                            name="responsible_signature"
                            accept="image/png,image/jpeg,image/webp"
                            ayuda="PNG, JPG o WEBP hasta 2 MB"
                            error={erroresFirma.responsible_signature}
                            preview={previews.responsible_signature}
                            previewLabel={firmas.responsible_signature?.name}
                            previewAlt="Firma del responsable"
                            onChange={(e) => {
                                seleccionarFirma("responsible_signature", e.target.files?.[0]);
                                e.target.value = "";
                            }}
                            onFileDrop={(e) => seleccionarFirma("responsible_signature", e.dataTransfer.files?.[0])}
                            onRemove={() => quitarFirma("responsible_signature")}
                        />
                    </div>
                </div>
                <br />
                <div className="btn-container">
                    <Boton 
                        clase="btn-azul"
                        icono="fa-solid fa-check"
                        texto={enviando ? "Enviando..." : "Enviar Inspección"}
                        disabled={enviando} 
                    />
                    <BotonLink
                        link={`/equipment/${id}/inspection/show`}
                        clase="btn-2"
                        icono="fa-solid fa-eye"
                        texto="Ver inspección"
                    />
                </div>
            </form>
        </div>
    );
}
export default LlenarInspeccionEquipo;