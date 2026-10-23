import { useState, useEffect } from "react";
import { Boton, BotonLink } from "../../components/common/Button";
import { PageWelcome, Searcher } from "../../components/common/welcome";
import { Form, Text, Textarea, Select } from "../../components/common/forms";
import { obtenerCategoriasUbicacion, guardarCategoriaUbicacion, actualizarCategoriaUbicacion, eliminarCategoriaUbicacion } from "../../api/locationCategory";
import { useSearch } from "../../hooks/useSearch";
import LoadingScreen from "../../components/LoadingScreen";
import { usePaginacion, Paginacion } from "../../components/common/Paginacion";

const opciones_estado = [
    { valor: "active", etiqueta: "Activo" },
    { valor: "inactive", etiqueta: "Inactivo" }
];

const etiqueta_estado = { active: "Activo", inactive: "Inactivo" };

const obtenerMensajeError = (err, porDefecto) => {
    const errores = err.response?.data?.errors;
    return (errores && Object.values(errores)[0]?.[0]) || err.response?.data?.message || porDefecto;
};

const regex_nombre = /^[\p{L}\p{N}\s\-]+$/u;

const validar = ({ nombre, descripcion }) => {
    if (!nombre) return "El nombre es obligatorio.";
    if (nombre.length > 45) return "El nombre no puede superar los 45 caracteres.";
    if (!regex_nombre.test(nombre)) return "El nombre solo puede contener letras, números, espacios y guiones.";
    if (!descripcion) return "La descripción es obligatoria.";
    if (descripcion.length > 5000) return "La descripción no puede superar los 5000 caracteres.";
    return null;
};

function Formulario({ onCancel, onSuccess, categoriaEditar = null }) {
    const [formData, setFormData] = useState({
        nombre: categoriaEditar ? categoriaEditar.name : '',
        descripcion: categoriaEditar ? categoriaEditar.description : '',
        estado: categoriaEditar ? categoriaEditar.status : 'active'
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
        const datos = { ...formData, nombre: formData.nombre.trim(), descripcion: formData.descripcion.trim() };
        const errorValidacion = validar(datos);
        if (errorValidacion) return setError(errorValidacion);

        setCargando(true);
        setError(null);

        try {
            if (isEditing) {
                await actualizarCategoriaUbicacion(categoriaEditar.id, datos);
            } else {
                await guardarCategoriaUbicacion(datos);
            }
            onSuccess();
            onCancel();
        } catch (err) {
            setError(obtenerMensajeError(err, "Error al procesar la solicitud."));
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
                    maxLength={45}
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
                    maxLength={5000}
                    required
                />
            </div>
            {isEditing && (
                <div className="col-span-6">
                    <Select
                        label="Estado:"
                        id="estado"
                        name="estado"
                        value={formData.estado}
                        onChange={handleChange}
                        opciones={opciones_estado}
                        required
                    />
                </div>
            )}
        </Form>
    );
}

function CategoriasUbicacion() {
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [categoriaAEditar, setCategoriaAEditar] = useState(null);
    const [categorias, setCategorias] = useState([]);
    const [cargando, setCargando] = useState(true);

    const { busqueda, setBusqueda, filtrosEspeciales, setFiltroEspecial, itemsFiltrados: categoriasFiltradas } = useSearch(
        categorias,
        ['name', 'description']
    );

    const { datosPagina, paginaActual, totalPaginas, setPaginaActual } = usePaginacion(categoriasFiltradas, 7);
    useEffect(() => {
        setPaginaActual(1);
    }, [busqueda, filtrosEspeciales, setPaginaActual]);

    const cargarLista = async () => {
        setCargando(true);
        try {
            const data = await obtenerCategoriasUbicacion();
            setCategorias(Array.isArray(data) ? data : []);
        } catch (err) {
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
                setCargando(false);
            }
        }
    };

    const opcionesEstados = [
        { valor: "", etiqueta: "Todos los estados" },
        { valor: "active", etiqueta: "Activo" },
        { valor: "inactive", etiqueta: "Inactivo" }
    ];

    if (cargando) return <LoadingScreen indeterminado/>
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
                        filtrosAdicionales={
                            <Select
                                id="filtroEstado"
                                name="filtroEstado"
                                value={filtrosEspeciales.status || ""}
                                onChange={(e) => setFiltroEspecial('status', e.target.value)}
                                opciones={opcionesEstados}
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
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cargando ? (
                            <tr>
                                <td colSpan="4" style={{ textAlign: "center" }}>Cargando categorías...</td>
                            </tr>
                        ) : datosPagina.length > 0 ? (
                            datosPagina.map((cat) => (
                                <tr key={cat.id}>
                                    <td>{cat.name}</td>
                                    <td>{cat.description}</td>
                                    <td>{etiqueta_estado[cat.status]}</td>
                                    <td>
                                        <div className="btn-container">
                                            <Boton
                                                clase="btn-azul"
                                                onClick={() => handleEditar(cat)}
                                                titulo="Editar registro"
                                                icono="fa-solid fa-edit"
                                            />
                                            <Boton
                                                clase="btn-azul"
                                                onClick={() => handleEliminar(cat.id)}
                                                titulo="Eliminar registro"
                                                icono="fa-solid fa-trash"
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" style={{ textAlign: "center" }}>
                                    {busqueda ? "No se encontraron resultados" : "No hay categorías registradas"}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="btn-container-page">
                <div className="btn-container">
                    <Boton
                        clase="btn-azul"
                        icono="fa-solid fa-plus"
                        texto="Nueva Categoría"
                        onClick={handleCrear}
                        titulo="Registrar nueva categoría"
                    />
                    <BotonLink
                        link="/ubications"
                        clase="btn-2"
                        icono="fa-solid fa-list"
                        texto="Volver a Ubicaciones"
                        titulo="Ir a la página de Ubicaciones"
                    />
                </div>
                <Paginacion
                    paginaActual={paginaActual}
                    totalPaginas={totalPaginas}
                    setPaginaActual={setPaginaActual}
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