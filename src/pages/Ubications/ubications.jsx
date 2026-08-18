import { Link } from "react-router-dom";
import {PageWelcome, Searcher} from "../../components/common/welcome";

function Ubicaciones() {

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
                <button  className="btn-azul">
                    <i className="fa-solid fa-plus"></i>
                    Nueva Ubicación
                </button>
                <Link to={"/ubications/categories_ubications"} ><button className="btn-2">
                    <i className="fa-solid fa-list"></i>
                    Categoria ubicaciones
                </button></Link>
            </div>
            
        </div>


    );
}

export default Ubicaciones; 