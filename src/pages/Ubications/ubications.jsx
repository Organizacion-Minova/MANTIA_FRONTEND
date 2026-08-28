import { useState } from "react";
import { Boton, BotonLink } from "../../components/common/Button";
import {PageWelcome, Searcher} from "../../components/common/welcome";
import { Form, Text, Textarea, Select } from "../../components/common/forms";
function Formulario({onCancel}){
    return(
        <Form
            titulo="Agregar nueva ubicación"
            descripcion="Ingrese los datos para la nueva ubicacion"
            onCancel={onCancel}
            textoBoton="Guardar"
            iconoBoton="fa-solid fa-floppy-disk"
        >
            <div className="col-span-6">
                <Text
                    label="Nombre de la ubicación:"
                    id="nombre"
                    name="nombre"
                    placeholder="Ingrese el nombre de la ubicación"
                    required
                />
            </div>
            <div className="col-span-6">
                <Select
                    label="Categoria ubicacion: "
                    id="categoria"
                    name="categoria"
                    opciones={["Seleccione una categoria"]}
                    required
                />
            </div>
            <div className="col-span-6">
                <Textarea
                    label="Descripción:"
                    id="descripcion"
                    name="descripcion"
                    placeholder="Ingrese la descripción"
                    required
                />
            </div>
        </Form>
    )

}
function Ubicaciones() {
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    return (
        <div className="">
            <PageWelcome
                titulo="UBICACIONES"
                descripcion="Este es el formato de las ubicaciones."
            />
            <Searcher/>
            <br/>
            <table>
                <thead>
                    <tr>
                        <th><h4>Nombre de la ubicación</h4></th>
                        <th><h4>Descripción</h4></th>
                        <th><h4>Categoria</h4></th>
                        <th><h4>Acciones</h4></th>
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
            <br/>
            <div className="btn-container">
                <Boton
                    clase="btn-azul"
                    icono="fa-solid fa-plus"
                    texto="Nueva Ubicación"
                    onClick={() => setMostrarFormulario(true)}
                />
                <BotonLink
                    link="/ubications/categoriesubications"
                    clase="btn-2"
                    icono="fa-solid fa-list"
                    texto="Categoría Ubicaciones"
                />
            </div>
            {mostrarFormulario && (
                <Formulario onCancel={() => setMostrarFormulario(false)} />
            )}
        </div>


    );
}

export default Ubicaciones; 