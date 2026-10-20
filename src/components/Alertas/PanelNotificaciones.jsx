import { useState } from "react";
import { Boton, BotonLink } from "../common/Button";
import NotificacionItem from "./NotificacionItem";
import "../../styles/Alerts/notificaciones-sistema.css";

const FILTROS = [
    { clave: "todas", etiqueta: "Todas" },
    { clave: "sin-leer", etiqueta: "Sin leer" },
    { clave: "graves", etiqueta: "Graves" },
];

const MENSAJE_VACIO = {
    todas: "No hay notificaciones por ahora.",
    "sin-leer": "Estás al día: no tienes alertas sin leer.",
    graves: "No hay alertas graves.",
};

function PanelNotificaciones({ abierto, animar, notificaciones, onMarcarTodas, onMarcarUna, onCerrar }) {
    const [filtro, setFiltro] = useState("todas");

    const sinLeer = notificaciones.filter((n) => !n.leida).length;
    const graves = notificaciones.filter((n) => n.tipo === "danger").length;
    const conteo = { todas: notificaciones.length, "sin-leer": sinLeer, graves };

    const visibles = notificaciones.filter((n) => {
        if (filtro === "sin-leer") return !n.leida;
        if (filtro === "graves") return n.tipo === "danger";
        return true;
    });

    return (
        <div
            className={`overlay-panel ${abierto ? "open" : ""} ${animar ? "trigger-panel" : ""}`}
            id="overlayAlertas"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="alerts-header">
                <h3>
                    <i className="fa-solid fa-bell"></i> Alertas del sistema
                    {sinLeer > 0 && <span className="alerts-contador">{sinLeer}</span>}
                </h3>
                <Boton
                    clase="mark-all"
                    texto="Marcar todas como leídas"
                    titulo="Marcar todas como leídas"
                    disabled={sinLeer === 0}
                    onClick={(e) => { e.stopPropagation(); onMarcarTodas?.(); }}
                />
            </div>

            <div className="alerts-tabs" role="tablist">
                {FILTROS.map((f) => (
                    <button
                        key={f.clave}
                        type="button"
                        role="tab"
                        aria-selected={filtro === f.clave}
                        className={`alerts-tab ${filtro === f.clave ? "activa" : ""}`}
                        onClick={(e) => { e.stopPropagation(); setFiltro(f.clave); }}
                    >
                        {f.etiqueta} ({conteo[f.clave]})
                    </button>
                ))}
            </div>

            <div className="alerts-list">
                {visibles.length === 0 ? (
                    <div className="alerts-vacio">
                        <i className="fa-regular fa-bell-slash"></i>
                        <p>{MENSAJE_VACIO[filtro]}</p>
                    </div>
                ) : (
                    visibles.map((n) => (
                        <NotificacionItem key={n.id} notificacion={n} onMarcarUna={onMarcarUna} />
                    ))
                )}
            </div>

            <div className="alerts-footer" onClick={() => onCerrar?.()}>
                <BotonLink link="/Alerts" clase="btn-azul" icono="fa-solid fa-triangle-exclamation" texto="Ver todas las alertas" />
            </div>
        </div>
    );
}

export default PanelNotificaciones;