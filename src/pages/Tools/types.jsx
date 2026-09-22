import { useEffect, useState } from "react";
import { Boton, BotonLink } from "../../components/common/Button";
import { PageWelcome, Searcher } from "../../components/common/welcome"; 
import { Form, Text, Textarea, Select } from "../../components/common/forms";
import { GetCategoryTools, CreateCategoryTools, DeleteCategoryTools, UpdateCategoryTools } from "../../api/Toolsapi";
import LoadingScreen from "../../components/LoadingScreen";
import { usePaginacion } from "../../components/common/Paginacion";
import Paginacion from "../../components/common/Paginacion";
import { soloLetras, tieneGroserias, esPalabraCoherente } from "../../components/common/Validations";

function FormConsumibles({onCancel,onGuardado,categoriaEditar }){
    const esEdicion = categoriaEditar != null;
    const [nombre, setNombre] = useState(categoriaEditar?.name || "");
    const [descripcion, setDescripcion] = useState(categoriaEditar?.description || "");
    const [estado, setEstado] = useState(categoriaEditar?.status || "activo");
    const [errores, setErrores] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrores({});

        const erroresLocales={};

        if (!soloLetras(nombre) || !soloLetras(descripcion)){
            if(!soloLetras(nombre)){
                erroresLocales.name = ["El contenido solo puede contener letras y espacios"]
            }
            if(!soloLetras(descripcion)){
                erroresLocales.description = ["El contenido solo puede contener letras y espacios"]
            }
        } else if (tieneGroserias(nombre) || tieneGroserias(descripcion)){
            if (tieneGroserias(nombre)){
                erroresLocales.name = ["El contenido tiene palabras inapropiadas"]
            }
            if (tieneGroserias(descripcion)){
                erroresLocales.description = ["El contenido tiene palabras inapropiadas"]
            }
        } else if (!esPalabraCoherente(nombre) || !esPalabraCoherente(descripcion)){
            if (!esPalabraCoherente(nombre)){
                erroresLocales.name = ["El contenido no es coherente"]
            }
            if (!esPalabraCoherente(descripcion)){
                erroresLocales.description = ["El contenido no es coherente"]
            }
        }

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
                        if (soloLetras(valor) || valor===""){
                            setNombre(e.target.value)
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
                    onChange={(e) => setDescripcion(e.target.value)}
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
function FormNoConsumibles({onCancel, onGuardado, categoriaEditar}){
    const esEdicion = categoriaEditar != null;
    const [nombre, setNombre] = useState(categoriaEditar?.name || "");
    const [descripcion, setDescripcion] = useState(categoriaEditar?.description || "");
    const [estado, setEstado] = useState(categoriaEditar?.status || "Activo");
    const [errores, setErrores] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrores({});

        const erroresLocales={};

        if (!soloLetras(nombre)){
            erroresLocales.name = []
        }
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
                        if (soloLetras(valor) || valor===""){
                            setNombre(e.target.value)
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
    categorias = categorias.filter((cat) => cat.category_group_id === 1);
    const { datosPagina, paginaActual, totalPaginas, setPaginaActual } = usePaginacion(categorias, 7);

    const cargarCategorias=()=>{
        setCargando(true);
        GetCategoryTools()
            .then((data) => setCategorias(data))
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
                    titulo="HERRAMIENTAS CONSUMIBLES"
                    descripcion="Este es el formato de las herramientas consumibles."
                />
                <Searcher/>
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
                                    link={`/types/consumables/tools/${cat.id}`}
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
                <Boton
                    clase="btn-azul"
                    icono="fa-solid fa-plus"
                    texto="Agregar tipo herramienta"
                    onClick={handleAbrirCrear}
                    titulo="Agregar nueva categoria consumible"
                />
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
    categorias = categorias.filter((cat) => cat.category_group_id === 2);
    const { datosPagina, paginaActual, totalPaginas, setPaginaActual } = usePaginacion(categorias, 7);

    const cargarCategorias=()=>{
        setCargando(true);
        GetCategoryTools()
            .then((data) => setCategorias(data))
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
                    titulo="HERRAMIENTAS NO CONSUMIBLES"
                    descripcion="Este es el formato de las herramientas no consumibles."
                />
                <Searcher/>
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
                                    link={`/types/consumables/tools/${cat.id}`}
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
                <Boton
                    clase="btn-azul"
                    icono="fa-solid fa-plus"
                    texto="Agregar tipo herramienta"
                    onClick={handleAbrirCrear}
                    titulo="Agregar nueva categoria consumible"
                />
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