import { useState } from "react";
import { PageWelcome,Searcher } from "../../components/common/welcome";
import { Boton } from "../../components/common/Button";
import { Form, Text, Textarea, Select, Dropzone, Checkbox, Date, Time, DateTime, Radio } from '../../components/common/forms';
function Formulario({onCancel}){
    return(
        <Form
            titulo="Nueva Empresa"
            descripcion="Ingrese los datos de una nueva empresa"
            onCancel={onCancel}
            textoBoton="Guardar"
            iconoBoton="fa-solid fa-floppy-disk"
        >
            <div className="col-span-3">
                <Text
                    label="Nit de la empresa:"
                    id="nit"
                    name="nit"
                    placeholder="Ingrese el Nit de la empresa"
                    required
                />
            </div>
            <div className="col-span-3">
                <Text
                    label="Nombre de la empresa:"
                    id="nombre"
                    name="nombre"
                    placeholder="Ingrese el nombre de la empresa"
                    required
                />
            </div>
            <div className="col-span-3">
                <Text
                    label="Telefono:"
                    id="telefono"
                    name="telefono"
                    type="tel"
                    placeholder="Ingrese el teléfono"
                    required
                />
            </div>
            <div className="col-span-3">
                <Text
                    label="Correo:"
                    id="correo"
                    name="correo"
                    type="email"
                    placeholder="Ingrese el correo electrónico"
                    required
                />
            </div>
            <div className="col-span-6">
                <Text
                    label="Direccion:"
                    id="direccion"
                    name="direccion"
                    placeholder="Ingrese la dirección"
                    required
                />
            </div>
        </Form>
    )
}
function Empresas(){
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    return(
        <div className="">
            <PageWelcome
                titulo="Empresas"
                descripcion="Este es el formato de las empresas"
            />
            <Searcher/>
            <br/>
            <table>
                <thead>
                    <tr>
                        <th>Nit empresa</th>
                        <th>Nombre de la empresa</th>
                        <th>Telefono</th>
                        <th>Correo</th>
                        <th>Direccion</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                </tbody>
            </table>
            <br/>
            <Boton
                clase="btn-azul"
                texto="Nueva Empresa"
                icono="fa-solid fa-plus"
                onClick={() => setMostrarFormulario(true)}
            />
            {mostrarFormulario && (
                <Formulario onCancel={() => setMostrarFormulario(false)} />
            )}
        </div>
    )
}
export default Empresas;