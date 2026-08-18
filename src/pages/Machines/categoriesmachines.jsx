import { Boton,BotonLink } from "../../components/common/Button";
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
                <Boton
                    clase="btn-azul"
                    icono="fa-solid fa-plus"
                    texto="Nueva Categoria"
                />
                <BotonLink
                    link="/machines"
                    clase="btn-2"
                    icono="fa-solid fa-list"
                    texto="Maquinas"
                />
            </div>
        </div>
    )
}
export default CategoriasMaquinas;