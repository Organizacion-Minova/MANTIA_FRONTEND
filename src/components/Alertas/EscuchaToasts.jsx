import { useEffect } from "react";
import { useToast } from "../../context/ToastContext.jsx";

// Escucha los avisos que lanza api/axios.js (que vive fuera de React)
// y los convierte en los banners de arriba a la derecha.
export default function EscuchaToasts() {
    const { notificar } = useToast();

    useEffect(() => {
        const alRecibir = (e) => {
            const { tipo, mensaje, titulo } = e.detail;
            notificar(tipo, mensaje, titulo);
        };
        window.addEventListener("app:toast", alRecibir);
        return () => window.removeEventListener("app:toast", alRecibir);
    }, [notificar]);

    return null;
}