import React from "react";

import "../../styles/variables.css";
import "../../styles/global.css";
import "../../styles/components.modules.css";
import "../../styles/animations/login.css";
import loginImage from "../../assets/img/Mantia2..png";
import AuthScene from "./AuthScene";

const ResetPassword = () => {
    return (
        <AuthScene>
            <div className="login-container">
                <div className="card-login">
                    <div className="container-img">
                        <img src={loginImage} alt="Mantia" />
                    </div>

                    <div className="container-login">
                        <h3>Restablecer Contraseña</h3>

                        <p className="form-description">
                            Ingresa tu correo registrado para enviarte las
                            instrucciones de recuperación.
                        </p>

                        <form>
                            <div className="input-box">
                                <label htmlFor="email">Correo Electrónico:</label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="usuario@sena.edu.co"
                                />
                            </div>

                            <div className="input-box">
                                <label htmlFor="newPassword">
                                    Nueva Contraseña:
                                </label>
                                <input
                                    id="newPassword"
                                    type="password"
                                    name="newPassword"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div className="input-box">
                                <label htmlFor="confirmNewPassword">
                                    Confirmar Nueva Contraseña:
                                </label>
                                <input
                                    id="confirmNewPassword"
                                    type="password"
                                    name="confirmNewPassword"
                                    placeholder="••••••••"
                                />
                            </div>

                            <button type="button" className="btn-buscar">
                                Actualizar Contraseña
                            </button>

                            <div className="links-footer">
                                <span>
                                    <a href="/login">
                                        Volver al Inicio de Sesión
                                    </a>
                                </span>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthScene>
    );
};

export default ResetPassword;