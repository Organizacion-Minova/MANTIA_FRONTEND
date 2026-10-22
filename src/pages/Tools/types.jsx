import { useEffect, useState } from "react";
import { Boton, BotonLink } from "../../components/common/Button";
import { PageWelcome, Searcher } from "../../components/common/welcome"; 
import { Form, Text, Textarea, Select } from "../../components/common/forms";
import { GetCategoryTools, CreateCategoryTools, DeleteCategoryTools, UpdateCategoryTools } from "../../api/Toolsapi";
import LoadingScreen from "../../components/LoadingScreen";
import { usePaginacion, Paginacion   } from "../../components/common/Paginacion";
import { capitalizarPrimeraLetra, sinCaracteresEspeciales, validarCaracteresEspeciales, validarGroserias } from "../../components/common/Validations";
import { validarCamposRequeridos } from "../../components/common/requiredFields";
import { useSearch } from "../../hooks/useSearch";

function FormConsumibles({onCancel,onGuardado,categoriaEditar }){
    const esEdicion = categoriaEditar != null;
    const [nombre, setNombre] = useState(categoriaEditar?.name || "");
    const [descripcion, setDescripcion] = useState(categoriaEditar?.description || "");
    const [estado, setEstado] = useState(categoriaEditar?.status || "activo");
    const [errores, setErrores] = useState({});

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
            }

            await onGuardado();
            onCancel();
        } catch (error) {
            console.error("Datos enviados:", datos);
            console.error("Respuesta del backend:", error.response?.data);

            setErrores(error.response?.data?.errors || {});
        }
    };
    
    return(
        <Form
            titulo={esEdicion? "Editar categoria consumible":"Agregar nueva categoria consumible"}
            descripcion={esEdicion ? "Modifique los datos de la categoria" : "Ingrese los datos de la nueva categoria"}
            onCancel={onCancel}
            textoBoton="Guardar"
            iconoBoton="fa-solid fa-floppy-disk"
            onSubmit={handleSubmit}
            noValidate
        >
            <div className="col-span-6">
                <Text
                    label="Nombre de la categoria:"
                    id="nombre"
                    name="nombre"
                    placeholder="Ingrese el nombre de la categoria"
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
            {errores.name && <p className="error-texto">{errores.name[0]}</p>}
            <div className="col-span-6">
                <Textarea
                    label="Descripción:"
                    id="descripcion"
                    name="descripcion"
                    rows="4"
                    placeholder="Descripcion"
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
function FormNoConsumibles({onCancel, onGuardado, categoriaEditar}){
    const esEdicion = categoriaEditar != null;
    const [nombre, setNombre] = useState(categoriaEditar?.name || "");
    const [descripcion, setDescripcion] = useState(categoriaEditar?.description || "");
    const [estado, setEstado] = useState(categoriaEditar?.status || "Activo");
    const [errores, setErrores] = useState({});

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
            }

            onGuardado();
            onCancel();
        } catch (error) {
            console.error("Datos enviados:", datos);
            console.error("Respuesta del backend:", error.response?.data);

            setErrores(error.response?.data?.errors || {});
        }
    };  
    return(
        <Form
            titulo={esEdicion? "Editar categoria No consumible":"Agregar nueva categoria no consumible"}
            descripcion={esEdicion ? "Modifique los datos de la categoria" : "Ingrese los datos de la nueva categoria"}
            onCancel={onCancel}
            textoBoton="Guardar"
            iconoBoton="fa-solid fa-floppy-disk"
            onSubmit={handleSubmit}
            noValidate
        >
            <div className="col-span-6">
                <Text
                    label="Nombre de la categoria:"
                    id="nombre"
                    name="nombre"
                    placeholder="Ingrese el nombre de la categoria"
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
            {errores.name && <p className="error-texto">{errores.name[0]}</p>}
            <div className="col-span-6">
                <Textarea
                    label="Descripción:"
                    id="descripcion"
                    name="descripcion"
                    rows="4"
                    placeholder="Descripcion"
                    value={descripcion}
                    onChange={(e) => setDescripcion(capitalizarPrimeraLetra(e.target.value))}
                    required
                />
            </div>
            {errores.description && <p className="error-texto">{errores.description[0]}</p>}
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
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    let [categorias, setCategorias] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [categoriaEditar, setCategoriaEditar] = useState(null);
    categorias = categorias.filter((cat) => Number(cat.category_group_id) === 2)
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
        let confirmar= window.confirm("¿Seguro que quieres eliminar esta categoría?")
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
                    titulo="CATEGORIAS DE HERRAMIENTAS CONSUMIBLES"
                    descripcion="Este es el formato de las categorias de herramientas consumibles."
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
                                
                                <Boton
                                    clase="btn-azul"
                                    icono="fa-solid fa-edit"
                                    onClick={() => handleAbrirEditar(cat)}
                                    titulo="Editar categoria consumible"
                                />
                                <Boton
                                    clase="btn-2"
                                    icono="fa-solid fa-trash"
                                    onClick={() => handleEliminar(cat.id)}
                                    titulo="Eliminar categoria consumible"
                                />
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
                        icono="fa-solid fa-list"
                        texto="Ver herramientas consumibles"
                        titulo="Ver herramientas consumibles "
                    />
                    <Boton
                        clase="btn-2"
                        icono="fa-solid fa-plus"
                        texto="Agregar tipo herramienta"
                        onClick={handleAbrirCrear}
                        titulo="Agregar nueva categoria consumible"
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
                    key={categoriaEditar?.id || "nuevo"}
                    onCancel={() => setMostrarFormulario(false)}
                    onGuardado={cargarCategorias}
                    categoriaEditar={categoriaEditar} />
            )}
        </div>
    );
}
export function No_Consumibles(){
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
        let confirmar= window.confirm("¿Seguro que quieres eliminar esta categoría?")
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
                    titulo="CATEGORIAS DE HERRAMIENTAS NO CONSUMIBLES"
                    descripcion="Este es el formato de las categorias de herramientas no consumibles."
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
                                <BotonLink
                                    link={`/noconsumables/tools/${cat.id}`}
                                    clase="btn-azul"
                                    icono="fa-solid fa-eye"
                                    titulo="Ver herramientas consumibles de la categoria"
                                />
                                <Boton
                                    clase="btn-azul"
                                    icono="fa-solid fa-edit"
                                    onClick={() => handleAbrirEditar(cat)}
                                    titulo="Editar categoria consumible"
                                />
                                <Boton
                                    clase="btn-2"
                                    icono="fa-solid fa-trash"
                                    onClick={() => handleEliminar(cat.id)}
                                    titulo="Eliminar categoria consumible"
                                />
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
                        icono="fa-solid fa-list"
                        texto="Ver herramientas no consumibles"
                        titulo="Ver herramientas no consumibles "
                    />
                    <Boton
                        clase="btn-2"
                        icono="fa-solid fa-plus"
                        texto="Agregar tipo herramienta"
                        onClick={handleAbrirCrear}
                        titulo="Agregar nueva categoria no consumible"
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
                    key={categoriaEditar?.id || "nuevo"}
                    onCancel={() => setMostrarFormulario(false)}
                    onGuardado={cargarCategorias}
                    categoriaEditar={categoriaEditar} 
                />
            )}
        </div>
    )
}