import { useState, useEffect } from "react";
import { Boton, BotonLink } from "../../components/common/Button";
import { PageWelcome, Searcher } from "../../components/common/welcome";
import { Form, Text, Textarea, Select } from "../../components/common/forms";
import { obtenerUbicaciones, guardarUbicacion, actualizarUbicacion, eliminarUbicacion } from "../../api/location";
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

const regex_nombre = /^[\p{L}\p{N}\s\-_.,#/()°:]+$/u;

const validar = ({ nombre, descripcion, categoria }) => {
    if (!nombre) return "El nombre es obligatorio.";
    if (nombre.length > 100) return "El nombre no puede superar los 100 caracteres.";
    if (!regex_nombre.test(nombre)) return "El nombre solo puede contener letras, números, espacios y los caracteres - _ . , # / ( ) ° :";
    if (!categoria) return "La categoría es obligatoria.";
    if (!descripcion) return "La descripción es obligatoria.";
    if (descripcion.length > 5000) return "La descripción no puede superar los 5000 caracteres.";
    return null;
};

function Formulario({ onCancel, onSuccess, categorias, ubicacionEditar = null }) {
    const [formData, setFormData] = useState({
        nombre: ubicacionEditar ? ubicacionEditar.name : '',
        descripcion: ubicacionEditar?.description ?? '',
        categoria: ubicacionEditar ? ubicacionEditar.location_category_id : '',
        estado: ubicacionEditar ? ubicacionEditar.status : 'active'
    });

    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);
    const isEditing = Boolean(ubicacionEditar);

    const opcionesCategoria = [
        { valor: "", etiqueta: "Seleccione una categoría" },
        ...categorias
            .filter(cat => cat.status === 'active' || cat.id === ubicacionEditar?.location_category_id)
            .map(cat => ({ valor: cat.id, etiqueta: cat.status === 'active' ? cat.name : `${cat.name} (Inactiva)` }))
    ];

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
                await actualizarUbicacion(ubicacionEditar.id, datos);
            } else {
                await guardarUbicacion(datos);
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
                    maxLength={100}
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

    const { datosPagina, paginaActual, totalPaginas, setPaginaActual } = usePaginacion(ubicacionesFiltradas, 7);
    useEffect(() => {
        setPaginaActual(1);
    }, [busqueda, filtrosEspeciales, setPaginaActual]);

    const cargarDatos = async () => {
        setCargando(true);
        try {
            const data = await obtenerUbicaciones();
            setUbicaciones(Array.isArray(data.ubicaciones) ? data.ubicaciones : []);
            setCategorias(Array.isArray(data.categorias) ? data.categorias : []);
        } catch (err) {
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
                setCargando(false);
            }
        }
    };

    const opcionesCategorias = [
        { valor: "", etiqueta: "Todas las categorías" },
        ...categorias.map(cat => ({ valor: cat.id, etiqueta: cat.name }))
    ];

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
                    titulo="UBICACIONES"
                    descripcion="Este es el formato de las ubicaciones."
                />
                <Searcher
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar por nombre o descripción"
                    filtrosAdicionales={
                        <>
                            <Select
                                id="filtroCategoria"
                                name="filtroCategoria"
                                value={filtrosEspeciales.location_category_id || ""}
                                onChange={(e) => setFiltroEspecial('location_category_id', e.target.value)}
                                opciones={opcionesCategorias}
                            />
                            <Select
                                id="filtroEstado"
                                name="filtroEstado"
                                value={filtrosEspeciales.status || ""}
                                onChange={(e) => setFiltroEspecial('status', e.target.value)}
                                opciones={opcionesEstados}
                            />
                        </>
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
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cargando ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: "center" }}>Cargando ubicaciones...</td>
                            </tr>
                        ) : datosPagina.length > 0 ? (
                            datosPagina.map((ubi) => (
                                <tr key={ubi.id}>
                                    <td>{ubi.name}</td>
                                    <td>{ubi.description}</td>
                                    <td>{ubi.location_category?.name}</td>
                                    <td>{etiqueta_estado[ubi.status]}</td>
                                    <td>
                                        <div className="btn-container">
                                            <Boton
                                                clase="btn-azul"
                                                titulo="Ver registro"
                                                icono="fa-solid fa-eye"
                                            />
                                            <Boton
                                                clase="btn-azul"
                                                onClick={() => handleEditar(ubi)}
                                                titulo="Editar registro"
                                                icono="fa-solid fa-edit"
                                            />
                                            <Boton
                                                clase="btn-azul"
                                                onClick={() => handleEliminar(ubi.id)}
                                                titulo="Eliminar registro"
                                                icono="fa-solid fa-trash"
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: "center" }}>
                                    {busqueda || filtrosEspeciales.location_category_id ? "No se encontraron resultados" : "No hay ubicaciones registradas"}
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
                        texto="Nueva Ubicación"
                        onClick={handleCrear}
                        titulo="Registrar nueva ubicación"
                    />
                    <BotonLink
                        link="/ubications/categoriesubications"
                        clase="btn-2"
                        icono="fa-solid fa-list"
                        texto="Categorías Ubicaciones"
                        titulo="Ir a la página de Categorías Ubicaciones"
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