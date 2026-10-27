import { useNavigate } from "react-router-dom";
import { rutaDeAlerta } from "../../utils/notificaciones";
import "../../styles/Alerts/notificaciones-sistema.css";

const ICONO_POR_NIVEL = {
    danger: "fa-solid fa-circle-exclamation",
    warning: "fa-solid fa-triangle-exclamation",
    success: "fa-solid fa-circle-check",
    info: "fa-solid fa-circle-info",
};

function NotificacionItem({ notificacion, onMarcarUna, onCerrar }) {
    const navigate = useNavigate();
    const { id, tipo, titulo, mensaje, hora, leida } = notificacion;
    const nivel = ICONO_POR_NIVEL[tipo] ? tipo : "info";

    // Pantalla del registro (ej: ficha de la máquina). Las de inicio de sesión no llevan a ninguna.
    const ruta = rutaDeAlerta(notificacion);
    const clicable = !leida || ruta;

    // Clic: se marca como leída y, si tiene pantalla, lleva a ella y cierra el panel
    const abrir = () => {
        if (!leida) onMarcarUna?.(id);
        if (ruta) {
            onCerrar?.();
            navigate(ruta);
        }
    };

    return (
        <div
            className={`alerta-item nivel-${nivel} ${leida ? "leida" : "sin-leer"} ${ruta ? "con-enlace" : ""}`}
            onClick={abrir}
            onKeyDown={(e) => { if (e.key === "Enter") abrir(); }}
            role={clicable ? "button" : undefined}
            tabIndex={clicable ? 0 : undefined}
            title={ruta ? "Ir a la pantalla de esta alerta" : leida ? undefined : "Clic para marcar como leída"}
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
            {ruta && <i className="fa-solid fa-chevron-right alerta-ir" aria-hidden="true"></i>}
        </div>
    );
}

export default NotificacionItem;