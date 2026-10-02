import "../../styles/Alerts/notificaciones-sistema.css";

function RadarPeligro({ titulo, descripcion, onCerrar }) {
    return (
        <div className="demo-radar-card trigger-radar">
            {onCerrar && (
                <button className="cerrar-radar" aria-label="Cerrar alerta" onClick={onCerrar}>
                    ✕
                </button>
            )}
            <h4>⚠ {titulo}</h4>
            <p>{descripcion}</p>
        </div>
    );
}

export default RadarPeligro;