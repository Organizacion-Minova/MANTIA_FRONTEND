import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import "../../styles/variables.css";
import "../../styles/global.css";
import "../../styles/Components.modules.css";
import "../../styles/animations/login.css";
import { Boton, BotonAccion } from "../../components/common/Button";
import loginImage from "../../assets/img/Mantia2..png";
import AuthScene from "./AuthScene";
import { register } from "../../api/auth";
import { useToast } from "../../context/ToastContext.jsx";
import { mensajeDeError } from "../../utils/errores";
import Captcha, { CAPTCHA_ACTIVO } from "../../components/Captcha.jsx";
import RequisitosContrasena from "../../components/common/RequisitosContrasena.jsx";
import {
    TIPOS_DOCUMENTO, REGLAS_DOCUMENTO,
    filtrarNombre, filtrarDocumento, filtrarCorreo, filtrarContrasena,
    validarNombre, validarCorreo, validarDocumento, validarContrasena, validarConfirmacion,
    soloErrores, erroresDelServidor,
} from "../../utils/validacionesUsuario";
import { tieneGroserias } from "../../components/common/Validations";

// Nombre del campo en el backend -> nombre en este formulario
const CAMPOS_SERVIDOR = {
    name: "nombre",
    last_name: "apellido",
    email: "email",
    password: "password",
    document_type: "documentType",
    document_number: "documentNumber",
};

const ETIQUETAS = {
    nombre: "Nombre",
    apellido: "Apellido",
    email: "Correo electrónico",
    password: "Contraseña",
    confirmPassword: "Confirmar contraseña",
    documentType: "Tipo de documento",
    documentNumber: "Número de documento",
};

