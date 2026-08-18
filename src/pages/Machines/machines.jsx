import { Boton,BotonLink } from "../../components/common/Button";
import {PageWelcome,Searcher} from "../../components/common/welcome";

function Maquinas(){
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
                        <td></td>
                        <td></td>
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
            <div className="btn-container">
                <Boton
                    clase="btn-azul"
                    icono="fa-solid fa-plus"
                    texto="Nueva Máquina"
                />
                <BotonLink
                    link="/machines/categories_machines"
                    clase="btn-2"
                    icono="fa-solid fa-list"
                    texto="Categorias Maquinas"
                />
            </div>
        </div>
    );
}
export default Maquinas;