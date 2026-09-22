import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Boton, BotonLink } from "../../components/common/Button";
import { PageWelcome,Searcher } from "../../components/common/welcome";
import { Form, Text, Select } from "../../components/common/forms";
import { GetCategoryToolById } from "../../api/Toolsapi";
import LoadingScreen from "../../components/LoadingScreen";
function Formulario({onCancel}){
    return(
        <Form
            titulo="Agregar nueva herramienta"
            descripcion="Ingrese los datos para una nueva herramienta"
            onCancel={onCancel}
            textoBoton="Guardar"
            iconoBoton="fa-solid fa-floppy-disk"
        >
            <div className="col-span-3">
                <Text
                    label="Nombre:"
                    id="nombre"
                    name="nombre"
                    placeholder="Nombre de la herramienta"
                    required
                />
            </div>
            <div className="col-span-3">
                <Text
                    label="Cantidad:"
                    id="stock"
                    name="stock"
                    type="number"
                    placeholder="Ingrese la cantidad de herramientas"
                    required
                />
            </div>
            <div className="col-span-6">
                <Select
                    label="Ubicacion: "
                    id="ubicacion"
                    name="ubicacion"
                    opciones={["Selecciona una ubicacion"]}
                    required
                />
            </div>
        </Form>
    )
}
function ToolsNoConsumables(){
    const { id } = useParams();
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [categoria, setCategoria] = useState(null); 
    useEffect(() => {
        const fetchCategoria = async () => {
            if (id) {
                const data = await GetCategoryToolById(id);
                setCategoria(data);
            }
        };
        fetchCategoria();
    }, [id]);
    if (!categoria) {
        return <LoadingScreen indeterminado />;
    }
    return(
        <div className="list-grid">
            <header className="bienvenida">
                <PageWelcome
                    titulo={`HERRAMIENTAS NO CONSUMIBLES ${categoria.name}`}
                    descripcion={`Este es el formato de las herramientas no consumibles ${categoria.name}.`}
                />
                <Searcher/>
            </header>
            <div className="table-responsive">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Condicion</th>
                            <th>Cantidad</th>
                            <th>Ubicacion</th>
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
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className="btn-container">
                <BotonLink
                    link="/types/noconsumables"
                    clase="btn-2"
                    icono="fa-solid fa-list"
                    texto="Volver a categorias no consumibles"
                    titulo="Volver a categorias no consumibles"
                />
                <Boton
                    clase="btn-azul"
                    icono="fa-solid fa-plus"
                    texto="Nueva Herramienta"
                    onClick={() => setMostrarFormulario(true)}
                    titulo="Agregar nueva herramienta"
                />
            </div>
            {mostrarFormulario && (
                <Formulario onCancel={() => setMostrarFormulario(false)} />
            )}
        </div>
    )
}
export default ToolsNoConsumables