import { Link } from "react-router-dom";
import { useFechaActual } from "../../hooks/useFechaActual";
import "../../styles/Tables/table.css";
import "../../styles/Components.modules.css";

function Ubicaciones() {
    const fechaActual = useFechaActual();

    return (
        <div className="">
            <div className="welcome">
                <div>
                    <h1>UBICACIONES</h1>
                    <p>Este es el formato de las ubicaciones.</p>
                </div>

                <div className="date">
                    <i className="fa-regular fa-calendar"></i>
                    <span id="fecha"> {fechaActual}</span>
                </div>
            </div>
            <br/>
            <div className="search-main">
                <div className="search-wrapper">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <input type="text" id="q" placeholder="Buscar por nombre, descripción, categoria"
                    />
                </div>
                <button className="btn-buscar">
                    <i className="fa-solid fa-magnifying-glass"></i> Buscar
                </button>
            </div>
            <br/>
            <table>
                <thead>
                    <tr>
                        <th><h4>Nombre de la ubicación</h4></th>
                        <th><h4>Descripción</h4></th>
                        <th><h4>Categoria</h4></th>
                        <th><h4>Acciones</h4></th>
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
            <div className="btn-container">
                <button  className="btn btn-azul">
                    <i className    ="fa-solid fa-plus"></i>
                    Nueva Ubicación
                </button>
                <Link to={"/ubicaciones/categorias_ubicacion"} ><button className="btn-azul">
                    <i className="fa-solid fa-list"></i>
                    Categoria ubicaciones
                </button></Link>
            </div>
            
        </div>


    );
}

export default Ubicaciones; 