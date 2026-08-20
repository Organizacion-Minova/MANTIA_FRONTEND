import React from "react";
import { Link } from "react-router-dom";
import "../../styles/variables.css";
import "../../styles/global.css";
import "../../styles/components.modules.css";
import "../../styles/animations/login.css";
import loginImage from "../../assets/img/Mantia2..png";
import AuthScene from "./AuthScene";

const Register = () => {
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

                        <form>
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
                                />
                            </div>

                            <div
                                className="form-row"
                            >
                                <div className="input-box">
                                    <label htmlFor="rol">Postularse para rol</label>
                                    <select id="rol" name="rol">
                                        <option value="">Selecciona un rol</option>
                                        <option value="Administrador">Administrador</option>
                                        <option value="Recepcionista">Recepcionista</option>
                                        <option value="Tecnico">Técnico</option>
                                    </select>
                                </div>

                                <div className="input-box">
                                    <label htmlFor="tipoTecnico">
                                        Tipo de técnico <span className="required-mark">*</span>
                                    </label>
                                    <select id="tipoTecnico" name="tipoTecnico">
                                        <option value="">Selecciona una especialidad</option>
                                        <option value="Electricista">Electricista</option>
                                        <option value="Mecanico">Mecánico</option>
                                        <option value="Operador">Operador</option>
                                        <option value="Supervisor">Supervisor</option>
                                    </select>
                                </div>
                            </div>

                            <div
                                className="form-row"
                            >
                                <div className="input-box">
                                    <label htmlFor="tipoDoc">
                                        Tipo de documento <span className="required-mark">*</span>
                                    </label>
                                    <select id="tipoDoc" name="tipoDoc">
                                        <option value="">Selecciona</option>
                                        <option value="CC">Cédula de Ciudadanía</option>
                                        <option value="TI">Tarjeta de Identidad</option>
                                        <option value="PP">Pasaporte</option>
                                        <option value="CE">Cédula de Extranjería</option>
                                    </select>
                                </div>

                                <div className="input-box">
                                    <label htmlFor="numDoc">
                                        No. de documento <span className="required-mark">*</span>
                                    </label>
                                    <input
                                        id="numDoc"
                                        type="text"
                                        name="numDoc"
                                        placeholder="Solo números"
                                        inputMode="numeric"
                                    />
                                </div>
                            </div>

                            <div
                                className="form-row"
                            >
                                <div className="input-box">
                                    <label htmlFor="telefono">
                                        Teléfono / Celular <span className="required-mark">*</span>
                                    </label>
                                    <input
                                        id="telefono"
                                        type="tel"
                                        name="telefono"
                                        placeholder="Ej: 3001234567"
                                        inputMode="numeric"
                                    />
                                </div>

                                <div className="input-box">
                                    <label htmlFor="password">
                                        Contraseña <span className="required-mark">*</span>
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        name="password"
                                        placeholder="Mínimo 8 caracteres"
                                    />
                                </div>
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
                                />
                            </div>

                            <button type="button" className="btn-buscar">
                                Crear mi cuenta
                            </button>

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