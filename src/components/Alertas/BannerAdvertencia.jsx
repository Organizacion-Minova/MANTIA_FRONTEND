import { useEffect, useState } from "react";
import "../../styles/Alerts/notificaciones-sistema.css";

function BannerAdvertencia({ titulo = "Advertencia", mensaje, duracion, onCerrar }) {
    const [clave, setClave] = useState(0);
    useEffect(() => { setClave((c) => c + 1); }, [mensaje]);

    useEffect(() => {
        if (!duracion || !onCerrar) return;
        const timer = setTimeout(onCerrar, duracion);
        return () => clearTimeout(timer);
    }, [duracion, onCerrar, mensaje]);

    return (
        <div className="demo-warning-banner">
            <svg key={clave} className="svg-warning-circle" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
            </svg>
            <div className="warning-text">
                <strong>{titulo}</strong>
                <span>{mensaje}</span>
            </div>
            {onCerrar && (
                <button className="cerrar-toast" aria-label="Cerrar" onClick={onCerrar}>✕</button>
            )}
        </div>
    );
}

export default BannerAdvertencia;