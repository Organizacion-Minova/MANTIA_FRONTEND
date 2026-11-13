import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { useConfirm } from "../../context/ConfirmContext";
import { PageWelcome } from "../../components/common/welcome"; 
import { Boton,BotonLink, BotonAccion } from "../../components/common/Button";
import { GetMachineById } from "../../api/machinesapi";
import { GetMachineTools, GetConsumableTools, CreateMachineTool, UpdateMachineTool, DeleteMachineTool } from "../../api/machinesapi";
import api from "../../api/axios";
import LoadingScreen from "../../components/LoadingScreen";
import imagenPorDefecto from "../../assets/img/Mantia - logo.png";
import { exportarFichaTecnicaMaquinaExcelUnitario, exportarFichaTecnicaMaquinaPdfUnitario } from "../../api/machinesapi";
import { rutaForm} from '../../components/common/Formarchine';
import { Form, Select, Text, Textarea,  } from "../../components/common/forms";
import { validarCamposRequeridos } from "../../components/common/requiredFields";
import { capitalizarPrimeraLetra, validarGroserias } from "../../components/common/Validations";
import { mensajeDeError } from "../../utils/errores";
import editarIcono from "../../assets/icons/editar.svg";
import editarIconoDark from "../../assets/icons/editar-2.svg";
import borrarIcono from "../../assets/icons/borrar.svg";
import agregarIcon from "../../assets/icons/agregar.svg";
import excelIcon from "../../assets/icons/excel.svg";
import excelIconDark from "../../assets/icons/excel2.svg";
import pdfIcon from "../../assets/icons/pdf.svg";
import pdfIconDark from "../../assets/icons/pdf2.svg";
import izquierdaIcon from "../../assets/icons/flecha-izquierda.svg";
import izquierdaIcon2 from "../../assets/icons/flecha-izquierda2.svg";
import inspeccionIcon from"../../assets/icons/inspeccion3.svg";
import usodiarioIcon from"../../assets/icons/diario3.svg";
import preoperacionalIcon from"../../assets/icons/preoperacional3.svg";
import { Paginacion, usePaginacion } from "../../components/common/Paginacion";

