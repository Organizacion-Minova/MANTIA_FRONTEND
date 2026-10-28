import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/variables.css";
import "../../styles/global.css";
import "../../styles/Components.modules.css";
import "../../styles/animations/login.css";
import { Boton } from "../../components/common/Button";
import loginImage from "../../assets/img/Mantia2..png";
import AuthScene from "./AuthScene";
import { register } from "../../api/auth";
import { useToast } from "../../context/ToastContext.jsx";
import { mensajeDeError } from "../../utils/errores";
import Turnstile, { CAPTCHA_ACTIVO } from "../../components/Turnstile.jsx";

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        email: "",
        password: "",
        confirmPassword: "",
        documentType: "",
        documentNumber: ""
    });
        const { peligro, advertencia } = useToast();
        const [loading, setLoading] = useState(false);
        const [captchaToken, setCaptchaToken] = useState("");
        const [reinicioCaptcha, setReinicioCaptcha] = useState(0);
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

const handleSubmit = async (e) => {
    e.preventDefault();

    const obligatorios = [
        ["nombre", "Nombre"],
        ["apellido", "Apellido"],
        ["email", "Correo electrónico"],
        ["password", "Contraseña"],
        ["confirmPassword", "Confirmar contraseña"],
        ["documentType", "Tipo de documento"],
        ["documentNumber", "Número de documento"],
    ];

    const faltante = obligatorios.find(([campo]) => !String(formData[campo] ?? "").trim());
    if (faltante) {
        advertencia(`Completa el campo: ${faltante[1]}.`, "Campos incompletos");
        return;
    }

    if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
        advertencia("Ingresa un correo electrónico válido.", "Correo inválido");
        return;
    }

    if (formData.password.length < 8) {
        advertencia("La contraseña debe tener al menos 8 caracteres.", "Contraseña muy corta");
        return;
    }

    if (formData.password !== formData.confirmPassword) {
        peligro("Las contraseñas no coinciden.", "Contraseñas distintas");
        return;
    }

    if (CAPTCHA_ACTIVO && !captchaToken) {
        advertencia("Completa la verificación de seguridad.", "Captcha pendiente");
        return;
    }

    try {
        setLoading(true);
        await register({
            name: formData.nombre,
            last_name: formData.apellido,
            email: formData.email,
            password: formData.password,
            document_type: formData.documentType,
            document_number: formData.documentNumber,
            captcha_token: captchaToken
        });
        // El aviso de éxito lo muestra api/axios.js
        setTimeout(() => {
            navigate("/login");
        }, 4000);
    } catch (err) {
        peligro(mensajeDeError(err, "Ocurrió un error al registrarse."), "No se pudo registrar");
        setReinicioCaptcha((n) => n + 1); // el captcha se usa una sola vez
    } finally {
        setLoading(false);
    }
};

    return (
        <AuthScene>
            <div className="login-container login-container--ancho">
                <div
                    className="card-login"
                    style={{
                        padding: "30px 42px 26px",
                    }}
                >
                    <div className="container-img">
                        <img src={loginImage} alt="Mantia" />
                    </div>

                    <div className="container-login">
                        <h3>Crear Cuenta</h3>
                        <p className="form-description">
                            Diligencia tus datos para solicitar una cuenta. Una vez creada, el administrador deberá aprobarla antes de que puedas iniciar sesión.
                        </p>
                        <p className="form-description">
                            Los campos marcados con <span className="required-mark">*</span> son obligatorios.
                        </p>

                        <form onSubmit={handleSubmit} noValidate>
                            <div
                                className="form-row"
                            >
                                <div className="input-box">
                                    <label htmlFor="nombre">
                                        Nombre <span className="required-mark">*</span>
                                    </label>
                                    <input
                                        id="nombre"
                                        type="text"
                                        name="nombre"
                                        placeholder="Ej: Juan"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="input-box">
                                    <label htmlFor="apellido">
                                        Apellido <span className="required-mark">*</span>
                                    </label>
                                    <input
                                        id="apellido"
                                        type="text"
                                        name="apellido"
                                        placeholder="Ej: García"
                                        value={formData.apellido}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="input-box">
                                <label htmlFor="email">
                                    Correo electrónico <span className="required-mark">*</span>
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="tucorreo@ejemplo.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div
                                className="form-row"
                            >
                                <div className="input-box">
                                    <label htmlFor="password">
                                        Contraseña <span className="required-mark">*</span>
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        name="password"
                                        placeholder="Mínimo 8 caracteres"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="input-box">
                                    <label htmlFor="confirmPassword">
                                        Confirmar contraseña <span className="required-mark">*</span>
                                    </label>
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        name="confirmPassword"
                                        placeholder="Repite tu contraseña"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="input-box">
                                    <label htmlFor="documentType">
                                        Tipo de documento <span className="required-mark">*</span>
                                    </label>
                                    <select
                                        id="documentType"
                                        name="documentType"
                                        className="form-select"
                                        value={formData.documentType}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Selecciona...</option>
                                        <option value="CC">Cédula de ciudadanía</option>
                                        <option value="CE">Cédula de extranjería</option>
                                        <option value="TI">Tarjeta de identidad</option>
                                        <option value="PA">Pasaporte</option>
                                    </select>
                                </div>

                                <div className="input-box">
                                    <label htmlFor="documentNumber">
                                        Número de documento <span className="required-mark">*</span>
                                    </label>
                                    <input
                                        id="documentNumber"
                                        type="text"
                                        name="documentNumber"
                                        placeholder="Ej: 1020304050"
                                        value={formData.documentNumber}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <Turnstile onToken={setCaptchaToken} reiniciar={reinicioCaptcha} />

                            <Boton
                                clase="btn-azul"
                                texto={loading ? "Registrando..." : "Registrarse"}
                                disabled={loading}
                            />

                            <div className="links-footer">
                                <span>
                                    ¿No recuerdas tu contraseña?{" "}
                                    <Link to="/ResetPassword">Restablecer</Link>
                                </span>
                                <span>
                                    ¿Ya tienes cuenta?{" "}
                                    <Link to="/login">Iniciar sesión</Link>
                                </span>
                                
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthScene>
    );
};

export default Register;