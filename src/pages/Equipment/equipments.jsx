import { Boton,BotonLink } from "../../components/common/Button";
import { PageWelcome,Searcher } from "../../components/common/welcome";
function Equipos(){
    return(
        <div className="list-grid">
            <header className="bienvenida">
                <PageWelcome
                    titulo="Equipos"
                    descripcion="Este es el formato de los equipos"
                />
                <Searcher/>
            </header>
         <div class="table-responsive">
            <table className="table">
                
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
                        <td>Alfis</td>
                        <td>666</td>
                        <td>Su aguela</td>
                        <td>lobo chiviado</td>
                        <td>Casa xleox</td>
                        <td>pasable</td>

                        <td>
                            <BotonLink
                                link="/equipment/cardequipment"
                                clase="btn-azul"
                                icono="fa-solid fa-eye"
                            />
                            <Boton
                                clase="btn-2"
                                icono="fa-solid fa-edit"
                            />
                        </td>
                    </tr>
                </tbody>
            </table>
            </div>
     
            <div className="btn-container">
                <Boton
                    clase="btn-azul"
                    icono="fa-solid fa-plus"
                    texto="Nueva Equipo"
                />
            </div>
        </div>
    )
}
export default Equipos;