import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { BotonLink } from "../../../components/common/Button";
import { PageWelcome } from "../../../components/common/welcome";
import { Text } from "../../../components/common/forms";
import LoadingScreen from "../../../components/LoadingScreen";
import FormularioRegistroMaquina from "../../../pages/Forms/machines/formmachine";
import { GetMachineFormat, GetMachineRecordPeriod, SaveMachineRecord } from "../../../api/machinesapi";
import { TIPOS, rutaForm, rutaMaquina } from "../../../components/common/Formarchine";
import { fechaHoy } from "../daily_use"
import { useToast } from "../../../context/ToastContext";
import { mensajeDeError } from "../../../utils/errores";

export default function LlenarRegistroMaquina() {
    const { id, kind } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { advertencia, peligro } = useToast();
    const tipo = TIPOS[kind];

    const [datos, setDatos] = useState(null);
    const [fecha, setFecha] = useState(searchParams.get("date") || fechaHoy());
    const [periodo, setPeriodo] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [cargandoPeriodo, setCargandoPeriodo] = useState(false);
    const [error, setError] = useState(false);
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        GetMachineFormat(id)
            .then((data) => {
                if (!data.format && data.category) {
                    // La categoría todavía no tiene formato: a armarlo
                    navigate(rutaForm(id, kind, "/questions"), { replace: true });
                    return;
                }
                setDatos(data);
            })
            .catch((err) => {
                console.error("Error al cargar el formato:", err);
                peligro(mensajeDeError(err, "No se pudo cargar el formato de la máquina."), "No se pudo cargar");
                setError(true);
            })
            .finally(() => setCargando(false));
    }, [id, kind, navigate, peligro]);

    useEffect(() => {
        if (!datos?.format || !fecha) return;
        setCargandoPeriodo(true);
        GetMachineRecordPeriod(id, kind, fecha)
            .then((data) => setPeriodo(data))
            .catch((err) => {
                console.error("Error al cargar el periodo:", err);
                peligro(mensajeDeError(err, "No se pudo cargar el periodo del registro."), "No se pudo cargar");
            })
            .finally(() => setCargandoPeriodo(false));
    }, [datos, fecha, id, kind, peligro]);

    const guardar = async (contenido) => {
        if (enviando) return;
        setEnviando(true);
        try {
            const clave = tipo.diario ? "week_start" : "inspection_date";
            const guardado = await SaveMachineRecord(kind, {
                machine_id: Number(id),
                [clave]: periodo.start,
                ...contenido,
            });
            navigate(rutaForm(id, kind, `/records/${guardado.id}`));
        } catch (err) {
            if (err.response?.status === 422) {
                advertencia(mensajeDeError(err, "Revisa los datos del registro."), "No se pudo guardar");
            } else {
                console.error("Error al guardar el registro:", err);
                peligro(mensajeDeError(err, "No se pudo guardar el registro."), "No se pudo guardar");
            }
        } finally {
            setEnviando(false);
        }
    };

    if (!tipo) return <p>Tipo de formato no válido.</p>;
    if (cargando) return <LoadingScreen indeterminado />;

    if (error || !datos || !datos.category) {
        return (
            <div className="list-grid">
                <p>
                    {error
                        ? "No se pudo cargar el formato."
                        : "Esta máquina no tiene categoría asignada, así que no tiene formato."}
                </p>
                <div className="btn-container">
                    <BotonLink link={rutaMaquina(id)} clase="btn-2" icono="fa-solid fa-arrow-left" texto="Regresar" />
                </div>
            </div>
        );
    }

    return (
        <div className="machine-format-grid">
            <header className="bienvenida">
                <PageWelcome
                    titulo={`${tipo.titulo}: ${datos.machine.name}`}
                    descripcion={tipo.diario ? "Marque cada día de la semana y guarde." : "Complete la inspección y guárdela."}
                    mostrarHistorial={true}
                />
            </header>

            <div className="form-grid machine-format-grid__wide">
                <div className="col-span-3">
                    <Text
                        label={tipo.diario ? "Semana que incluye el día:" : "Fecha de la inspección:"}
                        id="fecha-registro"
                        name="fecha-registro"
                        type="date"
                        value={fecha}
                        onChange={(e) => {
                            if (e.target.value) setFecha(e.target.value);
                        }}
                        required
                    />
                </div>
            </div>

            {periodo?.record && (
                <p className="machine-format-grid__wide">Ya hay un registro guardado para este periodo: al guardar se actualiza.</p>
            )}

            <div className="machine-format-grid__wide">
                {cargandoPeriodo || !periodo ? (
                    <LoadingScreen indeterminado />
                ) : (
                    <FormularioRegistroMaquina
                        key={periodo.start}
                        kind={kind}
                        machine={datos.machine}
                        format={datos.format}
                        start={periodo.start}
                        end={periodo.end}
                        record={periodo.record}
                        onSave={guardar}
                        enviando={enviando}
                    />
                )}
            </div>

            <div className="btn-container">
                <BotonLink 
                    link={rutaForm(id, kind, "/records")} 
                    clase="btn-2"
                    icono="fa-solid fa-list" 
                    texto="Ver formatos guardados"
                    titulo="Ver formatos guardados"
                />
                <BotonLink 
                    link={rutaForm(id, kind, "/edit")} 
                    clase="btn-2"
                    icono="fa-solid fa-pen" 
                    texto="Editar formato"
                    titulo="Editar formato"
                />
                <div className="footer-btns">
                     <BotonLink 
                         link={rutaMaquina(id)} 
                         clase="btn-regresar"
                         icono="fa-solid fa-arrow-left" 
                         texto="Regresar" 
                         titulo="Regresar a la máquina"
                     />
                </div>
            </div>
        </div>
    );
}