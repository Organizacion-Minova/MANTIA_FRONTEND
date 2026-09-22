import React from "react";
import { PageWelcome } from "../../components/common/welcome";

// Datos de prueba, escritos aquí mismo — cuando conectemos el backend,
// esto vendrá de una petición a la API en vez de estar escrito a mano.
const datosGeneralesEjemplo = [
    { id: "fecha", texto: "Fecha de inspección", valor: "2026-03-18" },
    { id: "persona", texto: "Persona que inspecciona", valor: "Juan Pérez" },
    { id: "nombreEquipo", texto: "Nombre del equipo", valor: "Compresor Zona Norte" },
    { id: "duracion", texto: "Duración:", valor: "45 minutos" },
    { id: "area", texto: "Área:", valor: "Zona de compresores" },
    { id: "reviso", texto: "Revisó:", valor: "Técnico de mantenimiento" },
];

const preguntasEjemplo = [
    { id: 1, texto: "Tornillería y tuercas", respuesta: "SI", observacion: "" },
    { id: 2, texto: "Revisión del carcasa o estructura metálica", respuesta: "NO", observacion: "Se observa corrosión leve en la base" },
    { id: 3, texto: "Voltaje del motor", respuesta: "N/A", observacion: "" },
];

function agruparDeATres(array) {
    const grupos = [];
    for (let i = 0; i < array.length; i += 3) {
        grupos.push(array.slice(i, i + 3));
    }
    return grupos;
}
function MostrarInspeccion() {
    const gruposDatosGenerales = agruparDeATres(datosGeneralesEjemplo);
    return (
        <div>
            <PageWelcome
                titulo="INSPECCIÓN REALIZADA"
                descripcion="Resumen del formulario diligenciado."
            />

            <table className="form">
                <tbody>
                    {gruposDatosGenerales.map((grupo, index) => (
                        <React.Fragment key={index}>
                            <tr >
                                {grupo.map((campo) => (
                                    <th colSpan="2" key={campo.id}>{campo.texto}</th>
                                ))}
                            </tr>
                            <tr>
                                {grupo.map((campo) => (
                                    <td colSpan="2" key={campo.id}>{campo.valor}</td>
                                ))}
                            </tr>
                        </React.Fragment>
                    ))}
                    <tr>
                        <th colSpan="2">Pregunta</th>
                        <th>SI</th>
                        <th>NO</th>
                        <th>N/A</th>
                        <th>Observaciones</th>
                    </tr>

                
                    {preguntasEjemplo.map((pregunta) => (
                        <tr key={pregunta.id}>
                            <td colSpan="2">{pregunta.texto}</td>
                            <td>{pregunta.respuesta === "SI" && "X"}</td>
                            <td>{pregunta.respuesta === "NO" && "X"}</td>
                            <td>{pregunta.respuesta === "N/A" && "X"}</td>
                            <td>{pregunta.observacion}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default MostrarInspeccion