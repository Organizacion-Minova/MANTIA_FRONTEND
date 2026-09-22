import { useState } from "react";
import { Boton,BotonLink } from "../../components/common/Button";
import { PageWelcome,Searcher } from "../../components/common/welcome";
import { Form, Text, Textarea, Time } from '../../components/common/forms';
function Formulario({onCancel}){
    return(
        <Form
           titulo="Agregar nuevo registro" 
           descripcion="Ingresa los datos del formulario diario de ' '"
           onCancel={onCancel}
           textoBoton="Guardar"
           iconoBoton="fa-solid fa-floppy-disk"
        >
            <div className="col-span-6">
                <Text
                    label="Verificación del estado de funcionamiento:"
                    id="estadofuncionamiento"
                    name="estadofuncionamiento"
                    placeholder="Verifique el estado del funcionamiento"
                    required
                />
            </div>
            <div className="col-span-3">
                <Time
                    label="Inicio de operación:"
                    id="inicioOperacion"
                    name="inicioOperacion"
                    required
                />
            </div>
            <div className="col-span-3">
                <Time
                    label="Fin de operación:"
                    id="finOperacion"
                    name="finOperacion"
                    required 
                />
            </div>
            <div className="col-span-6">
                <Text
                    label="Responsable a cargo:"
                    id="responsable"
                    name="responsable"
                    placeholder="Responsable a cargo:"
                    required
                />
            </div>
            <div className="col-span-6">
                <Textarea
                    label="Observaciones"
                    id="observaciones"
                    name="observaciones"
                    rows={4}
                    placeholder="Observaciones"
                    required
                />
            </div>

        </Form>

    )
}
export function UsoDiario(){
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    return(
        <div>
            <PageWelcome
                titulo={"USO DIARIO"}
                descripcion={"Este es el formato de uso diario de la"}

            />
            <Searcher/>
            <br />
            <table className="form">
                <tbody>
                    <tr>
                        <th colSpan="6">REGISTRO DIARIO DE USO DE MAQUINARIA Y EQUIPOS MINA DIDACTICA</th>
                    </tr>
                    <tr>
                        <th colSpan="2">NOMBRE MAQUINA:</th>
                        <td colSpan="4" ></td>
                    </tr>
                    <tr >
                        <th>Fecha</th>
                        <th>Verificacion de estado de <br/> funcionamiento de la máquina</th>
                        <th>Inicio de operacion</th>
                        <th>Fin de operacion</th>
                        <th>Responsable a cargo</th>
                        <th>Observaciones</th>
                    </tr>
                    <tr>
                        <td ></td>
                        <td ></td>
                        <td ></td>
                        <td ></td>
                        <td ></td>
                        <td ></td>
                    </tr> 
                </tbody>
            </table>
            <br />
            <div className="btn-container">
                <Boton
                    clase="btn-azul"
                    icono="fa-solid fa-plus"
                    texto="Nuevo Registro"
                    onClick={() => setMostrarFormulario(true)}
                />
                <Boton
                    clase="btn-azul"
                    icono="fa-solid fa-file-excel"
                    texto="Exportar Excel"
                />
                <Boton
                    clase="btn-azul"
                    icono="fa-solid fa-file-pdf"
                    texto="Exportar Pdf"
                />
                <BotonLink
                    link="../machines/cardMachine"
                    clase="btn-2"
                    icono="fa-solid fa-arrow-left"
                    texto="Regresar"
                    
                />
            </div>
            {mostrarFormulario && (
                <Formulario onCancel={() => setMostrarFormulario(false)} />
            )}
        </div>
    )
}