import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BotonLink } from "../../../components/common/Button";
import { PageWelcome } from "../../../components/common/welcome";
import LoadingScreen from "../../../components/LoadingScreen";
import FormatoPapel from "./formpaperequipment";
import { GetInspection } from "../../../api/Equipmentsapi";
import { formatearFechaCorta } from "../../../components/common/Validations";

export default function VerInspeccion() {
    const { id, inspectionId } = useParams();
    const [inspeccion, setInspeccion] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        GetInspection(inspectionId)
            .then((data) => setInspeccion(data))
            .catch((err) => {
                console.error("Error al cargar la inspección:", err);
                setError(true);
            })
            .finally(() => setCargando(false));
    }, [inspectionId]);

    if (cargando) return <LoadingScreen indeterminado />;
    if (error || !inspeccion) return <p>No se pudo cargar la inspección.</p>;

    const equipo = inspeccion.format.equipment;

    return (
        <div className="list-grid">
            <header className="bienvenida">
                <PageWelcome
                    titulo={`Inspección preoperacional ${equipo.name}`}
                    descripcion={`Semana del ${formatearFechaCorta(inspeccion.week_start)} al ${formatearFechaCorta(inspeccion.week_end)}`}
                />
            </header>

            <FormatoPapel
                format={inspeccion.format}
                equipment={equipo}
                weekStart={inspeccion.week_start}
                weekEnd={inspeccion.week_end}
                inspection={inspeccion}
            />

            <div className="btn-container">
                <BotonLink
                    link={`/equipment/cardequipment/${id}/inspection/complete?week=${inspeccion.week_start}`}
                    clase="btn-azul"
                    icono="fa-solid fa-pen"
                    texto="Editar esta semana"
                />
                <BotonLink
                    link={`/equipment/cardequipment/${id}/inspection/records`}
                    clase="btn-2"
                    icono="fa-solid fa-list"
                    texto="Formatos guardados"
                />
            </div>
        </div>
    );
}