function ErrorCampo({ mensaje, id }) {
    if (!mensaje) return null;
    return <p id={id} className="error-texto" role="alert">{mensaje}</p>;
}
import verIcono from "../../assets/icons/ver-contrasena.svg"
import verIconoDark from "../../assets/icons/ver-contrasena2.svg"
import ocultarIcono from "../../assets/icons/ocultar.svg"
import ocultarIconoDark from "../../assets/icons/ocultar2.svg"

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
    const [errores, setErrores] = useState({});
    const { peligro, advertencia } = useToast();
    const [loading, setLoading] = useState(false);
    const [aceptaTerminos, setAceptaTerminos] = useState(false);
    const [captchaToken, setCaptchaToken] = useState("");
    const [reinicioCaptcha, setReinicioCaptcha] = useState(0);

    const reglaDocumento = REGLAS_DOCUMENTO[formData.documentType];

    // Cada campo solo deja escribir lo que le corresponde
    const handleChange = (e) => {
        const { name, value } = e.target;
        let limpio = value;

        if (name === "nombre" || name === "apellido") limpio = filtrarNombre(value);
        if (name === "email") limpio = filtrarCorreo(value);
        if (name === "password" || name === "confirmPassword") limpio = filtrarContrasena(value);
        if (name === "documentNumber") limpio = filtrarDocumento(value, formData.documentType);

        setFormData((prev) => {
            const nuevo = { ...prev, [name]: limpio };
            // Al cambiar el tipo, el número se ajusta (por ejemplo, de pasaporte a cédula se quitan las letras)
            if (name === "documentType") nuevo.documentNumber = filtrarDocumento(prev.documentNumber, value);
            return nuevo;
        });
        setErrores((prev) => ({ ...prev, [name]: undefined }));
    };

    const [showPassword, setShowPassword] = useState(false);
     
    
        const togglePasswordVisibility = () => {
            setShowPassword((visible) => !visible);
        };

    const validar = () => soloErrores({
        nombre: validarNombre(formData.nombre, "El nombre") || (tieneGroserias(formData.nombre) ? "El nombre no puede tener palabras inapropiadas." : null),
        apellido: validarNombre(formData.apellido, "El apellido") || (tieneGroserias(formData.apellido) ? "El apellido no puede tener palabras inapropiadas." : null),
        email: validarCorreo(formData.email),
        password: validarContrasena(formData.password),
        confirmPassword: validarConfirmacion(formData.password, formData.confirmPassword),
        documentType: formData.documentType ? null : "Selecciona el tipo de documento.",
        documentNumber: formData.documentType ? validarDocumento(formData.documentType, formData.documentNumber) : null,
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!aceptaTerminos) {
            advertencia("Debes aceptar los términos de uso para completar el registro.", "Términos de uso");
            document.getElementById("aceptaTerminos")?.focus();
            return;
        }

        const encontrados = validar();
        setErrores(encontrados);

        const campos = Object.keys(encontrados);
        if (campos.length > 0) {
            const vacios = campos.filter((c) => !String(formData[c] ?? "").trim());
            if (vacios.length > 0) {
                advertencia(`Completa: ${vacios.map((c) => ETIQUETAS[c]).join(", ")}.`, "Campos incompletos");
            } else {
                advertencia(encontrados[campos[0]], `Revisa: ${ETIQUETAS[campos[0]]}`);
            }
            document.getElementById(campos[0])?.focus();
            return;
        }

        if (CAPTCHA_ACTIVO && !captchaToken) {
            advertencia("Escribe los 5 caracteres de la imagen de seguridad.", "Captcha pendiente");
            return;
        }

        try {
            setLoading(true);
            await register({
                name: formData.nombre.trim(),
                last_name: formData.apellido.trim(),
                email: formData.email.trim().toLowerCase(),
                password: formData.password,
                password_confirmation: formData.confirmPassword,
                document_type: formData.documentType,
                document_number: formData.documentNumber,
                captcha_token: captchaToken
            });
            // El aviso de éxito lo muestra api/axios.js
            setTimeout(() => {
                navigate("/login");
            }, 4000);
        } catch (err) {
            // Los errores del servidor se muestran debajo de cada campo y en un aviso
            const delServidor = erroresDelServidor(err);
            const mapeados = Object.fromEntries(
                Object.entries(delServidor).map(([campo, msg]) => [CAMPOS_SERVIDOR[campo] ?? campo, msg])
            );
            setErrores(mapeados);
            peligro(mensajeDeError(err, "Ocurrió un error al registrarse."), "No se pudo registrar");
            setReinicioCaptcha((n) => n + 1); // el captcha se usa una sola vez
        } finally {
            setLoading(false);
        }
    };

    const propsError = (campo) => ({
        "aria-invalid": errores[campo] ? true : undefined,
        "aria-describedby": errores[campo] ? `${campo}-error` : undefined,
    });

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
                            Diligencia tus datos para crear tu cuenta. Te enviaremos un enlace al correo para activarla; entrarás con el rol Visitante hasta que el administrador te asigne otro.
                        </p>
                        <p className="form-description">
                            Los campos marcados con <span className="required-mark">*</span> son obligatorios.
                        </p>

                        <form onSubmit={handleSubmit} noValidate>
                            <div className="form-row">
                                <div className="input-box">
                                    <label htmlFor="nombre">
                                        Nombre <span className="required-mark">*</span>
                                    </label>
                                    <input
                                        id="nombre"
                                        type="text"
                                        name="nombre"
                                        placeholder="Ej: Juan"
                                        autoComplete="given-name"
                                        maxLength={50}
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        required
                                        {...propsError("nombre")}
                                    />
                                    <ErrorCampo id="nombre-error" mensaje={errores.nombre} />
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
                                        autoComplete="family-name"
                                        maxLength={50}
                                        value={formData.apellido}
                                        onChange={handleChange}
                                        required
                                        {...propsError("apellido")}
                                    />
                                    <ErrorCampo id="apellido-error" mensaje={errores.apellido} />
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
                                    autoComplete="email"
                                    maxLength={100}
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    {...propsError("email")}
                                />
                                <ErrorCampo id="email-error" mensaje={errores.email} />
                            </div>

                            <div className="form-row">
                                <div className="input-box">
                                    <label htmlFor="password">
                                        Contraseña <span className="required-mark">*</span>
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        name="password"
                                        placeholder="Mínimo 8 caracteres"
                                        autoComplete="new-password"
                                        maxLength={64}
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        {...propsError("password")}
                                    />
                                    <ErrorCampo id="password-error" mensaje={errores.password} />
                                    <RequisitosContrasena valor={formData.password} />
                                </div>

                                <div className="input-box password-box">
                                    <label htmlFor="confirmPassword">
                                        Confirmar contraseña <span className="required-mark">*</span>
                                    </label>
                                    <input
                                        id="confirmPassword"
                                        type={showPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        placeholder="Repite tu contraseña"
                                        autoComplete="new-password"
                                        maxLength={64}
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        {...propsError("confirmPassword")}
                                    />
                                    <ErrorCampo id="confirmPassword-error" mensaje={errores.confirmPassword} />
                                    
                                     <BotonAccion
                                     clase="btn-toggle-password"
                                     onClick={togglePasswordVisibility}
                                     ariaLabel={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                                     icono={showPassword ? ocultarIcono : verIcono}
                                     iconoDark={showPassword ? ocultarIconoDark : verIconoDark}
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
                                        {...propsError("documentType")}
                                    >
                                        <option value="">Selecciona...</option>
                                        {TIPOS_DOCUMENTO.map((t) => (
                                            <option key={t.valor} value={t.valor}>{t.etiqueta}</option>
                                        ))}
                                    </select>
                                    <ErrorCampo id="documentType-error" mensaje={errores.documentType} />
                                </div>

                                <div className="input-box">
                                    <label htmlFor="documentNumber">
                                        Número de documento <span className="required-mark">*</span>
                                    </label>
                                    <input
                                        id="documentNumber"
                                        type="text"
                                        name="documentNumber"
                                        inputMode={reglaDocumento?.soloNumeros === false ? "text" : "numeric"}
                                        autoComplete="off"
                                        placeholder={reglaDocumento ? reglaDocumento.ejemplo : "Primero elige el tipo"}
                                        maxLength={reglaDocumento?.max ?? 12}
                                        value={formData.documentNumber}
                                        onChange={handleChange}
                                        disabled={!formData.documentType}
                                        required
                                        {...propsError("documentNumber")}
                                    />
                                    <ErrorCampo id="documentNumber-error" mensaje={errores.documentNumber} />
                                </div>
                            </div>

                            <Captcha onToken={setCaptchaToken} reiniciar={reinicioCaptcha} />

                            <div className="terms-consent">
                                <input
                                    id="aceptaTerminos"
                                    type="checkbox"
                                    checked={aceptaTerminos}
                                    onChange={(e) => setAceptaTerminos(e.target.checked)}
                                    required
                                />
                                <label htmlFor="aceptaTerminos">Acepto los</label>
                                <span>
                                    <Link to="/terms">Términos de uso</Link>
                                </span>
                            </div>

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
