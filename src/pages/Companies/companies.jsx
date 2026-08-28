import { Link } from "react-router-dom";
import { PageWelcome,Searcher } from "../../components/common/welcome";
import { Boton } from "../../components/common/Button";

function Empresas(){
    return(
        <div className="list-grid">
            <header className="bienvenida">
                <PageWelcome
                     titulo="Empresas"
                     descripcion="Este es el formato de las empresas"
                />
                <Searcher/>
            </header>
            <div className="table-responsive">
                <table className="table">
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
            </div>
       
            <div className="btn-container">
                <Boton
                   clase="btn-azul"
                   texto="Nueva Empresa"
                   icono="fa-solid fa-plus"
                />
            </div>
        </div>
    )
}
export default Empresas;