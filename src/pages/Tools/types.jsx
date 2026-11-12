import { useEffect, useState } from "react";
import { Boton, BotonAccion, BotonLink } from "../../components/common/Button";
import { PageWelcome, Searcher } from "../../components/common/welcome"; 
import { Form, Text, Textarea, Select } from "../../components/common/forms";
import { GetCategoryTools, CreateCategoryTools, DeleteCategoryTools, UpdateCategoryTools } from "../../api/Toolsapi";
import LoadingScreen from "../../components/LoadingScreen";
import { usePaginacion, Paginacion   } from "../../components/common/Paginacion";
import { capitalizarPrimeraLetra, sinCaracteresEspeciales, validarCaracteresEspeciales, validarGroserias } from "../../components/common/Validations";
import { validarCamposRequeridos } from "../../components/common/requiredFields";
import { useSearch } from "../../hooks/useSearch";
import { useConfirm } from "../../context/ConfirmContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import editarIcono from "../../assets/icons/editar.svg";
import editarIconoDark from "../../assets/icons/editar-2.svg";
import borrarIcono from "../../assets/icons/borrar.svg";
import agregarIcon from "../../assets/icons/agregar.svg";
import listaIcon from "../../assets/icons/lista.svg";

const obtenerClaveBorrador = (usuarioId, tipo) =>
    `mantia_borrador_categorias_herramientas_${tipo}_${usuarioId}`;

const obtenerBorrador = (usuarioId, tipo) => {
    if (!usuarioId) return null;

    try {
        const borrador = sessionStorage.getItem(obtenerClaveBorrador(usuarioId, tipo));
        return borrador ? JSON.parse(borrador) : null;
    } catch (error) {
        console.error(`Error al recuperar el borrador de categorías ${tipo}:`, error);
        return null;
    }
};

const eliminarBorrador = (usuarioId, tipo) => {
    if (!usuarioId) return;
    sessionStorage.removeItem(obtenerClaveBorrador(usuarioId, tipo));
};

