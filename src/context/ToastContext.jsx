import { createContext, useCallback, useContext, useRef, useState } from "react";
import BannerExito from "../components/Alertas/BannerExito";
import BannerAdvertencia from "../components/Alertas/BannerAdvertencia";
import BannerError from "../components/Alertas/BannerError";
import BannerInfo from "../components/Alertas/BannerInfo";
import "../styles/Alerts/notificaciones-sistema.css";

const ToastContext = createContext(null);

// Qué componente visual corresponde a cada nivel de gravedad —
// los mismos 4 niveles que ya usa el backend (AlertaSistema: info/warning/danger + success).
const COMPONENTE_POR_TIPO = {
    success: BannerExito,
    warning: BannerAdvertencia,
    danger: BannerError,
    info: BannerInfo,
};

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const idRef = useRef(0);

    const cerrarToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    // Función genérica: notificar('warning', 'Quedan 2 unidades', 'Stock bajo')
    const notificar = useCallback((tipo, mensaje, titulo, duracion = 4000) => {
        const id = ++idRef.current;
        setToasts((prev) => [...prev, { id, tipo, mensaje, titulo, duracion }]);
        return id;
    }, []);

    // Atajos en español para no repetir el string del tipo cada vez.
    const exito = useCallback((mensaje, titulo, duracion) => notificar("success", mensaje, titulo ?? "Operación exitosa", duracion), [notificar]);
    const advertencia = useCallback((mensaje, titulo, duracion) => notificar("warning", mensaje, titulo ?? "Advertencia", duracion), [notificar]);
    const peligro = useCallback((mensaje, titulo, duracion) => notificar("danger", mensaje, titulo ?? "Ocurrió un error", duracion), [notificar]);
    const info = useCallback((mensaje, titulo, duracion) => notificar("info", mensaje, titulo ?? "Información", duracion), [notificar]);

    return (
        <ToastContext.Provider value={{ notificar, exito, advertencia, peligro, info }}>
            {children}
            <div className="toast-contenedor">
                {toasts.map((t) => {
                    const Banner = COMPONENTE_POR_TIPO[t.tipo] ?? BannerInfo;
                    return (
                        <Banner
                            key={t.id}
                            titulo={t.titulo}
                            mensaje={t.mensaje}
                            duracion={t.duracion}
                            onCerrar={() => cerrarToast(t.id)}
                        />
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        throw new Error("useToast debe usarse dentro de <ToastProvider>");
    }
    return ctx;
}