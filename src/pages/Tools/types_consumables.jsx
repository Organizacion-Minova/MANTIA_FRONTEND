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
            <button class="btn-azul" id="abrirModal">
                <i class="fa-solid fa-plus"></i> Agregar tipo herramienta
            </button>
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
            <button class="btn-azul" id="abrirModal">
                <i class="fa-solid fa-plus"></i> Agregar tipo herramienta
            </button>
        </div>
    )
}