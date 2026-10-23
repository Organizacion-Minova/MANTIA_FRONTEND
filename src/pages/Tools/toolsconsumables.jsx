import { useState, useEffect } from "react";
import { Boton, BotonLink } from "../../components/common/Button";
import { PageWelcome,Searcher } from "../../components/common/welcome";
import { Form, Text, Select } from "../../components/common/forms";
import {  GetTools, DeleteTool, CreateTool, UpdateTool, GetCategoryTools} from "../../api/Toolsapi";
import LoadingScreen from "../../components/LoadingScreen";
import { usePaginacion, Paginacion   } from "../../components/common/Paginacion";
import { obtenerUbicaciones } from "../../api/location";
import { capitalizarPrimeraLetra, soloNumeros, sinCaracteresEspeciales, tieneGroserias, validarCaracteresEspeciales } from "../../components/common/Validations";
import { validarCamposRequeridos } from "../../components/common/requiredFields";
import { useSearch } from "../../hooks/useSearch";

function Formulario({onCancel,onGuardado, herramientaEditar}){
    const esEdicion = herramientaEditar != null;
    const [nombre, setNombre] = useState(herramientaEditar?.name ||"");
    const [stockBueno, setStockBueno] = useState(herramientaEditar?.condiciones?.find(c => c.condition === "bueno")?.stock ?? "");
    const [stockRegular, setStockRegular] = useState(herramientaEditar?.condiciones?.find(c => c.condition === "regular")?.stock ?? "");
    const [stockMalo, setStockMalo] = useState(herramientaEditar?.condiciones?.find(c => c.condition === "malo")?.stock ?? "");
    const [locationId, setLocationId] = useState(herramientaEditar?.location_id || "");
    const [categoryId, setCategoryId] = useState(herramientaEditar?.category_id || "");
    const [categoria, setCategoria]= useState([])
    const [ubicaciones, setUbicaciones] = useState([]);
    const [errores, setErrores] = useState({});

    useEffect(() => {
        obtenerUbicaciones()
            .then((data) => setUbicaciones(Array.isArray(data.ubicaciones) ? data.ubicaciones : []))
            .catch((error) => console.error("Error al traer ubicaciones:", error));
        GetCategoryTools()
            .then((data) => {
                const lista = Array.isArray(data) ? data : [];
                setCategoria(
                    lista.filter((c) => Number(c.category_group_id) === 1)
                );
    })            .catch((error) => console.error("Error al traer categorias:", error));
    }, []);

    const handleSubmit = async (e) =>{
        e.preventDefault();
        setErrores({});

        if (!validarCamposRequeridos({
            "Nombre": nombre,
            "Cantidad buena": stockBueno,
            "Cantidad regular": stockRegular,
            "Cantidad mala": stockMalo,
            "Ubicación": locationId,
            "Categoria": categoryId
        })) return;

        const erroresLocales = {};

        Object.assign(erroresLocales, validarCaracteresEspeciales({ name: nombre }));
        if (tieneGroserias(nombre)) {
            erroresLocales.name = ["El nombre contiene palabras inapropiadas."];
        }
        if (Object.keys(erroresLocales).length > 0) {
            setErrores(erroresLocales);
            return;
        }
        if (esEdicion) {
            const sincambios =
                nombre === herramientaEditar.name &&
                Number(stockBueno) === herramientaEditar.condiciones?.find(c => c.condition === "bueno")?.stock &&
                Number(stockRegular) === herramientaEditar.condiciones?.find(c => c.condition === "regular")?.stock &&
                Number(stockMalo) === herramientaEditar.condiciones?.find(c => c.condition === "malo")?.stock &&
                Number(locationId) === herramientaEditar.location_id &&
                Number(categoryId) === herramientaEditar.category_id;
            if (sincambios) {
                onCancel();
                return;
            }
        }
        const datos = {
            name: nombre,
            location_id: locationId,
            category_id: Number(categoryId), 
            condiciones: {
                bueno: Number(stockBueno) || 0,
                regular: Number(stockRegular) || 0,
                malo: Number(stockMalo) || 0,
            },
        };
        try {
            if (esEdicion) {
                await UpdateTool(herramientaEditar.id, datos);
            } else {
                await CreateTool(datos);
            }
            onGuardado();
            onCancel();
        } catch (error) {
            if (error.response?.status === 422) {
                setErrores(error.response.data.errors);
            } else {
                console.error("Error al guardar herramienta:", error);
            }
        }
    }

    const opcionesUbicaciones = [
        { valor: "", etiqueta: "Seleccione una ubicación" },
        ...ubicaciones
            .filter(ubi => ubi.status === 'active' || ubi.id === herramientaEditar?.location_id)
            .map(ubi => ({ valor: ubi.id, etiqueta: ubi.status === 'active' ? ubi.name : `${ubi.name} (Inactiva)` }))
    ];

    return(
        <Form
            titulo={esEdicion?"Editar herramienta":"Agregar nueva herramienta"}
            descripcion={esEdicion?"Modifique los datos de la herramienta":"Ingrese los datos para una nueva herramienta"}
            onCancel={onCancel}
            textoBoton="Guardar"
            iconoBoton="fa-solid fa-floppy-disk"
            onSubmit={handleSubmit}
            noValidate
        >
            <div className="col-span-3">
                <Text
                    label="Nombre:"
                    id="nombre"
                    name="nombre"
                    placeholder="Nombre de la herramienta"
                    value={nombre}
                    onChange={(e) => {
                        const valor = e.target.value;
                        if (valor === "" || sinCaracteresEspeciales(valor)) {
                            setNombre(capitalizarPrimeraLetra(valor));
                        }
                    }
                    }
                    required
                />
            </div>
            <div className="col-span-3">
                <Select
                    label="Categoria: "
                    id="categoria"
                    name="categoria"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    opciones={[{valor:"", etiqueta:"Seleccione una categoria"},...categoria.map((c) => ({ valor: c.id, etiqueta: c.name }))]}
                    required
                />
            </div>
            <div className="col-span-3">
                <Text
                    label="Cantidad buena:"
                    id="stock"
                    name="stock"
                    type="number"
                    placeholder="Ingrese la cantidad de herramientas buenas"
                    value={stockBueno}
                    onChange={(e) => {
                        const valor = e.target.value;
                        if (valor === "" || soloNumeros(valor)) {
                            setStockBueno(valor);
                        }
                    }}
                    required
                />
            </div>
            <div className="col-span-3">
                <Text
                    label="Cantidad regular:"
                    id="stock"
                    name="stock"
                    type="number"
                    placeholder="Ingrese la cantidad de herramientas regulares"
                    value={stockRegular}
                    onChange={(e) => {
                        const valor = e.target.value;
                        if (valor === "" || soloNumeros(valor)) {
                            setStockRegular(valor);
                        }
                    }}
                    required
                />
            </div>
            <div className="col-span-3">
                <Text
                    label="Cantidad mala:"
                    id="stock"
                    name="stock"
                    type="number"
                    placeholder="Ingrese la cantidad de herramientas mala"
                    value={stockMalo}
                    onChange={(e) => {
                        const valor = e.target.value;
                        if (valor === "" || soloNumeros(valor)) {
                            setStockMalo(valor);
                        }
                    }}
                    required
                />
            </div>
            <div className="col-span-3">
                <Select
                    label="Ubicacion: "
                    id="ubicacion"
                    name="ubicacion"
                    value={locationId}
                    onChange={(e) => setLocationId(e.target.value)}
                    opciones={opcionesUbicaciones}
                    required
                />
            </div>

        </Form>
    )
}
function obtenerCantidadSegunEstado(herramienta, estado) {
    if (estado === "total" || !estado) {
        return herramienta.stock_total;
    }
    const encontrado = herramienta.condiciones?.find((c) => c.condition === estado);
    return encontrado ? encontrado.stock : 0;
}
function ToolsConsumables(){
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    let[herramienta, setHerramienta] = useState([]);
    const [herramientaEditar, setHerramientaEditar]=useState(null);
    const [cargando, setCargando] = useState(true);
    const [estadoSeleccionado, setEstadoSeleccionado] = useState({});
    herramienta = herramienta.filter((h)=>Number(h.categoria?.category_group_id) === 1);
    herramienta.map((herramienta) => ({
            ...herramienta,
            ubicacionBusqueda: herramienta.ubicacion?.name || "",
            categoriaBusqueda: herramienta.categoria?.name || ""
    }));
    const ubicacionesDisponibles = [...new Map(
        herramienta
            .filter((herramienta) => herramienta.location_id != null)
            .map((herramienta) => [
                String(herramienta.location_id),
                {
                    id: herramienta.location_id,
                    name: herramienta.ubicacion?.name || `Ubicación ${herramienta.location_id}`,
                },
            ])
    ).values()];
    const categoriasDisponibles = [...new Map(
        herramienta
        .filter((h)=>(h.categoria?.category_group_id) === 1)
            .map((herramienta)=>[
                String(herramienta.category_id),
                {
                    id: herramienta.category_id,
                    name: herramienta.categoria?.name || `Categoria ${herramienta.category_id}`,
                }
            ])
    ).values()]
    const { busqueda, setBusqueda, filtrosEspeciales, setFiltroEspecial, itemsFiltrados: herramientasFiltradas } = useSearch(
        herramienta,
        ["name", "ubicacionBusqueda", "categoriaBusqueda"]
    );
    const { datosPagina, paginaActual, totalPaginas, setPaginaActual } = usePaginacion(herramientasFiltradas, 7);

    useEffect(() => {
        setPaginaActual(1);
    }, [busqueda, filtrosEspeciales, setPaginaActual]);

    const cargarHerramientas = () => {
        setCargando(true);
        GetTools()
            .then((data) => {
                setHerramienta(data);
            })
            .catch((err) => console.error("Error al cargar herramientas:", err))
            .finally(() => setCargando(false));
    };

    useEffect(() => {
        cargarHerramientas();
    }, []);
    const handleEliminar = async (id) =>{
        let confirmar= window.confirm("¿Seguro que quieres eliminar esta herramienta?")
        if (!confirmar)
            return
        try {
            await DeleteTool(id)
            cargarHerramientas()
        }
        catch (error){
            console.error("Error al eliminar categoría:", error);
        }
    }
    const handleAbrirCrear = () =>{
        setHerramientaEditar(null);
        setMostrarFormulario(true);
    }
    const handleAbrirEditar = (herramienta) =>{
        setHerramientaEditar(herramienta);
        setMostrarFormulario(true);
    }

    if (cargando) {
        return <LoadingScreen indeterminado />;
    }
    
    
    const cambiarEstadoSeleccionado = (toolId, nuevoEstado) => {
        setEstadoSeleccionado((prev) => ({
            ...prev,
            [toolId]: nuevoEstado,
        }));
    };

    return(
        <div className="list-grid">
            <header className="bienvenida">
                <PageWelcome
                    titulo={`HERRAMIENTAS CONSUMIBLES` }  
                    descripcion={`Este es el formato de las herramientas consumibles .`}
                />
                
                <Searcher
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar por nombre o ubicacion"
                    filtrosAdicionales={
                        <div className="btn-container">
                            <Select
                                id="filtro-ubicacion"
                                name="filtro-ubicacion"
                                value={filtrosEspeciales.location_id || ""}
                                onChange={(e) => setFiltroEspecial("location_id", e.target.value)}
                                opciones={[
                                    { valor: "", etiqueta: "Todas las ubicaciones" },
                                    ...ubicacionesDisponibles.map((ubicacion) => ({
                                        valor: ubicacion.id,
                                        etiqueta: ubicacion.name,
                                    })),
                                ]}
                            />
                            <Select
                                id="filtro-categoria"
                                name="filtro-categoria"
                                value={filtrosEspeciales.category_id || ""}
                                onChange={(e) => setFiltroEspecial("category_id", e.target.value)}
                                opciones={[
                                    { valor: "", etiqueta: "Todas las categorias" },
                                    ...categoriasDisponibles.map((c) => ({
                                        valor: c.id,
                                        etiqueta: c.name,
                                    })),
                                ]}
                            />
                        </div>
                    }
                />
            </header>
            <div className="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Condicion</th>
                            <th>Cantidad</th>
                            <th>Ubicacion</th>
                            <th>Categoria</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {datosPagina.map((h)=>{
                        const estadoActual = estadoSeleccionado[h.id] || "total";
                        return (
                        <tr key={h.id}>
                            <td>{h.name}</td>
                            <td>
                                <Select
                                    id={`estado-${h.id}`}
                                    name={`estado-${h.id}`}
                                    value={estadoActual}
                                    opciones={[{ valor: "total", etiqueta: "Total" }, 
                                               { valor: "bueno", etiqueta: "Bueno" }, 
                                               { valor: "regular", etiqueta: "Regular" }, 
                                               { valor: "malo", etiqueta: "Malo" }]}
                                    onChange={(e) => cambiarEstadoSeleccionado(h.id, e.target.value)}
                                />
                            </td>
                            <td>
                                {obtenerCantidadSegunEstado(h, estadoActual)}
                            </td>
                            <td>{h.ubicacion.name}</td>
                            <td>{h.categoria?.name || "Sin categoría"}</td>
                            <td>
                                <Boton
                                    clase="btn-azul"
                                    icono="fa-solid fa-edit"
                                    onClick={() => handleAbrirEditar(h)}
                                    titulo="Editar herramienta"
                                />
                                <Boton
                                    clase="btn-2"
                                    icono="fa-solid fa-trash"
                                    onClick={() => handleEliminar(h.id)}
                                    titulo="Eliminar herramienta"
                                />
                            </td>
                        </tr>
                        )})}
                    </tbody>
                </table>
            </div>
            <div className="btn-container-page">
                <div className="btn-container">
                    
                    <Boton
                        clase="btn-azul"
                        icono="fa-solid fa-plus"
                        texto="Nueva Herramienta"
                        onClick={handleAbrirCrear}
                        titulo="Agregar nueva herramienta"
                    />
                    <BotonLink
                        link="/consumables/tools/types"
                        clase="btn-2"
                        icono="fa-solid fa-list"
                        texto="Ir a las categorias de las herramientas consumibles"
                        titulo="Ir a las categorias de las herramientas consumibles"
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
                    key={herramientaEditar?.id || "nuevo"}
                    onCancel={() => setMostrarFormulario(false)}
                    onGuardado={cargarHerramientas} 
                    herramientaEditar={herramientaEditar}
                />
            )}
        </div>
    )
}
export default ToolsConsumables