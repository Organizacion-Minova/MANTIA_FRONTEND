import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Boton, BotonLink } from "../../../components/common/Button";
import { PageWelcome } from "../../../components/common/welcome";
import LoadingScreen from "../../../components/LoadingScreen";
import FormatoPapel from "./formpaperequipment";
import { GetInspection } from "../../../api/Equipmentsapi";
import { formatearFechaCorta } from "../../../components/common/Validations";
import { exportarInspeccionEquipoExcelUnitario, exportarInspeccionEquipoPdfUnitario } from "../../../api/Equipmentsapi";

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
                    titulo="Editar la inspección preoperacional de esta semana"
                />
                <BotonLink
                    link={`/equipment/cardequipment/${id}/inspection/records`}
                    clase="btn-2"
                    icono="fa-solid fa-list"
                    texto="Formatos guardados"
                    titulo="Ver inspecciones preoperacionales guardadas"
                />
                <Boton
                    clase="btn-3"
                    icono="fa-solid fa-file-excel"
                    texto="Exportar Excel"
                    onClick={() => exportarInspeccionEquipoExcelUnitario(inspectionId, equipo.name, inspeccion.week_start)}
                    titulo="Exportar inspección preoperacional en un archivo de Excel"
                />
                <Boton
                    clase="btn-3"
                    icono="fa-solid fa-file-pdf"
                    texto="Exportar PDF"
                    onClick={() => exportarInspeccionEquipoPdfUnitario(inspectionId, equipo.name, inspeccion.week_start)}
                    titulo="Exportar inspección preoperacional en un archivo PDF"
                />
                
            </div>
        </div>
    );
}