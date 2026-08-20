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
                        <td>Dante</td>
                        <td>666</td>
                        <td>que es eso</td>
                        <td>Cazador de demonios</td>
                        <td>Capcom</td>
                        <td>Infierno</td>
                        <td>Papucho</td>
                        <td>
                            <BotonLink
                            link="/machines/card_machine"
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
                />
                <BotonLink
                    link="/machines/categories_machines"
                    clase="btn-2"
                    texto="Categorias Maquinas"
                    icono="fa-solid fa-list"
                />
            </div>
        </div>
    );
}
export default Maquinas;