function FormConsumibles({onCancel,onGuardado,categoriaEditar, usuarioId }){
    const esEdicion = categoriaEditar != null;
    const [borradorInicial] = useState(() => esEdicion ? null : obtenerBorrador(usuarioId, "consumibles"));
    const [nombre, setNombre] = useState(borradorInicial?.nombre ?? categoriaEditar?.name ?? "");
    const [descripcion, setDescripcion] = useState(borradorInicial?.descripcion ?? categoriaEditar?.description ?? "");
    const [estado, setEstado] = useState(categoriaEditar?.status || "activo");
    const [errores, setErrores] = useState({});
    const hayDatosIngresados = [nombre, descripcion]
        .some(valor => String(valor ?? "").trim() !== "");

    useEffect(() => {
        if (esEdicion || !usuarioId) return;

        try {
            sessionStorage.setItem(
                obtenerClaveBorrador(usuarioId, "consumibles"),
                JSON.stringify({ nombre, descripcion })
            );
        } catch (error) {
            console.error("Error al guardar el borrador de categorías consumibles:", error);
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
        Object.assign(erroresLocales, validarCaracteresEspeciales({ name: nombre }));
        Object.assign(erroresLocales, validarGroserias({ name: nombre, description: descripcion }));
        if (Object.keys(erroresLocales).length > 0) {
            setErrores(erroresLocales);
            return;
        }

        if (esEdicion){
            const sinCambios= 
                nombre.trim() === categoriaEditar.name &&
                descripcion.trim() === categoriaEditar.description &&
                estado === categoriaEditar.status;
            if (sinCambios){
                onCancel()
                return
            }
        }

        const datos = {
            name: nombre.trim(),
            description: descripcion.trim(),
            status: estado,
            category_group_id: 1,
        };

        try {
            if (esEdicion) {
                await UpdateCategoryTools(categoriaEditar.id, datos);
            } else {
                await CreateCategoryTools(datos);
                eliminarBorrador(usuarioId, "consumibles");
            }

            await onGuardado();
            onCancel();
        } catch (error) {
            console.error("Datos enviados:", datos);
            console.error("Respuesta del backend:", error.response?.data);

            setErrores(error.response?.data?.errors || {});
        }
    };

    const pedirConfirmacion = useConfirm();
    const handleDescartar = async () => {
        const confirmar = await pedirConfirmacion({
            titulo: "Descartar borrador",
            mensaje: "¿Estás seguro de que deseas descartar este borrador? Se perderán todos los datos ingresados.",
        });

        if (!confirmar) return;

        eliminarBorrador(usuarioId, "consumibles");
        onCancel();
    };
    
    return(
        <Form
            titulo={esEdicion? "Editar categoría consumible":"Agregar nueva categoría consumible"}
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
                        if (sinCaracteresEspeciales(valor) || valor === ""){
                            setNombre(capitalizarPrimeraLetra(valor))
                        }
                    }}
                    required
                />
            </div>
            <div className="col-span-6">
                <Textarea
                    label="Descripción:"
                    id="descripcion"
                    name="descripcion"
                    rows="4"
                    placeholder="Descripción"
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
                            { valor: "Activo", etiqueta: "Activo" },
                            { valor: "Inactivo", etiqueta: "Inactivo" },
                        ]}
                        onChange={(e) => setEstado(e.target.value)}
                        required
                    />
                </div>
            )}
        </Form>
    )
}
function FormNoConsumibles({onCancel, onGuardado, categoriaEditar, usuarioId}){
    const esEdicion = categoriaEditar != null;
    const [borradorInicial] = useState(() => esEdicion ? null : obtenerBorrador(usuarioId, "no_consumibles"));
    const [nombre, setNombre] = useState(borradorInicial?.nombre ?? categoriaEditar?.name ?? "");
    const [descripcion, setDescripcion] = useState(borradorInicial?.descripcion ?? categoriaEditar?.description ?? "");
    const [estado, setEstado] = useState(categoriaEditar?.status || "Activo");
    const [errores, setErrores] = useState({});
    const hayDatosIngresados = [nombre, descripcion]
        .some(valor => String(valor ?? "").trim() !== "");

    useEffect(() => {
        if (esEdicion || !usuarioId) return;

        try {
            sessionStorage.setItem(
                obtenerClaveBorrador(usuarioId, "no_consumibles"),
                JSON.stringify({ nombre, descripcion })
            );
        } catch (error) {
            console.error("Error al guardar el borrador de categorías no consumibles:", error);
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
        Object.assign(erroresLocales, validarCaracteresEspeciales({ name: nombre }));
        Object.assign(erroresLocales, validarGroserias({ name: nombre, description: descripcion }));
        if (Object.keys(erroresLocales).length > 0) {
            setErrores(erroresLocales);
            return; 
        }

        if (esEdicion){
            const sinCambios= 
                nombre.trim() === categoriaEditar.name &&
                descripcion.trim() === categoriaEditar.description &&
                estado === categoriaEditar.status;
            if (sinCambios){
                onCancel()
                return
            }
        }

        const datos = {
            name: nombre.trim(),
            description: descripcion.trim(),
            status: estado,
            category_group_id: 2,
        };

        try {
            if (esEdicion) {
                await UpdateCategoryTools(categoriaEditar.id, datos);
            } else {
                await CreateCategoryTools(datos);
                eliminarBorrador(usuarioId, "no_consumibles");
            }

            onGuardado();
            onCancel();
        } catch (error) {
            console.error("Datos enviados:", datos);
            console.error("Respuesta del backend:", error.response?.data);

            setErrores(error.response?.data?.errors || {});
        }
    };

    const pedirConfirmacion = useConfirm();
    const handleDescartar = async () => {
        const confirmar = await pedirConfirmacion({
            titulo: "Descartar borrador",
            mensaje: "¿Estás seguro de que deseas descartar este borrador? Se perderán todos los datos ingresados.",
        });

        if (!confirmar) return;

        eliminarBorrador(usuarioId, "no_consumibles");
        onCancel();
    };

    return(
        <Form
            titulo={esEdicion? "Editar categoría No consumible":"Agregar nueva categoría no consumible"}
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
                        if (sinCaracteresEspeciales(valor) || valor === ""){
                            setNombre(capitalizarPrimeraLetra(valor))
                        }
                    }}
                    required
                />
            </div>
            <div className="col-span-6">
                <Textarea
                    label="Descripción:"
                    id="descripcion"
                    name="descripcion"
                    rows="4"
                    placeholder="Descripción"
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
                            { valor: "Activo", etiqueta: "Activo" },
                            { valor: "Inactivo", etiqueta: "Inactivo" },
                        ]}
                        onChange={(e) => setEstado(e.target.value)}
                        required
                    />
                </div>
            )}
        </Form>
    )
}
export function Consumibles(){
    const { usuario } = useAuth();
    const usuarioId = usuario?.id;
    const pedirConfirmacion = useConfirm();
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    let [categorias, setCategorias] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [categoriaEditar, setCategoriaEditar] = useState(null);
    categorias = categorias.filter((cat) => Number(cat.category_group_id) === 1)
    const { busqueda, setBusqueda, filtrosEspeciales, setFiltroEspecial, itemsFiltrados: categoriasFiltradas } = useSearch(
        categorias,
        ["name", "description", "status"]
    );
    const { datosPagina, paginaActual, totalPaginas, setPaginaActual } = usePaginacion(categoriasFiltradas, 7);

    useEffect(() => {
        setPaginaActual(1);
    }, [busqueda, filtrosEspeciales, setPaginaActual]);

    const cargarCategorias=()=>{
        setCargando(true);
        GetCategoryTools()
            .then((data) => setCategorias(Array.isArray(data) ? data : data?.data || []))
            .catch((error) => console.error("Error al traer categorías:", error))
            .finally(() => setCargando(false))
    }
    useEffect(()=>{cargarCategorias();},[])
    if (cargando) return <LoadingScreen indeterminado/>;
    
    const handleEliminar = async (id) => {
        let confirmar = await pedirConfirmacion({
            titulo: "Eliminar categoría",
            mensaje: "¿Seguro que quieres eliminar esta categoría? Esta acción no se puede deshacer.",
        });
        if (!confirmar)
            return
        try {
            await DeleteCategoryTools(id)
            cargarCategorias()
        }
        catch (error){
            console.error("Error al eliminar categoría:", error);
        }
    }
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
                    titulo="CATEGORÍAS DE HERRAMIENTAS CONSUMIBLES"
                    descripcion="Este es el formato de las categorías de herramientas consumibles."
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
                                { valor: "Activo", etiqueta: "Activo" },
                                { valor: "Inactivo", etiqueta: "Inactivo" },
                            ]}
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
                             <th> Estado</th>
                             <th>Acciones</th>
                         </tr>
                     </thead>
                     <tbody>
                        {datosPagina.map((cat) =>(
                         <tr key={cat.id}>
                            <td>{cat.name}</td>
                            <td>{cat.description}</td>
                            <td>{cat.status}</td>                           
                            <td>
                                <div className="btn-container__acciones">
                                <BotonAccion
                                    clase="btn-editar"
                                    icono={editarIcono}
                                    iconoDark={editarIconoDark}
                                    onClick={() => handleAbrirEditar(cat)}
                                    titulo="Editar categoría consumible"
                                />
                                <BotonAccion
                                    clase="btn-borrar"
                                    icono={borrarIcono}
                                    onClick={() => handleEliminar(cat.id)}
                                    titulo="Eliminar categoría consumible"
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
                    <BotonLink
                        link={`/consumables/tools`}
                        clase="btn-azul"
                        img={listaIcon}
                        texto="Ver herramientas consumibles"
                        titulo="Ver herramientas consumibles "
                    />
                    <Boton
                        clase="btn-2"
                        img={agregarIcon}
                        texto="Agregar tipo herramienta"
                        onClick={handleAbrirCrear}
                        titulo="Agregar nueva categoría consumible"
                    />
                </div>
                <Paginacion
                    paginaActual={paginaActual}
                    totalPaginas={totalPaginas}
                    setPaginaActual={setPaginaActual}
                />
            </div>
            {mostrarFormulario && (
                <FormConsumibles 
                    key={`${usuarioId ?? "sin-usuario"}-${categoriaEditar?.id ?? "nuevo"}`}
                    onCancel={() => setMostrarFormulario(false)}
                    onGuardado={cargarCategorias}
                    categoriaEditar={categoriaEditar}
                    usuarioId={usuarioId}
                />
            )}
        </div>
    );
}
export function No_Consumibles(){
    const { usuario } = useAuth();
    const usuarioId = usuario?.id;
    const pedirConfirmacion = useConfirm();
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    let [categorias, setCategorias] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [categoriaEditar, setCategoriaEditar] = useState(null);
    categorias= categorias.filter((cat) => Number(cat.category_group_id) === 2)

    const { busqueda, setBusqueda, filtrosEspeciales, setFiltroEspecial, itemsFiltrados: categoriasFiltradas } = useSearch(
    categorias,
    ["name", "description", "status"]
    );
    const { datosPagina, paginaActual, totalPaginas, setPaginaActual } = usePaginacion(categoriasFiltradas, 7);

    useEffect(() => {
        setPaginaActual(1);
    }, [busqueda, filtrosEspeciales, setPaginaActual]);
    const cargarCategorias=()=>{
        setCargando(true);
        GetCategoryTools()
            .then((data) => setCategorias(Array.isArray(data) ? data : data?.data || []))
            .catch((error) => console.error("Error al traer categorías:", error))
            .finally(() => setCargando(false))
    }
    useEffect(()=>{cargarCategorias();},[])
    if (cargando) return <LoadingScreen indeterminado/>;
    
    const handleEliminar = async (id) => {
        let confirmar = await pedirConfirmacion({
            titulo: "Eliminar categoría",
            mensaje: "¿Seguro que quieres eliminar esta categoría? Esta acción no se puede deshacer.",
        });
        if (!confirmar)
            return
        try {
            await DeleteCategoryTools(id)
            cargarCategorias()
        }
        catch (error){
            console.error("Error al eliminar categoría:", error);
        }
    }
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
                    titulo="CATEGORÍAS DE HERRAMIENTAS NO CONSUMIBLES"
                    descripcion="Este es el formato de las categorías de herramientas no consumibles."
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
                                { valor: "Activo", etiqueta: "Activo" },
                                { valor: "Inactivo", etiqueta: "Inactivo" },
                            ]}
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
                            <th> Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {datosPagina.map((cat) =>(
                         <tr key={cat.id}>
                            <td>{cat.name}</td>
                            <td>{cat.description}</td>
                            <td>{cat.status}</td>
                            <td>
                                <div className="btn-container__acciones">
                                    <BotonAccion
                                        clase="btn-editar"
                                        icono={editarIcono}
                                        iconoDark={editarIconoDark}
                                        onClick={() => handleAbrirEditar(cat)}
                                        titulo="Editar categoría consumible"
                                    />
                                    <BotonAccion
                                        clase="btn-borrar"
                                        icono={borrarIcono}
                                        onClick={() => handleEliminar(cat.id)}
                                        titulo="Eliminar categoría consumible"
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
                    <BotonLink
                        link={`/noconsumables/tools`}
                        clase="btn-azul"
                        img={listaIcon}
                        texto="Ver herramientas no consumibles"
                        titulo="Ver herramientas no consumibles "
                    />
                    <Boton
                        clase="btn-2"
                        img={agregarIcon}
                        texto="Agregar tipo herramienta"
                        onClick={handleAbrirCrear}
                        titulo="Agregar nueva categoría no consumible"
                    />
                </div>
                <Paginacion
                    paginaActual={paginaActual}
                    totalPaginas={totalPaginas}
                    setPaginaActual={setPaginaActual}
                />
            </div>
            {mostrarFormulario && (
                <FormNoConsumibles 
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