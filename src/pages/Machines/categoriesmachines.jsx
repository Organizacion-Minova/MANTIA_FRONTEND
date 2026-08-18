import { Link } from "react-router-dom";
import { PageWelcome, Searcher } from "../../components/common/welcome";

function CategoriasMaquinas(){
    return(
        <div className="">
            <PageWelcome
                titulo="CATEGORIAS MAQUINAS"
                descripcion="Este es el formato de las categorias de las máquinas."
            />
            <Searcher/>
            <br/>
            <table>
                <thead>
                    <tr>
                        <th>Nombre de la categoria</th>
                        <th>Descripción</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                </tbody>
            </table>
            <br />
            <div className="btn-container">
                <button className="btn-azul">
                    <i className="fa-solid fa-plus"></i>
                    Nueva Categoria
                </button>
                <Link to="/machines"><button type="submit" className="btn-2">
                    <i className="fa-solid fa-list"></i> Maquinas
                </button></Link>
            </div>
        </div>
    )
}
export default CategoriasMaquinas;