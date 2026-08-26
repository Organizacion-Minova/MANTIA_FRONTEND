import { useState } from "react";
import { Boton,BotonLink } from "../../components/common/Button";
import { PageWelcome,Searcher } from "../../components/common/welcome";
import { Form, Text, Textarea, Dropzone,Select, Date } from "../../components/common/forms";
function Formulario({onCancel}){
    return(
        <Form
            titulo="Agregar Nuevo Equipo"
            descripcion="Ingrese los datos del nuevo equipo"
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
                    placeholder="Nombre del equipo"
                    required
                />
            </div>
            <div className="col-span-6">
                <Textarea
                    label="Descripcion:"
                    id="descripcion"
                    name="descripcion"
                    placeholder="Descripcion del equipo"
                    rows="4"
                    required
                />
            </div>
            <div className="col-span-3">
                <Text
                    label="Número de serie:"
                    id="serie"
                    name="serie"
                    placeholder="Ingrese el número de serie del equipo"
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
                <Date
                    label="Fecha ingreso:"
                    id="fechaingreso"
                    name="fechaingreso"
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
                    label="Responsable:"
                    id="responsable"
                    name="responsable"
                    placeholder="Ingresa el responsable"
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
            <div className="col-span-6">
                <Select
                    label="Estado:"
                    id="estado"
                    name="estado"
                    opciones={["Seleccione una opcion", "Activo", "Mantenimiento", "Fuera de servicio", "Inactivo"]}
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
function Equipos(){
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    return(
        <div className="">
            <PageWelcome
                titulo="Equipos"
                descripcion="Este es el formato de los equipos"
            />
            <Searcher/>
            <br />
            <table>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>N° Serie</th>
                        <th>Responsable</th>
                        <th>Marca</th>
                        <th>Ubicación</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Alfis</td>
                        <td>666</td>
                        <td>Su aguela</td>
                        <td>lobo chiviado</td>
                        <td>Casa xleox</td>
                        <td>pasable</td>

                        <td>

                            <BotonLink
                                link="/equipment/cardequipment"
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
            <br />
            <Boton
                clase="btn-azul"
                icono="fa-solid fa-plus"
                texto="Nueva Equipo"
                onClick={() => setMostrarFormulario(true)}

            />
            {mostrarFormulario && (
                <Formulario onCancel={() => setMostrarFormulario(false)} />
            )}
        </div>
    )
}
export default Equipos;