import { useState } from "react";
import { PageWelcome } from "../../components/common/welcome";
import { Boton, BotonLink } from "../../components/common/Button";
import { Text, Select, Checkbox } from "../../components/common/forms";
function AgregarInspeccion(){
    const [tituloFormato, setTituloFormato] = useState("");
    const [preguntas, setPreguntas] = useState([]);

    // Agrega una pregunta nueva y vacía al final de la lista
    const agregarPregunta = () => {
        const nuevaPregunta = {
            id: Date.now(),
            texto: "",
            tipo: "corta",
            columnaFija: false,
            agregarObservacion: false,
        };
        setPreguntas([...preguntas, nuevaPregunta]);
    };

    // Actualiza un campo específico de una pregunta específica
    const actualizarPregunta = (id, campo, valor) => {
        setPreguntas(
            preguntas.map((p) =>
                p.id === id ? { ...p, [campo]: valor } : p
            )
        );
    };

    // Elimina una pregunta por su id
    const eliminarPregunta = (id) => {
        setPreguntas(preguntas.filter((p) => p.id !== id));
    };

    // Junta todo y lo "guarda" (por ahora, solo lo mostramos en consola)
    const guardarFormulario = () => {
        const formatoFinal = {
            titulo: tituloFormato,
            preguntas: preguntas,
        };
        console.log("Formato guardado:", formatoFinal);
        alert("Formulario guardado (revisa la consola por ahora)");
    };

    return (
        <div>
            <PageWelcome
                titulo="AGREGAR PREGUNTAS INSPECCIÓN"
                descripcion="Este es el formato para agregar una nueva inspección."
            />

            <div className="card">
                <Text
                    label="Nombre del formato"
                    id="tituloFormato"
                    name="tituloFormato"
                    placeholder="Inspección Compresor"
                    required
                    value={tituloFormato}
                    onChange={(e) => setTituloFormato(e.target.value)}
                />
            </div>
            <br />
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
                    texto="Guardar formulario" 
                    onClick={guardarFormulario} 
                />
                <BotonLink
                    link="/machines/cardMachine/completeinspection"
                    clase="btn-2"
                    icono="fa-solid fa-arrow-right"
                    texto="Llenar Formulario"

                />
            </div>

            {preguntas.map((pregunta) => (
                <div key={pregunta.id} className="card form-grid">
                    <div className="col-span-4">
                        <Text
                            placeholder="Escribe tu pregunta"
                            value={pregunta.texto}
                            onChange={(e) => actualizarPregunta(pregunta.id, "texto", e.target.value)}
                        />
                    </div>
                    <div className="col-span-2">
                        <Select
                            value={pregunta.tipo}
                            onChange={(e) => actualizarPregunta(pregunta.id, "tipo", e.target.value)}
                            opciones={["Respuesta corta","Sí / No / N.A.", "Número", "Fecha"]}
                        />
                    </div>
                    <div className="col-span-2">
                        <Checkbox
                            label="Columna fija en tabla"
                            checked={pregunta.columnaFija}
                            onChange={(e) => actualizarPregunta(pregunta.id, "columnaFija", e.target.checked)}
                        />
                    </div>
                    <div className="col-span-2">
                        <Checkbox
                            label="Agregar observación"
                            checked={pregunta.agregarObservacion}
                            onChange={(e) => actualizarPregunta(pregunta.id, "agregarObservacion", e.target.checked)}
                        />
                    </div>
                    <Boton
                        clase="btn-azul"
                        icono="fa-solid fa-trash"
                        texto="Eliminar"
                        onClick={() => eliminarPregunta(pregunta.id)}
                    />
                </div>

            ))}
        </div>
    );
}
export default AgregarInspeccion