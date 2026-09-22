import { useState, useEffect } from "react";
import { Boton, BotonLink } from "../../components/common/Button";
import { PageWelcome, Searcher } from "../../components/common/welcome";
import { Form, Text, Textarea, Select } from "../../components/common/forms";
import { obtenerUbicaciones, guardarUbicacion, actualizarUbicacion, eliminarUbicacion } from "../../api/location";
import { useSearch } from "../../hooks/useSearch";

function Formulario({ onCancel, onSuccess, categorias, ubicacionEditar = null }) {
    const [formData, setFormData] = useState({
        nombre: ubicacionEditar ? ubicacionEditar.name : '',
        descripcion: ubicacionEditar ? ubicacionEditar.description : '',
        categoria: ubicacionEditar ? ubicacionEditar.location_category_id : ''
    });

    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);
    const isEditing = Boolean(ubicacionEditar);

    const opcionesCategoria = [
        { valor: "", etiqueta: "Seleccione una categoría" },
        ...categorias.map(cat => ({ valor: cat.id, etiqueta: cat.name }))
    ];

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
                await actualizarUbicacion(ubicacionEditar.id, formData);
            } else {
                await guardarUbicacion(formData);
            }
            onSuccess();
            onCancel();
        } catch (err) {
            const mensajeServidor = err.response?.data?.message || "Error al procesar la solicitud.";
            setError(mensajeServidor);
        } finally {
            setCargando(false);
        }
    };

    return (
        <Form
            titulo={isEditing ? "Editar ubicación" : "Agregar nueva ubicación"}
            descripcion={isEditing ? "Modifique los datos de la ubicación" : "Ingrese los datos para la nueva ubicación"}
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
                    placeholder="Ingrese el nombre de la ubicación"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="col-span-6">
                <Select
                    label="Categoría:"
                    id="categoria"
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                    opciones={opcionesCategoria}
                    required
                />
            </div>
            <div className="col-span-6">
                <Textarea
                    label="Descripción:"
                    id="descripcion"
                    name="descripcion"
                    placeholder="Ingrese la descripción de la ubicación"
                    value={formData.descripcion}
                    onChange={handleChange}
                    required
                />
            </div>
        </Form>
    );
}

function Ubicaciones() {
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [ubicacionAEditar, setUbicacionAEditar] = useState(null);
    const [ubicaciones, setUbicaciones] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [cargando, setCargando] = useState(true);

    const { busqueda, setBusqueda, filtrosEspeciales, setFiltroEspecial, itemsFiltrados: ubicacionesFiltradas } = useSearch(
        ubicaciones,
        ['name', 'description']
    );

    const cargarDatos = async () => {
        setCargando(true);
        try {
            const data = await obtenerUbicaciones();
            setUbicaciones(Array.isArray(data.ubicaciones) ? data.ubicaciones : []);
            setCategorias(Array.isArray(data.categorias) ? data.categorias : []);
        } catch (err) {
            console.error("Error al cargar los datos:", err);
            setUbicaciones([]);
            setCategorias([]);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const handleCrear = () => {
        setUbicacionAEditar(null);
        setMostrarFormulario(true);
    };

    const handleEditar = (ubicacion) => {
        setUbicacionAEditar(ubicacion);
        setMostrarFormulario(true);
    };

    const handleEliminar = async (id) => {
        if (window.confirm("¿Está seguro de eliminar esta ubicación?")) {
            try {
                await eliminarUbicacion(id);
                cargarDatos();
            } catch (err) {
                console.error("Error al eliminar la ubicación:", err);
                if (err.response && err.response.data && err.response.data.message) {
                    alert(err.response.data.message);
                }
            }
        }
    };

    const opcionesCategorias = [
        { valor: "", etiqueta: "Todas las categorías" },
        ...categorias.map(cat => ({ valor: cat.id, etiqueta: cat.name }))
    ];

    return (
        <div className="list-grid">
            <header className="bienvenida">
                <PageWelcome
                    titulo="UBICACIONES"
                    descripcion="Este es el formato de las ubicaciones."
                />
                <Searcher
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar por nombre o descripción"
                    filtrosAdicionales={
                        <Select
                            id="categoria"
                            name="categoria"
                            value={filtrosEspeciales.location_category_id || ""}
                            onChange={(e) => setFiltroEspecial('location_category_id', e.target.value)}
                            opciones={opcionesCategorias}
                        />
                    }
                />
            </header>
            <div className="table-responsive">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Descripción</th>
                            <th>Categoría</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cargando ? (
                            <tr>
                                <td colSpan="4" style={{ textAlign: "center" }}>Cargando ubicaciones...</td>
                            </tr>
                        ) : ubicacionesFiltradas.length > 0 ? (
                            ubicacionesFiltradas.map((ubi) => (
                                <tr key={ubi.id}>
                                    <td>{ubi.name}</td>
                                    <td>{ubi.description}</td>
                                    <td>{ubi.location_category?.name}</td>
                                    <td>
                                        <div className="btn-container">
                                            <Boton
                                                clase="btn-azul"
                                                title="Ver registro"
                                                icono="fa-solid fa-eye"
                                            />
                                            <Boton
                                                clase="btn-azul"
                                                onClick={() => handleEditar(ubi)}
                                                title="Editar registro"
                                                icono="fa-solid fa-edit"
                                            />
                                            <Boton
                                                clase="btn-azul"
                                                onClick={() => handleEliminar(ubi.id)}
                                                title="Eliminar registro"
                                                icono="fa-solid fa-trash"
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" style={{ textAlign: "center" }}>
                                    {busqueda || categoria !== "todas" ? "No se encontraron resultados" : "No hay ubicaciones registradas"}
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
                    texto="Nueva Ubicación"
                    onClick={handleCrear}
                    title="Registrar nueva ubicación"
                />
                <BotonLink
                    link="/ubications/categoriesubications"
                    clase="btn-2"
                    icono="fa-solid fa-list"
                    texto="Categorías Ubicaciones"
                    title="Ir a la página de Categorías Ubicaciones"
                />
            </div>
            {mostrarFormulario && (
                <Formulario
                    ubicacionEditar={ubicacionAEditar}
                    categorias={categorias}
                    onCancel={() => setMostrarFormulario(false)}
                    onSuccess={cargarDatos}
                />
            )}
        </div>
    );
}

export default Ubicaciones;