function obtenerUrlImagen(imagen) {
    if (!imagen) return imagenPorDefecto;
    if (/^https?:\/\//i.test(imagen)) return imagen;

    const ruta = imagen.replace(/^\/+/, "").replace(/^storage\//, "");
    const baseUrl = api.defaults.baseURL.replace(/\/+$/, "");
    return `${baseUrl}/storage/${ruta}`;
}

function etiquetaEstado(estado) {
    const valor = String(estado || "").trim().toLocaleLowerCase("es");
    if (valor === "inactive" || valor === "inactivo") return "Inactivo";
    if (valor === "maintenance" || valor === "mantenimiento") return "Mantenimiento";
    if (valor === "active" || valor === "activo") return "Activo";
    return "—";
}

function FormularioConsumible({ machineId, consumibleEditar, onCancel, onGuardado }) {
    const esEdicion = consumibleEditar != null;
    const { advertencia, peligro } = useToast();
    const [toolId, setToolId] = useState(esEdicion ? String(consumibleEditar.tool_id) : "");
    const [marca, setMarca] = useState(consumibleEditar?.brand ?? "");
    const [cantidad, setCantidad] = useState(consumibleEditar?.stock ?? 0);
    const [observaciones, setObservaciones] = useState(consumibleEditar?.observations ?? "");
    const [catalogo, setCatalogo] = useState([]);

    // Solo al crear: consumibles que la máquina aún no tiene
    useEffect(() => {
        if (esEdicion) return;
        GetConsumableTools(machineId)
            .then((data) => setCatalogo(Array.isArray(data) ? data : []))
            .catch((error) => console.error("Error al traer consumibles:", error));
    }, [machineId, esEdicion]);

    const opcionesHerramienta = esEdicion
        ? [{ valor: String(consumibleEditar.tool_id), etiqueta: consumibleEditar.tool?.name ?? "" }]
        : [
              { valor: "", etiqueta: "Seleccione un consumible" },
              ...catalogo.map((t) => ({ valor: String(t.id), etiqueta: t.name })),
          ];

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validarCamposRequeridos({ "Consumible": toolId, "Cantidad": String(cantidad) })) return;

        const cantidadNumerica = Number(cantidad);
        if (!Number.isSafeInteger(cantidadNumerica) || cantidadNumerica < 0 || cantidadNumerica > 1000) {
            advertencia("La cantidad debe ser un número entero entre 0 y 1000.", "Revisa los datos");
            return;
        }

        const camposTexto = { marca, observaciones };
        const camposTextoModificados = esEdicion
            ? Object.fromEntries(
                Object.entries(camposTexto).filter(([campo, valor]) =>
                    valor !== (consumibleEditar[campo === "marca" ? "brand" : "observations"] ?? "")
                )
            )
            : camposTexto;
        const erroresGroserias = validarGroserias(camposTextoModificados);
        if (Object.keys(erroresGroserias).length > 0) {
            advertencia(
                `No se permiten palabras inapropiadas en: ${Object.keys(erroresGroserias).join(", ")}.`,
                "Revisa los datos"
            );
            return;
        }

        const longitudesInvalidas = [
            {
                nombre: "Marca",
                valor: marca,
                original: consumibleEditar?.brand ?? "",
                minimo: 2,
            },
            {
                nombre: "Observaciones",
                valor: observaciones,
                original: consumibleEditar?.observations ?? "",
                minimo: 3,
            },
        ].filter(({ valor, original, minimo }) => {
            const longitud = Array.from(valor.trim()).length;
            return longitud > 0 && longitud < minimo && (!esEdicion || valor !== original);
        });
        if (longitudesInvalidas.length > 0) {
            advertencia(
                longitudesInvalidas.map(({ nombre, minimo }) => `${nombre}: mínimo ${minimo} caracteres`).join(". "),
                "Revisa los datos"
            );
            return;
        }

        if (esEdicion) {
            const sinCambios =
                marca === (consumibleEditar.brand ?? "") &&
                cantidadNumerica === consumibleEditar.stock &&
                observaciones === (consumibleEditar.observations ?? "");
            if (sinCambios) {
                onCancel();
                return;
            }
        }

        const payload = {
            brand: marca.trim() || null,
            stock: cantidadNumerica,
            observations: observaciones.trim() || null,
        };

        try {
            if (esEdicion) {
                await UpdateMachineTool(consumibleEditar.id, payload);
            } else {
                await CreateMachineTool({ ...payload, machine_id: machineId, tool_id: Number(toolId) });
            }
            onGuardado();
            onCancel();
        } catch (error) {
            const tieneErrores = error.response?.data?.errors;
            const mensaje = mensajeDeError(error, "No se pudo guardar el consumible.");
            if (tieneErrores) {
                advertencia(mensaje, "Revisa los datos");
            } else {
                peligro(mensaje, "No se pudo guardar");
            }
        }
    };

    return (
        <Form
            titulo={esEdicion ? "Editar consumible" : "Agregar consumible"}
            descripcion={esEdicion ? "Ingrese los datos que desea editar" : "Seleccione el consumible de la máquina"}
            onCancel={onCancel}
            textoBoton="Guardar"
            iconoBoton="fa-solid fa-floppy-disk"
            onSubmit={handleSubmit}
            noValidate
        >
            <div className="col-span-6">
                <Select
                    label="Consumible:"
                    id="consumible"
                    name="consumible"
                    value={toolId}
                    onChange={(e) => setToolId(e.target.value)}
                    opciones={opcionesHerramienta}
                    required
                />
            </div>
            <div className="col-span-3">
                <Text
                    label="Marca (opcional):"
                    id="marca-consumible"
                    name="marca"
                    placeholder="Marca del consumible"
                    value={marca}
                    onChange={(e) => setMarca(capitalizarPrimeraLetra(e.target.value))}
                    maxLength={esEdicion ? 100 : 50}
                />
            </div>
            <div className="col-span-3">
                <Text
                    label="Cantidad:"
                    id="cantidad-consumible"
                    name="cantidad"
                    type="number"
                    min="0"
                    max="1000"
                    value={cantidad}
                    onChange={(e) => {
                        const valor = e.target.value;
                        if (valor === "" || /^\d+$/.test(valor)) setCantidad(valor);
                    }}
                    required
                />
            </div>
            <div className="col-span-6">
                <Textarea
                    label="Observaciones (opcional):"
                    id="observaciones-consumible"
                    name="observaciones"
                    placeholder="Observaciones del consumible"
                    rows="3"
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                />
            </div>
        </Form>
    );
}

