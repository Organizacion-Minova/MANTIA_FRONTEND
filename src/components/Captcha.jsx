// Captcha LOCAL: funciona sin internet (lo genera el backend en GET /api/captcha).
// Uso: <Captcha onToken={setCaptchaToken} reiniciar={contador} />
//   - onToken recibe "id:respuesta" cuando la persona escribe los 5 caracteres ("" si está incompleto).
//   - reiniciar: súbele 1 al contador después de un envío fallido; cada imagen sirve una sola vez.
import { useCallback, useEffect, useRef, useState } from "react";
import api from "../api/axios";
import { BotonAccion } from "./common/Button";

export const CAPTCHA_ACTIVO = true;

const LARGO = 5;

export default function Captcha({ onToken, reiniciar = 0 }) {
    const [captcha, setCaptcha] = useState(null); // { id, imagen, expira_en }
    const [respuesta, setRespuesta] = useState("");
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);
    const alToken = useRef(onToken);
    const temporizador = useRef(null);

    useEffect(() => {
        alToken.current = onToken;
    });

    const cargar = useCallback(async () => {
        setCargando(true);
        setError(null);
        setRespuesta("");
        alToken.current("");
        clearTimeout(temporizador.current);

        try {
            const { data } = await api.get("/api/captcha");
            setCaptcha(data);
            // Se cambia sola un poco antes de vencer
            temporizador.current = setTimeout(cargar, Math.max(30, (data.expira_en ?? 300) - 10) * 1000);
        } catch {
            setCaptcha(null);
            setError("No se pudo cargar la imagen de seguridad. Pulsa el botón para intentar de nuevo.");
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        cargar();
        return () => clearTimeout(temporizador.current);
    }, [cargar]);

    useEffect(() => {
        if (reiniciar > 0) cargar();
    }, [reiniciar, cargar]);

    const alEscribir = (e) => {
        // Solo letras y números, en mayúscula, máximo 5
        const limpio = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, LARGO);
        setRespuesta(limpio);
        alToken.current(limpio.length === LARGO && captcha ? `${captcha.id}:${limpio}` : "");
    };

    return (
        <div className="input-box" style={{ margin: "12px 0" }}>
            <label htmlFor="captcha-respuesta">
                Verificación de seguridad <span className="required-mark">*</span>
            </label>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                {captcha ? (
                    <img
                        src={captcha.imagen}
                        alt="Imagen de seguridad con 5 caracteres"
                        width={200}
                        height={64}
                        style={{ borderRadius: 8, opacity: cargando ? 0.5 : 1 }}
                        draggable={false}
                    />
                ) : (
                    <div style={{ width: 200, height: 64, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {cargando ? "Cargando..." : ""}
                    </div>
                )}
                <BotonAccion
                    clase="btn-2"
                    iconoFa="fa-solid fa-rotate-right"
                    titulo="Cambiar imagen"
                    disabled={cargando}
                    onClick={cargar}
                />
            </div>

            <input
                id="captcha-respuesta"
                type="text"
                name="captcha-respuesta"
                placeholder="Escribe los 5 caracteres de la imagen"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                maxLength={LARGO}
                value={respuesta}
                onChange={alEscribir}
                disabled={!captcha}
                required
                style={{ letterSpacing: "4px", textTransform: "uppercase" }}
            />
            {error && <p className="error-texto" role="alert">{error}</p>}
        </div>
    );
}
