import { useState } from "react";
import { Boton, BotonLink } from "../../components/common/Button";
import { PageWelcome,Searcher } from "../../components/common/welcome";
import { Form, Text, Select } from "../../components/common/forms";
function Formulario({onCancel}){
    return(
        <Form
            titulo="Agregar nueva herramienta"
            descripcion="Ingrese los datos para una nueva herramienta"
            onCancel={onCancel}
            textoBoton="Guardar"
            iconoBoton="fa-solid fa-floppy-disk"
        >
            <div className="col-span-3">
                <Text
                    label="Nombre:"
                    id="nombre"
                    name="nombre"
                    placeholder="Nombre de la herramienta"
                    required
                />
            </div>
            <div className="col-span-3">
                <Text
                    label="Cantidad:"
                    id="stock"
                    name="stock"
                    type="number"
                    placeholder="Ingrese la cantidad de herramientas"
                    required
                />
            </div>
            <div className="col-span-6">
                <Select
                    label="Ubicacion: "
                    id="ubicacion"
                    name="ubicacion"
                    opciones={["Selecciona una ubicacion"]}
                    required
                />
            </div>
        </Form>
    )
}
function ToolsNoConsumables(){
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    return(
        <div className="list-grid">
            <PageWelcome
                titulo="HERRAMIENTAS NO CONSUMIBLES ----"
                descripcion="Este es el formato de las herramientas ()."
            />
            <Searcher/>
            <br />
           
            <table className="table">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Cantidad</th>
                        <th>Ubicacion</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                </tbody>
            </table>
            <br />
            <div className="btn-container">
                <BotonLink
                    link="/types/noconsumables"
                    clase="btn-2"
                    icono="fa-solid fa-list"
                    texto="Volver a categorias no consumibles"
                />
                <Boton
                    clase="btn-azul"
                    icono="fa-solid fa-plus"
                    texto="Nueva Herramienta"
                    onClick={() => setMostrarFormulario(true)}
                />
            </div>
            {mostrarFormulario && (
                <Formulario onCancel={() => setMostrarFormulario(false)} />
            )}
        </div>
    )
}
export default ToolsNoConsumables