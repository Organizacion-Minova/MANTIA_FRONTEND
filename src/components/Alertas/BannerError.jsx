import { useEffect, useState } from "react";
import "../../styles/Alerts/notificaciones-sistema.css";

function BannerError({ titulo = "Ocurrió un error", mensaje, duracion, onCerrar }) {
    const [clave, setClave] = useState(0);
    useEffect(() => { setClave((c) => c + 1); }, [mensaje]);

    useEffect(() => {
        if (!duracion || !onCerrar) return;
        const timer = setTimeout(onCerrar, duracion);
        return () => clearTimeout(timer);
    }, [duracion, onCerrar, mensaje]);

    return (
        <div className="demo-error-banner">
            <svg key={clave} className="svg-error-circle" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" opacity="0.25" />
                <path d="M15 9l-6 6M9 9l6 6" />
            </svg>
            <div className="error-text">
                <strong>{titulo}</strong>
                <span>{mensaje}</span>
            </div>
            {onCerrar && (
                <button className="cerrar-toast" aria-label="Cerrar" onClick={onCerrar}>✕</button>
            )}
        </div>
    );
}

export default BannerError;