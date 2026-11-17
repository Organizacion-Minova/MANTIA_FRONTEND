import React, { useState } from "react";
import "../../styles/variables.css";
import "../../styles/global.css";
import "../../styles/Components.modules.css";
import "../../styles/animations/login.css";
import { Link, useNavigate } from "react-router-dom";
import { Boton, BotonAccion } from "../../components/common/Button";
import loginImage from "../../assets/img/Mantia2..png";
import AuthScene from "./AuthScene";
import api from "../../api/axios";
import { useToast } from "../../context/ToastContext.jsx";
import { mensajeDeError } from "../../utils/errores";
import Captcha, { CAPTCHA_ACTIVO } from "../../components/Captcha.jsx";
import RequisitosContrasena from "../../components/common/RequisitosContrasena.jsx";
import {
    filtrarCorreo, filtrarCodigo, filtrarContrasena,
    validarCorreo, validarCodigo, validarContrasena, validarConfirmacion, erroresDelServidor,
} from "../../utils/validacionesUsuario";
import verIcono from "../../assets/icons/ver-contrasena.svg";
import verIconoDark from "../../assets/icons/ver-contrasena2.svg";
import ocultarIcono from "../../assets/icons/ocultar.svg";
import ocultarIconoDark from "../../assets/icons/ocultar2.svg";

function ErrorCampo({ mensaje, id }) {
    if (!mensaje) return null;
    return <p id={id} className="error-texto" role="alert">{mensaje}</p>;
}

