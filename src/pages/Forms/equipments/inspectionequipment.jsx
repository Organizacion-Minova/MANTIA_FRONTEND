import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { BotonLink } from "../../../components/common/Button";
import { HasInspectionFormat } from "../../../api/Equipmentsapi";
import LoadingScreen from "../../../components/LoadingScreen";
import izquierdaIcon from "../../../assets/icons/flecha-izquierda.svg";
import izquierdaIcon2 from "../../../assets/icons/flecha-izquierda2.svg";

function InspeccionEquipo() {
    const { id } = useParams();
    const [destino, setDestino] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        setDestino(null);
        setError(false);

        HasInspectionFormat(id)
            .then((existe) => {
                setDestino(
                    existe
                        ? `/equipment/cardequipment/${id}/inspection/complete`
                        : `/equipment/cardequipment/${id}/inspection/questions`
                );
            })
            .catch((err) => {
                console.error("Error al verificar las preguntas de inspección:", err);
                setError(true);
            });
    }, [id]);

    if (error) {
        return (
            <div className="list-grid">
                <p>No se pudo verificar el formato de inspección.</p>
                <div className="btn-container">
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
        );
    }
    if (!destino) return <LoadingScreen indeterminado />;

    return <Navigate to={destino} replace />;
}

export default InspeccionEquipo;