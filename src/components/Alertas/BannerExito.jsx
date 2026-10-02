import { useEffect, useState } from "react";
import "../../styles/Alerts/notificaciones-sistema.css";

function BannerExito({ titulo = "Operación exitosa", mensaje, duracion, onCerrar }) {
    const [clave, setClave] = useState(0);
    useEffect(() => { setClave((c) => c + 1); }, [mensaje]);

    // Si se pasa duración y un callback de cierre, se autooculta (uso tipo "toast").
    // Si no se pasan, se queda fijo (uso embebido dentro de una página/formulario).
    useEffect(() => {
        if (!duracion || !onCerrar) return;
        const timer = setTimeout(onCerrar, duracion);
        return () => clearTimeout(timer);
    }, [duracion, onCerrar, mensaje]);

    return (
        <div className="demo-success-banner">
            <svg key={clave} className="svg-check-circle" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" opacity="0.25" />
                <path d="M7 12.5l3 3 7-7" />
            </svg>
            <div className="success-text">
                <strong>{titulo}</strong>
                <span>{mensaje}</span>
            </div>
            {onCerrar && (
                <button className="cerrar-toast" aria-label="Cerrar" onClick={onCerrar}>✕</button>
            )}
        </div>
    );
}

export default BannerExito;