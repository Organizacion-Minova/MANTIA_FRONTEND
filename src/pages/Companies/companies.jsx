import { Link } from "react-router-dom";
import { PageWelcome,Searcher } from "../../components/common/welcome";
import { Boton } from "../../components/common/Button";

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
            <Boton
                clase="btn-azul"
                texto="Nueva Empresa"
                icono="fa-solid fa-plus"
            />
        </div>
    )
}
export default Empresas;