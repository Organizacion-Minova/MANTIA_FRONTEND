import { useState, useEffect } from "react";
import { Boton, BotonAccion, BotonLink } from "../../components/common/Button";
import { PageWelcome,Searcher } from "../../components/common/welcome";
import { Form, Text, Select } from "../../components/common/forms";
import {  GetTools, DeleteTool, CreateTool, UpdateTool, GetCategoryTools} from "../../api/Toolsapi";
import LoadingScreen from "../../components/LoadingScreen";
import { usePaginacion, Paginacion   } from "../../components/common/Paginacion";
import { obtenerUbicaciones } from "../../api/location";
import { capitalizarPrimeraLetra, soloNumeros, sinCaracteresEspeciales, tieneGroserias, validarCaracteresEspeciales } from "../../components/common/Validations";
import { validarCamposRequeridos } from "../../components/common/requiredFields";
import { useSearch } from "../../hooks/useSearch";
import { useConfirm } from "../../context/ConfirmContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import editarIcono from "../../assets/icons/editar.svg";
import editarIconoDark from "../../assets/icons/editar-2.svg";
import borrarIcono from "../../assets/icons/borrar.svg";
import agregarIcon from "../../assets/icons/agregar.svg";
import listaIcon from "../../assets/icons/lista.svg";

const obtenerClaveBorrador = (usuarioId) => `mantia_borrador_herramientas_${usuarioId}`;

const obtenerBorrador = (usuarioId) => {
    if (!usuarioId) return null;

    try {
        const borrador = sessionStorage.getItem(obtenerClaveBorrador(usuarioId));
        return borrador ? JSON.parse(borrador) : null;
    } catch (error) {
        console.error("Error al recuperar el borrador de herramientas:", error);
        return null;
    }
};

const eliminarBorrador = (usuarioId) => {
    if (!usuarioId) return;
    sessionStorage.removeItem(obtenerClaveBorrador(usuarioId));
};

