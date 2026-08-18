import { Boton } from "../../components/common/Button";

import { Link } from "react-router-dom";
import { PageWelcome, Searcher } from "../../components/common/welcome";
function Equipos(){
    return(
        <div className="">
            <PageWelcome
                titulo="Equipos"
                descripcion="Este es el formato de los equipos"
            />
            <Searcher/>
            <br />
            <table>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>N° Serie</th>
                        <th>Responsable</th>
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
                    </tr>
                </tbody>
            </table>
            <br />
            <Boton
                clase="btn-azul"
                icono="fa-solid fa-plus"
                texto="Nueva Equipo"
            />
        </div>
    )
}
export default Equipos;