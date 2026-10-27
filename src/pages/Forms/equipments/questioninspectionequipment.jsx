import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageWelcome } from "../../../components/common/welcome";
import { Boton } from "../../../components/common/Button";
import { Text } from "../../../components/common/forms";
import { CreateEquipmentQuestion } from "../../../api/Equipmentsapi";
function AgregarInspeccionEquipo(){
    const { id }=useParams();
    const navigate = useNavigate();

    const [preguntas, setPreguntas] = useState([]);
    const [error, setError] = useState("");
    const [guardando, setGuardando] = useState(false);

    // Agrega una pregunta nueva y vacía al final de la lista
    const agregarPregunta = () => {
        setPreguntas((prev) => [
            ...prev,
            { localId: Date.now(), text: "", has_observation: true },
        ]);
    };

    // Actualiza un campo específico de una pregunta específica
    const actualizarPregunta = (localId, campo, valor) => {
        setPreguntas((prev) =>
            prev.map((p) => (p.localId === localId ? { ...p, [campo]: valor } : p))
        );
    };

    // Elimina una pregunta por su id
    const eliminarPregunta = (localId) => {
        setPreguntas((prev) => prev.filter((p) => p.localId !== localId));
    };

    // Junta todo y lo "guarda" (por ahora, solo lo mostramos en consola)
    const guardarFormulario = async () => {
        setError("");

        const validas = preguntas.filter((p) => p.text.trim() !== "");
        if (validas.length === 0) {
            setError("Agrega al menos una pregunta con texto.");
            return;
        }

        setGuardando(true);
        try {
            // Secuencial (no Promise.all) para que las posiciones queden en orden
            for (const p of validas) {
                await CreateEquipmentQuestion({
                    equipment_id: id,
                    text: p.text.trim(),
                    has_observation: p.has_observation,
                });
            }
            navigate(`/equipment/${id}/inspection/complete`);
        } catch (err) {
            const errors = err.response?.data?.errors;
            setError(errors?.text?.[0] ?? "No se pudieron guardar las preguntas.");
        } finally {
            setGuardando(false);
        }
    };
    return (
        <div>
            <PageWelcome
                titulo="AGREGAR PREGUNTAS INSPECCIÓN"
                descripcion="Este es el formato para agregar una nueva inspección."
            />

            {error && <p role="alert">{error}</p>}

            <div className="btn-container">
                <Boton 
                    clase="btn-azul" 
                    icono="fa-solid fa-plus" 
                    texto="Agregar Pregunta" 
                    onClick={agregarPregunta} 
                />
                <Boton
                    clase="btn-azul"
                    icono="fa-solid fa-floppy-disk"
                    texto={guardando ? "Guardando..." : "Guardar formulario"}
                    onClick={guardarFormulario}
                />
            </div>
            <br />
            {preguntas.map((p) => (
                <div key={p.localId} className="card form-grid">
                    <div className="col-span-6">
                        <Text
                            placeholder="Escribe tu pregunta"
                            value={p.text}
                            onChange={(e) => actualizarPregunta(p.localId, "text", e.target.value)}
                        />
                    </div>
                    <Boton
                        clase="btn-azul"
                        icono="fa-solid fa-trash"
                        texto="Eliminar"
                        onClick={() => eliminarPregunta(p.localId)}
                    /><br />
                </div>
                
            ))}
        </div>
    );
}
export default AgregarInspeccionEquipo