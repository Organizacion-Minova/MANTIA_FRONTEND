import { useEffect, useState } from "react";
import { Boton, BotonAccion, BotonLink } from "../../components/common/Button";
import {PageWelcome,Searcher} from "../../components/common/welcome";
import { Form, Text, Textarea, Dropzone, Select, Date } from '../../components/common/forms';
import LoadingScreen from "../../components/LoadingScreen";
import { GetCategoryMachine ,GetMachine, CreateMachine, UpdateMachine, DeleteMachine } from "../../api/machinesapi";
import { obtenerUbicaciones } from "../../api/location";
import { usePaginacion,Paginacion } from "../../components/common/Paginacion";
import { useSearch } from "../../hooks/useSearch";
import { useRolesResponsables } from "../../hooks/useRolesResponsables";
import { capitalizarPrimeraLetra, sinCaracteresEspeciales, validarCaracteresEspeciales, validarGroserias } from "../../components/common/Validations";
import { validarCamposRequeridos } from "../../components/common/requiredFields";
import { useToast } from "../../context/ToastContext";
import { useConfirm } from "../../context/ConfirmContext.jsx";
import editarIcono from "../../assets/icons/editar.svg";
import editarIconoDark from "../../assets/icons/editar-2.svg";
import borrarIcono from "../../assets/icons/borrar.svg";
import verIcono from "../../assets/icons/ver.svg";
import { useAuth } from "../../context/AuthContext.jsx";
import { mensajeDeError } from "../../utils/errores";

const valorSelect = (valor) => (valor == null ? "" : String(valor));
const normalizarEstado = (estado) => {
    const valor = String(estado || "").trim().toLocaleLowerCase("es");
    if (valor === "inactive" || valor === "inactivo") return "Inactivo";
    if (valor === "maintenance" || valor === "mantenimiento") return "Mantenimiento";
    return "Activo";
};
const obtenerClaveBorrador = (usuarioId) => `mantia_borrador_maquinas_${usuarioId}`;

const obtenerBorrador = (usuarioId) => {
    if (!usuarioId) return null;

    try {
        const borrador = sessionStorage.getItem(obtenerClaveBorrador(usuarioId));
        return borrador ? JSON.parse(borrador) : null;
    } catch (error) {
        console.error("Error al recuperar el borrador de máquinas:", error);
        return null;
    }
};

const eliminarBorrador = (usuarioId) => {
    if (!usuarioId) return;
    sessionStorage.removeItem(obtenerClaveBorrador(usuarioId));
};

