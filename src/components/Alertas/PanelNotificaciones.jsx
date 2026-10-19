import { Boton, BotonLink } from "../common/Button";
import NotificacionItem from "./NotificacionItem";
import "../../styles/Alerts/notificaciones-sistema.css";

function PanelNotificaciones({ abierto, animar, notificaciones, onMarcarTodas }) {
    return (
        <div className={`overlay-panel ${abierto ? "open" : ""} ${animar ? "trigger-panel" : ""}`} id="overlayAlertas">
            <div className="alerts-header">
                <h3><i className="fa-solid fa-bell"></i> Alertas del sistema</h3>
                <Boton clase="mark-all" texto="Marcar todas como leídas" title="Eliminar"
                    onClick={(e) => { e.stopPropagation(); onMarcarTodas?.(); }} />
            </div>
            <div>
                {notificaciones.length === 0 ? (
                    <div className="demo-panel-item">
                        <span className="notificacion-contenido"><p>No hay notificaciones por ahora.</p></span>
                    </div>
                ) : (
                    notificaciones.map((n) => <NotificacionItem key={n.id} notificacion={n} />)
                )}
            </div>
            <div className="alerts-footer">
                <BotonLink link="/Alerts" clase="btn-azul" icono="fa-solid fa-triangle-exclamation" texto="Alertas" />
            </div>
        </div>
    );
}

export default PanelNotificaciones;