const ResetPassword = () => {
    const navigate = useNavigate();
    const { peligro, advertencia } = useToast();
    const [step, setStep] = useState(1); // 1: Pedir email, 2: Ingresar código, 3: Nueva contraseña
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [mostrarPassword, setMostrarPassword] = useState(false);
    const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [captchaToken, setCaptchaToken] = useState("");
    const [reinicioCaptcha, setReinicioCaptcha] = useState(0);
    const [errores, setErrores] = useState({});

    // Los avisos de éxito (código enviado / contraseña actualizada) los muestra api/axios.js.
    // Aquí solo se avisan los errores y las validaciones locales.

    // Paso 1: Enviar correo para recibir código
    const handleSendCode = async (e) => {
        e.preventDefault();

        const errorCorreo = validarCorreo(email);
        setErrores({ email: errorCorreo });
        if (errorCorreo) {
            advertencia(errorCorreo, email.trim() ? "Correo inválido" : "Campo incompleto");
            document.getElementById("email")?.focus();
            return;
        }

        if (CAPTCHA_ACTIVO && !captchaToken) {
            advertencia("Escribe los 5 caracteres de la imagen de seguridad.", "Captcha pendiente");
            return;
        }

        try {
            setLoading(true);
            await api.get('/sanctum/csrf-cookie');
            await api.post('/api/forgot-password', { email: email.trim().toLowerCase(), captcha_token: captchaToken });
            setCode("");
            setStep(2);
        } catch (err) {
            setErrores(erroresDelServidor(err));
            setReinicioCaptcha((n) => n + 1); // el captcha se usa una sola vez
            peligro(
                mensajeDeError(err, "No se pudo enviar el código. Verifica el correo."),
                "No se pudo enviar el código"
            );
        } finally {
            setLoading(false);
        }
    };

    // Paso 2: Validar formato del código y avanzar a paso 3
    const handleVerifyCode = (e) => {
        e.preventDefault();

        const errorCodigo = validarCodigo(code);
        setErrores({ code: errorCodigo });
        if (errorCodigo) {
            advertencia(errorCodigo, "Código inválido");
            document.getElementById("code")?.focus();
            return;
        }

        setStep(3);
    };

    // Paso 3: Validar contraseña y enviar { email, code, password } al backend
    const handleResetPassword = async (e) => {
        e.preventDefault();

        const encontrados = {
            password: validarContrasena(password, "La nueva contraseña"),
            confirmPassword: validarConfirmacion(password, confirmPassword),
        };
        setErrores(encontrados);
        if (encontrados.password) {
            advertencia(encontrados.password, "Contraseña no válida");
            document.getElementById("password")?.focus();
            return;
        }
        if (encontrados.confirmPassword) {
            peligro(encontrados.confirmPassword, "Contraseñas distintas");
            document.getElementById("confirmPassword")?.focus();
            return;
        }

        try {
            setLoading(true);
            await api.post('/api/reset-password', {
                email: email.trim().toLowerCase(),
                code,
                password,
                password_confirmation: confirmPassword,
            });
            setTimeout(() => {
                navigate("/login");
            }, 3000);
        } catch (err) {
            const delServidor = erroresDelServidor(err);
            setErrores(delServidor);
            // Si el problema es el código (inválido o vencido), se vuelve al paso del código
            if (delServidor.code || err.response?.status === 400) {
                setCode("");
                setStep(2);
            }
            peligro(
                mensajeDeError(err, "Código inválido o expirado."),
                "No se pudo restablecer la contraseña"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthScene>
            <div className="login-container">
                <div className="card-login">
                    <div className="container-img">
                        <img src={loginImage} alt="Mantia" />
                    </div>

                    <div className="container-login">
                        <h3>Restablecer Contraseña</h3>

                        {step === 1 && (
                            <>
                                <p className="form-description">
                                    Ingresa tu correo registrado para recibir un código de verificación de 6 dígitos.
                                </p>

                                <form onSubmit={handleSendCode} noValidate>
                                    <div className="input-box">
                                        <label htmlFor="email">Correo Electrónico:</label>
                                        <input
                                            id="email"
                                            type="email"
                                            name="email"
                                            placeholder="usuario@ejemplo.com"
                                            autoComplete="email"
                                            maxLength={100}
                                            value={email}
                                            onChange={(e) => { setEmail(filtrarCorreo(e.target.value)); setErrores({}); }}
                                            required
                                            aria-invalid={errores.email ? true : undefined}
                                        />
                                        <ErrorCampo id="email-error" mensaje={errores.email} />
                                    </div>

                                    <Captcha onToken={setCaptchaToken} reiniciar={reinicioCaptcha} />

                                    <Boton
                                        clase="btn-azul"
                                        texto={loading ? "Enviando código..." : "Enviar código de verificación"}
                                        disabled={loading}
                                    />

                                    <div className="links-footer">
                                        <span>
                                            <Link to="/login">Volver al Inicio de Sesión</Link>
                                        </span>
                                        <span>
                                        <Link to="/terms">Términos de uso</Link>
                                        </span>
                                    </div>
                                </form>
                            </>
                        )}

                        {step === 2 && (
                            <>
                                <p className="form-description">
                                    Ingresa el código de 6 dígitos que enviamos a <strong>{email}</strong>.
                                </p>

                                <form onSubmit={handleVerifyCode} noValidate>
                                    <div className="input-box">
                                        <label htmlFor="code">Código de 6 dígitos:</label>
                                        <input
                                            id="code"
                                            type="text"
                                            name="code"
                                            placeholder="Ej: 485920"
                                            inputMode="numeric"
                                            autoComplete="one-time-code"
                                            pattern="[0-9]*"
                                            maxLength={6}
                                            value={code}
                                            onChange={(e) => { setCode(filtrarCodigo(e.target.value)); setErrores({}); }}
                                            onPaste={(e) => { e.preventDefault(); setCode(filtrarCodigo(e.clipboardData.getData("text"))); }}
                                            required
                                            aria-invalid={errores.code ? true : undefined}
                                            style={{ letterSpacing: "4px", fontWeight: "bold", textAlign: "center" }}
                                        />
                                        <ErrorCampo id="code-error" mensaje={errores.code} />
                                    </div>

                                    <Boton
                                        clase="btn-azul"
                                        texto="Continuar"
                                    />

                                    <div className="links-footer">
                                        <span
                                            onClick={() => setStep(1)}
                                            style={{ cursor: "pointer", color: "var(--color-primary)" }}
                                        >
                                            ¿No recibiste el código? Volver a enviar
                                        </span>
                                        <span>
                                            <Link to="/login">Volver al Inicio de Sesión</Link>
                                        </span>
                                    </div>
                                </form>
                            </>
                        )}

                        {step === 3 && (
                            <>
                                <p className="form-description">
                                    Crea y confirma tu nueva contraseña para la cuenta <strong>{email}</strong>.
                                </p>

                                <form onSubmit={handleResetPassword} noValidate>
                                    <div className="input-box password-box">
                                        <label htmlFor="password">Nueva Contraseña:</label>
                                        <input
                                            id="password"
                                            type={mostrarPassword ? "text" : "password"}
                                            name="password"
                                            placeholder="Mínimo 8 caracteres"
                                            autoComplete="new-password"
                                            maxLength={64}
                                            value={password}
                                            onChange={(e) => { setPassword(filtrarContrasena(e.target.value)); setErrores((p) => ({ ...p, password: undefined })); }}
                                            required
                                            aria-invalid={errores.password ? true : undefined}
                                        />
                                        <BotonAccion
                                            clase="btn-toggle-password"
                                            onClick={() => setMostrarPassword((visible) => !visible)}
                                            ariaLabel={mostrarPassword ? "Ocultar contraseña" : "Ver contraseña"}
                                            icono={mostrarPassword ? ocultarIcono : verIcono}
                                            iconoDark={mostrarPassword ? ocultarIconoDark : verIconoDark}
                                        />
                                        <ErrorCampo id="password-error" mensaje={errores.password} />
                                        <RequisitosContrasena valor={password} />
                                    </div>

                                    <div className="input-box password-box">
                                        <label htmlFor="confirmPassword">Confirmar Nueva Contraseña:</label>
                                        <input
                                            id="confirmPassword"
                                            type={mostrarConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            placeholder="Repite tu contraseña"
                                            autoComplete="new-password"
                                            maxLength={64}
                                            value={confirmPassword}
                                            onChange={(e) => { setConfirmPassword(filtrarContrasena(e.target.value)); setErrores((p) => ({ ...p, confirmPassword: undefined })); }}
                                            required
                                            aria-invalid={errores.confirmPassword ? true : undefined}
                                        />
                                        <BotonAccion
                                            clase="btn-toggle-password"
                                            onClick={() => setMostrarConfirmPassword((visible) => !visible)}
                                            ariaLabel={mostrarConfirmPassword ? "Ocultar contraseña" : "Ver contraseña"}
                                            icono={mostrarConfirmPassword ? ocultarIcono : verIcono}
                                            iconoDark={mostrarConfirmPassword ? ocultarIconoDark : verIconoDark}
                                        />
                                        <ErrorCampo id="confirmPassword-error" mensaje={errores.confirmPassword} />
                                    </div>

                                    <Boton
                                        clase="btn-azul"
                                        texto={loading ? "Actualizando..." : "Actualizar Contraseña"}
                                        disabled={loading}
                                    />

                                    <div className="links-footer">
                                        <span
                                            onClick={() => setStep(2)}
                                            style={{ cursor: "pointer", color: "var(--color-primary)" }}
                                        >
                                            Volver a ingresar el código
                                        </span>
                                        <span>
                                            <Link to="/login">Volver al Inicio de Sesión</Link>
                                        </span>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </AuthScene>
    );
};

export default ResetPassword;