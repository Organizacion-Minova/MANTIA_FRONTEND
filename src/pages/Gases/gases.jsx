import { Boton, BotonLink } from "../../components/common/Button";
import { PageWelcome, Searcher } from "../../components/common/welcome";

function Gases() {
    return (
        <div className="grid-contenedor-5">
            <PageWelcome
                titulo="MEDICIÓN DE GASES"
                descripcion="Este es el formato con el registro de gases."
            />
            <Searcher placeholder="Buscar por código, fecha, hora, observaciones "/>
            <section className='cards2'>
                <table>
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Fecha</th>
                            <th>Hora</th>
                            <th>Observaciones</th>
                            <th>Responsable</th>
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
                            <td>
                                <div className="btn-container">
                                    <BotonLink
                                        link="/Gases/gas_format"
                                        clase="btn-azul"
                                        icono="fa-solid fa-eye"
                                        title="Ver detalle"
                                    />
                                    <Boton
                                        clase="btn-2"
                                        icono="fa-solid fa-trash"
                                        title="Eliminar"
                                    />
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </section>
            <div className="btn-container">
                <BotonLink
                    link="/gases/compare_gases"
                    clase="btn-azul"
                    icono="fa-solid fa-chart-line"
                    texto="Comparar mediciones"
                />
            </div>
        </div>
    );
}

export default Gases;