import { PUNTO_POR_TIPO } from "../../utils/notificaciones";
import "../../styles/Alerts/notificaciones-sistema.css";

function NotificacionItem({ notificacion }) {
    const { tipo, titulo, mensaje, hora } = notificacion;
    const claseColor = PUNTO_POR_TIPO[tipo] ?? "punto-azul";

    return (
        <div className="demo-panel-item">
            <span className={`punto-indicador ${claseColor}`}></span>
            <div className="notificacion-contenido">
                <strong>{titulo}</strong>
                <p>{mensaje}</p>
            </div>
            <span className="notificacion-hora">{hora}</span>
        </div>
    );
}

export default NotificacionItem;