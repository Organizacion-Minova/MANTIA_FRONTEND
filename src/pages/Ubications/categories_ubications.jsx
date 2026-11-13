import { useState, useEffect } from "react";
import { Boton, BotonAccion, BotonLink } from "../../components/common/Button";
import { PageWelcome, Searcher } from "../../components/common/welcome";
import { Form, Text, Textarea, Select } from "../../components/common/forms";
import { obtenerCategoriasUbicacion, guardarCategoriaUbicacion, actualizarCategoriaUbicacion, eliminarCategoriaUbicacion } from "../../api/locationCategory";
import { useSearch } from "../../hooks/useSearch";
import LoadingScreen from "../../components/LoadingScreen";
import { usePaginacion, Paginacion } from "../../components/common/Paginacion";
import { validarGroserias } from "../../components/common/Validations";
import { useToast } from "../../context/ToastContext";
import { useConfirm } from "../../context/ConfirmContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import editarIcono from "../../assets/icons/editar.svg";
import editarIconoDark from "../../assets/icons/editar-2.svg";
import borrarIcono from "../../assets/icons/borrar.svg";
import agregarIcon from "../../assets/icons/agregar.svg";
import listaIcon from "../../assets/icons/lista.svg";
import reestablecerFiltrosIcon from "../../assets/icons/reestablecerFiltros.svg";

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

    const erroresGroserias = validarGroserias({ 
        name: nombre, 
        description: descripcion 
    });
    if (erroresGroserias.name) return erroresGroserias.name;
    if (erroresGroserias.description) return erroresGroserias.description;

    return null;
};

const obtenerClaveBorrador = (usuarioId) => `mantia_borrador_categorias_ubicaciones_${usuarioId}`;

const obtenerBorrador = (usuarioId) => {
    if (!usuarioId) return null;

    try {
        const borrador = sessionStorage.getItem(obtenerClaveBorrador(usuarioId));
        return borrador ? JSON.parse(borrador) : null;
    } catch (error) {
        console.error("Error al recuperar el borrador de categorías de ubicaciones:", error);
        return null;
    }
};

const eliminarBorrador = (usuarioId) => {
    if (!usuarioId) return;
    sessionStorage.removeItem(obtenerClaveBorrador(usuarioId));
};

