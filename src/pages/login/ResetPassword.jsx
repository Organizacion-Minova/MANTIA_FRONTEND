import React, { useState } from "react";
import "../../styles/variables.css";
import "../../styles/global.css";
import "../../styles/components.modules.css";
import "../../styles/animations/login.css";
import { Link, useNavigate } from "react-router-dom";
import { Boton } from "../../components/common/Button";
import loginImage from "../../assets/img/Mantia2..png";
import AuthScene from "./AuthScene";
import api from "../../api/axios";

const ResetPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Pedir email, 2: Ingresar código, 3: Nueva contraseña
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Paso 1: Enviar correo para recibir código
    const handleSendCode = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        try {
            setLoading(true);
            await api.get('/sanctum/csrf-cookie');
            await api.post('/api/forgot-password', { email });
            setMessage("¡Código de 6 dígitos enviado a tu correo!");
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || "No se pudo enviar el código. Verifica el correo.");
        } finally {
            setLoading(false);
        }
    };

    // Paso 2: Validar formato del código y avanzar a paso 3
    const handleVerifyCode = (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        const trimmedCode = code.trim();
        if (trimmedCode.length !== 6) {
            setError("El código debe tener exactamente 6 dígitos.");
            return;
        }

        setStep(3);
    };

    // Paso 3: Validar contraseña y enviar { email, code, password } al backend
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (password.length < 8) {
            setError("La contraseña debe tener al menos 8 caracteres.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        try {
            setLoading(true);
            await api.post('/api/reset-password', {
                email,
                code: code.trim(),
                password
            });
            setMessage("¡Contraseña restablecida con éxito! Redirigiendo al login...");
            setTimeout(() => {
                navigate("/login");
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Código inválido o expirado.");
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

                                {error && <div style={{ color: "#d9534f", marginBottom: "15px", fontSize: "14px" }}>{error}</div>}
                                {message && <div style={{ color: "#5cb85c", marginBottom: "15px", fontSize: "14px" }}>{message}</div>}

                                <form onSubmit={handleSendCode}>
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

                                {error && <div style={{ color: "#d9534f", marginBottom: "15px", fontSize: "14px" }}>{error}</div>}
                                {message && <div style={{ color: "#5cb85c", marginBottom: "15px", fontSize: "14px" }}>{message}</div>}

                                <form onSubmit={handleVerifyCode}>
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
                                            onClick={() => {
                                                setError("");
                                                setMessage("");
                                                setStep(1);
                                            }}
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

                                {error && <div style={{ color: "#d9534f", marginBottom: "15px", fontSize: "14px" }}>{error}</div>}
                                {message && <div style={{ color: "#5cb85c", marginBottom: "15px", fontSize: "14px" }}>{message}</div>}

                                <form onSubmit={handleResetPassword}>
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
                                            onClick={() => {
                                                setError("");
                                                setMessage("");
                                                setStep(2);
                                            }}
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
