import React, { useEffect, useState } from "react";
import "../../styles/animations/login.css";
import "../../styles/variables.css";
import loginImage from "../../assets/img/Mantia2..png";
import "../../styles/global.css";
import "../../styles/Components.modules.css";
import { Boton, BotonAccion } from "../../components/common/Button";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthScene from "./AuthScene";
import { useAuth } from "../../context/AuthContext.jsx";
import LoadingScreen from "../../components/LoadingScreen.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import Captcha, { CAPTCHA_ACTIVO } from "../../components/Captcha.jsx";
import { filtrarCorreo, validarCorreo } from "../../utils/validacionesUsuario";
import verIcono from "../../assets/icons/ver-contrasena.svg"
import verIconoDark from "../../assets/icons/ver-contrasena2.svg"
import ocultarIcono from "../../assets/icons/ocultar.svg"
import ocultarIconoDark from "../../assets/icons/ocultar2.svg"


const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useAuth();
    const { peligro, advertencia, exito } = useToast();
    const [cargandoLogin, setCargandoLogin] = useState(false);
    const [captchaToken, setCaptchaToken] = useState("");
    const [reinicioCaptcha, setReinicioCaptcha] = useState(0);
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const [showPassword, setShowPassword] = useState(false);
 

    const togglePasswordVisibility = () => {
        setShowPassword((visible) => !visible);
    };

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

        // Sin espacios y con el mismo límite que valida el servidor
        if (name === "email") {
            setEmail(filtrarCorreo(value));
        }

        if (name === "password") {
            setPassword(value.slice(0, 64));
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!email.trim() || !password) {
            advertencia("Debes completar ambos campos.", "Campos incompletos");
            return;
        }

        const errorCorreo = validarCorreo(email);
        if (errorCorreo) {
            advertencia(errorCorreo, "Correo inválido");
            return;
        }

        if (CAPTCHA_ACTIVO && !captchaToken) {
            advertencia("Escribe los 5 caracteres de la imagen de seguridad.", "Captcha pendiente");
            return;
        }

        setCargandoLogin(true);
        try {
            await login(email.trim().toLowerCase(), password, captchaToken);
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
                                    type="email"
                                    name="email"
                                    value={email}
                                    onChange={handleChange}
                                    placeholder="usuario@sena.edu.co"
                                    required
                                />
                            </div>

                            <div className="input-box password-box">
                                <label htmlFor="password">Contraseña:</label>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                />

                                <BotonAccion
                                    clase="btn-toggle-password"
                                    onClick={togglePasswordVisibility}
                                    ariaLabel={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                                    icono={showPassword ? ocultarIcono : verIcono}
                                    iconoDark={showPassword ? ocultarIconoDark : verIconoDark}
                                />
                            </div>
                            <Captcha onToken={setCaptchaToken} reiniciar={reinicioCaptcha} />

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
                                    <Link to="/">
                                        <i className="fa-solid fa-house"></i> Regresar al inicio
                                    </Link>
                                </span>
                                <span>
                                    <Link to="/terms">Términos de uso</Link>
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