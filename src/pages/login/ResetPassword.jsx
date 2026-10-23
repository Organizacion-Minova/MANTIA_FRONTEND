import React, { useState } from "react";
import "../../styles/variables.css";
import "../../styles/global.css";
import "../../styles/Components.modules.css";
import "../../styles/animations/login.css";
import { Link, useNavigate } from "react-router-dom";
import { Boton } from "../../components/common/Button";
import loginImage from "../../assets/img/Mantia2..png";
import AuthScene from "./AuthScene";
import api from "../../api/axios";
import { useToast } from "../../context/ToastContext.jsx";
import { mensajeDeError } from "../../utils/errores";

const ResetPassword = () => {
    const navigate = useNavigate();
    const { peligro, advertencia } = useToast();
    const [step, setStep] = useState(1); // 1: Pedir email, 2: Ingresar código, 3: Nueva contraseña
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    // Los avisos de éxito (código enviado / contraseña actualizada) los muestra api/axios.js.
    // Aquí solo se avisan los errores y las validaciones locales.

    // Paso 1: Enviar correo para recibir código
    const handleSendCode = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            advertencia("Ingresa tu correo electrónico.", "Campo incompleto");
            return;
        }
        if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
            advertencia("Ingresa un correo electrónico válido.", "Correo inválido");
            return;
        }

        try {
            setLoading(true);
            await api.get('/sanctum/csrf-cookie');
            await api.post('/api/forgot-password', { email: email.trim() });
            setStep(2);
        } catch (err) {
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

        if (!/^\d{6}$/.test(code.trim())) {
            advertencia("El código debe tener exactamente 6 dígitos.", "Código inválido");
            return;
        }

        setStep(3);
    };

    // Paso 3: Validar contraseña y enviar { email, code, password } al backend
    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (password.length < 8) {
            advertencia("La contraseña debe tener al menos 8 caracteres.", "Contraseña muy corta");
            return;
        }

        if (password !== confirmPassword) {
            peligro("Las contraseñas no coinciden.", "Contraseñas distintas");
            return;
        }

        try {
            setLoading(true);
            await api.post('/api/reset-password', {
                email: email.trim(),
                code: code.trim(),
                password
            });
            setTimeout(() => {
                navigate("/login");
            }, 3000);
        } catch (err) {
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
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <Boton
                                        clase="btn-azul"
                                        texto={loading ? "Enviando código..." : "Enviar código de verificación"}
                                        disabled={loading}
                                    />

                                    <div className="links-footer">
                                        <span>
                                            <Link to="/login">Volver al Inicio de Sesión</Link>
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
                                            maxLength={6}
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            required
                                            style={{ letterSpacing: "4px", fontWeight: "bold", textAlign: "center" }}
                                        />
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
                                    <div className="input-box">
                                        <label htmlFor="password">Nueva Contraseña:</label>
                                        <input
                                            id="password"
                                            type="password"
                                            name="password"
                                            placeholder="Mínimo 8 caracteres"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="input-box">
                                        <label htmlFor="confirmPassword">Confirmar Nueva Contraseña:</label>
                                        <input
                                            id="confirmPassword"
                                            type="password"
                                            name="confirmPassword"
                                            placeholder="Repite tu contraseña"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
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