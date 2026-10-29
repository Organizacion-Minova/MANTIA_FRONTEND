import { useEffect, useState } from "react";
import { Boton,BotonLink } from "../../components/common/Button";
import {PageWelcome,Searcher} from "../../components/common/welcome";
import { Form, Text, Textarea, Dropzone, Select, Date } from '../../components/common/forms';
import LoadingScreen from "../../components/LoadingScreen";
import { GetCategoryMachine ,GetMachine, CreateMachine, UpdateMachine, DeleteMachine } from "../../api/machinesapi";
import { obtenerUbicaciones } from "../../api/location";
import { usePaginacion,Paginacion } from "../../components/common/Paginacion";
import { useSearch } from "../../hooks/useSearch";
import { capitalizarPrimeraLetra, sinCaracteresEspeciales, validarCaracteresEspeciales, validarGroserias } from "../../components/common/Validations";
import { validarCamposRequeridos } from "../../components/common/requiredFields";

const valorSelect = (valor) => (valor == null ? "" : String(valor));
const valorOperacion = (valor) => {
    if (valor === true || valor === 1 || valor === "1" || valor === "yes" || valor === "true") return "1";
    if (valor === false || valor === 0 || valor === "0" || valor === "no" || valor === "false") return "0";
    return valorSelect(valor);
};

