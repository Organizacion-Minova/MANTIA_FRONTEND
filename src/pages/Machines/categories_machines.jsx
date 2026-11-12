import { useState, useEffect } from "react";
import { Boton, BotonAccion, BotonLink } from "../../components/common/Button";
import { PageWelcome, Searcher } from "../../components/common/welcome";
import { Form, Text, Textarea, Select } from '../../components/common/forms';
import { GetCategoryMachine, CreateCategoryMachine, DeleteCategoryMachine, UpdateCategoryMachine } from "../../api/machinesapi";
import LoadingScreen from "../../components/LoadingScreen";
import { usePaginacion, Paginacion } from "../../components/common/Paginacion";
import { capitalizarPrimeraLetra, soloLetras, sinCaracteresEspeciales, validarCaracteresEspeciales, validarGroserias } from "../../components/common/Validations";
import { validarCamposRequeridos } from "../../components/common/requiredFields";
import { useSearch } from "../../hooks/useSearch";
import { useConfirm } from "../../context/ConfirmContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import editarIcono from "../../assets/icons/editar.svg";
import editarIconoDark from "../../assets/icons/editar-2.svg";
import borrarIcono from "../../assets/icons/borrar.svg";
import agregarIcon from "../../assets/icons/agregar.svg";
import listaIcon from "../../assets/icons/lista.svg";

const obtenerClaveBorrador = (usuarioId) => `mantia_borrador_categorias_maquinas_${usuarioId}`;

const obtenerBorrador = (usuarioId) => {
    if (!usuarioId) return null;

    try {
        const borrador = sessionStorage.getItem(obtenerClaveBorrador(usuarioId));
        return borrador ? JSON.parse(borrador) : null;
    } catch (error) {
        console.error("Error al recuperar el borrador de categorías de máquinas:", error);
        return null;
    }
};

const eliminarBorrador = (usuarioId) => {
    if (!usuarioId) return;
    sessionStorage.removeItem(obtenerClaveBorrador(usuarioId));
};

