import React, { useEffect, useState } from "react";
import "../../styles/animations/login.css";
import "../../styles/variables.css";
import loginImage from "../../assets/img/Mantia2..png";
import "../../styles/global.css";
import "../../styles/Components.modules.css";
import { Boton } from "../../components/common/Button";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthScene from "./AuthScene";
import { useAuth } from "../../context/AuthContext.jsx";
import LoadingScreen from "../../components/LoadingScreen.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import Turnstile, { CAPTCHA_ACTIVO } from "../../components/Turnstile.jsx";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { login, loginConLetra } = useAuth();
    const { peligro, advertencia, exito } = useToast();
    const [cargandoLogin, setCargandoLogin] = useState(false);
    const [captchaToken, setCaptchaToken] = useState("");
    const [reinicioCaptcha, setReinicioCaptcha] = useState(0);
    const navigate = useNavigate();
    const [params] = useSearchParams();

    // Resultado del enlace de verificación que llega por correo
    useEffect(() => {
        const resultado = params.get("verificado");
        if (resultado === "1") exito("Correo verificado. Ya puedes iniciar sesión.", "Cuenta activada");
        if (resultado === "expirado") advertencia("El enlace expiró. Regístrate de nuevo.", "Enlace vencido");
        if (resultado === "0") peligro("El enlace de verificación no es válido.", "Enlace inválido");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;

        if (name === "email") {
            setEmail(value);
        }

        if (name === "password") {
            setPassword(value);
        }
    };

    const handleSubmit = async (event) => {
    event.preventDefault();

    const esLetraDev = /^[A-Za-z]$/.test(email.trim());

    if (!esLetraDev && (!email.trim() || !password)) {
        advertencia("Debes completar ambos campos.", "Campos incompletos");
        return;
    }

    // El login rápido por letra (solo desarrollo) no usa captcha
    if (!esLetraDev && CAPTCHA_ACTIVO && !captchaToken) {
        advertencia("Completa la verificación de seguridad.", "Captcha pendiente");
        return;
    }

    setCargandoLogin(true);
    try {
        if (esLetraDev) {
            await loginConLetra(email.trim().toUpperCase());
        } else {
            await login(email, password, captchaToken);
        }
        navigate("/dashboard");
    } catch (err) {
        peligro(err.message, "No se pudo iniciar sesión");
        setCargandoLogin(false);
        setReinicioCaptcha((n) => n + 1); // el captcha se usa una sola vez
    }
};

    // 👇 AQUÍ VA — dentro del componente, antes del return del formulario
    if (cargandoLogin) {
        return <LoadingScreen indeterminado />;
    }

    return (
        <AuthScene>
            <div className="login-container">
                <div className="card-login">
                    <div className="container-img">
                        <img src={loginImage} alt="Mantia" />
                    </div>

                    <div className="container-login">
                        <h3>Inicia Sesión</h3>

                        <form onSubmit={handleSubmit} noValidate>
                            <div className="input-box">
                                <label htmlFor="email">
                                    Correo electrónico:
                                </label>
                                <input
                                    id="email"
                                    type="text"
                                    name="email"
                                    value={email}
                                    onChange={handleChange}
                                    placeholder="usuario@sena.edu.co"
                                    required
                                />
                            </div>

                            <div className="input-box">
                                <label htmlFor="password">Contraseña:</label>
                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                />
                            </div>
                            <Turnstile onToken={setCaptchaToken} reiniciar={reinicioCaptcha} />

                            <Boton
                                clase="btn-azul"
                                texto="Iniciar Sesión"
                            />

                            <div className="links-footer">
                                <span>
                                    ¿No recuerdas tu contraseña?{" "}
                                    <Link to="/ResetPassword">
                                        Restablecer
                                    </Link>
                                </span>
                                <span>
                                    ¿No tienes una cuenta?{" "}
                                    <Link to="/register">Solicitar</Link>
                                </span>
                                <span>
                                <strong>
                                    <Link to="/">
                                         <i className="fa-solid fa-house"></i> Regresar al inicio
                                    </Link>
                                </strong>
                                </span>
                            </div>
                        </form>


                    </div>
                </div>
            </div>
        </AuthScene>
    );
};

export default Login;