function Formulario({ onCancel, onSuccess, categoriaEditar = null, usuarioId }) {
    const isEditing = Boolean(categoriaEditar);
    const [borradorInicial] = useState(() => isEditing ? null : obtenerBorrador(usuarioId));
    const [formData, setFormData] = useState(() => ({
        nombre: borradorInicial?.nombre ?? (categoriaEditar ? categoriaEditar.name : ''),
        descripcion: borradorInicial?.descripcion ?? (categoriaEditar ? categoriaEditar.description : ''),
        estado: categoriaEditar ? categoriaEditar.status : 'active'
    }));
    const [cargando, setCargando] = useState(false);
    const { advertencia } = useToast(); 
    const pedirConfirmacion = useConfirm();
    const hayDatosIngresados = [formData.nombre, formData.descripcion]
        .some(valor => String(valor ?? "").trim() !== "");

    useEffect(() => {
        if (isEditing || !usuarioId) return;

        try {
            sessionStorage.setItem(obtenerClaveBorrador(usuarioId), JSON.stringify({
                nombre: formData.nombre,
                descripcion: formData.descripcion,
            }));
        } catch (error) {
            console.error("Error al guardar el borrador de categorías de ubicaciones:", error);
        }
    }, [isEditing, usuarioId, formData.nombre, formData.descripcion]);

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
        if (errorValidacion) {
            advertencia(errorValidacion, "Error de validación"); 
            return;
        }

        setCargando(true);

        try {
            if (isEditing) {
                await actualizarCategoriaUbicacion(categoriaEditar.id, datos);
            } else {
                await guardarCategoriaUbicacion(datos);
                eliminarBorrador(usuarioId);
            }
            onSuccess();
            onCancel();
        } catch (err) {
            setError(obtenerMensajeError(err, "Error al procesar la solicitud."));
        } finally {
            setCargando(false);
        }
    };

    const handleDescartar = async () => {
        const confirmar = await pedirConfirmacion({
            titulo: "Descartar borrador",
            mensaje: "¿Estás seguro de que deseas descartar este borrador? Se perderán todos los datos ingresados.",
        });

        if (!confirmar) return;

        eliminarBorrador(usuarioId);
        onCancel();
    };

    return (
        <Form
            titulo={isEditing ? "Editar categoría" : "Agregar nueva categoría"}
            descripcion={isEditing ? "Modifique los datos de la categoría" : "Ingrese los datos de la nueva categoría"}
            onCancel={onCancel}
            onDiscard={!isEditing && hayDatosIngresados ? handleDescartar : undefined}
            onSubmit={handleSubmit}
            textoBoton={cargando ? "Guardando..." : isEditing ? "Actualizar" : "Guardar"}
            iconoBoton="fa-solid fa-floppy-disk"
        >
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
    const { usuario } = useAuth();
    const usuarioId = usuario?.id;
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [categoriaAEditar, setCategoriaAEditar] = useState(null);
    const [categorias, setCategorias] = useState([]);
    const [cargando, setCargando] = useState(true);

    const { busqueda, setBusqueda, filtrosEspeciales, setFiltroEspecial, itemsFiltrados: categoriasFiltradas } = useSearch(
        categorias,
        ['name', 'description', 'status']
    );
    const hayFiltros =
        busqueda.trim() !== "" ||
        Object.values(filtrosEspeciales).some((v) => v !== "" && v != null);

    const handleBorrarFiltros = () => {
        setBusqueda("");
        setFiltroEspecial("status", "");
        setPaginaActual(1);
    };

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

    const pedirConfirmacion = useConfirm();
    const handleEliminar = async (id) => {
        if (await pedirConfirmacion({
            titulo: "Eliminar categoría",
            mensaje: "¿Seguro que quieres eliminar esta categoría? Esta acción no se puede deshacer.",
        })) {
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
                    mostrarHistorial={true}
                />
                    <Searcher
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        placeholder="Buscar por nombre o descripción"
                        filtrosAdicionales={
                            <div className="btn-container">
                                <Select
                                    id="filtroEstado"
                                    name="filtroEstado"
                                    value={filtrosEspeciales.status || ""}
                                    onChange={(e) => setFiltroEspecial('status', e.target.value)}
                                    opciones={opcionesEstados}
                                />
                                {hayFiltros && (
                                    <BotonAccion
                                        clase='btn-borrar'
                                        icono={reestablecerFiltrosIcon}
                                        texto="Borrar filtros"
                                        onClick={handleBorrarFiltros}
                                        titulo="Quitar la búsqueda y todos los filtros"
                                    />
                                )}
                            </div>
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
                                        <div className="btn-container__acciones">
                                            <BotonAccion
                                                clase="btn-editar"
                                                onClick={() => handleEditar(cat)}
                                                titulo="Editar registro"
                                                icono={editarIcono}
                                                iconoDark={editarIconoDark}
                                            />
                                            <BotonAccion
                                                clase="btn-borrar"
                                                onClick={() => handleEliminar(cat.id)}
                                                titulo="Eliminar registro"
                                                icono={borrarIcono}
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
                        img={agregarIcon}
                        texto="Nueva Categoría"
                        onClick={handleCrear}
                        titulo="Registrar nueva categoría"
                    />
                    <BotonLink
                        link="/ubications"
                        clase="btn-2"
                        img={listaIcon}
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
                    key={`${usuarioId ?? "sin-usuario"}-${categoriaAEditar?.id ?? "nuevo"}`}
                    categoriaEditar={categoriaAEditar}
                    onCancel={() => setMostrarFormulario(false)}
                    onSuccess={cargarLista}
                    usuarioId={usuarioId}
                />
            )}
        </div>
    );
}

export default CategoriasUbicacion;