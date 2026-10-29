import { useState, useEffect } from "react";
import { Boton } from "../../components/common/Button";
import { PageWelcome,Searcher } from "../../components/common/welcome";
import { Form, Text, Textarea, Time, Select } from '../../components/common/forms';
import { GetDailyUse, CreateDailyUse, DeleteDailyUse, UpdateDailyUse  } from "../../api/dailyuseapi";
import { GetMachine } from "../../api/machinesapi";
import LoadingScreen from "../../components/LoadingScreen";
import { usePaginacion, Paginacion } from "../../components/common/Paginacion";
import { useSearch } from "../../hooks/useSearch";

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

function Formulario({onCancel, onGuardado, registroEditar}){
    const esEdicion= registroEditar!=null;
    const [date, setDate] = useState(registroEditar?.date || fechaHoy());
    const [operatingStatus, setOperatingStatus] = useState(registroEditar?.operating_status || "");
    const [operationStart, setOperationStart] = useState(horaParaInput(registroEditar?.operation_start));
    const [operationEnd, setOperationEnd] = useState(horaParaInput(registroEditar?.operation_end));
    const [responsible, setResponsible] = useState(registroEditar?.responsible || "");
    const [observations, setObservations] = useState(registroEditar?.observations || "");
    const [machineId, setMachineId] = useState(registroEditar?.machine_id || "");
    const [machines, setMachines] = useState([]);
    const [timeError, setTimeError] = useState("");

    useEffect(() => {
        GetMachine()
            .then((data) => {
                setMachines(data);
            });
    }, []);

    const handleSubmit = async (e) =>{
        e.preventDefault();
        if (operationEnd < operationStart) {
            setTimeError("La hora de fin no puede ser anterior a la hora de inicio.");
            return;
        }
        if (operationEnd == operationStart) {
            setTimeError("Las horas de inicio y fin no pueden ser iguales.");
            return;
        }
        setTimeError("");

        if (esEdicion){
            const sinCambios =
                date === registroEditar.date &&
                operatingStatus === registroEditar.operating_status &&
                operationStart === horaParaInput(registroEditar.operation_start) &&
                operationEnd === horaParaInput(registroEditar.operation_end) &&
                responsible === registroEditar.responsible &&
                observations === registroEditar.observations &&
                machineId === registroEditar.machine_id;
            if (sinCambios) {
                onCancel();
                return;
            }
        }
        const formData = new FormData();
            formData.append("date", date);
            formData.append("operating_status", operatingStatus);
            formData.append("operation_start", operationStart.length === 5 ? `${operationStart}:00` : operationStart);
            formData.append("operation_end", operationEnd.length === 5 ? `${operationEnd}:00` : operationEnd);
            formData.append("responsible", responsible);
            formData.append("observations", observations);
            formData.append("machine_id", machineId);
        try {
            if (esEdicion) {
                await UpdateDailyUse(registroEditar.id, formData);
            } else {
                await CreateDailyUse(formData);
            }
            onGuardado();
            onCancel();
        } catch (error) {
            console.error("Error al guardar el registro:", error);
        }
    }

    return(
        <Form
            titulo={esEdicion ? "Editar registro" : "Agregar nuevo registro"}
            descripcion={esEdicion ? "Edita los datos del registro existente" : "Ingresa los datos del nuevo registro"}
            onCancel={onCancel}
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
                    opciones={[
                        {valor:"",etiqueta:"Seleccione una maquina"},
                        ...machines.map((m)=>({valor:m.id,etiqueta:m.name}))
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
                    required
                />
            </div>
            <div className="col-span-3">
                <Time
                    label="Inicio de operación:"
                    id="inicioOperacion"
                    name="inicioOperacion"
                    value={operationStart}
                    onChange={(e) => {
                        setOperationStart(e.target.value);
                        setTimeError("");
                    }}
                    required
                />
            </div>
            <div className="col-span-3">
                <Time
                    label="Fin de operación:"
                    id="finOperacion"
                    name="finOperacion"
                    value={operationEnd}
                    onChange={(e) => {
                        setOperationEnd(e.target.value);
                        setTimeError("");
                    }}
                    required 
                />
                {timeError && <p className="form-dropzone-error" role="alert">{timeError}</p>}
            </div>
            <div className="col-span-6">
                <Text
                    label="Responsable a cargo:"
                    id="responsable"
                    name="responsable"
                    placeholder="Responsable a cargo:"
                    value={responsible}
                    onChange={(e) => setResponsible(e.target.value)}
                    required
                />
            </div>
            <div className="col-span-6">
                <Textarea
                    label="Observaciones"
                    id="observaciones"
                    name="observaciones"
                    rows={4}
                    placeholder="Observaciones"
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    required
                />
            </div>
        </Form>
    )
}
export function UsoDiario(){
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    let [registro, setRegistro] = useState([]);
    const [registroEditar, setRegistroEditar] = useState([]);
    let [maquinas, setMaquinas] = useState([]);
    const [maquinaSeleccionada, setMaquinaSeleccionada] = useState("");
    const [cargando, setCargando]=useState(true)

    const { busqueda, setBusqueda, itemsFiltrados}=useSearch(
        registro,
        ['date','responsible','observations','operating_status']
    )

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
    const cargarMaquinas = async () => {
        setCargando(true);
        GetMachine()
            .then((data) => {
                setMaquinas(data);
                if (data.length > 0) {
                    setMaquinaSeleccionada(String(data[0].id));
                }
            })
            .catch((error) => {
                console.error("Error al obtener las máquinas:", error);
            })
            .finally(() => {
                setCargando(false);
            });
    };
    useEffect(() => {
        cargarMaquinas();
    }, []);
    const handleEliminarRegistro = async (id) => {
        let confirmacion = window.confirm("¿Estás seguro de que deseas eliminar este registro?");
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
    const registrosFiltrados = itemsFiltrados.filter(
        (r) => r.machine_id === Number(maquinaSeleccionada)
    );
    const { datosPagina, paginaActual, totalPaginas, setPaginaActual } = usePaginacion(registrosFiltrados, 7);
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
                    placeholder="Buscar por fecha, responsable, observaciones o estado de funcionamiento"
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
                                    opciones={maquinas.map((m) => ({ valor: m.id, etiqueta: m.name }))}
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
                                        <div className="btn-container">
                                            <Boton
                                                clase="btn-azul"
                                                icono="fa-solid fa-edit"
                                                onClick={()=>handleAbrirEditar(r)}
                                                titulo="Editar registro"
                                            />
                                            <Boton
                                                clase="btn-2"
                                                icono="fa-solid fa-trash"
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
                        icono="fa-solid fa-plus"
                        texto="Nuevo Registro"
                        onClick={handleAbrirCrear}
                    />
                    <Boton
                        clase="btn-azul"
                        icono="fa-solid fa-file-excel"
                        texto="Exportar Excel"
                    />
                    <Boton
                        clase="btn-azul"
                        icono="fa-solid fa-file-pdf"
                        texto="Exportar Pdf"
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
                    key={registroEditar?.id || "nuevo"}
                    onCancel={() => setMostrarFormulario(false)} 
                    onGuardado={cargarRegistros}
                    registroEditar={registroEditar}
                />
            )}
        </div>
    )
}