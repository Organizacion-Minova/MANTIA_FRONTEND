import { Boton } from "../../components/common/Button";
import { Link } from "react-router-dom";
import { PageWelcome, Searcher } from "../../components/common/welcome"; 

export function Consumibles(){
    return(
        <div className="list-grid">
            <header className="bienvenida">
                <PageWelcome
                    titulo="HERRAMIENTAS CONSUMIBLES"
                    descripcion="Este es el formato de las herramientas consumibles."
                />
                <Searcher/>
            </header>
            <div className="table-responsive">
                <table className="table">
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
            </div>
            <div className="btn-container">
                <Boton
                    clase="btn-azul"
                    icono="fa-solid fa-plus"
                    texto="Agregar tipo herramienta"
                />
            </div>
        </div>
    );
    
}
export function No_Consumibles(){
    return(
        <div className="list-grid">
            <header className="bienvenida">
                <PageWelcome
                    titulo="HERRAMIENTAS NO CONSUMIBLES"
                    descripcion="Este es el formato de las herramientas no consumibles."
                />
                <Searcher/>
            </header>
        
            <table className="table">
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
            
            <div className="btn-container">
                <Boton
                    clase="btn-azul"
                    icono="fa-solid fa-plus"
                    texto="Agregar tipo herramienta"
                />
            </div>
        </div>
    )
}