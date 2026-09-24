import { useState } from "react";
import { Boton, BotonLink } from "../../components/common/Button";
import { PageWelcome, Searcher } from "../../components/common/welcome";
import { Form, Text, Textarea } from "../../components/common/forms";
function Formulario({onCancel}){
    return(
        <Form
            titulo="Agregar nueva categoria"
            descripcion="Ingrese los datos para una nueva categoria"
            onCancel={onCancel}
            textoBoton="Guardar"
            iconoBoton="fa-solid fa-floppy-disk"
        >
            <div className="col-span-6">
                <Text
                    label="Nombre de la categoria:"
                    id="nombre"
                    name="nombre"
                    placeholder="Ingrese el nombre de la categoria"
                    required
                />
            </div>
            <div className="col-span-6">
                <Textarea
                    label="Descripción:"
                    id="descripcion"
                    name="descripcion"
                    rows="4"
                    placeholder="Descripcion"
                    required
                />
            </div>
        </Form>
    )
}
function CategoriasUbicacion() {
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    return (
        <div className="list-grid">
            <header className="bienvenida">
                <PageWelcome
                    titulo="CATEGORIAS UBICACIONES"
                    descripcion="Este es el formato de las categorias de las ubicaciones."
                />
                <Searcher/>
            </header>
            <div className="table-responsive">
                <table className="table">
                        <thead>
                            <tr>
                                <th><h4>Nombre de la categoria</h4></th>
                                <th><h4>Descripción</h4></th>
                                <th><h4>Acciones</h4></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
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
                        texto="Nueva Categoria"
                        onClick={() => setMostrarFormulario(true)}
                    />
                    <BotonLink
                        link="/ubications"
                        clase="btn-2"
                        icono="fa-solid fa-list"
                        texto="Volver a Ubicaciones"
                    />

                </div>
            {mostrarFormulario && (
                <Formulario onCancel={() => setMostrarFormulario(false)} />
            )}
        </div>
    );
}

export default CategoriasUbicacion;