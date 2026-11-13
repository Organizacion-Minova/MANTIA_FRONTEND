import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Boton, BotonAccion, BotonLink } from "../../components/common/Button";
import { PageWelcome,Searcher } from "../../components/common/welcome";
import { Form, Text, Textarea, Time, Select } from '../../components/common/forms';
import { GetDailyUse, CreateDailyUse, DeleteDailyUse, UpdateDailyUse  } from "../../api/dailyuseapi";
import { GetMachine } from "../../api/machinesapi";
import LoadingScreen from "../../components/LoadingScreen";
import { usePaginacion, Paginacion } from "../../components/common/Paginacion";
import { useSearch } from "../../hooks/useSearch";
import { useRolesResponsables } from "../../hooks/useRolesResponsables";
import { exportarUsoDiarioExcelUnitario, exportarUsoDiarioPdfUnitario } from "../../api/dailyuseapi";
import { useConfirm } from "../../context/ConfirmContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { validarGroserias, capitalizarPrimeraLetra } from "../../components/common/Validations";
import { validarCamposRequeridos } from "../../components/common/requiredFields";
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
import reestablecerFiltrosIcon from "../../assets/icons/reestablecerFiltros.svg";

const obtenerClaveBorrador = (usuarioId) => `mantia_borrador_uso_diario_${usuarioId}`;

const obtenerBorrador = (usuarioId) => {
    if (!usuarioId) return null;

    try {
        const borrador = sessionStorage.getItem(obtenerClaveBorrador(usuarioId));
        return borrador ? JSON.parse(borrador) : null;
    } catch (error) {
        console.error("Error al recuperar el borrador de uso diario:", error);
        return null;
    }
};

const eliminarBorrador = (usuarioId) => {
    if (!usuarioId) return;
    sessionStorage.removeItem(obtenerClaveBorrador(usuarioId));
};

export function fechaHoy() {
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");
    return `${anio}-${mes}-${dia}`;
}
function horaParaInput(hora) {
    return hora ? hora.slice(0, 5) : "";
}