export function CardMachine() {
    const { id } = useParams();
    const [maquina, setMaquina] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [errorMaquina, setErrorMaquina] = useState(null);
    const [maquinaCargadaId, setMaquinaCargadaId] = useState(null);
    const { peligro } = useToast();
    const pedirConfirmacion = useConfirm();
    const [items, setItems] = useState([]);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [consumibleEditar, setConsumibleEditar] = useState(null);

    const { datosPagina, paginaActual, totalPaginas, setPaginaActual} = usePaginacion(items,7)

    const cargar = useCallback(async () => {
        try {
            const data = await GetMachineTools(id);
            setItems(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error al cargar los consumibles:", error);
            peligro(mensajeDeError(error, "No se pudieron cargar los consumibles."), "No se pudieron cargar");
        }
    }, [id, peligro]);

    const obtenerMaquina = useCallback(async () => {
        const data = await GetMachineById(id);
        if (!data) throw new Error("La respuesta no contiene una máquina.");
        return data;
    }, [id]);

    const cargarMaquina = useCallback(async () => {
        setCargando(true);
        setErrorMaquina(null);
        setMaquina(null);
        try {
            setMaquina(await obtenerMaquina());
        } catch (error) {
            console.error("Error al cargar la máquina:", error);
            setErrorMaquina(error.response?.status ?? true);
        } finally {
            setCargando(false);
            setMaquinaCargadaId(id);
        }
    }, [id, obtenerMaquina]);

    useEffect(() => {
        let vigente = true;
        obtenerMaquina()
            .then((data) => {
                if (!vigente) return;
                setMaquina(data);
                setErrorMaquina(null);
            })
            .catch((error) => {
                if (!vigente) return;
                console.error("Error al cargar la máquina:", error);
                setErrorMaquina(error.response?.status ?? true);
            })
            .finally(() => {
                if (!vigente) return;
                setCargando(false);
                setMaquinaCargadaId(id);
            });
        cargar();
        return () => {
            vigente = false;
        };
    }, [cargar, id, obtenerMaquina]);

    const handleAbrirCrear = () => {
        setConsumibleEditar(null);
        setMostrarFormulario(true);
    };

    const handleAbrirEditar = (item) => {
        setConsumibleEditar(item);
        setMostrarFormulario(true);
    };

    const handleEliminar = async (item) => {
        const confirmar = await pedirConfirmacion({
            titulo: "Quitar consumible",
            mensaje: `¿Seguro que quieres quitar "${item.tool?.name}" de esta máquina?`,
        });
        if (!confirmar) return;

        try {
            await DeleteMachineTool(item.id);
            cargar();
        } catch (error) {
            peligro(mensajeDeError(error, "No se pudo quitar el consumible."), "No se pudo eliminar");
        }
    };

    if (cargando || maquinaCargadaId !== id) return <LoadingScreen indeterminado />;
    if (errorMaquina || !maquina) {
        return (
            <div className="cards-grid">
                <div role="alert">
                    <p>
                        No se pudo cargar la máquina
                        {typeof errorMaquina === "number" ? ` (HTTP ${errorMaquina})` : "."}
                    </p>
                    <button type="button" onClick={cargarMaquina}>Reintentar</button>
                </div>
            </div>
        );
    }

    return (
        <div className="cards-grid">

            <PageWelcome
                titulo={`Detalles de ${maquina.name}`}
                descripcion="Detalles de la máquina."
                mostrarHistorial={true}
            />
                <section className="cards">
                    <div className="table-responsive">
                        <table className="form">
                            <tbody>
                                <tr>
                                    <td colSpan="2" rowSpan="4">
                                        <img className="logoSena" src="/src/assets/img/sena-logo-naranja.png" alt="SENA" />
                                    </td>
                                </tr>
                                <tr>
                                    <th colSpan="2">SISTEMA DE GESTIÓN DE SEGURIDAD Y SALUD EN EL TRABAJO</th>
                                    <th>CÓDIGO:</th>
                                    <td>FT-SST 002</td>
                                </tr>
                                <tr>
                                    <th colSpan="2">PROGRAMA DE MANTENIMIENTO</th>
                                    <th>VERSIÓN:</th>
                                    <td>1.0</td>
                                </tr>
                                <tr>
                                    <th colSpan="2">FICHA TÉCNICA {maquina?.name?.toUpperCase()}</th>
                                    <th>FECHA:</th>
                                    <td>8/09/2021</td>
                                </tr>
                                <tr>
                                    <th colSpan="6">IMAGEN:</th>
                                </tr>
                                <tr>
                                    <td colSpan="6">
                                        <div className="equipment-image-container">
                                            <img
                                                src={obtenerUrlImagen(maquina.image)}
                                                alt="Imagen de la maquina"
                                                onError={(m) => {
                                                    m.currentTarget.onerror = null;
                                                    m.currentTarget.src = imagenPorDefecto;
                                                }}
                                            />
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <th>CÓDIGO:</th>
                                    <td>{maquina.code}</td>
                                    <th>NOMBRE:</th>
                                    <td>{maquina.name}</td>
                                    <th>PLACA:</th>
                                    <td>{maquina.plate}</td>
                                </tr>
                                <tr>
                                    <th>MODELO:</th>
                                    <td>{maquina.model}</td>
                                    <th>NÚMERO DE SERIE:</th>
                                    <td>{maquina.serial_number}</td>
                                    <th>FECHA DE INICIO:</th>
                                    <td>{maquina.start_up_date}</td>
                                </tr>
                                <tr>
                                    <th>UBICACIÓN:</th>
                                    <td>{maquina.ubicacion?.name ?? "—"}</td>
                                    <th>RESPONSABLE:</th>
                                    <td>{maquina.responsible}</td>
                                    <th>ESTADO:</th>
                                    <td>{etiquetaEstado(maquina.status)}</td>
                                </tr>
                                <tr>
                                    <th>CONSUMIBLE:</th>
                                    <td>{maquina.fuel}</td>
                                    <th>POTENCIA:</th>
                                    <td>{maquina.power}</td>
                                    <th>VOLTAJE:</th>
                                    <td>{maquina.voltage}</td>
                                </tr>
                                <tr>
                                    <th colSpan="6"> DESCRIPCIÓN: </th>
                                </tr>
                                <tr>
                                    <td colSpan="6">{maquina.characteristics}</td>
                                </tr>
                                <tr>
                                    <th colSpan="6">CONSUMIBLES</th>
                                </tr>
                                <tr>
                                    <th colSpan='2'>Nombre</th>
                                    <th>Marca</th>
                                    <th>Cantidad</th>
                                    <th>Observaciones</th>
                                    <th>Acciones</th>
                                </tr>
                                {datosPagina.map((i) => (
                                    <tr key={i.id}>
                                        <td colSpan='2'>{i.tool?.name}</td>
                                        <td>{i.brand}</td>
                                        <td>{i.stock}</td>
                                        <td>{i.observations}</td>
                                        <td>
                                            <div className="btn-container__acciones">
                                                <BotonAccion
                                                    clase="btn-editar"
                                                    icono={editarIcono}
                                                    iconoDark={editarIconoDark}
                                                    onClick={() => handleAbrirEditar(i)}
                                                    titulo="Editar consumible"
                                                />
                                                <BotonAccion
                                                    clase="btn-borrar"
                                                    icono={borrarIcono}
                                                    onClick={() => handleEliminar(i)}
                                                    titulo="Quitar consumible"
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <br />
                        <div className=" btn-container-page">
                            <Paginacion
                                paginaActual={paginaActual}
                                totalPaginas={totalPaginas}
                                setPaginaActual={setPaginaActual}
                            />

                        </div>
                        
                    </div>
                </section>
                <div className="btn-container">
                     <Boton
                                clase="btn-azul"
                                img={agregarIcon}
                                texto="Nuevo consumible"
                                onClick={handleAbrirCrear}
                                titulo="Agregar consumible a la máquina"
                            />
                    <BotonLink 
                        link={rutaForm(id, "inspection", "/complete")} 
                        clase="btn-2"
                        img={inspeccionIcon} 
                        texto="Inspección" 
                    />

                    <BotonLink
                        link={`/machines/cardMachine/${id}/dailyuse`}
                        clase="btn-2"
                        img={usodiarioIcon} 
                        texto="Uso diario"
                    />
                    <BotonLink 
                        link={rutaForm(id, "preoperational", "/complete")} 
                        clase="btn-2"
                       img={preoperacionalIcon} 
                        texto="Preoperacional" 
                    />
                    
                    <Boton
                        clase="btn-3"
                        img={excelIcon}
                        imgDark={excelIconDark}
                        texto="Exportar Excel"
                        onClick={() => exportarFichaTecnicaMaquinaExcelUnitario(maquina.id, maquina.name)}
                        titulo="Exportar ficha técnica en un archivo de Excel"
                    />
                    <Boton
                        clase="btn-3"
                        img={pdfIcon}
                        imgDark={pdfIconDark}
                        texto="Exportar PDF"
                        onClick={() => exportarFichaTecnicaMaquinaPdfUnitario(maquina.id, maquina.name)}
                        titulo="Exportar ficha técnica en un archivo PDF"
                    />
                    <div className="footer-btns">
                        <BotonLink
                            link="/machines"
                            clase="btn-regresar"
                            img={izquierdaIcon}
                            imgDark={izquierdaIcon2}
                            texto="Regresar"
                        />
                   </div> 
                </div>
                {mostrarFormulario && (
                    <FormularioConsumible
                        key={consumibleEditar?.id ?? "nuevo"}
                        machineId={id}
                        consumibleEditar={consumibleEditar}
                        onCancel={() => setMostrarFormulario(false)}
                        onGuardado={cargar}
                    />
                )}
        </div>
    )
}
