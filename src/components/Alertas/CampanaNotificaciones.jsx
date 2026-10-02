import { useEffect, useRef, useState } from "react";
import PanelNotificaciones from "./PanelNotificaciones";
import "../../styles/Alerts/notificaciones-sistema.css";

function CampanaNotificaciones({ notificaciones, abierto, onToggle, onCerrar, onMarcarTodas }) {
    const campanaRef = useRef(null);
    const [animarCampana, setAnimarCampana] = useState(false);
    const [animarPanel, setAnimarPanel] = useState(false);
    const pendientes = notificaciones.filter((n) => !n.leida).length;
    const pendientesAnteriorRef = useRef(pendientes);

    // Anima la campana automáticamente cuando llegan notificaciones nuevas
    // (por ejemplo, al iniciar sesión, o por el polling cada 30s), sin
    // necesidad de que el usuario haga clic.
    useEffect(() => {
        if (pendientes > pendientesAnteriorRef.current) {
            setAnimarCampana(false);
            requestAnimationFrame(() => setAnimarCampana(true));
        }
        pendientesAnteriorRef.current = pendientes;
    }, [pendientes]);

    useEffect(() => {
        function manejarClicAfuera(event) {
            if (campanaRef.current && !campanaRef.current.contains(event.target)) onCerrar?.();
        }
        document.addEventListener("mousedown", manejarClicAfuera);
        return () => document.removeEventListener("mousedown", manejarClicAfuera);
    }, [onCerrar]);

    useEffect(() => {
        if (!abierto) { setAnimarPanel(false); return; }
        setAnimarPanel(false);
        const raf = requestAnimationFrame(() => setAnimarPanel(true));
        return () => cancelAnimationFrame(raf);
    }, [abierto]);

    function manejarClicCampana(e) {
        e.stopPropagation();
        setAnimarCampana(false);
        requestAnimationFrame(() => setAnimarCampana(true));
        onToggle?.();
    }

    return (
        <div ref={campanaRef} style={{ position: "relative" }}>
            <button className={`bell-btn ${animarCampana ? "trigger-campana" : ""}`} id="btnCampana" title="Alertas"
                onClick={manejarClicCampana} onAnimationEnd={() => setAnimarCampana(false)}>
                <i className="fa-solid fa-bell"></i>
                {pendientes > 0 && <span className="bell-badge" id="bellBadge">{pendientes}</span>}
            </button>
            <PanelNotificaciones abierto={abierto} animar={animarPanel} notificaciones={notificaciones} onMarcarTodas={onMarcarTodas} />
        </div>
    );
}

export default CampanaNotificaciones;