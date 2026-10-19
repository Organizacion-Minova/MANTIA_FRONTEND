import { useEffect, useState } from "react";
import "../../styles/Alerts/notificaciones-sistema.css";

function BannerInfo({ titulo = "Información", mensaje, duracion, onCerrar }) {
    const [clave, setClave] = useState(0);
    useEffect(() => { setClave((c) => c + 1); }, [mensaje]);

    useEffect(() => {
        if (!duracion || !onCerrar) return;
        const timer = setTimeout(onCerrar, duracion);
        return () => clearTimeout(timer);
    }, [duracion, onCerrar, mensaje]);

    return (
        <div className="demo-info-banner">
            <svg key={clave} className="svg-info-circle" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" opacity="0.25" />
                <path d="M12 16v-4M12 8h.01" />
            </svg>
            <div className="info-text">
                <strong>{titulo}</strong>
                <span>{mensaje}</span>
            </div>
            {onCerrar && (
                <button className="cerrar-toast" aria-label="Cerrar" onClick={onCerrar}>✕</button>
            )}
        </div>
    );
}

export default BannerInfo;