function Formulario({onCancel, onGuardado, maquinaEditar}){
    const esEdicion=maquinaEditar!=null;
    const [codigo, setCodigo] = useState(maquinaEditar?.code || "");
    const [nombre, setNombre] = useState(maquinaEditar?.name || "");
    const [modelo, setModelo] = useState(maquinaEditar?.model || "");
    const [numeroSerie, setNumeroSerie] = useState(maquinaEditar?.serial_number || "");
    const [fechaAdquisicion, setFechaAdquisicion] = useState(maquinaEditar?.acquisition_date || "");
    const [costoAdquisicion, setCostoAdquisicion] = useState(maquinaEditar?.acquisition_cost ?? "");
    const [estado, setEstado] = useState(maquinaEditar?.status || "active");
    const [garantia, setGarantia] = useState(maquinaEditar?.warranty ?? "");
    const [archivoImagen, setArchivoImagen] = useState(null);
    const [categoriaid, setCategoriaid] = useState(valorSelect(maquinaEditar?.category_maquina?.id ?? maquinaEditar?.category_id));
    const [locationid, setLocationid] = useState(valorSelect(maquinaEditar?.ubicacion?.id ?? maquinaEditar?.location?.id ?? maquinaEditar?.location_id));
    const [marca, setMarca] = useState(maquinaEditar?.brand || "");
    const [responsable, setResponsable] = useState(maquinaEditar?.responsible || "");
    const [usoMaquina, setUsoMaquina] = useState(maquinaEditar?.machine_usage || "");
    const [maquinaEnOperacion, setMaquinaEnOperacion] = useState(valorOperacion(maquinaEditar?.in_operation));
    const [caracteristicas, setCaracteristicas] = useState(maquinaEditar?.characteristics || "");
    const [categorias,setCategorias]=useState([]);
    const [ubicaciones, setUbicaciones] = useState([]);
    const [errorImagen, setErrorImagen] = useState("");
    const [vistaPrevia, setVistaPrevia] = useState(null);
    const [errores, setErrores] = useState({});
    const [mensajeError, setMensajeError] = useState("");
    const imagenActual = maquinaEditar?.image || null;

    useEffect(()=>{
        GetCategoryMachine()
            .then((data) => setCategorias(Array.isArray(data) ? data : []))
            .catch((error) => console.error("Error al traer categorías de máquinas:", error));
        obtenerUbicaciones()
            .then((data) => setUbicaciones(Array.isArray(data?.ubicaciones) ? data.ubicaciones : []))
            .catch((error) => console.error("Error al traer ubicaciones:", error));
    }, [])

    useEffect(()=>{
        return () => {
            if (vistaPrevia) URL.revokeObjectURL(vistaPrevia);
        };
    }, [vistaPrevia])
    const handleImagen = (e) => {
        const archivo = e.target?.files?.[0] || e.dataTransfer?.files?.[0];
        if (!archivo) return;

        if (!archivo.type.startsWith("image/")) {
            setErrorImagen("Seleccione un archivo de imagen válido.");
            setArchivoImagen(null);
            setVistaPrevia(null);
            if (e.target) e.target.value = "";
            return;
        }

        if (archivo.size > 10 * 1024 * 1024) {
            setErrorImagen("La imagen no puede superar los 10 MB.");
            setArchivoImagen(null);
            setVistaPrevia(null);
            if (e.target) e.target.value = "";
            return;
        }

        setErrorImagen("");
        setArchivoImagen(archivo);
        setVistaPrevia(URL.createObjectURL(archivo));
    };
    const handleQuitarImagen = () => {
        setArchivoImagen(null);
        setVistaPrevia(null);
        setErrorImagen("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrores({});
        setMensajeError("");
        const imagenFaltante = !esEdicion && !archivoImagen;
        if (!validarCamposRequeridos({
            "Código": codigo,
            "Nombre": nombre,
            "Modelo": modelo,
            "Número de serie": numeroSerie,
            "Fecha de adquisición": fechaAdquisicion,
            "Costo de adquisición": costoAdquisicion,
            "Marca": marca,
            "Ubicación": locationid,
            "Uso de la máquina": usoMaquina,
            "Responsable": responsable,
            "Operación de la máquina": maquinaEnOperacion,
            "Garantía": garantia,
            "Categoría": categoriaid,
            "Características": caracteristicas,
            ...(esEdicion ? { "Estado": estado } : {}),
            ...(imagenFaltante ? { "Imagen": "" } : {}),
        })) {
            if (imagenFaltante) setErrorImagen("Debe seleccionar una imagen.");
            return;
        }

        const erroresLocales = validarCaracteresEspeciales({ name: nombre });
        Object.assign(erroresLocales, validarGroserias({
            name: nombre,
            model: modelo,
            machine_usage: usoMaquina,
            responsible: responsable,
            characteristics: caracteristicas,
        }));
        if (Object.keys(erroresLocales).length > 0) {
            setErrores(erroresLocales);
            return;
        }
        if (!esEdicion && !archivoImagen) {
            setErrorImagen("Debe seleccionar una imagen.");
            return;
        }
        if (esEdicion){
            const sincambios=
                codigo===maquinaEditar.code &&
                nombre===maquinaEditar.name &&
                modelo===maquinaEditar.model &&
                numeroSerie===maquinaEditar.serial_number &&
                fechaAdquisicion===maquinaEditar.acquisition_date &&
                costoAdquisicion===maquinaEditar.acquisition_cost &&
                estado===maquinaEditar.status &&
                garantia===maquinaEditar.warranty &&
                categoriaid===valorSelect(maquinaEditar.category_maquina?.id ?? maquinaEditar.category_id) &&
                locationid===valorSelect(maquinaEditar.ubicacion?.id ?? maquinaEditar.location?.id ?? maquinaEditar.location_id) &&
                marca===maquinaEditar.brand &&
                responsable===maquinaEditar.responsible &&
                caracteristicas===maquinaEditar.characteristics &&
                usoMaquina===maquinaEditar.machine_usage &&
                maquinaEnOperacion===valorOperacion(maquinaEditar.in_operation) &&
                !archivoImagen;
            if (sincambios){
                onCancel();
                return;
            }

        }
        const datos = new FormData();
            datos.append("code", codigo);
            datos.append("name", nombre);
            datos.append("model", modelo);
            datos.append("serial_number", numeroSerie);
            datos.append("acquisition_date", fechaAdquisicion);
            datos.append("acquisition_cost", costoAdquisicion);
            datos.append("status", estado);
            datos.append("warranty", garantia);
            datos.append("machine_category_id", categoriaid);
            datos.append("location_id", locationid);
            datos.append("brand", marca);
            datos.append("responsible", responsable);
            datos.append("machine_usage", usoMaquina);
            datos.append("in_operation", maquinaEnOperacion);
            datos.append("characteristics", caracteristicas);
            if (archivoImagen) datos.append("image", archivoImagen);
        try {
            if (esEdicion){
                await UpdateMachine(maquinaEditar.id, datos);
            } else {
                await CreateMachine(datos);
            }
            onGuardado();
            onCancel();
        } catch (error) {
            const respuesta = error.response?.data;
            if (respuesta?.errors && typeof respuesta.errors === "object") {
                setErrores(respuesta.errors);
                setMensajeError(respuesta.message || "El servidor rechazó algunos datos.");
                console.error("Error de validación al guardar la máquina:", JSON.stringify(respuesta, null, 2));
            } else {
                console.error("Error al guardar la maquina:", respuesta || error.message);
                setMensajeError(respuesta?.message || "No se pudo guardar la máquina. Intente de nuevo.");
            }
        }
    }

    const opcionesUbicaciones = [
        { valor: "", etiqueta: "Seleccione una ubicación" },
        ...ubicaciones
            .filter(ubi => ubi.status === 'active' || ubi.id === maquinaEditar?.location_id)
            .map(ubi => ({ valor: ubi.id, etiqueta: ubi.status === 'active' ? ubi.name : `${ubi.name} (Inactiva)` }))
    ];

    return(
        <Form
            titulo={esEdicion?"Editar máquina":"Agregar nueva máquina"}
            descripcion={esEdicion?"Ingrese los datos que desea editar":"Ingrese los datos de la nueva maquina"}
            onCancel={onCancel}
            textoBoton="Guardar"
            iconoBoton="fa-solid fa-floppy-disk"
            onSubmit={handleSubmit}
            noValidate
        >
            <div className="col-span-3">
                <Text
                    label="Código:"
                    id="codigo"
                    name="codigo"
                    placeholder="Código de la máquina"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    required
                />
            </div>
            <div className="col-span-3">
                <Text
                    label="Nombre:"
                    id="nombre"
                    name="nombre"
                    placeholder="Nombre de la máquina"
                    value={nombre}
                    onChange={(e) => {
                        const valor = e.target.value;
                        if (valor === "" || sinCaracteresEspeciales(valor)) {
                            setNombre(capitalizarPrimeraLetra(valor));
                        }
                    }}
                    required
                />
            </div>
            <div className="col-span-3">
                <Text
                    label="Modelo:"
                    id="modelo"
                    name="modelo"
                    placeholder="Modelo de la máquina"
                    value={modelo}
                    onChange={(e) => setModelo(capitalizarPrimeraLetra(e.target.value))}
                    required
                />
            </div>
            <div className="col-span-3">
                <Text
                    label="Marca:"
                    id="marca"
                    name="marca"
                    placeholder="Marca de la máquina"
                    value={marca}
                    onChange={(e) => setMarca(e.target.value)}
                    required
                />
            </div>
            <div className="col-span-3">
                <Text
                    label="Número de serie:"
                    id="serie"
                    name="serie"
                    placeholder="Número de serie"
                    value={numeroSerie}
                    onChange={(e) =>setNumeroSerie(e.target.value)}
                    required
                />
            </div>
            <div className="col-span-3">
                <Select
                    label="Ubicación: "
                    id="ubicacion"
                    name="ubicacion"
                    value={locationid}
                    onChange={(e) => setLocationid(e.target.value)}
                    opciones={opcionesUbicaciones}
                    required
                />
            </div>
            <div className="col-span-3">
                <Text
                    label="Uso de la máquina: "
                    id="usoMaquina"
                    name="usoMaquina"
                    placeholder="Uso de la máquina"
                    value={usoMaquina}
                    onChange={(e) => setUsoMaquina(capitalizarPrimeraLetra(e.target.value))}
                    required
                />
            </div>
            <div className="col-span-3">
                <Text
                    label="Responsable:"
                    id="responsable"
                    name="responsable"
                    placeholder="Ingresa el responsable"
                    value={responsable}
                    onChange={(e) => setResponsable(capitalizarPrimeraLetra(e.target.value))}
                    required
                />
            </div>
            <div className="col-span-3">
                <Date
                    label="Fecha de adquisición:"
                    id="fechaAdquisicion"
                    name="fechaAdquisicion"
                    value={fechaAdquisicion}
                    onChange={(e) => setFechaAdquisicion(e.target.value)}
                    required
                />
            </div>
            <div className="col-span-3">
                <Text
                    label="Costo adquisición:"
                    id="costoAdquisicion"
                    name="costoAdquisicion"
                    type="number"
                    placeholder="Costo de adquisición"
                    value={costoAdquisicion}
                    onChange={(e) => setCostoAdquisicion(e.target.value)}
                    required
                />
            </div>
            {esEdicion && (
                <div className="col-span-3">
                    <Select
                        label="Estado:"
                        id="estado"
                        name="estado"
                        value={estado}
                        onChange={(e) => setEstado(e.target.value)}
                        opciones={[
                            {valor:"", etiqueta:"Seleccione un estado"},
                            {valor:"active", etiqueta:"Activo"},
                            {valor:"inactive", etiqueta:"Inactivo"},
                            {valor:"maintenance", etiqueta:"Mantenimiento"}
                        ]}
                        required
                    />
                </div>
            )}
            
            <div className={esEdicion?"col-span-3":"col-span-6"}>
                <Select
                    label="Máquina en operación:"
                    id="maquinaenoperacion"
                    name="maquinaenoperacion"
                    value={maquinaEnOperacion}
                    onChange={(e) => setMaquinaEnOperacion(e.target.value)}
                    opciones={[
                        {valor:"", etiqueta:"Seleccione una opción"},
                        {valor:"1", etiqueta:"Sí"},
                        {valor:"0", etiqueta:"No"}
                    ]}
                    required
                />
            </div>
            <div className="col-span-3">
                <Text
                    label="Garantía:"
                    id="garantia"
                    name="garantia"
                    type="number"
                    placeholder="Garantía en meses"
                    value={garantia}
                    onChange={(e) => setGarantia(e.target.value)}
                    required
                />
            </div>
            <div className="col-span-3">
                <Select 
                    label="Categoría:"
                    id="categoria"
                    name="categoria"
                    value={categoriaid}
                    onChange={(e) => setCategoriaid(e.target.value)}
                    opciones={[
                        {valor:"", etiqueta:"Seleccione una categoría"},
                        ...categorias.map((cat) => ({valor: valorSelect(cat.id), etiqueta: cat.name}))
                    ]}
                    required
                />
            </div>
            <div className="col-span-6">
                <Textarea
                    label="Características:"
                    id="caracteristicas"
                    name="caracteristicas"
                    placeholder="Características de la máquina"
                    rows="4"
                    value={caracteristicas}
                    onChange={(e) => setCaracteristicas(capitalizarPrimeraLetra(e.target.value))}
                    required
                />
            </div>
            <div className="col-span-6">
                <Dropzone
                    label="Imagen:"
                    id="imagen"
                    name="imagen"
                    accept="image/*"
                    ayuda="Formatos de imagen, hasta 10 MB"
                    onChange={handleImagen}
                    onFileDrop={handleImagen}
                    onRemove={archivoImagen ? handleQuitarImagen : undefined}
                    preview={vistaPrevia || imagenActual}
                    previewAlt="Vista previa de la imagen del equipo"
                    previewLabel={archivoImagen?.name || "Imagen actual"}
                    error={errorImagen}
                    required={!esEdicion && !archivoImagen}
                />
            </div>
        </Form>
    )

}
function Maquinas(){
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    let [maquina, setMaquina]=useState([])
    const [maquinaEditar, setMaquinaEditar]=useState(null);
    const [cargando, setCargando]=useState(true)
    maquina.map((maquina)=>({
        ...maquina,
        categoriaBusqueda: maquina.category_maquina?.name || "",
        ubicacionBusqueda: maquina.ubicacion?.name || ""
    }));
    const { busqueda, setBusqueda, filtrosEspeciales, setFiltroEspecial, itemsFiltrados: maquinasFiltrados } = useSearch(
        maquina,
        ["code","name","responsible","model","ubicacionBusqueda","marcaBusqueda"]
    );
    const ubicacionesUnicas = Array.from(
        new Map(
            maquina
                .filter((maquina) => maquina.ubicacion?.id != null)
                .map((maquina) => [
                    String(maquina.ubicacion.id),
                    { valor: maquina.ubicacion.id, etiqueta: maquina.ubicacion.name },
                ])
        ).values()
    );
    const categoriasUnicas = Array.from(
        new Map(
            maquina
                .filter((maquina) => maquina.category_maquina?.id != null)
                .map((maquina) => [
                    String(maquina.category_maquina.id),
                    { valor: maquina.category_maquina.id, etiqueta: maquina.category_maquina.name },
                ])
        ).values()
    );
    const { datosPagina, paginaActual, totalPaginas, setPaginaActual } = usePaginacion(maquinasFiltrados, 7  );
    const cargarMaquinas = () =>{
        setCargando(true);
        GetMachine()
            .then((data) => {
                setMaquina(data);
            })
            .catch((error) => {
                console.error("Error al cargar las maquinas:", error);

            })
            .finally(() => setCargando(false));
    }
    useEffect(()=>{
        cargarMaquinas()
    },[])
    const handleEliminar = async (id) =>{
        let confirmar= window.confirm("¿Seguro que quieres eliminar esta maquina?")
        if (!confirmar)
            return
        try {
            await DeleteMachine(id)
            cargarMaquinas()
        }
        catch (error){
            console.error("Error al eliminar categoría:", error);
        }
    }
    const handleAbrirCrear=()=>{
        setMaquinaEditar(null);
        setMostrarFormulario(true);
    }
    const handleAbrirEditar=(maquina)=>{
        setMaquinaEditar(maquina);
        setMostrarFormulario(true);
    }
    if (cargando) return <LoadingScreen indeterminado/>
    return(
        <div className="list-grid">
            <header className="bienvenida">
                <PageWelcome
                    titulo="MÁQUINAS"
                    descripcion="Este es el formato de las máquinas."
                    mostrarHistorial={true}
                />
                <Searcher
                    value={busqueda}
                    onChange={(e)=>setBusqueda(e.target.value)}
                    placeholder="Buscar por código, nombre, responsable, modelo o ubicación"
                    filtrosAdicionales={
                        <div className="btn-container">
                            <Select
                                id="filtro-categoria"
                                name="filtro-categoria"
                                value={filtrosEspeciales.machine_category_id || ""}
                                onChange={(e) => setFiltroEspecial("machine_category_id", e.target.value)}
                                opciones={[
                                    { valor: "", etiqueta: "Todas las categorías" },
                                    ...categoriasUnicas,
                                ]}
                            />
                            <Select
                                id="filtro-ubicacion"
                                name="filtro-ubicacion"
                                value={filtrosEspeciales.location_id || ""}
                                onChange={(e) => setFiltroEspecial("location_id", e.target.value)}
                                opciones={[
                                    { valor: "", etiqueta: "Todas las ubicaciones" },
                                    ...ubicacionesUnicas,
                                ]}
                            
                            />
                    </div>}
                />
            </header>
            <div className="table-responsive">
                <table className="table">
                        <thead>
                            <tr>
                            <th>Código</th>
                            <th>Nombre</th>
                            <th>Número de serie</th>
                            <th>Categoría</th>
                            <th>Marca</th>
                            <th>Ubicación</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {datosPagina.map((m) => (
                            <tr key={m.id}>
                                <td>{m.code}</td>
                                <td>{m.name}</td>
                                <td>{m.serial_number}</td>
                                <td>{m.category_maquina?.name||""}</td>
                                <td>{m.brand}</td>
                                <td>{m.ubicacion?.name||""}</td>
                                <td>{m.status==="active"?"Activo":m.status==="inactive"?"Inactivo":m.status==="maintenance"?"En mantenimiento":"Desconocido"}</td>
                                <td>
                                <div className="btn-container">
                                <BotonLink
                                    link={`/machines/cardmachine/${m.id}`}
                                    clase="btn-azul"
                                    icono="fa-solid fa-eye"
                                    titulo="Ver detalles de la máquina"
                                />
                                <Boton
                                    clase="btn-2"
                                    icono="fa-solid fa-edit"
                                    onClick={()=>handleAbrirEditar(m)}
                                    titulo="Editar máquina"
                                />
                                <Boton
                                    clase="btn-2"
                                    icono="fa-solid fa-trash"
                                    onClick={() => handleEliminar(m.id)}
                                    titulo="Eliminar equipo"
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
                        link="/machines/categoriesmachines"
                        clase="btn-2"
                        texto="Categorías de máquinas"
                        icono="fa-solid fa-list"
                        titulo="Volver a categorías de máquinas"
                    />
                    <Boton
                        clase="btn-azul"
                        icono="fa-solid fa-plus"
                        texto="Nueva Máquina"
                        onClick={handleAbrirCrear}
                        titulo="Agregar nueva máquina"
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
                    key={maquinaEditar?.id || "nuevo"}
                    onCancel={() => setMostrarFormulario(false)}
                    onGuardado={cargarMaquinas}
                    maquinaEditar={maquinaEditar}
                />
            )}
        </div>
    );
}
export default Maquinas;