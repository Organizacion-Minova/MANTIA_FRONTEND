import { Link } from "react-router-dom";
import { PageWelcome, Searcher } from "../../components/common/welcome";

function CategoriasUbicacion() {
    return (
        <div className="">
            <PageWelcome
                titulo="CATEGORIAS UBICACIONES"
                descripcion="Este es el formato de las categorias de las ubicaciones."
            />
            <Searcher/>
            <br/>
            <table>
                    <thead>
                        <tr>
                            <th><h4>Nombre de la categoria</h4></th>
                            <th><h4>Descripción</h4></th>
                            <th><h4>Acciones</h4></th>
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
                <br/>
                <div className="btn-container">
                   
                    <button id="abrirModal" className="btn-azul">
                        <i className="fa-solid fa-plus"></i>
                        Nueva Categoria
                    </button>
                     <Link to={"/ubications"}><button className="btn-2">
                        <i className="fa-solid fa-list"></i>
                        Volver a Ubicaciones
                    </button></Link>
                </div>
        </div>
    );
}

export default CategoriasUbicacion;