function Formulario({onCancel,onGuardado, herramientaEditar, usuarioId}){
    const esEdicion = herramientaEditar != null;
    const [borradorInicial] = useState(() => esEdicion ? null : obtenerBorrador(usuarioId));
    const [codigo, setCodigo] = useState(borradorInicial?.codigo ?? herramientaEditar?.code ?? "");
    const [nombre, setNombre] = useState(borradorInicial?.nombre ?? herramientaEditar?.name ?? "");
    const [stockBueno, setStockBueno] = useState(borradorInicial?.stockBueno ?? herramientaEditar?.condiciones?.find(c => c.condition === "bueno")?.stock ?? "");
    const [stockRegular, setStockRegular] = useState(borradorInicial?.stockRegular ?? herramientaEditar?.condiciones?.find(c => c.condition === "regular")?.stock ?? "");
    const [stockMalo, setStockMalo] = useState(borradorInicial?.stockMalo ?? herramientaEditar?.condiciones?.find(c => c.condition === "malo")?.stock ?? "");
    const [locationId, setLocationId] = useState(
        borradorInicial?.locationId ?? String(herramientaEditar?.location_id ?? herramientaEditar?.ubicacion?.id ?? "")
    );
    const [categoryId, setCategoryId] = useState(
        borradorInicial?.categoryId ?? String(herramientaEditar?.category_id ?? herramientaEditar?.categoria?.id ?? "")
    );
    const [categoria, setCategoria]= useState([])
    const [ubicaciones, setUbicaciones] = useState([]);
    const [errores, setErrores] = useState({});

    const hayDatosIngresados = [
        codigo,
        nombre,
        stockBueno,
        stockRegular,
        stockMalo,
        locationId,
        categoryId,
    ].some(valor => String(valor ?? "").trim() !== "");

    useEffect(() => {
        if (esEdicion || !usuarioId) return;

        const borrador = { codigo, nombre, stockBueno, stockRegular, stockMalo, locationId, categoryId };

        try {
            sessionStorage.setItem(obtenerClaveBorrador(usuarioId), JSON.stringify(borrador));
        } catch (error) {
            console.error("Error al guardar el borrador de herramientas:", error);
        }
    }, [esEdicion, usuarioId, codigo, nombre, stockBueno, stockRegular, stockMalo, locationId, categoryId]);

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
    })            .catch((error) => console.error("Error al traer categorías:", error));
    }, []);

    const handleSubmit = async (e) =>{
        e.preventDefault();
        setErrores({});
        const codigoNormalizado = String(codigo ?? "").trim();
        const codigoOriginal = String(herramientaEditar?.code ?? "").trim();
        const codigoModificado = codigoNormalizado !== codigoOriginal;

        if (!validarCamposRequeridos({
            "Nombre": nombre,
            "Cantidad buena": stockBueno,
            "Cantidad regular": stockRegular,
            "Cantidad mala": stockMalo,
            "Ubicación": locationId,
            "Categoria": categoryId
        })) return;

        const validarNombre = !esEdicion || nombre !== herramientaEditar.name;
        const validarCodigo = !esEdicion || codigoModificado;
        const erroresLocales = validarNombre
            ? validarCaracteresEspeciales({ name: nombre })
            : {};
        if (validarNombre && tieneGroserias(nombre)) {
            erroresLocales.name = ["El nombre contiene palabras inapropiadas."];
        }
        if (validarCodigo && tieneGroserias(codigoNormalizado)) {
            erroresLocales.code = ["El código contiene palabras inapropiadas."];
        }
        if (Object.keys(erroresLocales).length > 0) {
            setErrores(erroresLocales);
            return;
        }
        if (esEdicion) {
            const sincambios =
                !codigoModificado &&
                nombre === herramientaEditar.name &&
                Number(stockBueno) === herramientaEditar.condiciones?.find(c => c.condition === "bueno")?.stock &&
                Number(stockRegular) === herramientaEditar.condiciones?.find(c => c.condition === "regular")?.stock &&
                Number(stockMalo) === herramientaEditar.condiciones?.find(c => c.condition === "malo")?.stock &&
                locationId === String(herramientaEditar.location_id ?? herramientaEditar.ubicacion?.id ?? "") &&
                categoryId === String(herramientaEditar.category_id ?? herramientaEditar.categoria?.id ?? "");
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
        if (!esEdicion || codigoModificado || herramientaEditar.code != null) {
            datos.code = codigoNormalizado || null;
        }
        try {
            if (esEdicion) {
                await UpdateTool(herramientaEditar.id, datos);
            } else {
                await CreateTool(datos);
                eliminarBorrador(usuarioId);
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
            .filter(ubi =>
                ubi.status === 'active' ||
                String(ubi.id) === String(herramientaEditar?.location_id ?? herramientaEditar?.ubicacion?.id)
            )
            .map(ubi => ({ valor: ubi.id, etiqueta: ubi.status === 'active' ? ubi.name : `${ubi.name} (Inactiva)` }))
    ];

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

    return(
        <Form
            titulo={esEdicion?"Editar herramienta":"Agregar nueva herramienta"}
            descripcion={esEdicion?"Modifique los datos de la herramienta":"Ingrese los datos para una nueva herramienta"}
            onCancel={onCancel}
            onDiscard={!esEdicion && hayDatosIngresados ? handleDescartar : undefined}
            textoBoton="Guardar"
            iconoBoton="fa-solid fa-floppy-disk"
            onSubmit={handleSubmit}
            noValidate
        >
            <div className="col-span-3">
                <Text
                    label='Codigo (opcional):'
                    id='codigo'
                    name='codigo'
                    placeholder='Codigo de la herramienta'
                    value={codigo}
                    onChange={(e) => {
                        const valor = e.target.value;
                        setCodigo(capitalizarPrimeraLetra(valor));
                    }
                    }
                />
            </div>
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
                    label="Categoría: "
                    id="categoria"
                    name="categoría"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    opciones={[{valor:"", etiqueta:"Seleccione una categoría"},...categoria.map((c) => ({ valor: c.id, etiqueta: c.name }))]}
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
            <div className="col-span-6">
                <Select
                    label="Ubicación: "
                    id="ubicacion"
                    name="ubicacion"
                    value={locationId}
                    onChange={(e) => setLocationId(e.target.value)}
                    opciones={opcionesUbicaciones}
                    required
                />
            </div>

            {Object.values(errores).flat().map((error, index) => (
                <p key={`${index}-${error}`} className="error-texto" role="alert">
                    {error}
                </p>
            ))}

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
    const { usuario } = useAuth();
    const usuarioId = usuario?.id;
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
                    name: herramienta.categoria?.name || `Categoría ${herramienta.category_id}`,
                }
            ])
    ).values()]
    const { busqueda, setBusqueda, filtrosEspeciales, setFiltroEspecial, itemsFiltrados: herramientasFiltradas } = useSearch(
        herramienta,
        ['code', 'name', 'ubicacionBusqueda', 'categoriaBusqueda']
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
    const pedirConfirmacion = useConfirm();
    const handleEliminar = async (id) =>{
        let confirmar = await pedirConfirmacion({
            titulo: "Eliminar herramienta",
            mensaje: "¿Seguro que quieres eliminar esta herramienta? Esta acción no se puede deshacer.",
        });
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
                    mostrarHistorial={true}
                />
                
                <Searcher
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar por codigo, nombre, categoria o ubicacion"
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
                                name="filtro-categoría"
                                value={filtrosEspeciales.category_id || ""}
                                onChange={(e) => setFiltroEspecial("category_id", e.target.value)}
                                opciones={[
                                    { valor: "", etiqueta: "Todas las categorías" },
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
                            <th>Código</th>
                            <th>Nombre</th>
                            <th>Condición</th>
                            <th>Cantidad</th>
                            <th>Ubicación</th>
                            <th>Categoría</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {datosPagina.map((h)=>{
                        const estadoActual = estadoSeleccionado[h.id] || "total";
                        return (
                        <tr key={h.id}>
                            <td>{h.code}</td>
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
                                <div className="btn-container__acciones">
                                <BotonAccion
                                    clase="btn-editar"
                                    icono={editarIcono}
                                    iconoDark={editarIconoDark}
                                    onClick={() => handleAbrirEditar(h)}
                                    titulo="Editar herramienta"
                                />
                                <BotonAccion
                                    clase="btn-borrar"
                                    icono={borrarIcono}
                                    onClick={() => handleEliminar(h.id)}
                                    titulo="Eliminar herramienta"
                                />
                                </div>
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
                        img={agregarIcon}
                        texto="Nueva Herramienta"
                        onClick={handleAbrirCrear}
                        titulo="Agregar nueva herramienta"
                    />
                    <BotonLink
                        link="/consumables/tools/types"
                        clase="btn-2"
                        img={listaIcon}
                        texto="Ir a categorías de herramientas consumibles"
                        titulo="Ir a categorías de las herramientas consumibles"
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
                    key={`${usuarioId ?? "sin-usuario"}-${herramientaEditar?.id ?? "nuevo"}`}
                    onCancel={() => setMostrarFormulario(false)}
                    onGuardado={cargarHerramientas} 
                    herramientaEditar={herramientaEditar}
                    usuarioId={usuarioId}
                />
            )}
        </div>
    )
}
export default ToolsConsumables