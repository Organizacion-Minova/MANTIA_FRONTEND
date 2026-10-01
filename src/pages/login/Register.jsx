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

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        if (formData.password !== formData.confirmPassword) {
            setError("Las contraseñas no coinciden");
            return;
        }

        try {
            setLoading(true);
            const fullName = `${formData.nombre} ${formData.apellido}`;
            await register({
                name: fullName,
                email: formData.email,
                password: formData.password
            });
            setSuccessMessage("¡Registro exitoso! Tu cuenta está pendiente de aprobación por el administrador. Te notificaremos por correo cuando sea aprobada.");
            setTimeout(() => {
                navigate("/login");
            }, 4000);
        } catch (err) {
            setError(err.response?.data?.message || "Ocurrió un error al registrarse");
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
                            Los campos marcados con <span className="required-mark">*</span> son obligatorios.
                        </p>

                        {error && <div style={{ color: "#d9534f", marginBottom: "15px", fontSize: "14px" }}>{error}</div>}
                        {successMessage && <div style={{ color: "#5cb85c", marginBottom: "15px", fontSize: "14px" }}>{successMessage}</div>}

                        <form onSubmit={handleSubmit}>
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

                            <Boton
                                clase="btn-azul"
                                texto={loading ? "Registrando..." : "Crear mi cuenta"}
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
                                <Link to="/">Ir al inicio</Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthScene>
    );
};

export default Register;