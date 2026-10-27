import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { GetEquipmentQuestions } from "../../../api/Equipmentsapi";
import LoadingScreen from "../../../components/LoadingScreen";

function InspeccionEquipo() {
    const { id } = useParams();
    const [destino, setDestino] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        setDestino(null);
        setError(false);

        GetEquipmentQuestions(id)
            .then((preguntas) => {
                setDestino(
                    preguntas.length > 0
                        ? `/equipment/${id}/inspection/complete`
                        : `/equipment/${id}/inspection/questions`
                );
            })
            .catch((err) => {
                console.error("Error al verificar las preguntas de inspección:", err);
                setError(true);
            });
    }, [id]);

    if (error) return <p>No se pudo verificar el formato de inspección.</p>;
    if (!destino) return <LoadingScreen indeterminado />;

    return <Navigate to={destino} replace />;
}

export default InspeccionEquipo;