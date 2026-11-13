// Captcha de Cloudflare Turnstile (gratis).
// Uso: <Turnstile onToken={setCaptchaToken} reiniciar={contador} />
//   - onToken recibe el token cuando la persona pasa el captcha ("" si expira o falla).
//   - reiniciar: súbele 1 al contador después de un envío fallido; el token se gasta una sola vez.
import { useEffect, useRef } from "react";

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

// Si no hay clave en el .env del frontend, el captcha no se muestra (solo útil en desarrollo).
export const CAPTCHA_ACTIVO = Boolean(SITE_KEY);

let promesaScript = null;

function cargarScript() {
    if (window.turnstile) return Promise.resolve(window.turnstile);

    if (!promesaScript) {
        promesaScript = new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = SCRIPT_SRC;
            script.async = true;
            script.defer = true;
            script.onload = () => resolve(window.turnstile);
            script.onerror = () => {
                promesaScript = null;
                reject(new Error("No se pudo cargar el captcha."));
            };
            document.head.appendChild(script);
        });
    }

    return promesaScript;
}

export default function Turnstile({ onToken, reiniciar = 0 }) {
    const contenedor = useRef(null);
    const widgetId = useRef(null);
    const alToken = useRef(onToken);

    useEffect(() => {
        alToken.current = onToken;
    });

    useEffect(() => {
        if (!SITE_KEY) return undefined;
        let cancelado = false;

        cargarScript()
            .then((turnstile) => {
                if (cancelado || !contenedor.current) return;
                widgetId.current = turnstile.render(contenedor.current, {
                    sitekey: SITE_KEY,
                    language: "es",
                    callback: (token) => alToken.current(token),
                    "expired-callback": () => alToken.current(""),
                    "error-callback": () => alToken.current(""),
                });
            })
            .catch(() => alToken.current(""));

        return () => {
            cancelado = true;
            if (widgetId.current !== null && window.turnstile) {
                window.turnstile.remove(widgetId.current);
                widgetId.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (reiniciar > 0 && widgetId.current !== null && window.turnstile) {
            window.turnstile.reset(widgetId.current);
            alToken.current("");
        }
    }, [reiniciar]);

    if (!SITE_KEY) {
        return import.meta.env.DEV ? (
            <p style={{ fontSize: "0.8rem", opacity: 0.7 }}>
                Captcha desactivado: falta VITE_TURNSTILE_SITE_KEY en el .env del frontend.
            </p>
        ) : null;
    }

    return <div ref={contenedor} style={{ margin: "12px 0", display: "flex", justifyContent: "center" }} />;
}