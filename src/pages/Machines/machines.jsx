import { Link } from "react-router-dom";
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
                <button className="btn-azul">
                    <i className="fa-solid fa-plus"></i>
                    Nueva Máquina
                </button>
                <Link to="/machines/categories_machines"><button type="submit" className="btn-2">
                    <i className="fa-solid fa-list"></i> Categorias maquinas
                </button></Link>
            </div>
        </div>
    );
}
export default Maquinas;