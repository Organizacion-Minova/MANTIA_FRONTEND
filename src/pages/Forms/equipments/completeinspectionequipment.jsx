import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { BotonLink } from "../../../components/common/Button";
import { PageWelcome } from "../../../components/common/welcome";
import { Date as CampoFecha } from "../../../components/common/forms";
import LoadingScreen from "../../../components/LoadingScreen";
import izquierdaIcon from "../../../assets/icons/flecha-izquierda.svg";
import izquierdaIcon2 from "../../../assets/icons/flecha-izquierda2.svg";
import FormatoInspeccion from "./forminspectionequipment";
import { GetEquipmentInspectionFormat, GetInspectionWeek, SaveInspection } from "../../../api/Equipmentsapi";
import { fechaHoy } from "../daily_use";

export default function LlenarInspeccion() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [datos, setDatos] = useState(null);
    const [semana, setSemana] = useState(searchParams.get("week") || fechaHoy());
    const [semanaInfo, setSemanaInfo] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [cargandoSemana, setCargandoSemana] = useState(false);
    const [error, setError] = useState(false);
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        GetEquipmentInspectionFormat(id)
            .then((data) => {
                if (!data.format) {
                    navigate(`/equipment/cardequipment/${id}/inspection/questions`, { replace: true });
                    return;
                }
                setDatos(data);
            })
            .catch((err) => {
                console.error("Error al cargar el formato:", err);
                setError(true);
            })
            .finally(() => setCargando(false));
    }, [id]);

    useEffect(() => {
        if (!datos || !semana) return;
        setCargandoSemana(true);
        GetInspectionWeek(datos.format.id, semana)
            .then((data) => setSemanaInfo(data))
            .catch((err) => console.error("Error al cargar la semana:", err))
            .finally(() => setCargandoSemana(false));
    }, [datos, semana]);

    const guardar = async (contenido) => {
        if (enviando) return;
        setEnviando(true);
        try {
            const guardada = await SaveInspection({
                format_id: datos.format.id,
                week_start: semanaInfo.week_start,
                ...contenido,
            });
            navigate(`/equipment/cardequipment/${id}/inspection/records/${guardada.id}`);
        } catch (err) {
            if (err.response?.status !== 422) {
                console.error("Error al guardar la inspección:", err);
            }
        } finally {
            setEnviando(false);
        }
    };

    if (cargando) return <LoadingScreen indeterminado />;

    if (error || !datos) {
        return (
            <div className="list-grid">
                <p>No se pudo cargar el formato de inspección.</p>
                <div className="btn-container">
                    <BotonLink link={`/equipment/${id}`} clase="btn-regresar" img={izquierdaIcon} imgDark={izquierdaIcon2} texto="Regresar" />
                </div>
            </div>
        );
    }

    return (
        <div className="equipment-format-grid">
            <header className="bienvenida">
                <PageWelcome
                    titulo={`Inspección preoperacional ${datos.equipment.name}`}
                    descripcion="Complete el formato de la semana y guárdelo."
                    mostrarHistorial={true}
                />
            </header>

            <div className="form-grid equipment-format-grid__wide">
                <div className="col-span-3">
                    <CampoFecha
                        label="Semana que incluye el día:"
                        id="semana"
                        name="semana"
                        value={semana}
                        onChange={(e) => setSemana(e.target.value)}
                    />
                </div>
            </div>

            {semanaInfo?.inspection && (
                <p className="equipment-format-grid__wide">Ya hay una inspección guardada de esta semana: al guardar se actualiza.</p>
            )}

            <div className="equipment-format-grid__wide">
                {cargandoSemana || !semanaInfo ? (
                    <LoadingScreen indeterminado />
                ) : (
                    <FormatoInspeccion
                        key={semanaInfo.week_start}
                        format={datos.format}
                        equipment={datos.equipment}
                        weekStart={semanaInfo.week_start}
                        weekEnd={semanaInfo.week_end}
                        inspection={semanaInfo.inspection}
                        onSave={guardar}
                        enviando={enviando}
                    />
                )}
            </div>

            <div className="btn-container">
                
                <BotonLink
                    link={`/equipment/cardequipment/${id}/inspection/records`}
                    clase="btn-2"
                    icono="fa-solid fa-list"
                    texto="Ver formatos guardados"
                    titulo="Ver inspecciones guardadas"
                />
                
                <BotonLink
                    link={`/equipment/cardequipment/${id}/inspection/edit`}
                    clase="btn-2"
                    icono="fa-solid fa-pen"
                    texto="Editar formato"
                    titulo="Editar el formato de inspección"
                />
                <div className="footer-btns">
                    <BotonLink
                        link={`/equipment/cardequipment/${id}`}
                        clase="btn-regresar"
                        img={izquierdaIcon}
                        imgDark={izquierdaIcon2}
                        texto="Regresar"
                        titulo="Regresar a la página del equipo"
                     />
                </div>
            </div>
        </div>
    );
}