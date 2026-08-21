import { useState } from "react";
import { Boton,BotonLink } from "../../components/common/Button";
import { PageWelcome, Searcher } from "../../components/common/welcome";
import { Form, Text, Textarea } from '../../components/common/forms';
function Formulario({onCancel}){
    return(
        <Form
            titulo="Agregar nueva categoria"
            descripcion="Ingrese los datos de la nueva categoria"
            onCancel={onCancel}
            textoBoton="Guardar"
            iconoBoton="fa-solid fa-floppy-disk"
        >
            <div className="col-span-6">
                <Text
                    label="Nombre de la categoria:"
                    id="nombre"
                    name="nombre"
                    placeholder="Ingrese el nombre de la categoria"
                    required

                />
            </div>
            <div className="col-span-6">
                <Textarea
                    label="Descripcion"
                    id="descripcion"
                    name="descripcion"
                    rows={4}
                    required
                />
            </div>
        </Form>
    )
}
function CategoriasMaquinas(){
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    return(
        <div className="">
            <PageWelcome
                titulo="CATEGORIAS MAQUINAS"
                descripcion="Este es el formato de las categorias de las máquinas."
            />
            <Searcher/>
            <br/>
            <table>
                <thead>
                    <tr>
                        <th>Nombre de la categoria</th>
                        <th>Descripción</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                </tbody>
            </table>
            <br />
            <div className="btn-container">
                <Boton
                    clase="btn-azul"
                    icono="fa-solid fa-plus"
                    texto="Nueva Categoria"
                    onClick={() => setMostrarFormulario(true)}
                />
                <BotonLink
                    link="/machines"
                    clase="btn-2"
                    icono="fa-solid fa-list"
                    texto="Maquinas"
                />
            </div>
            {mostrarFormulario && (
                <Formulario onCancel={() => setMostrarFormulario(false)} />
            )}
        </div>
    )
}
export default CategoriasMaquinas;