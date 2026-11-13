import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import "../styles/Alerts/notificaciones-sistema.css";

const ConfirmContext = createContext(null);

const VALORES_POR_DEFECTO = {
    titulo: "Confirmar acción",
    mensaje: "¿Seguro que quieres continuar?",
    textoConfirmar: "Eliminar",
    textoCancelar: "Cancelar",
    tipo: "danger", // "danger" (rojo) | "warning" (amarillo)
};

export function ConfirmProvider({ children }) {
    const [dialogo, setDialogo] = useState(null);
    const resolverRef = useRef(null);
    const cancelarRef = useRef(null);
    const confirmarRef = useRef(null);

    const cerrar = useCallback((respuesta) => {
        resolverRef.current?.(respuesta);
        resolverRef.current = null;
        setDialogo(null);
    }, []);

    // Uso: const ok = await pedirConfirmacion({ titulo, mensaje, textoConfirmar, tipo })
    const pedirConfirmacion = useCallback((opciones = {}) => {
        // Si ya había una pregunta abierta, a esa se le responde "no"
        resolverRef.current?.(false);
        return new Promise((resolve) => {
            resolverRef.current = resolve;
            setDialogo({ ...VALORES_POR_DEFECTO, ...opciones });
        });
    }, []);

    // Mientras está abierto: el foco empieza en "Cancelar" (más seguro al eliminar),
    // Esc cancela y Tab no se sale del cuadro.
    useEffect(() => {
        if (!dialogo) return undefined;

        const anterior = document.activeElement;
        cancelarRef.current?.focus();

        const alPulsar = (e) => {
            if (e.key === "Escape") {
                e.preventDefault();
                cerrar(false);
                return;
            }
            if (e.key === "Tab") {
                e.preventDefault();
                const botones = [cancelarRef.current, confirmarRef.current].filter(Boolean);
                const indice = botones.indexOf(document.activeElement);
                const siguiente = e.shiftKey
                    ? (indice <= 0 ? botones.length - 1 : indice - 1)
                    : (indice + 1) % botones.length;
                botones[siguiente].focus();
            }
        };

        document.addEventListener("keydown", alPulsar);
        return () => {
            document.removeEventListener("keydown", alPulsar);
            anterior?.focus?.();
        };
    }, [dialogo, cerrar]);

    const esPeligro = dialogo?.tipo !== "warning";

    return (
        <ConfirmContext.Provider value={pedirConfirmacion}>
            {children}
            {dialogo && (
                <div className="confirmar-overlay" onMouseDown={() => cerrar(false)}>
                    <div
                        className={`confirmar-dialogo trigger-panel ${esPeligro ? "" : "advertencia"}`}
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="confirmar-titulo"
                        aria-describedby="confirmar-mensaje"
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <svg className="confirmar-icono" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            aria-hidden="true">
                            <path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
                        </svg>
                        <div className="confirmar-texto">
                            <strong id="confirmar-titulo">{dialogo.titulo}</strong>
                            <span id="confirmar-mensaje">{dialogo.mensaje}</span>
                        </div>
                        <div className="confirmar-acciones">
                            <button ref={cancelarRef} type="button" className="btn-2" onClick={() => cerrar(false)}>
                                {dialogo.textoCancelar}
                            </button>
                            <button
                                ref={confirmarRef}
                                type="button"
                                className={`btn-azul ${esPeligro ? "confirmar-peligro" : ""}`}
                                onClick={() => cerrar(true)}
                            >
                                {dialogo.textoConfirmar}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
}

export function useConfirm() {
    const ctx = useContext(ConfirmContext);
    if (!ctx) {
        throw new Error("useConfirm debe usarse dentro de <ConfirmProvider>");
    }
    return ctx;
}