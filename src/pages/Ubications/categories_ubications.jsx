import { useState, useEffect } from "react";
import { Boton, BotonLink } from "../../components/common/Button";
import { PageWelcome, Searcher } from "../../components/common/welcome";
import { Form, Text, Textarea } from "../../components/common/forms";
import { obtenerCategoriasUbicacion, guardarCategoriaUbicacion, actualizarCategoriaUbicacion, eliminarCategoriaUbicacion } from "../../api/locationCategory";
import { useSearch } from "../../hooks/useSearch";

function Formulario({ onCancel, onSuccess, categoriaEditar = null }) {
    const [formData, setFormData] = useState({
        nombre: categoriaEditar ? categoriaEditar.name : '',
        descripcion: categoriaEditar ? categoriaEditar.description : ''
    });
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);

    const isEditing = Boolean(categoriaEditar);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setCargando(true);
        setError(null);

        try {
            if (isEditing) {
                await actualizarCategoriaUbicacion(categoriaEditar.id, formData);
            } else {
                await guardarCategoriaUbicacion(formData);
            }
            onSuccess();
            onCancel();
        } catch (err) {
            const mensajeServidor = err.response?.data?.message || "Error al registrar la categoría.";
            setError(mensajeServidor);
        } finally {
            setCargando(false);
        }
    };

    return (
        <Form
            titulo={isEditing ? "Editar categoría" : "Agregar nueva categoría"}
            descripcion={isEditing ? "Modifique los datos de la categoría" : "Ingrese los datos de la nueva categoría"}
            onCancel={onCancel}
            onSubmit={handleSubmit}
            textoBoton={cargando ? "Guardando..." : isEditing ? "Actualizar" : "Guardar"}
            iconoBoton="fa-solid fa-floppy-disk"
        >
            {error && (
                <div className="col-span-6">
                    {error}
                </div>
            )}
            <div className="col-span-6">
                <Text
                    label="Nombre:"
                    id="nombre"
                    name="nombre"
                    placeholder="Ingrese el nombre de la categoría"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="col-span-6">
                <Textarea
                    label="Descripción:"
                    id="descripcion"
                    name="descripcion"
                    rows="4"
                    placeholder="Ingrese la descripción de la categoría"
                    value={formData.descripcion}
                    onChange={handleChange}
                    required
                />
            </div>
        </Form>
    );
}

function CategoriasUbicacion() {
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [categoriaAEditar, setCategoriaAEditar] = useState(null);
    const [categorias, setCategorias] = useState([]);
    const [cargando, setCargando] = useState(true);
    
    const { busqueda, setBusqueda, itemsFiltrados: categoriasFiltradas } = useSearch(
        categorias,
        ['name', 'description']
    );

    const cargarLista = async () => {
        setCargando(true);
        try {
            const data = await obtenerCategoriasUbicacion();
            setCategorias(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error al cargar categorías:", err);
            setCategorias([]);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarLista();
    }, []);

    const handleCrear = () => {
        setCategoriaAEditar(null);
        setMostrarFormulario(true);
    }

    const handleEditar = (categoria) => {
        setCategoriaAEditar(categoria);
        setMostrarFormulario(true);
    }

    const handleEliminar = async (id) => {
        if (window.confirm("¿Está seguro de eliminar esta categoría?")) {
            try {
                await eliminarCategoriaUbicacion(id);
                cargarLista();
            } catch (err) {
                console.error("Error al eliminar la categoría:", err);
                if (err.response && err.response.data && err.response.data.message) {
                    alert(err.response.data.message);
                }
            }
        }
    };

    return (
        <div className="list-grid">
            <header className="bienvenida">
                <PageWelcome
                    titulo="CATEGORÍAS UBICACIONES"
                    descripcion="Este es el formato de las categorías de las ubicaciones."
                />
                    <Searcher
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        placeholder="Buscar por nombre o descripción"
                    />
            </header>
            <div className="table-responsive">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Descripción</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cargando ? (
                            <tr>
                                <td colSpan="3" style={{ textAlign: "center" }}>Cargando categorías...</td>
                            </tr>
                        ) : categoriasFiltradas.length > 0 ? (
                            categoriasFiltradas.map((cat) => (
                                <tr key={cat.id}>
                                    <td>{cat.name}</td>
                                    <td>{cat.description}</td>
                                    <td>
                                        <div className="btn-container">
                                            <Boton
                                                clase="btn-azul"
                                                onClick={() => handleEditar(cat)}
                                                title="Editar registro"
                                                icono="fa-solid fa-edit"
                                            />
                                            <Boton
                                                clase="btn-azul"
                                                onClick={() => handleEliminar(cat.id)}
                                                title="Eliminar registro"
                                                icono="fa-solid fa-trash"
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" style={{ textAlign: "center" }}>
                                    {busqueda ? "No se encontraron resultados" : "No hay categorías registradas"}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="btn-container">
                <Boton
                    clase="btn-azul"
                    icono="fa-solid fa-plus"
                    texto="Nueva Categoría"
                    onClick={handleCrear}
                    title="Registrar nueva categoría"
                />
                <BotonLink
                    link="/ubications"
                    clase="btn-2"
                    icono="fa-solid fa-list"
                    texto="Volver a Ubicaciones"
                    title="Ir a la página de Ubicaciones"
                />
            </div>
            {mostrarFormulario && (
                <Formulario
                    categoriaEditar={categoriaAEditar}
                    onCancel={() => setMostrarFormulario(false)}
                    onSuccess={cargarLista}
                />
            )}
        </div>
    );
}

export default CategoriasUbicacion;