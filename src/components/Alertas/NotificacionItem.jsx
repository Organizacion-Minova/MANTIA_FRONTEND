import { useNavigate } from "react-router-dom";
import { rutaDeAlerta } from "../../utils/notificaciones";
import "../../styles/Alerts/notificaciones-sistema.css";
import advertenciaIcon from "../../assets/icons/advertencia.svg";
import peligroIcon from "../../assets/icons/critico.svg"
import infoIcon from "../../assets/icons/info-notificaciones.svg"
import confirmadoIcon from "../../assets/icons/confirmado.svg"


const ICONO_POR_NIVEL = {
    danger: { src: peligroIcon, alt: "Error" },
    warning: { src: advertenciaIcon, alt: "Advertencia" },
    success: { src: confirmadoIcon, alt: "Confirmación" },
    info: { src: infoIcon, alt: "Información" },
};

function NotificacionItem({ notificacion, onMarcarUna, onCerrar }) {
    const navigate = useNavigate();
    const { id, tipo, titulo, mensaje, hora, leida } = notificacion;
    const nivel = ICONO_POR_NIVEL[tipo] ? tipo : "info";
    const icono = ICONO_POR_NIVEL[nivel];

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
                <img src={icono.src} alt={icono.alt} />
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