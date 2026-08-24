import { useState } from "react";
import { Boton,BotonLink } from "../../components/common/Button";
import {PageWelcome,Searcher} from "../../components/common/welcome";
import { Form, Text, Textarea, Dropzone, Select, Date } from '../../components/common/forms';
function Formulario({onCancel}){
    return(
        <Form
            titulo="Agregar nueva maquina"
            descripcion="Ingrese los datos de la nueva maquina"
            onCancel={onCancel}
            textoBoton="Guardar"
            iconoBoton="fa-solid fa-floppy-disk"
        >
            <div className="col-span-3">
                <Text
                    label="Código:"
                    id="codigo"
                    name="codigo"
                    placeholder="Código de la máquina"
                    required
                />
            </div>
            <div className="col-span-3">
                <Text
                    label="Nombre:"
                    id="nombre"
                    name="nombre"
                    placeholder="Nombre de la máquina"
                    required
                />
            </div>
            <div className="col-span-3">
                <Text
                    label="Modelo:"
                    id="modelo"
                    name="modelo"
                    placeholder="Modelo de la máquina"
                    required
                />
            </div>
            <div className="col-span-3">
                <Select
                    label="Marca:"
                    id="marca"
                    name="marca"
                    opciones={["Seleccione una marca"]}
                    required
                />
            </div>
            <div className="col-span-3">
                <Text
                    label="Número de serie:"
                    id="serie"
                    name="serie"
                    placeholder="Número de serie"
                    required 
                />
            </div>
            <div className="col-span-3">
                <Select
                    label="Ubicacion: "
                    id="ubicacion"
                    name="ubicacion"
                    opciones={["Selecciona una ubicacion"]}
                    required
                />
            </div>
            <div className="col-span-3">
                <Text
                    label="Uso de la maquina: "
                    id="usoMaquina"
                    name="usoMaquina"
                    placeholder="Uso de la maquina"
                    required
                />
            </div>
            <div className="col-span-3">
                <Text
                    label="Responsable:"
                    id="responsable"
                    name="responsable"
                    placeholder="Ingresa el responsable"
                    required
                />
            </div>
            <div className="col-span-3">
                <Date
                    label="Fecha de adquisición:"
                    id="fechaAdquisicion"
                    name="fechaAdquisicion"
                    required
                />
            </div>
            <div className="col-span-3">
                <Text
                    label="Costo adquisición:"
                    id="costoAdquisicion"
                    name="costoAdquisicion"
                    type="number"
                    placeholder="Costo de adquisición"
                    required
                />
            </div>
            <div className="col-span-3">
                <Select
                    label="Estado:"
                    id="estado"
                    name="estado"
                    opciones={["Seleccione una opcion", "Activo", "Mantenimiento", "Fuera de servicio", "Inactivo"]}
                    required
                />
            </div>
            <div className="col-span-3">
                <Select
                    label="Maquina en operación:"
                    id="maquinaenoperacion"
                    name="maquinaenoperacion"
                    opciones={["Seleccione una opción", "Si", "No"]}
                    required
                />
            </div>
            <div className="col-span-3">
                <Text
                    label="Garantía:"
                    id="garantia"
                    name="garantia"
                    type="number"
                    placeholder="Garantía en meses"
                    required
                />
            </div>
            <div className="col-span-3">
                <Select 
                    label="Categoría:"
                    id="categoria"
                    name="categoria"
                    opciones={["Seleccione una categoria"]}
                    required
                />
            </div>
            <div className="col-span-6">
                <Textarea
                    label="Caracteristicas:"
                    id="caracteristicas"
                    name="caracteristicas"
                    placeholder="Características de la maquina"
                    rows="4"
                    required
                />
            </div>
            <div className="col-span-6">
                <Dropzone
                    label="Imagen:"
                    id="imagen"
                    name="imagen"
                    ayuda="PNG, JPG, PDF hasta 10MB"
                    required
                />
            </div>
        </Form>
    )

}
function Maquinas(){
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    return(
        <div className="">
            <PageWelcome
                titulo="MAQUINAS"
                descripcion="Este es el formato de las máquinas."
            />
            <Searcher/>
            <br/>
            <table>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Código</th>
                        <th>Número de serie</th>
                        <th>Tipo</th>
                        <th>Marca</th>
                        <th>Ubicación</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Dante</td>
                        <td>666</td>
                        <td>que es eso</td>
                        <td>Cazador de demonios</td>
                        <td>Capcom</td>
                        <td>Infierno</td>
                        <td>Papucho</td>
                        <td>
                        <BotonLink
                            link="/machines/cardmachine"
                            clase="btn-azul"
                            icono="fa-solid fa-eye"
                        />
                        <Boton
                            clase="btn-2"
                            icono="fa-solid fa-edit"
                        />
                        </td>
                    </tr>
                </tbody>
            </table>
            <br/>
            <div className="btn-container">
                <Boton
                    clase="btn-azul"
                    icono="fa-solid fa-plus"
                    texto="Nueva Máquina"
                    onClick={() => setMostrarFormulario(true)}
                />
                <BotonLink
                    link="/machines/categoriesmachines"
                    clase="btn-2"
                    texto="Categorias Maquinas"
                    icono="fa-solid fa-list"
                />
            </div>
            {mostrarFormulario && (
                <Formulario onCancel={() => setMostrarFormulario(false)} />
            )}
        </div>
    );
}
export default Maquinas;