function Formulario({onCancel, onGuardado, registroEditar, usuarioId, maquinaIdFija}){
    const esEdicion= registroEditar!=null;
    const [borradorInicial] = useState(() => (
        esEdicion ? null : obtenerBorrador(usuarioId)
    ));
    const [date, setDate] = useState(borradorInicial?.date ?? registroEditar?.date ?? fechaHoy());
    const [operatingStatus, setOperatingStatus] = useState(borradorInicial?.operatingStatus ?? registroEditar?.operating_status ?? "");
    const [operationStart, setOperationStart] = useState(borradorInicial?.operationStart ?? horaParaInput(registroEditar?.operation_start));
    const [operationEnd, setOperationEnd] = useState(borradorInicial?.operationEnd ?? horaParaInput(registroEditar?.operation_end));
    const [responsible, setResponsible] = useState(borradorInicial?.responsible ?? registroEditar?.responsible ?? "");
    const [observations, setObservations] = useState(borradorInicial?.observations ?? registroEditar?.observations ?? "");
    const [machineId, setMachineId] = useState(
        maquinaIdFija ?? borradorInicial?.machineId ?? registroEditar?.machine_id ?? ""
    );
    const [machines, setMachines] = useState([]);
    const { advertencia, peligro } = useToast();
    const opcionesResponsable = useRolesResponsables(registroEditar?.responsible);
    const hayDatosIngresados = [
        operatingStatus,
        operationStart,
        operationEnd,
        responsible,
        observations,
        machineId,
    ].some((valor) => String(valor ?? "").trim() !== "") || date !== fechaHoy();

    useEffect(() => {
        GetMachine()
            .then((data) => {
                setMachines(data);
            });
    }, []);

    const maquinasFormulario = maquinaIdFija
        ? machines.filter((machine) => String(machine.id) === String(maquinaIdFija))
        : machines;

    useEffect(() => {
        if (esEdicion || !usuarioId) return;

        try {
            if (!hayDatosIngresados) {
                eliminarBorrador(usuarioId);
                return;
            }

            sessionStorage.setItem(
                obtenerClaveBorrador(usuarioId),
                JSON.stringify({
                    date,
                    operatingStatus,
                    operationStart,
                    operationEnd,
                    responsible,
                    observations,
                    machineId,
                })
            );
        } catch (error) {
            console.error("Error al guardar el borrador de uso diario:", error);
        }
    }, [
        esEdicion,
        usuarioId,
        hayDatosIngresados,
        date,
        operatingStatus,
        operationStart,
        operationEnd,
        responsible,
        observations,
        machineId,
    ]);

    const pedirConfirmacion = useConfirm();

    const handleSubmit = async (e) =>{
        e.preventDefault();
        if (!validarCamposRequeridos({
            "Máquina": machineId,
            "Estado de funcionamiento": operatingStatus,
            "Hora de inicio": operationStart,
            "Hora de fin": operationEnd,
            "Responsable": responsible,
        })) return;

        const camposTexto = [
            {
                campo: "Estado de funcionamiento",
                valor: operatingStatus,
                original: registroEditar?.operating_status ?? "",
            },
            {
                campo: "Responsable",
                valor: responsible,
                original: registroEditar?.responsible ?? "",
            },
            {
                campo: "Observaciones",
                valor: observations,
                original: registroEditar?.observations ?? "",
            },
        ];
        const camposTextoModificados = esEdicion
            ? camposTexto.filter(({ valor, original }) => valor !== original)
            : camposTexto;
        const erroresGroserias = validarGroserias(
            Object.fromEntries(camposTextoModificados.map(({ campo, valor }) => [campo, valor]))
        );
        if (Object.keys(erroresGroserias).length > 0) {
            advertencia(
                `No se permiten palabras inapropiadas en: ${Object.keys(erroresGroserias).join(", ")}.`,
                "Revisa los datos"
            );
            return;
        }

        const camposConLongitudMinima = [
            { nombre: "Estado de funcionamiento", valor: operatingStatus, minimo: 3 },
            { nombre: "Responsable", valor: responsible, minimo: 3 },
            { nombre: "Observaciones", valor: observations, minimo: 3, opcional: true },
        ];
        const camposInvalidos = camposConLongitudMinima.filter(({ nombre, valor, minimo, opcional }) => {
            const longitud = Array.from(String(valor).trim()).length;
            const original = camposTexto.find((campo) => campo.campo === nombre)?.original ?? "";
            return (opcional && longitud === 0)
                ? false
                : longitud > 0 && longitud < minimo && (!esEdicion || valor !== original);
        });
        if (camposInvalidos.length > 0) {
            advertencia(
                camposInvalidos
                    .map(({ nombre, minimo }) => `${nombre}: mínimo ${minimo} caracteres`)
                    .join(". "),
                "Mínimo de caracteres"
            );
            return;
        }

        if (operationEnd < operationStart) {
            advertencia("La hora de fin no puede ser anterior a la hora de inicio.", "Revisa las horas");
            return;
        }
        if (operationEnd == operationStart) {
            advertencia("Las horas de inicio y fin no pueden ser iguales.", "Revisa las horas");
            return;
        }

        if (esEdicion){
            const sinCambios =
                date === registroEditar.date &&
                operatingStatus === registroEditar.operating_status &&
                operationStart === horaParaInput(registroEditar.operation_start) &&
                operationEnd === horaParaInput(registroEditar.operation_end) &&
                responsible === registroEditar.responsible &&
                observations === registroEditar.observations &&
                String(machineId) === String(registroEditar.machine_id);
            if (sinCambios) {
                onCancel();
                return;
            }
        }
        const formData = new FormData();
            formData.append("date", date);
            formData.append("operating_status", capitalizarPrimeraLetra(operatingStatus.trim()));
            formData.append("operation_start", operationStart.length === 5 ? `${operationStart}:00` : operationStart);
            formData.append("operation_end", operationEnd.length === 5 ? `${operationEnd}:00` : operationEnd);
            formData.append("responsible", capitalizarPrimeraLetra(responsible.trim()));
            formData.append("observations", capitalizarPrimeraLetra(observations.trim()));
            formData.append("machine_id", machineId);
        try {
            if (esEdicion) {
                await UpdateDailyUse(registroEditar.id, formData);
            } else {
                await CreateDailyUse(formData);
                eliminarBorrador(usuarioId);
            }
            onGuardado();
            onCancel();
        } catch (error) {
            console.error("Error al guardar el registro:", error);
            if (error.response?.status === 422) {
                advertencia(mensajeDeError(error, "Revisa los datos del registro."), "No se pudo guardar");
            } else {
                peligro(mensajeDeError(error, "No se pudo guardar el registro."), "No se pudo guardar");
            }
        }
    }

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
            titulo={esEdicion ? "Editar registro" : "Agregar nuevo registro"}
            descripcion={esEdicion ? "Edita los datos del registro existente" : "Ingresa los datos del nuevo registro"}
            onCancel={onCancel}
            onDiscard={!esEdicion && hayDatosIngresados ? handleDescartar : undefined}
            textoBoton="Guardar"
            iconoBoton="fa-solid fa-floppy-disk"
            onSubmit={handleSubmit}
        >
            <div className="col-span-3">
                <Select
                    label="Máquina:"
                    id="maquina" 
                    name="maquina"
                    value={machineId}
                    onChange={(e) => setMachineId(e.target.value)}
                    disabled={Boolean(maquinaIdFija)}
                    opciones={[
                        ...(maquinaIdFija
                            ? (maquinasFormulario.length
                                ? maquinasFormulario.map((machine) => ({ valor: machine.id, etiqueta: machine.name }))
                                : [{ valor: maquinaIdFija, etiqueta: "Máquina seleccionada" }])
                            : [
                                { valor: "", etiqueta: "Seleccione una maquina" },
                                ...maquinasFormulario.map((machine) => ({ valor: machine.id, etiqueta: machine.name })),
                            ]),
                    ]}
                    required
                />
            </div>
            <div className="col-span-3">
                <Text
                    label="Verificación del estado de funcionamiento:"
                    id="estadofuncionamiento"
                    name="estadofuncionamiento"
                    placeholder="Verifique el estado del funcionamiento"
                    value={operatingStatus}
                    onChange={(e) => setOperatingStatus(e.target.value)}
                    maxLength={10}
                    required
                />
            </div>
            <div className="col-span-3">
                <Time
                    label="Inicio de operación:"
                    id="inicioOperacion"
                    name="inicioOperacion"
                    value={operationStart}
                    onChange={(e) => setOperationStart(e.target.value)}
                    required
                />
            </div>
            <div className="col-span-3">
                <Time
                    label="Fin de operación:"
                    id="finOperacion"
                    name="finOperacion"
                    value={operationEnd}
                    onChange={(e) => setOperationEnd(e.target.value)}
                    required 
                />
            </div>
            <div className="col-span-6">
                <Select
                    label="Responsable a cargo:"
                    id="responsable"
                    name="responsable"
                    value={responsible}
                    onChange={(e) => setResponsible(e.target.value)}
                    opciones={opcionesResponsable}
                    required
                />
            </div>
            <div className="col-span-6">
                <Textarea
                    label="Observaciones (opcional):"
                    id="observaciones"
                    name="observaciones"
                    rows={4}
                    placeholder="Observaciones"
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    maxLength={500}
                />
            </div>
        </Form>
    )
}
export function UsoDiario(){
    const { id: maquinaIdFija } = useParams();
    const { usuario } = useAuth();
    const usuarioId = usuario?.id;
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    let [registro, setRegistro] = useState([]);
    const [registroEditar, setRegistroEditar] = useState([]);
    let [maquinas, setMaquinas] = useState([]);
    const [maquinaSeleccionada, setMaquinaSeleccionada] = useState(maquinaIdFija ?? "");
    const [cargando, setCargando]=useState(true)

    const { busqueda, setBusqueda, rangoFecha, setRangoFecha, itemsFiltrados}=useSearch(
        registro,
        ['date','responsible','observations','operating_status'],
        "date"
    )
    const hayFiltros = busqueda.trim() !== "" || rangoFecha.trim() !== "";

    const handleBorrarFiltros = () => {
        setBusqueda("");
        setRangoFecha("");
        setPaginaActual(1);
    };

    const cargarRegistros = async () => {
        setCargando(true);
        GetDailyUse()
            .then((data) => {
                setRegistro(data);
            })
            .catch((error) => {
                console.error("Error al obtener los registros:", error);
            })
            .finally(() => {
                setCargando(false);
            });
    };
    useEffect(() => {
        cargarRegistros();
    }, []);
    const cargarMaquinas = useCallback(async () => {
        setCargando(true);
        GetMachine()
            .then((data) => {
                setMaquinas(data);
                if (maquinaIdFija) {
                    setMaquinaSeleccionada(String(maquinaIdFija));
                } else if (data.length > 0) {
                    setMaquinaSeleccionada(String(data[0].id));
                }
            })
            .catch((error) => {
                console.error("Error al obtener las máquinas:", error);
            })
            .finally(() => {
                setCargando(false);
            });
    }, [maquinaIdFija]);
    useEffect(() => {
        cargarMaquinas();
    }, [cargarMaquinas]);
    const pedirConfirmacion = useConfirm();
    const handleEliminarRegistro = async (id) => {
        let confirmacion = await pedirConfirmacion({
            titulo: "Eliminar registro",
            mensaje: "¿Seguro que quieres eliminar este registro de uso diario? Esta acción no se puede deshacer.",
        });
        if (!confirmacion) return
        try {
            await DeleteDailyUse(id);
            cargarRegistros();
        } catch (error) {
            console.error("Error al eliminar el registro:", error);
        }
    };
    const handleAbrirCrear=()=>{
        setRegistroEditar(null);
        setMostrarFormulario(true);
    }
    const handleAbrirEditar=(registro)=>{
        setRegistroEditar(registro);
        setMostrarFormulario(true);
    }

    const handleExportarExcel = () => {
        if (!maquinaSeleccionada) return;
        const maquinaActiva = maquinas.find((m) => String(m.id) === String(maquinaSeleccionada));
        const nombreMaquina = maquinaActiva ? maquinaActiva.name : "Maquina";
        exportarUsoDiarioExcelUnitario(maquinaSeleccionada, nombreMaquina);
    };

    const handleExportarPdf = () => {
        if (!maquinaSeleccionada) return;
        const maquinaActiva = maquinas.find((m) => String(m.id) === String(maquinaSeleccionada));
        const nombreMaquina = maquinaActiva ? maquinaActiva.name : "Maquina";
        exportarUsoDiarioPdfUnitario(maquinaSeleccionada, nombreMaquina);
    };

    const registrosFiltrados = itemsFiltrados.filter(
        (r) => String(r.machine_id) === String(maquinaSeleccionada)
    );
    const { datosPagina, paginaActual, totalPaginas, setPaginaActual } = usePaginacion(registrosFiltrados, 7);
    const maquinasVisibles = maquinaIdFija
        ? maquinas.filter((machine) => String(machine.id) === String(maquinaIdFija))
        : maquinas;
    if (cargando) 
        return <LoadingScreen indeterminado/>

    return(
        <div className="list-grid">
            <header>
                <PageWelcome
                    titulo={"USO DIARIO"}
                    descripcion={"Este es el formato de uso diario de la"}
                    mostrarHistorial={true}
                />
                <Searcher
                    value={busqueda}
                    onChange={(e) => {
                        setBusqueda(e.target.value);
                        setPaginaActual(1);
                    }}
                    rangoFecha={rangoFecha}
                    onRangoFechaChange={(valor) => {
                        setRangoFecha(valor);
                        setPaginaActual(1);
                    }}
                    placeholder="Buscar por fecha, responsable, observaciones o estado de funcionamiento"
                    filtrosAdicionales={
                        <>
                        {hayFiltros && (
                            <BotonAccion
                                clase='btn-borrar'
                                icono={reestablecerFiltrosIcon}
                                texto="Borrar filtros"
                                onClick={handleBorrarFiltros}
                                titulo="Quitar la búsqueda y el filtro de fechas"
                            />
                        )}
                    </>
                    }
                      
                />
           </header>
            <div className="table-responsive">
                <table className="form">
                    <tbody>
                        <tr>
                            <th colSpan="7">REGISTRO DIARIO DE USO DE MAQUINARIA Y EQUIPOS MINA DIDÁCTICA</th>
                        </tr>
                        <tr>
                            <th colSpan="2">NOMBRE MÁQUINA:</th>
                            <td colSpan="5" >
                                <Select
                                    id="maquinas"
                                    name="maquinas"
                                    value={maquinaSeleccionada}
                                    onChange={(e) => {
                                        setMaquinaSeleccionada(e.target.value);
                                        setPaginaActual(1);
                                    }}
                                    disabled={Boolean(maquinaIdFija)}
                                    opciones={maquinaIdFija
                                        ? (maquinasVisibles.length
                                            ? maquinasVisibles.map((machine) => ({ valor: machine.id, etiqueta: machine.name }))
                                            : [{ valor: maquinaIdFija, etiqueta: "Máquina seleccionada" }])
                                        : maquinasVisibles.map((machine) => ({ valor: machine.id, etiqueta: machine.name }))}
                                />
                            </td>
                        </tr>
                        <tr>
                            <th>Fecha</th>
                            <th>Verificación de estado de <br/> funcionamiento de la máquina</th>
                            <th>Inicio de operación</th>
                            <th>Fin de operación</th>
                            <th>Responsable a cargo</th>
                            <th>Observaciones</th>
                            <th>Acciones</th>
                        </tr>
                            {datosPagina.map((r)=>(
                                <tr>
                                    <td>{r.date}</td>
                                    <td>{r.operating_status}</td>
                                    <td>{r.operation_start}</td>
                                    <td>{r.operation_end}</td>
                                    <td>{r.responsible}</td>
                                    <td>{r.observations}</td>
                                    <td>
                                        <div className="btn-container__acciones">
                                            <BotonAccion
                                                clase="btn-editar"
                                                icono={editarIcono}
                                                iconoDark={editarIconoDark}
                                                onClick={()=>handleAbrirEditar(r)}
                                                titulo="Editar registro"
                                            />
                                            <BotonAccion
                                                clase="btn-borrar"
                                                icono={borrarIcono}
                                                onClick={() => handleEliminarRegistro(r.id)}
                                                titulo="Eliminar registro"
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
                    <Boton
                        clase="btn-azul"
                        img={agregarIcon}
                        texto="Nuevo Registro"
                        onClick={handleAbrirCrear}
                    />
                    <Boton
                        clase="btn-3"
                        img={excelIcon}
                        imgDark={excelIconDark}
                        texto="Exportar Excel"
                        onClick={handleExportarExcel}
                    />
                    <Boton
                        clase="btn-3"
                        img={pdfIcon}
                        imgDark={pdfIconDark}
                        texto="Exportar Pdf"
                        onClick={handleExportarPdf}
                    />
                    {maquinaIdFija && (
                        <div className="footer-btns">
                            <BotonLink
                                link={`/machines/cardMachine/${maquinaIdFija}`}
                                clase="btn-regresar"
                                img={izquierdaIcon}
                                imgDark={izquierdaIcon2}
                                texto="Volver a la máquina"
                            />
                        </div>
                    )}
                </div>
                <Paginacion
                    paginaActual={paginaActual}
                    totalPaginas={totalPaginas}
                    setPaginaActual={setPaginaActual}
                />
            </div>
            {mostrarFormulario && (
                <Formulario 
                    key={registroEditar?.id || "nuevo"}
                    onCancel={() => setMostrarFormulario(false)} 
                    onGuardado={cargarRegistros}
                    registroEditar={registroEditar}
                    usuarioId={usuarioId}
                    maquinaIdFija={maquinaIdFija}
                />
            )}
        </div>
    )
}