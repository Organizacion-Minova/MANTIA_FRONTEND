import { Boton, BotonLink } from "../../components/common/Button";
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
                    <Boton
                        clase="btn-azul"
                        icono="fa-solid fa-plus"
                        texto="Nueva Categoria"
                    />
                    <BotonLink
                        link="/ubications"
                        clase="btn-2"
                        icono="fa-solid fa-list"
                        texto="Volver a Ubicaciones"
                    />

                </div>
        </div>
    );
}

export default CategoriasUbicacion;