function Formulario({ onCancel, onGuardado, categoriaEditar, usuarioId }) {
    const esEdicion = categoriaEditar != null;
    const [borradorInicial] = useState(() => esEdicion ? null : obtenerBorrador(usuarioId));
    const [nombre, setNombre] = useState(borradorInicial?.nombre ?? categoriaEditar?.name ?? "");
    const [descripcion, setDescripcion] = useState(borradorInicial?.descripcion ?? categoriaEditar?.description ?? "");
    const [estado, setEstado] = useState(categoriaEditar?.status || "active");
    const [errores, setErrores] = useState({});
    const hayDatosIngresados = [nombre, descripcion]
        .some(valor => String(valor ?? "").trim() !== "");

    useEffect(() => {
        if (esEdicion || !usuarioId) return;

        try {
            sessionStorage.setItem(
                obtenerClaveBorrador(usuarioId),
                JSON.stringify({ nombre, descripcion })
            );
        } catch (error) {
            console.error("Error al guardar el borrador de categorías de máquinas:", error);
        }
    }, [esEdicion, usuarioId, nombre, descripcion]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrores({});

        if (!validarCamposRequeridos({
            "Nombre de la categoría": nombre,
            "Descripción": descripcion,
            ...(esEdicion ? { "Estado": estado } : {}),
        })) return;

        const erroresLocales = {};

        if (!soloLetras(descripcion)) {
            erroresLocales.description = ["El contenido solo puede contener letras y espacios."];
        }
        Object.assign(erroresLocales, validarCaracteresEspeciales({ name: nombre }));
        Object.assign(erroresLocales, validarGroserias({ name: nombre, description: descripcion }));

        if (Object.keys(erroresLocales).length > 0) {
            setErrores(erroresLocales);
            return; 
        }
        if (esEdicion) {
            const sinCambios =
                nombre === categoriaEditar.name &&
                descripcion === categoriaEditar.description &&
                estado === categoriaEditar.status;
            if (sinCambios) {
                onCancel();
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
                eliminarBorrador(usuarioId);
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

    const pedirConfirmacion = useConfirm();
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
            titulo={esEdicion ? "Editar categoría" : "Agregar nueva categoría"}
            descripcion={esEdicion ? "Modifique los datos de la categoría" : "Ingrese los datos de la nueva categoría"}
            onCancel={onCancel}
            onDiscard={!esEdicion && hayDatosIngresados ? handleDescartar : undefined}
            textoBoton="Guardar"
            iconoBoton="fa-solid fa-floppy-disk"
            onSubmit={handleSubmit}
            noValidate
        >
            <div className="col-span-6">
                <Text
                    label="Nombre de la categoría:"
                    id="nombre"
                    name="nombre"
                    placeholder="Ingrese el nombre de la categoría"
                    value={nombre}
                    onChange={(e) => {
                        const valor = e.target.value;
                        if (sinCaracteresEspeciales(valor)){
                            setNombre(capitalizarPrimeraLetra(valor))
                        }
                    }}
                    required
                />
            </div>

            <div className="col-span-6">
                <Textarea
                    label="Descripción"
                    id="descripcion"
                    name="descripcion"
                    rows={4}
                    value={descripcion}
                    onChange={(e) => setDescripcion(capitalizarPrimeraLetra(e.target.value))}
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
    const { usuario } = useAuth();
    const usuarioId = usuario?.id;
    const pedirConfirmacion = useConfirm();
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [categoriaEditar, setCategoriaEditar] = useState(null);
    const [categorias, setCategorias] = useState([]);
    const [cargando, setCargando] = useState(true);


    const { busqueda, setBusqueda, filtrosEspeciales, setFiltroEspecial, itemsFiltrados: categoriasFiltradas } = useSearch(
        categorias,
        ['name', 'description', 'status']
    );

    const { datosPagina, paginaActual, totalPaginas, setPaginaActual } = usePaginacion(categoriasFiltradas, 7);

    useEffect(() => {
        setPaginaActual(1);
    }, [busqueda, filtrosEspeciales, setPaginaActual]);
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

    if (cargando) return <LoadingScreen indeterminado/>;

    const handleEliminar = async (id) => {
        const confirmar = await pedirConfirmacion({
            titulo: "Eliminar categoría",
            mensaje: "¿Seguro que quieres eliminar esta categoría? Esta acción no se puede deshacer.",
        });
        if (!confirmar) return;

        try {
            await DeleteCategoryMachine(id);
            cargarCategorias(); 
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
                    titulo="CATEGORÍAS DE MÁQUINAS"
                    descripcion="Este es el formato de las categorías de las máquinas."
                    mostrarHistorial={true}
                />
                <Searcher
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar por nombre o descripción"
                    filtrosAdicionales={
                        <Select
                            id="filtro-estado-consumibles"
                            name="filtro-estado-consumibles"
                            value={filtrosEspeciales.status || ""}
                            onChange={(e) => setFiltroEspecial("status", e.target.value)}
                            opciones={[
                                { valor: "", etiqueta: "Todos los estados" },
                                { valor: "active", etiqueta: "Activo" },
                                { valor: "inactive", etiqueta: "Inactivo" },
                            ]}  
                        />
                    }
                />
            </header>
            <div className="table-responsive">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Nombre de la categoría</th>
                            <th>Descripción</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {datosPagina.map((cat) => (
                        <tr key={cat.id}>
                            <td>{cat.name}</td>
                            <td>{cat.description}</td>
                            <td>{cat.status === "active" ? "Activo" : "Inactivo"}</td>
                            <td>
                                <div className="btn-container__acciones">
                                    <BotonAccion
                                        clase="btn-editar"
                                        icono={editarIcono}
                                        iconoDark={editarIconoDark}
                                        onClick={() => handleAbrirEditar(cat)}
                                        titulo="Editar categoría"
                                    />
                                    <BotonAccion
                                        clase="btn-borrar"
                                        icono={borrarIcono}
                                        onClick={() => handleEliminar(cat.id)}
                                        titulo="Eliminar categoría"
                                    />
                                </div>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table>
           </div>
            <div className="btn-container-page">
                <div className="btn-container">
                    <Boton
                        clase="btn-azul"
                        img={agregarIcon}
                        texto="Nueva categoría"
                        onClick={handleAbrirCrear}
                        titulo="Agregar nueva categoría"
                    />
                    <BotonLink
                        link="/machines"
                        clase="btn-2"
                        img={listaIcon}
                        texto="Máquinas"
                        titulo="Volver al listado de máquinas"
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
                    key={`${usuarioId ?? "sin-usuario"}-${categoriaEditar?.id ?? "nuevo"}`}
                    onCancel={() => setMostrarFormulario(false)}
                    onGuardado={cargarCategorias}
                    categoriaEditar={categoriaEditar}
                    usuarioId={usuarioId}
                />
            )}
        </div>
    )
}
export default CategoriasMaquinas;