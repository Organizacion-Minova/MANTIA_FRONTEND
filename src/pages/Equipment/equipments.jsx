import { useState, useEffect } from "react";
import { Boton,BotonLink } from "../../components/common/Button";
import { PageWelcome,Searcher } from "../../components/common/welcome";
import { Form, Text, Textarea, Dropzone, Select, Date } from "../../components/common/forms";
import { GetEquipments, DeleteEquipment, CreateEquipment, UpdateEquipment } from "../../api/Equipmentsapi";
import { obtenerUbicaciones } from "../../api/location";
import LoadingScreen from "../../components/LoadingScreen";
import { usePaginacion,Paginacion } from "../../components/common/Paginacion";
import { useSearch } from "../../hooks/useSearch";
import api from "../../api/axios";
import { capitalizarPrimeraLetra, sinCaracteresEspeciales, validarCaracteresEspeciales, validarGroserias } from "../../components/common/Validations";
import { validarCamposRequeridos } from "../../components/common/requiredFields";
import { useToast } from "../../context/ToastContext";

function obtenerUrlImagen(imagen) {
    if (!imagen) return null;
    if (/^https?:\/\//i.test(imagen)) return imagen;

    const ruta = imagen.replace(/^\/+/, "").replace(/^storage\//, "");
    const baseUrl = api.defaults.baseURL.replace(/\/+$/, "");
    return `${baseUrl}/storage/${ruta}`;
}

function Formulario({onCancel, onGuardado, equiposEditar}){
    const esEdicion = equiposEditar != null;
    const { advertencia } = useToast();
    const [codigo, setCodigo] = useState(equiposEditar?.code || "");
    const [nombre, setNombre] = useState(equiposEditar?.name || "");
    const [modelo, setModelo] = useState(equiposEditar?.model || "");
    const [descripcion, setDescripcion] = useState(equiposEditar?.description || "");
    const [serie, setSerie] = useState(equiposEditar?.serial_number || "");
    const [responsable, setResponsable] = useState(equiposEditar?.responsible || "");
    const [estado, setEstado] = useState(equiposEditar?.status || "active");
    const [fechaIngreso, setFechaIngreso] = useState(equiposEditar?.start_up_date || "");
    const [marca, setMarca] = useState(equiposEditar?.brand || "");
    const [placa, setPlaca] = useState(equiposEditar?.plate || "");
    const [combustible, setCombustible] = useState(equiposEditar?.fuel || "");
    const [potencia, setPotencia] = useState(equiposEditar?.power || "");
    const [voltaje, setVoltaje] = useState(equiposEditar?.voltage || "");
    const [locationid, setLocationid] = useState(equiposEditar?.ubicacion?.id || equiposEditar?.location?.id || "");
    const [archivoImagen, setArchivoImagen] = useState(null);
    const [ubicaciones, setUbicaciones] = useState([]);
    const [errores, setErrores] = useState({});
    const [errorImagen, setErrorImagen] = useState("");
    const [vistaPrevia, setVistaPrevia] = useState(null);
    const imagenActual = obtenerUrlImagen(equiposEditar?.image);

    useEffect(()=>{
        obtenerUbicaciones()
            .then((data) => setUbicaciones(Array.isArray(data?.ubicaciones) ? data.ubicaciones : []))
            .catch((error) => console.error("Error al traer ubicaciones:", error));
    },[]);

    useEffect(() => {
        return () => {
            if (vistaPrevia) URL.revokeObjectURL(vistaPrevia);
        };
    }, [vistaPrevia]);

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

    const handleSubmit = async (e) =>{
        e.preventDefault();
        setErrores({});
        const imagenFaltante = !esEdicion && !archivoImagen;
        if (!validarCamposRequeridos({
            "Código": codigo,
            "Nombre": nombre,
            "Descripción": descripcion,
            "Número de serie": serie,
            "Marca": marca,
            "Placa": placa,
            "Fecha de ingreso": fechaIngreso,
            "Ubicación": locationid,
            "Responsable": responsable,
            "Modelo": modelo,
            ...(esEdicion ? { "Estado": estado } : {}),
            ...(imagenFaltante ? { "Imagen": "" } : {}),
        })) {
            if (imagenFaltante) setErrorImagen("Debe seleccionar una imagen.");
            return;
        }
        const erroresGroserias = validarGroserias({
            name: nombre,
            description: descripcion,
            responsible: responsable,
            model: modelo,
        });
        if (Object.keys(erroresGroserias).length > 0) {
            advertencia("Se han detectado palabras inapropiadas en los campos: " + Object.keys(erroresGroserias).join(", "));
            return;
        }

        const erroresGroserias = validarGroserias({
            name: nombre,
            description: descripcion,
            responsible: responsable,
            model: modelo,
        });
        
        Object.assign(erroresLocales, validarGroserias({
            name: nombre,
            responsible: responsable,
        });
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
                codigo === equiposEditar.code &&
                nombre === equiposEditar.name &&
                modelo === equiposEditar.model &&
                serie === equiposEditar.serial_number &&
                estado === equiposEditar.status &&
                responsable === equiposEditar.responsible &&
                fechaIngreso === equiposEditar.registration_date &&
                marca === equiposEditar.brand &&
                combustible === equiposEditar.fuel &&
                placa === equiposEditar.plate &&
                potencia === equiposEditar.power &&
                voltaje === equiposEditar.voltage &&
                locationid === (equiposEditar.location?.id || "") && 
                descripcion === equiposEditar.description &&
                !archivoImagen 
                
            if (sincambios){
                onCancel();
                return;
            }
        }
        
        const camposConLongitudMinima = [
            { nombre: "Código", valor: codigo, minimo: 2 },
            { nombre: "Nombre", valor: nombre, minimo: 3 },
            { nombre: "Modelo", valor: modelo, minimo: 2 },
            { nombre: "Número de serie", valor: serie, minimo: 3 },
            { nombre: "Responsable", valor: responsable, minimo: 3 },
            { nombre: "Marca", valor: marca, minimo: 2 },
            { nombre: "Placa", valor: placa, minimo: 3 },
            { nombre: "Combustible", valor: combustible, minimo: 2, opcional: true },
            { nombre: "Descripción", valor: descripcion, minimo: 10 },
        ];
        const camposInvalidos = camposConLongitudMinima.filter(({ valor, minimo, opcional }) => {
            const longitud = Array.from(String(valor).trim()).length;
            return (opcional && longitud === 0) ? false : longitud < minimo;
        });
        if (camposInvalidos.length > 0) {
            window.dispatchEvent(new CustomEvent("app:toast", {
                detail: {
                    tipo: "warning",
                    titulo: "Mínimo de caracteres",
                    mensaje: camposInvalidos
                        .map(({ nombre, minimo }) => `${nombre}: mínimo ${minimo} caracteres`)
                        .join(". "),
                },
            }));
            return;
        }

        const datos = new FormData();
            datos.append("code", codigo);
            datos.append("name", nombre);
            datos.append("model", modelo);
            datos.append("serial_number", serie);
            datos.append("responsible", responsable);
            datos.append("status", estado);
            datos.append("start_up_date", fechaIngreso);
            datos.append("brand", marca);
            datos.append("plate", placa);
            datos.append("fuel", combustible);
            datos.append("power", potencia);
            datos.append("voltage", voltaje);
            datos.append("location_id", locationid);
            datos.append("description", descripcion);
            
            if (archivoImagen) datos.append("image", archivoImagen);
        try {
            if (esEdicion){
                await UpdateEquipment(equiposEditar.id, datos);
            } else {
                await CreateEquipment(datos);
            }
            onGuardado();
            onCancel();
        } catch (error) {
            const respuesta = error.response?.data;
            if (respuesta?.errors && typeof respuesta.errors === "object") {
                setErrores(respuesta.errors);
                console.error("Errores de validación al guardar el equipo:", respuesta.errors);
            } else {
                console.error("Error al guardar el equipo:", respuesta || error.message);
            }
        }
    }

        const opcionesUbicaciones = [
        { valor: "", etiqueta: "Seleccione una ubicación" },
        ...ubicaciones
            .filter(ubi => ubi.status === 'active' || ubi.id === equiposEditar?.location_id)
            .map(ubi => ({ valor: ubi.id, etiqueta: ubi.status === 'active' ? ubi.name : `${ubi.name} (Inactiva)` }))
    ];

    return(
        <Form
            titulo={esEdicion?"Editar Equipo":"Agregar Nuevo Equipo"}
            descripcion={esEdicion?"Ingrese los datos que desea editar":"Ingrese los datos del nuevo equipo"}
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
                    placeholder="Código del equipo"
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
                    placeholder="Nombre del equipo"
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
                    label="Número de serie:"
                    id="serie"
                    name="serie"
                    placeholder="Ingrese el número de serie del equipo"
                    value={serie}
                    onChange={(e) => setSerie(e.target.value)}
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
                    onChange={(e) => {
                        const valor = e.target.value;
                        if (valor === "" || sinCaracteresEspeciales(valor)) {
                            setResponsable(capitalizarPrimeraLetra(valor));
                        }
                    }}
                    required
                />
            </div>
            
            <div className="col-span-3">
                <Date
                    label="Fecha de inicio:"
                    id="fechainicio"
                    name="fechainicio"
                    value={fechaIngreso}
                    onChange={(e) => setFechaIngreso(e.target.value)}
                />
            </div>
            <div className="col-span-3">
                <Text
                    label="Marca:"
                    id="marca"
                    name="marca"
                    placeholder="Ingrese la marca del equipo"
                    value={marca}
                    onChange={(e) => setMarca(capitalizarPrimeraLetra(e.target.value))}
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
                    required
                />
            </div>
            <div className="col-span-3">
                <Text
                    label="Combustible:"
                    id="combustible"
                    name="combustible"
                    placeholder="Ingrese el combustible del equipo"
                    value={combustible}
                    onChange={(e) => setCombustible(e.target.value)}

                />
            </div>
            <div className="col-span-3">
                <Text
                    label="Potencia:"
                    id="potencia"
                    name="potencia"
                    placeholder="Ingrese la potencia del equipo"
                    value={potencia}
                    onChange={(e) => setPotencia(e.target.value)}
                />
            </div>
            <div className="col-span-3">
                <Text
                    label="Voltaje:"
                    id="voltaje"
                    name="voltaje"
                    placeholder="Ingrese el voltaje del equipo"
                    value={voltaje}
                    onChange={(e) => setVoltaje(e.target.value)}
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
            
            {esEdicion && (
                <div className="col-span-6">
                    <Select
                        label="Estado:"
                        id="estado"
                        name="estado"
                        value={estado}
                        onChange={(e) => setEstado(e.target.value)}
                        opciones={[
                            { valor: "active", etiqueta: "Activo" },
                            { valor: "inactive", etiqueta: "Inactivo" },
                        ]}
                        required
                    />
                </div>
            )}
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
            <div className="col-span-6">
                <Textarea
                    label="Descripción:"
                    id="descripcion"
                    name="descripcion"
                    placeholder="Descripción del equipo"
                    rows="4"
                    value={descripcion}
                    onChange={(e) => setDescripcion(capitalizarPrimeraLetra(e.target.value))}
                    required
                />
            </div>
        </Form>
    )
}
function Equipos(){
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    let [equipo, setEquipo]= useState([])
    const [equiposEditar, setEquiposEditar]=useState(null);
    const [cargando, setCargando] = useState(true);
    equipo.map((equipo)=>({
        ...equipo,
        ubicacionBusqueda:equipo.ubicacion?.name || ""
    }))

    const { busqueda, setBusqueda, filtrosEspeciales, setFiltroEspecial, itemsFiltrados: equiposFiltrados } = useSearch(
        equipo,
        ["code","name", "description","responsible","model","ubicacionBusqueda"]
    );
    const ubicacionesUnicas = Array.from(
        new Map(
            equipo
                .filter((equipo) => equipo.ubicacion?.id != null)
                .map((equipo) => [
                    String(equipo.ubicacion.id),
                    { valor: equipo.ubicacion.id, etiqueta: equipo.ubicacion.name },
                ])
        ).values()
    );
    const { datosPagina, paginaActual, totalPaginas, setPaginaActual } = usePaginacion(equiposFiltrados, 7  );
    const cargarEquipos = () => {
        setCargando(true);
        GetEquipments()
            .then((data) => {
                setEquipo(data);   
            })
            .catch((error) => {
                console.error("Error al cargar los equipos:", error);
                
            })
            .finally(() => setCargando(false));
    };

    useEffect(() => {
        cargarEquipos();
    }, []);
    const handleEliminar = async (id) =>{
        let confirmar= window.confirm("¿Seguro que quieres eliminar este equipo?")
        if (!confirmar)
            return
        try {
            await DeleteEquipment(id)
            cargarEquipos()
        }
        catch (error){
            console.error("Error al eliminar categoría:", error);
        }
    }
    const handleAbrirCrear=()=>{
        setEquiposEditar(null);
        setMostrarFormulario(true);
    }
    const handleAbrirEditar=(equipo)=>{
        setEquiposEditar(equipo);
        setMostrarFormulario(true);
    }

    if (cargando) return <LoadingScreen indeterminado/>
    return(
        <div className="list-grid">
            <header className="bienvenida">
                <PageWelcome
                    titulo="Equipos"
                    descripcion="Este es el formato de los equipos"
                    mostrarHistorial={true}
                />
                <Searcher
                    value={busqueda}
                    onChange={(e)=>setBusqueda(e.target.value)}
                    placeholder="Buscar por nombre, código, descripción, responsable, modelo, ubicación o marca"
                    filtrosAdicionales={
                        <div className="btn-container">
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
                        </div>
                    }
                />
                
            </header>
         <div className="table-responsive">
            <table className="table">
                
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>N° Serie</th>
                        <th>Responsable</th>
                        <th>Marca</th>
                        <th>Ubicación</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {datosPagina.map((e) => (
                    <tr key={e.id}>
                        <td>{e.name}</td>
                        <td>{e.serial_number}</td>
                        <td>{e.responsible}</td>
                        <td>{e.brand}</td>
                        <td>{e.ubicacion.name}</td>
                        <td>{e.status==='active'?'Activo':'Inactivo'}</td>
                        <td>
                            <div className="btn-container">
                                <BotonLink
                                    link={`/equipment/cardequipment/${e.id}`}
                                    clase="btn-azul"
                                    icono="fa-solid fa-eye"
                                    titulo="Ver detalles del equipo"
                                />
                                <Boton
                                    clase="btn-2"
                                    icono="fa-solid fa-edit"
                                    onClick={()=>handleAbrirEditar(e)}
                                    titulo="Editar equipo"
                                />
                                <Boton
                                    clase="btn-2"
                                    icono="fa-solid fa-trash"
                                    onClick={() => handleEliminar(e.id)}
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
                <div className="btn-container2">
                <Boton
                    clase="btn-azul"
                    icono="fa-solid fa-plus"
                    texto="Nuevo equipo"
                    onClick={handleAbrirCrear}
                    titulo="Agregar nuevo equipo"

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
                    key={equiposEditar?.id || "nuevo"}
                    onCancel={() => setMostrarFormulario(false)} 
                    onGuardado={cargarEquipos} 
                    equiposEditar={equiposEditar}
                />
            )}
        
        </div>
    )}

export default Equipos;