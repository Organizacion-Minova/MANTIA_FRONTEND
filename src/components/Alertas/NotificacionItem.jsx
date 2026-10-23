import "../../styles/Alerts/notificaciones-sistema.css";

const ICONO_POR_NIVEL = {
    danger: "fa-solid fa-circle-exclamation",
    warning: "fa-solid fa-triangle-exclamation",
    success: "fa-solid fa-circle-check",
    info: "fa-solid fa-circle-info",
};

function NotificacionItem({ notificacion, onMarcarUna }) {
    const { id, tipo, titulo, mensaje, hora, leida } = notificacion;
    const nivel = ICONO_POR_NIVEL[tipo] ? tipo : "info";

    const marcar = () => { if (!leida) onMarcarUna?.(id); };

    return (
        <div
            className={`alerta-item nivel-${nivel} ${leida ? "leida" : "sin-leer"}`}
            onClick={marcar}
            onKeyDown={(e) => { if (e.key === "Enter") marcar(); }}
            role={leida ? undefined : "button"}
            tabIndex={leida ? undefined : 0}
            title={leida ? undefined : "Clic para marcar como leída"}
        >
            <span className="alerta-icono">
                <i className={ICONO_POR_NIVEL[nivel]}></i>
            </span>
            <div className="alerta-cuerpo">
                <div className="alerta-titulo">
                    <strong>{titulo}</strong>
                    <span className="alerta-hora">{hora}</span>
                </div>
                <p className="alerta-mensaje">{mensaje}</p>
            </div>
        </div>
    );
}

export default NotificacionItem;