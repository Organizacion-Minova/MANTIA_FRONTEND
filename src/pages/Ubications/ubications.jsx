import { Boton, BotonLink } from "../../components/common/Button";
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
                <Boton
                    clase="btn-azul"
                    icono="fa-solid fa-plus"
                    texto="Nueva Ubicación"
                />
                <BotonLink
                    link="/ubications/categories_ubications"
                    clase="btn-2"
                    icono="fa-solid fa-list"
                    texto="Categoría Ubicaciones"
                />
            </div>
            
        </div>


    );
}

export default Ubicaciones; 