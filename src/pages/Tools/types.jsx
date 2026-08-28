import { useState } from "react";
import { Boton, BotonLink } from "../../components/common/Button";
import { PageWelcome, Searcher } from "../../components/common/welcome"; 
import { Form, Text, Textarea } from "../../components/common/forms";
function FormConsumibles({onCancel}){
    return(
        <Form
            titulo="Agregar nueva categoria consumibles"
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
                    label="Descripción:"
                    id="descripcion"
                    name="descripcion"
                    rows="4"
                    placeholder="Descripcion"
                    required
                />
            </div>
        </Form>
    )
}
function FormNoConsumibles({onCancel}){
    return(
        <Form
            titulo="Agregar nueva categoria consumibles"
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
                    label="Descripción:"
                    id="descripcion"
                    name="descripcion"
                    rows="4"
                    placeholder="Descripcion"
                    required
                />
            </div>
        </Form>
    )
}
export function Consumibles(){
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    return(
        <div className="">
            <PageWelcome
                titulo="HERRAMIENTAS CONSUMIBLES"
                descripcion="Este es el formato de las herramientas consumibles."
            />
            <Searcher/>
            <br/>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Leonardo</td>
                        <td>Kevin</td>
                        <td>Sebastian</td>
                        <td><BotonLink
                            link="/types/consumables/tools"
                            clase="btn-azul"
                            icono="fa-solid fa-eye"
                        /></td>
                    </tr>
                </tbody>
            </table>
            <br/>
            <Boton
                clase="btn-azul"
                icono="fa-solid fa-plus"
                texto="Agregar tipo herramienta"
                onClick={() => setMostrarFormulario(true)}
            />
            {mostrarFormulario && (
                <FormConsumibles onCancel={() => setMostrarFormulario(false)} />
            )}
        </div>
    );
    
}
export function No_Consumibles(){
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    return(
        <div className="">
            <PageWelcome
                titulo="HERRAMIENTAS NO CONSUMIBLES"
                descripcion="Este es el formato de las herramientas no consumibles."
            />
            <Searcher/>
            <br/>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Leonardo</td>
                        <td>Daniela</td>
                        <td>Santiago</td>
                        <td><BotonLink
                            link="/types/noconsumables/tools"
                            clase="btn-azul"
                            icono="fa-solid fa-eye"
                        /></td>
                    </tr>
                </tbody>
            </table>
            <br/>
            <Boton
                clase="btn-azul"
                icono="fa-solid fa-plus"
                texto="Agregar tipo herramienta"
                onClick={() => setMostrarFormulario(true)}
            />
            {mostrarFormulario && (
                <FormNoConsumibles onCancel={() => setMostrarFormulario(false)} />
            )}
        </div>
    )
}