import { Boton } from "../../components/common/Button";
import { Link } from "react-router-dom";
import { PageWelcome, Searcher } from "../../components/common/welcome"; 

export function Consumibles(){
    return(
        <div className="">
            <PageWelcome
                titulo="HERRAMIENTAS CONSUMIBLES"
                descripcion="Este es el formato de las herramientas consumibles."
            />

            <Searcher/>
            <br/>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Acciones</th>
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
            <Boton
                clase="btn-azul"
                icono="fa-solid fa-plus"
                texto="Agregar tipo herramienta"
            />
        </div>
    );
    
}
export function No_Consumibles(){
    return(
        <div className="">
            <PageWelcome
                titulo="HERRAMIENTAS NO CONSUMIBLES"
                descripcion="Este es el formato de las herramientas no consumibles."
            />
            <Searcher/>
            <br/>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Acciones</th>
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
            <Boton
                clase="btn-azul"
                icono="fa-solid fa-plus"
                texto="Agregar tipo herramienta"
            />
        </div>
    )
}