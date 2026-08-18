import { Link } from "react-router-dom";
import { PageWelcome,Searcher } from "../../components/common/welcome";

function Empresas(){
    return(
        <div className="">
            <PageWelcome
                titulo="Empresas"
                descripcion="Este es el formato de las empresas"
            />
            <Searcher/>
            <br/>
            <table>
                <thead>
                    <tr>
                        <th>Nit empresa</th>
                        <th>Nombre de la empresa</th>
                        <th>Telefono</th>
                        <th>Correo</th>
                        <th>Direccion</th>
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
                    </tr>
                </tbody>
            </table>
            <br/>
            <button className="btn-azul">
                <i className="fa-solid fa-plus"></i>
                Nueva Empresa
            </button>   
        </div>
    )
}
export default Empresas;