function Formulario({onCancel, onGuardado, maquinaEditar, usuarioId}){
    const esEdicion=maquinaEditar!=null;
    const { advertencia, peligro } = useToast();
    const [borradorInicial] = useState(() => esEdicion ? null : obtenerBorrador(usuarioId));
    const [codigo, setCodigo] = useState(borradorInicial?.codigo ?? maquinaEditar?.code ?? "");
    const [nombre, setNombre] = useState(borradorInicial?.nombre ?? maquinaEditar?.name ?? "");
    const [modelo, setModelo] = useState(borradorInicial?.modelo ?? maquinaEditar?.model ?? "");
    const [numeroSerie, setNumeroSerie] = useState(borradorInicial?.numeroSerie ?? maquinaEditar?.serial_number ?? "");
    const [responsable, setResponsable] = useState(borradorInicial?.responsable ?? maquinaEditar?.responsible ?? "");
    const [estado, setEstado] = useState(normalizarEstado(maquinaEditar?.status));
    const [fechaInicio, setFechaInicio] = useState(borradorInicial?.fechaInicio ?? maquinaEditar?.start_up_date?.slice(0, 10) ?? "");
    const [marca, setMarca] = useState(borradorInicial?.marca ?? maquinaEditar?.brand ?? "");
    const [placa, setPlaca] = useState(borradorInicial?.placa ?? maquinaEditar?.plate ?? "");
    const [combustible, setCombustible] = useState(borradorInicial?.combustible ?? maquinaEditar?.fuel ?? "");
    const [potencia, setPotencia] = useState(borradorInicial?.potencia ?? maquinaEditar?.power ?? "");
    const [voltaje, setVoltaje] = useState(borradorInicial?.voltaje ?? maquinaEditar?.voltage ?? "");
    const [locationid, setLocationid] = useState(borradorInicial?.locationid ?? valorSelect(maquinaEditar?.ubicacion?.id ?? maquinaEditar?.location?.id ?? maquinaEditar?.location_id));
    const [categoriaid, setCategoriaid] = useState(borradorInicial?.categoriaid ?? valorSelect(maquinaEditar?.category_maquina?.id ?? maquinaEditar?.category_id));
    const [caracteristicas, setCaracteristicas] = useState(borradorInicial?.caracteristicas ?? maquinaEditar?.characteristics ?? "");
    const [categorias,setCategorias]=useState([]);
    const [ubicaciones, setUbicaciones] = useState([]);
    const [archivoImagen, setArchivoImagen] = useState(null);
    const [errorImagen, setErrorImagen] = useState("");
    const [vistaPrevia, setVistaPrevia] = useState(null);
    const imagenActual = maquinaEditar?.image || null;
    const opcionesResponsable = useRolesResponsables(maquinaEditar?.responsible);

    const hayDatosIngresados = [
        codigo,
        nombre,
        modelo,
        numeroSerie,
        responsable,
        fechaInicio,
        marca,
        placa,
        combustible,
        potencia,
        voltaje,
        locationid,
        categoriaid,
        caracteristicas,
        archivoImagen,
    ].some(valor => String(valor ?? "").trim() !== "");

    useEffect(() => {
        if (esEdicion || !usuarioId) return;

        const borrador = {
            codigo,
            nombre,
            modelo,
            numeroSerie,
            responsable,
            fechaInicio,
            marca,
            placa,
            combustible,
            potencia,
            voltaje,
            locationid,
            categoriaid,
            caracteristicas,
        };

        try {
            sessionStorage.setItem(obtenerClaveBorrador(usuarioId), JSON.stringify(borrador));
        } catch (error) {
            console.error("Error al guardar el borrador de máquinas:", error);
        }
    }, [
        esEdicion, usuarioId, codigo, nombre, modelo, numeroSerie, responsable,
        fechaInicio, marca, placa, combustible, potencia, voltaje, locationid,
        categoriaid, caracteristicas,
    ]);

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
        const imagenFaltante = !esEdicion && !archivoImagen;
        if (!validarCamposRequeridos({
            "Código": codigo,
            "Nombre": nombre,
            "Modelo": modelo,
            "Número de serie": numeroSerie,
            "Responsable": responsable,
            "Marca": marca,
            "Placa": placa,
            "Ubicación": locationid,
            "Categoría": categoriaid,
            ...(esEdicion ? { "Estado": estado } : {}),
            ...(imagenFaltante ? { "Imagen": "" } : {}),
        })) {
            if (imagenFaltante) setErrorImagen("Debe seleccionar una imagen.");
            return;
        }

        if (esEdicion) {
            const sinCambios =
                codigo === (maquinaEditar.code || "") &&
                nombre === (maquinaEditar.name || "") &&
                modelo === (maquinaEditar.model || "") &&
                numeroSerie === (maquinaEditar.serial_number || "") &&
                responsable === (maquinaEditar.responsible || "") &&
                estado === normalizarEstado(maquinaEditar.status) &&
                fechaInicio === (maquinaEditar.start_up_date?.slice(0, 10) || "") &&
                marca === (maquinaEditar.brand || "") &&
                placa === (maquinaEditar.plate || "") &&
                combustible === (maquinaEditar.fuel || "") &&
                potencia === (maquinaEditar.power || "") &&
                voltaje === (maquinaEditar.voltage || "") &&
                locationid === valorSelect(maquinaEditar.ubicacion?.id ?? maquinaEditar.location?.id ?? maquinaEditar.location_id) &&
                categoriaid === valorSelect(maquinaEditar.category_maquina?.id ?? maquinaEditar.category_id) &&
                caracteristicas === (maquinaEditar.characteristics || "") &&
                !archivoImagen;
            if (sinCambios) {
                onCancel();
                return;
            }
        }

        const camposTexto = {
            code: codigo,
            name: nombre,
            model: modelo,
            serial_number: numeroSerie,
            responsible: responsable,
            brand: marca,
            plate: placa,
            fuel: combustible,
            characteristics: caracteristicas,
        };
        const camposTextoValidados = esEdicion
            ? Object.fromEntries(
                Object.entries(camposTexto).filter(([campo, valor]) =>
                    valor !== (maquinaEditar[campo] || "")
                )
            )
            : camposTexto;
        const erroresGroserias = validarGroserias(camposTextoValidados);
        if (Object.keys(erroresGroserias).length > 0) {
            advertencia(
                `Se encontraron palabras inapropiadas en: ${Object.keys(erroresGroserias).join(", ")}.`,
                "Revisa los datos"
            );
            return;
        }

        const patronIdentificador = /^[\p{L}\p{N}]+(?:[ ._/-][\p{L}\p{N}]+)*$/u;
        const identificadores = [
            { nombre: "Código", valor: codigo, original: maquinaEditar?.code },
            { nombre: "Modelo", valor: modelo, original: maquinaEditar?.model },
            { nombre: "Número de serie", valor: numeroSerie, original: maquinaEditar?.serial_number },
            { nombre: "Placa", valor: placa, original: maquinaEditar?.plate },
        ].filter(({ valor, original }) => !esEdicion || valor !== (original || ""));
        const identificadoresInvalidos = identificadores
            .filter(({ valor }) => !patronIdentificador.test(valor.trim()))
            .map(({ nombre }) => nombre);
        if (identificadoresInvalidos.length > 0) {
            advertencia(
                `${identificadoresInvalidos.join(", ")}: usa solo letras, números, espacios, puntos, guiones, barras o guiones bajos.`,
                "Revisa los datos"
            );
            return;
        }

        const camposConLongitudMinima = [
            { nombre: "Código", valor: codigo, minimo: 2 },
            { nombre: "Nombre", valor: nombre, minimo: 3 },
            { nombre: "Modelo", valor: modelo, minimo: 2 },
            { nombre: "Número de serie", valor: numeroSerie, minimo: 3 },
            { nombre: "Responsable", valor: responsable, minimo: 3 },
            { nombre: "Marca", valor: marca, minimo: 2 },
            { nombre: "Placa", valor: placa, minimo: 3 },
            { nombre: "Características", valor: caracteristicas, minimo: 10 },
        ];
        const camposInvalidos = camposConLongitudMinima.filter(({ nombre, valor, minimo }) => {
            const longitud = Array.from(String(valor).trim()).length;
            const original = {
                Código: maquinaEditar?.code,
                Nombre: maquinaEditar?.name,
                Modelo: maquinaEditar?.model,
                "Número de serie": maquinaEditar?.serial_number,
                Responsable: maquinaEditar?.responsible,
                Marca: maquinaEditar?.brand,
                Placa: maquinaEditar?.plate,
                Características: maquinaEditar?.characteristics,
            }[nombre] || "";
            return (longitud > 0 && longitud < minimo) &&
                (!esEdicion || valor !== original);
        });
        if (camposInvalidos.length > 0) {
            advertencia(
                camposInvalidos.map(({ nombre, minimo }) => `${nombre}: mínimo ${minimo} caracteres`).join(". "),
                "Mínimo de caracteres"
            );
            return;
        }
        if (Array.from(placa.trim()).length > 80) {
            advertencia("La placa no puede superar los 80 caracteres.", "Revisa los datos");
            return;
        }
        if (!esEdicion && !archivoImagen) {
            setErrorImagen("Debe seleccionar una imagen.");
            return;
        }
        const datos = new FormData();
            datos.append("code", codigo);
            datos.append("name", nombre);
            datos.append("model", modelo);
            datos.append("serial_number", numeroSerie);
            datos.append("responsible", responsable);
            datos.append("status", estado);
            datos.append("start_up_date", fechaInicio);
            datos.append("brand", marca);
            datos.append("plate", placa);
            datos.append("fuel", combustible);
            datos.append("power", potencia);
            datos.append("voltage", voltaje);
            datos.append("location_id", locationid);
            datos.append("machine_category_id", categoriaid);
            datos.append("characteristics", caracteristicas);
            if (archivoImagen) datos.append("image", archivoImagen);
        try {
            if (esEdicion){
                await UpdateMachine(maquinaEditar.id, datos);
            } else {
                await CreateMachine(datos);
                eliminarBorrador(usuarioId);
            }
            onGuardado();
            onCancel();
        } catch (error) {
            const respuesta = error.response?.data;
            if (respuesta?.errors && typeof respuesta.errors === "object") {
                console.error("Error de validación al guardar la máquina:", JSON.stringify(respuesta, null, 2));
                advertencia(mensajeDeError(error, "Revisa los datos de la máquina."), "No se pudo guardar");
            } else {
                console.error("Error al guardar la maquina:", respuesta || error.message);
                peligro(mensajeDeError(error, "No se pudo guardar la máquina."), "No se pudo guardar");
            }
        }
    }

    const opcionesUbicaciones = [
        { valor: "", etiqueta: "Seleccione una ubicación" },
        ...ubicaciones
            .filter((ubi) =>
                ubi.status === "active" ||
                String(ubi.id) === valorSelect(
                    maquinaEditar?.ubicacion?.id ??
                    maquinaEditar?.location?.id ??
                    maquinaEditar?.location_id
                )
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
            titulo={esEdicion?"Editar máquina":"Agregar nueva máquina"}
            descripcion={esEdicion?"Ingrese los datos que desea editar":"Ingrese los datos de la nueva maquina"}
            onCancel={onCancel}
            onDiscard={!esEdicion && hayDatosIngresados ? handleDescartar : undefined}
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
                    maxLength={50}
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
                        setNombre(capitalizarPrimeraLetra(valor));
                    }}
                    maxLength={50}
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
                    maxLength={50}
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
                    maxLength={50}
                    required
                />
            </div>
            <div className="col-span-3">
                <Select
                    label="Responsable:"
                    id="responsable"
                    name="responsable"
                    value={responsable}
                    onChange={(e) => setResponsable(e.target.value)}
                    opciones={opcionesResponsable}
                    required
                />
            </div>
            <div className="col-span-3">
                <Date
                    label="Fecha de inicio :"
                    id="fechainicio"
                    name="fechaInicio"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                />
            </div>
            <div className="col-span-3">
                <Text
                    label="Marca:"
                    id="marca"
                    name="marca"
                    placeholder="Marca de la máquina"
                    value={marca}
                    onChange={(e) => setMarca(capitalizarPrimeraLetra(e.target.value))}
                    maxLength={50}
                    required
                />
            </div>
            
            <div className="col-span-3">
                <Text
                    label="Placa:"
                    id="placa"
                    name="placa"
                    placeholder="Ingrese la placa del equipo"
                    value={placa}
                    onChange={(e) => setPlaca(e.target.value)}
                    maxLength={80}
                    required
                />
            </div>
            <div className="col-span-3">
                <Text
                    label="Combustible (opcional):"
                    id="combustible"
                    name="combustible"
                    placeholder="Ingrese el combustible del equipo"
                    value={combustible}
                    onChange={(e) => setCombustible(capitalizarPrimeraLetra(e.target.value))}
                    maxLength={50}

                />
            </div>
            <div className="col-span-3">
                <Text
                    label="Potencia (opcional):"
                    id="potencia"
                    name="potencia"
                    placeholder="Ingrese la potencia del equipo"
                    value={potencia}
                    onChange={(e) => setPotencia(e.target.value)}
                    maxLength={50}
                />
            </div>
            <div className="col-span-3">
                <Text
                    label="Voltaje (opcional):"
                    id="voltaje"
                    name="voltaje"
                    placeholder="Ingrese el voltaje del equipo"
                    value={voltaje}
                    onChange={(e) => setVoltaje(e.target.value)}
                    maxLength={50}
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
            {esEdicion && (
                <div className="col-span-3">
                    <Select
                        label="Estado:"
                        id="estado"
                        name="estado"
                        value={estado}
                        onChange={(e) => setEstado(e.target.value)}
                        opciones={[
                            {valor:"Activo", etiqueta:"Activo"},
                            {valor:"Inactivo", etiqueta:"Inactivo"},
                            {valor:"Mantenimiento", etiqueta:"Mantenimiento"}
                        ]}
                        required
                    />
                </div>
            )}
            
            <div className="col-span-6">
                <Dropzone
                    label="Imagen (opcional):"
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
            <div className="col-span-6">
                <Textarea
                    label="Características (opcional):"
                    id="caracteristicas"
                    name="caracteristicas"
                    placeholder="Características de la máquina"
                    rows="4"
                    value={caracteristicas}
                    onChange={(e) => setCaracteristicas(capitalizarPrimeraLetra(e.target.value))}
                />
            </div>
            
        </Form>
    )

}
function Maquinas(){
    const { usuario } = useAuth();
    const usuarioId = usuario?.id;
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
    const pedirConfirmacion = useConfirm();
    const handleEliminar = async (id) =>{
        let confirmar = await pedirConfirmacion({
            titulo: "Eliminar máquina",
            mensaje: "¿Seguro que quieres eliminar esta máquina? Esta acción no se puede deshacer.",
        });
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
                                <td>{m.status}</td>
                                <td>
                                <div className="btn-container__acciones">
                                <BotonLink
                                    link={`/machines/cardmachine/${m.id}`}
                                    clase="btn-azul"
                                    img={verIcono}
                                    titulo="Ver detalles de la máquina"
                                />
                                <BotonAccion
                                    clase="btn-editar"
                                    icono={editarIcono}
                                    iconoDark={editarIconoDark}
                                    onClick={()=>handleAbrirEditar(m)}
                                    titulo="Editar máquina"
                                />
                                <BotonAccion
                                    clase="btn-borrar"
                                    icono={borrarIcono}
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
                    key={`${usuarioId ?? "sin-usuario"}-${maquinaEditar?.id ?? "nuevo"}`}
                    onCancel={() => setMostrarFormulario(false)}
                    onGuardado={cargarMaquinas}
                    maquinaEditar={maquinaEditar}
                    usuarioId={usuarioId}
                />
            )}
        </div>
    );
}
export default Maquinas;