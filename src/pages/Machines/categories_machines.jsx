import { useState, useEffect } from "react";
import { Boton,BotonLink } from "../../components/common/Button";
import { PageWelcome, Searcher } from "../../components/common/welcome";
import { Form, Text, Textarea, Select } from '../../components/common/forms';
import { GetCategoryMachine, CreateCategoryMachine, DeleteCategoryMachine, UpdateCategoryMachine } from "../../api/auth";
function Formulario({ onCancel, onGuardado, categoriaEditar }) {
    const esEdicion = categoriaEditar != null;
    const [nombre, setNombre] = useState(categoriaEditar?.name || "");
    const [descripcion, setDescripcion] = useState(categoriaEditar?.description || "");
    const [estado, setEstado] = useState(categoriaEditar?.status || "active");
    const [errores, setErrores] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrores({});

        if (esEdicion) {
            const sinCambios =
                nombre === categoriaEditar.name &&
                descripcion === categoriaEditar.description &&
                estado === categoriaEditar.status;

            if (sinCambios) {
                onCancel(); // cierra el formulario sin hacer nada
                return;
            }
        }   
        const datos = { name: nombre, description: descripcion };
        if (esEdicion) {
            datos.status = estado;
        }

        try {
            if (esEdicion) {
                await UpdateCategoryMachine(categoriaEditar.id, datos);
            } else {
                await CreateCategoryMachine(datos);
            }
            onGuardado();
            onCancel();
        } catch (error) {
            if (error.response?.status === 422) {
                setErrores(error.response.data.errors);
            } else {
                console.error("Error al guardar categoría:", error);
            }
        }
    };

    return (
        <Form
            titulo={esEdicion ? "Editar categoria" : "Agregar nueva categoria"}
            descripcion={esEdicion ? "Modifique los datos de la categoria" : "Ingrese los datos de la nueva categoria"}
            onCancel={onCancel}
            textoBoton="Guardar"
            iconoBoton="fa-solid fa-floppy-disk"
            onSubmit={handleSubmit}
        >
            <div className="col-span-6">
                <Text
                    label="Nombre de la categoria:"
                    id="nombre"
                    name="nombre"
                    placeholder="Ingrese el nombre de la categoria"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                />
            </div>
            {errores.name && <p className="error-texto">{errores.name[0]}</p>}

            <div className="col-span-6">
                <Textarea
                    label="Descripcion"
                    id="descripcion"
                    name="descripcion"
                    rows={4}
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    required
                />
            </div>

            {esEdicion && (
                <div className="col-span-6">
                    <Select
                        label="Estado"
                        id="estado"
                        name="estado"
                        value={estado}
                        opciones={[
                            { valor: "active", etiqueta: "Activo" },
                            { valor: "inactive", etiqueta: "Inactivo" },
                        ]}
                        onChange={(e) => setEstado(e.target.value)}
                        required
                    />
                </div>
            )}
        </Form>
    );
}
function CategoriasMaquinas(){
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [categoriaEditar, setCategoriaEditar] = useState(null);
    const [categorias, setCategorias] = useState([]);
    const [cargando, setCargando] = useState(true);

    const cargarCategorias = () => {
        setCargando(true);
        GetCategoryMachine()
            .then((data) => setCategorias(data))
            .catch((error) => console.error("Error al traer categorías:", error))
            .finally(() => setCargando(false));
    };
    useEffect(() => {
        cargarCategorias();
    }, []);

    if (cargando) return <p>Cargando categorías...</p>;

    const handleEliminar = async (id) => {
        const confirmar = window.confirm("¿Seguro que quieres eliminar esta categoría?");
        if (!confirmar) return;

        try {
            await DeleteCategoryMachine(id);
            cargarCategorias(); // recarga la tabla sin esa categoría
        } catch (error) {
            console.error("Error al eliminar categoría:", error);
        }
    };
    const handleAbrirCrear = () => {
        setCategoriaEditar(null);
        setMostrarFormulario(true);
    };
    const handleAbrirEditar = (categoria) => {
        setCategoriaEditar(categoria);
        setMostrarFormulario(true);
    };
    return(
        <div className="list-grid">
            <header className="bienvenida">
                <PageWelcome
                    titulo="CATEGORIAS MAQUINAS"
                    descripcion="Este es el formato de las categorias de las máquinas."
                />
                <Searcher/>
            </header>
            <div className="table-responsive">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Nombre de la categoria</th>
                            <th>Descripción</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categorias.map((cat) => (
                        <tr key={cat.id}>
                            <td>{cat.name}</td>
                            <td>{cat.description}</td>
                            <td>{cat.status === "active" ? "Activo" : "Inactivo"}</td>
                            <td>
                                <Boton
                                    clase="btn-azul"
                                    icono="fa-solid fa-edit"
                                    onClick={() => handleAbrirEditar(cat)}
                                />
                                <Boton
                                    clase="btn-2"
                                    icono="fa-solid fa-trash"
                                    onClick={() => handleEliminar(cat.id)}
                                />
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table>
           </div>
            <div className="btn-container">
                <Boton
                    clase="btn-azul"
                    icono="fa-solid fa-plus"
                    texto="Nueva Categoria"
                    onClick={handleAbrirCrear}
                />
                <BotonLink
                    link="/machines"
                    clase="btn-2"
                    icono="fa-solid fa-list"
                    texto="Maquinas"
                />
            </div>
            {mostrarFormulario && (
                <Formulario 
                    key={categoriaEditar?.id || "nuevo"}
                    onCancel={() => setMostrarFormulario(false)}
                    onGuardado={cargarCategorias}
                    categoriaEditar={categoriaEditar}
                />
                
            )}
        </div>
    )
}
export default CategoriasMaquinas;