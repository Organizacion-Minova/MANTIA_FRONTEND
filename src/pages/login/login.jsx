import React, { useState } from "react";
import "../../styles/animations/login.css";
import "../../styles/variables.css";
import loginImage from "../../assets/img/Mantia2..png";
import "../../styles/global.css";
import "../../styles/components.modules.css";
import { Boton } from "../../components/common/Button";
import { Link } from "react-router-dom";
import AuthScene from "./AuthScene";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;

        if (name === "email") {
            setEmail(value);
        }

        if (name === "password") {
            setPassword(value);
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Debes completar ambos campos.");
            return;
        }

        console.log("Login con:", { email, password });
    };

    return (
        <AuthScene>
            <div className="login-container">
                <div className="card-login">
                    <div className="container-img">
                        <img src={loginImage} alt="Mantia" />
                    </div>

                    <div className="container-login">
                        <h3>Inicia Sesión</h3>

                        <form onSubmit={handleSubmit}>
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

                            <div className="input-box">
                                <label htmlFor="password">Contraseña:</label>
                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
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
                                    <Link to="/register">Registrarme</Link>
                                </span>
                            </div>
                        </form>

                        {error && <p className="error-message">{error}</p>}
                    </div>
                </div>
            </div>
        </AuthScene>
    );
};

export default Login;
