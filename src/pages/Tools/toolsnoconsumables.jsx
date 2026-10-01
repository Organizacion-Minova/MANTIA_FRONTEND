import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Boton, BotonLink } from "../../components/common/Button";
import { PageWelcome,Searcher } from "../../components/common/welcome";
import { Form, Text, Select } from "../../components/common/forms";
import { GetCategoryToolById, GetTools, DeleteTool, CreateTool, UpdateTool } from "../../api/Toolsapi";
import LoadingScreen from "../../components/LoadingScreen";
import { usePaginacion, Paginacion   } from "../../components/common/Paginacion";
import { obtenerUbicaciones } from "../../api/location";
import { soloLetras, soloNumeros, tieneGroserias, esPalabraCoherente} from "../../components/common/Validations";
import { useSearch } from "../../hooks/useSearch";

function Formulario({onCancel,onGuardado, herramientaEditar, categoryid}){
    const esEdicion = herramientaEditar != null;
    const [nombre, setNombre] = useState(herramientaEditar?.name ||"");
    const [stockBueno, setStockBueno] = useState(herramientaEditar?.condiciones?.find(c => c.condition === "bueno")?.stock || "");
    const [stockRegular, setStockRegular] = useState(herramientaEditar?.condiciones?.find(c => c.condition === "regular")?.stock || "");
    const [stockMalo, setStockMalo] = useState(herramientaEditar?.condiciones?.find(c => c.condition === "malo")?.stock || "");
    const [locationId, setLocationId] = useState(herramientaEditar?.location_id || "");
    const [ubicaciones, setUbicaciones] = useState([]);
    const [errores, setErrores] = useState({});

    useEffect(() => {
        obtenerUbicaciones()
            .then((data) => setUbicaciones(Array.isArray(data.ubicaciones) ? data.ubicaciones : []))
            .catch((error) => console.error("Error al traer ubicaciones:", error));
    }, []);

    const handleSubmit = async (e) =>{
        e.preventDefault();
        setErrores({});

        const erroresLocales = {};

        if (!soloLetras(nombre)) {
            erroresLocales.name = ["El nombre solo puede contener letras y espacios."];
        }else if (tieneGroserias(nombre)) {
            erroresLocales.name = ["El nombre contiene palabras inapropiadas."];
        }else if (!esPalabraCoherente(nombre)) {
            erroresLocales.name = ["El nombre contiene palabras que no son coherentes."];
        }
        if (esEdicion) {
            const sincambios =
                nombre === herramientaEditar.name &&
                Number(stockBueno) === herramientaEditar.condiciones?.find(c => c.condition === "bueno")?.stock &&
                Number(stockRegular) === herramientaEditar.condiciones?.find(c => c.condition === "regular")?.stock &&
                Number(stockMalo) === herramientaEditar.condiciones?.find(c => c.condition === "malo")?.stock &&
                Number(locationId) === herramientaEditar.location_id;
            if (sincambios) {
                onCancel();
                return;
            }
        }
        const datos = {
            name: nombre,
            location_id: locationId,
            category_id: Number(categoryid), 
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
    return(
        <Form
            titulo={esEdicion?"Editar herramienta":"Agregar nueva herramienta"}
            descripcion={esEdicion?"Modifique los datos de la herramienta":"Ingrese los datos para una nueva herramienta"}
            onCancel={onCancel}
            textoBoton="Guardar"
            iconoBoton="fa-solid fa-floppy-disk"
            onSubmit={handleSubmit}
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
                        if (valor === "" || soloLetras(valor)) {
                            setNombre(valor);
                        }
                    }
                    }
                    required
                />
            </div>
            {errores.name && <p className="error-texto">{errores.name[0]}</p>}
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
            <div className="col-span-6">
                <Select
                    label="Ubicacion: "
                    id="ubicacion"
                    name="ubicacion"
                    value={locationId}
                    onChange={(e) => setLocationId(e.target.value)}
                    opciones={[{valor:"", etiqueta:"Seleccione una ubicacion"},...ubicaciones.map((u) => ({ valor: u.id, etiqueta: u.name }))]}
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
function ToolsNoConsumables(){
    const { id } = useParams();
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [categoria, setCategoria] = useState(null); 
    let[herramienta, setHerramienta] = useState([]);
    const [herramientaEditar, setHerramientaEditar]=useState(null);
    const [cargandoCategoria, setCargandoCategoria] = useState(true);
    const [cargandoHerramientas, setCargandoHerramientas] = useState(true);
    const [estadoSeleccionado, setEstadoSeleccionado] = useState({});
    const herramientasCategoria = herramienta
        .filter((herramienta) => herramienta.category_id === Number(id))
        .map((herramienta) => ({
            ...herramienta,
            ubicacionBusqueda: herramienta.ubicacion?.name || "",
    }));
    const ubicacionesDisponibles = [...new Map(
        herramientasCategoria
            .filter((herramienta) => herramienta.location_id != null)
            .map((herramienta) => [
                String(herramienta.location_id),
                {
                    id: herramienta.location_id,
                    name: herramienta.ubicacion?.name || `Ubicación ${herramienta.location_id}`,
                },
            ])
    ).values()];
    const { busqueda, setBusqueda, filtrosEspeciales, setFiltroEspecial, itemsFiltrados: herramientasFiltradas } = useSearch(
        herramientasCategoria,
        ["name", "ubicacionBusqueda"]
    );
    const { datosPagina, paginaActual, totalPaginas, setPaginaActual } = usePaginacion(herramientasFiltradas, 7);

    const cargarCategoria = () => {
        setCargandoCategoria(true);
        GetCategoryToolById(id)
            .then((data) => setCategoria(data))
            .catch((err) => console.error("Error al cargar categoría:", err))
            .finally(() => setCargandoCategoria(false));
    };

    const cargarHerramientas = () => {
        setCargandoHerramientas(true);
        GetTools()
            .then((data) => {
                setHerramienta(data);
            })
            .catch((err) => console.error("Error al cargar herramientas:", err))
            .finally(() => setCargandoHerramientas(false));
    };
    useEffect(() => {
        cargarCategoria();
        cargarHerramientas();
    }, [id]);
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
    if (cargandoCategoria || cargandoHerramientas) {
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
                    titulo={`HERRAMIENTAS NO CONSUMIBLES ${categoria.name}`}
                    descripcion={`Este es el formato de las herramientas no consumibles ${categoria.name}.`}
                />
                <Searcher
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar por nombre o ubicacion"
                    filtrosAdicionales={
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
                    }
                />
            </header>
            <div className="table-responsive">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Condicion</th>
                            <th>Cantidad</th>
                            <th>Ubicacion</th>
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
                    <BotonLink
                        link="/types/noconsumables"
                        clase="btn-2"
                        icono="fa-solid fa-list"
                        texto="Volver a categorias no consumibles"
                        titulo="Volver a categorias no consumibles"
                    />
                    <Boton
                        clase="btn-azul"
                        icono="fa-solid fa-plus"
                        texto="Nueva Herramienta"
                        onClick={handleAbrirCrear}
                        titulo="Agregar nueva herramienta"
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
                    categoryid={id}
                />            
            )}
        </div>
    )
}
export default ToolsNoConsumables