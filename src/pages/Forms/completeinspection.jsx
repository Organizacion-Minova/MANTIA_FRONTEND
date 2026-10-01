import { useState } from "react";
import { PageWelcome } from "../../components/common/welcome";
import { Text,  Radio, Date } from "../../components/common/forms";
import { Boton, BotonLink } from "../../components/common/Button";

const preguntasEjemplo = [
    { id: 1, texto: "Tornillería y tuercas", tipo: "Sí / No / N.A.", agregarObservacion: true },
    { id: 2, texto: "Revisión del carcasa o estructura metálica", tipo: "Sí / No / N.A.", agregarObservacion: true },
    { id: 3, texto: "Voltaje del motor", tipo: "Número", agregarObservacion: false },
    { id: 4, texto: "Fecha de última revisión", tipo: "Fecha", agregarObservacion: false },
];

function LlenarInspeccion() {
    const [respuestas, setRespuestas] = useState({});

    const actualizarRespuesta = (idPregunta, campo, valor) => {
        setRespuestas((prev) => ({
            ...prev,
            [idPregunta]: {
                ...prev[idPregunta],
                [campo]: valor,
            },
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Respuestas de la inspección:", respuestas);
        alert("Inspección enviada (revisa la consola por ahora)");
    };

    // Decide qué componente mostrar según el tipo de la pregunta
    const renderizarCampo = (pregunta) => {
        const valorActual = respuestas[pregunta.id]?.valor || "";

        switch (pregunta.tipo) {
            case "Sí / No / N.A.":
                return (
                    <Radio
                        id={`pregunta-${pregunta.id}`}
                        name={`pregunta-${pregunta.id}`}
                        value={valorActual}
                        onChange={(e) => actualizarRespuesta(pregunta.id, "valor", e.target.value)}
                        opciones={["SI", "NO", "N/A"]}
                    />
                );
            case "Número":
                return (
                    <Text
                        id={`pregunta-${pregunta.id}`}
                        name={`pregunta-${pregunta.id}`}
                        type="number"
                        value={valorActual}
                        onChange={(e) => actualizarRespuesta(pregunta.id, "valor", e.target.value)}
                    />
                );
            case "Fecha":
                return (
                    <Date
                        id={`pregunta-${pregunta.id}`}
                        name={`pregunta-${pregunta.id}`}
                        value={valorActual}
                        onChange={(e) => actualizarRespuesta(pregunta.id, "valor", e.target.value)}
                    />
                );
            default: // "Respuesta corta"
                return (
                    <Text
                        id={`pregunta-${pregunta.id}`}
                        name={`pregunta-${pregunta.id}`}
                        value={valorActual}
                        onChange={(e) => actualizarRespuesta(pregunta.id, "valor", e.target.value)}
                    />
                );
        }
    };

    return (
        <div>
            <PageWelcome
                titulo="LLENAR INSPECCIÓN"
                descripcion="Completa el formato de inspeccion de la maquina."
            />
            <form onSubmit={handleSubmit}>
                {preguntasEjemplo.map((pregunta) => (
                    
                    <div key={pregunta.id} className="card">
                        <label>{pregunta.texto}</label>

                        {renderizarCampo(pregunta)}
                        <br />

                        {pregunta.agregarObservacion && (
                            <Text
                                id={`obs-${pregunta.id}`}
                                name={`obs-${pregunta.id}`}
                                label="Observaciones"
                                placeholder="Escribe una observación (opcional)"
                                value={respuestas[pregunta.id]?.observacion || ""}
                                onChange={(e) => actualizarRespuesta(pregunta.id, "observacion", e.target.value)}
                            />
                        )}
                    </div>
                    
                ))}
                <br />
                <div className="btn-container">
                    <Boton 
                        clase="btn-azul" 
                        icono="fa-solid fa-check" 
                        texto="Enviar Inspección" 
                    />
                    <BotonLink
                        link="/machines/cardMachine/showinspection"
                        clase="btn-2"
                        icono="fa-solid fa-eye"
                        texto="Ver inspección"
                    />
                </div>
            </form>
        </div>
    );
}
export default LlenarInspeccion;