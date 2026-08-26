import { useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/Components.modules.css";
import { useAuth } from "../../context/AuthContext.jsx";
import AppLayout from "../../components/layout/AppLayout.jsx";
import PublicLayout from "../../components/layout/PublicLayout.jsx";

/* ---------- pequeños bloques reutilizables de la página ---------- */

function Circulo({ icono, tamano = "2.75rem" }) {
    return (
        <div
            style={{
                width: tamano,
                height: tamano,
                borderRadius: "50%",
                background: "var(--hover-principal)",
                color: "var(--secundario)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.1rem",
                flexShrink: 0,
            }}
        >
            <i className={icono}></i>
        </div>
    );
}

function Tarjeta({ icono, titulo, texto }) {
    const [hover, setHover] = useState(false);

    return (
        <div
            className="date"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                textAlign: "left",
                boxShadow: hover
                    ? "var(--sombra-contenedor-hover)"
                    : "var(--sombra-contenedor)",
                transform: hover
                    ? "translateY(-0.25rem)"
                    : "translateY(0)",
                transition:
                    "box-shadow .25s ease, transform .25s ease",
            }}
        >
            <Circulo icono={icono} />

            <br />

            <h3>{titulo}</h3>

            <br />

            <p style={{ color: "var(--texto2)" }}>
                {texto}
            </p>
        </div>
    );
}

function Chip({ icono, children }) {
    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                border: "0.125rem solid var(--secundario)",
                color: "var(--secundario)",
                borderRadius: "3.125rem",
                padding: "0.4rem 0.9rem",
                fontSize: "0.8rem",
                fontWeight: 700,
                margin: "0.25rem 0.5rem 0.25rem 0",
            }}
        >
            <i className={icono}></i>
            {children}
        </span>
    );
}

function FilaContacto({ icono, titulo, texto }) {
    return (
        <div
            className="contact-row"
            style={{
                display: "flex",
                alignItems: "center",
                gap: "0.9rem",
                padding: "0.85rem 0",
            }}
        >
            <Circulo
                icono={icono}
                tamano="2.5rem"
            />

            <div>
                <strong
                    style={{
                        display: "block",
                        color: "var(--texto)",
                    }}
                >
                    {titulo}
                </strong>

                <span style={{ color: "var(--texto2)" }}>
                    {texto}
                </span>
            </div>
        </div>
    );
}

/* ---------------------------- contenido ---------------------------- */

const valores = [
    {
        icono: "fa-solid fa-industry",
        titulo: "¿Qué es MANTIA?",
        texto:
            "Un sistema de mantenimiento e inventario de activos para el sector minero: máquinas, equipos, herramientas y ubicaciones controlados desde un solo lugar.",
    },
    {
        icono: "fa-solid fa-bullseye",
        titulo: "Misión",
        texto:
            "Optimizar el mantenimiento preventivo y correctivo y el control de repuestos y herramientas, reduciendo tiempos de parada y facilitando decisiones.",
    },
    {
        icono: "fa-solid fa-eye",
        titulo: "Visión",
        texto:
            "Ser una herramienta de referencia para la digitalización del mantenimiento industrial y minero en pequeñas y medianas empresas del país.",
    },
    {
        icono: "fa-solid fa-shield-halved",
        titulo: "Seguridad y roles",
        texto:
            "Manejo de roles de usuario y monitoreo de protocolos, con trazabilidad sobre cada acción realizada dentro de la plataforma.",
    },
];

const tecnologias = [
    {
        icono: "fa-brands fa-react",
        nombre: "React",
    },
    {
        icono: "fa-solid fa-bolt",
        nombre: "Vite",
    },
    {
        icono: "fa-solid fa-route",
        nombre: "React Router",
    },
    {
        icono: "fa-solid fa-palette",
        nombre: "CSS a medida",
    },
];

/* ----------------------- equipo de desarrollo ----------------------- */

const equipoDesarrollo = [
    {
        nombre: "Dilan Santiago",
        rol: "Frontend Developer",
        imagen: "/santiago2.png",
    },
    {
        nombre: "Kevin el papu",
        rol: "Backend Developer",
        imagen: "/kev.jpeg",
    },
    {
        nombre: "Leox Rodriguez",
        rol: "Diseño",
        imagen: "/leox.jpeg",
    },
    {
        nombre: "Alvaro Sebastian",
        rol: "Base de datos",
        imagen: "/seba.jpeg",
    },
        {
        nombre: "daniela rojas",
        rol: "Frontend Developer",
        imagen: "/mantia-log.png",
    },
];

/* ---------------------------- componente ---------------------------- */

function AcercaDe() {

    const { isAuthenticated } = useAuth();
    const Layout = isAuthenticated ? AppLayout : PublicLayout;

    return (
        <Layout>
        <div className="public-page">

            {/* ================= HERO ================= */}

            <div
                style={{
                    background: "var(--principal)",
                    color: "var(--blanco)",
                    borderRadius: "1.25rem",
                    padding: "3rem 2rem",
                    textAlign: "center",
                    boxShadow: "var(--sombra-contenedor-hover)",
                }}
            >
                <span
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        background: "rgba(255,255,255,.15)",
                        padding: "0.35rem 1rem",
                        borderRadius: "3.125rem",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        letterSpacing: "0.02em",
                        marginBottom: "1rem",
                    }}
                >
                    <i className="fa-solid fa-graduation-cap"></i>
                    PROYECTO FORMATIVO SENA
                </span>

              <div
    style={{
        marginBottom: "1.25rem",
        display: "flex",
        justifyContent: "center",
    }}
>
                <div
                className="date"
                style={{
            padding: "1rem 1.6rem",
            boxShadow:
                "0 0.25rem 1rem rgba(0,0,0,.18)",
                }}
            >
        <img
            src="/mantia-logo.png"
            alt="MANTIA"
            style={{ height: "2.4rem", display: "block" }}
                />
                </div>
            </div>

            <p
            style={{
        maxWidth: "40rem",
        margin: "0.6rem auto 0",
        opacity: 0.92,
            }}
        >
    Mantenimiento e inventario de activos, pensado para
    la industria minera colombiana.
</p>
            </div>

            <br />
            <br />

            {/* ================= POR QUÉ EXISTE ================= */}

            <h2>¿Por qué existe MANTIA?</h2>

            <br />

            <p
                style={{
                    color: "var(--texto2)",
                    maxWidth: "50rem",
                }}
            >
                Las operaciones mineras dependen de maquinaria pesada y
                herramientas críticas: un daño no previsto o un repuesto
                agotado pueden detener una línea completa. MANTIA
                centraliza el registro y seguimiento de esos activos para
                anticipar fallas y mantener la trazabilidad de cada
                ubicación, equipo y herramienta.
            </p>

            <br />
            <br />

            {/* ================= VALORES ================= */}

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(auto-fit, minmax(16rem, 1fr))",
                    gap: "1.25rem",
                }}
            >
                {valores.map((v) => (
                    <Tarjeta
                        key={v.titulo}
                        icono={v.icono}
                        titulo={v.titulo}
                        texto={v.texto}
                    />
                ))}
            </div>

            <br />
            <br />


            {/* ================= EQUIPO SENA ================= */}
            {/* Tabla con nombres y fotos: solo visible con sesión iniciada */}

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr",
                    gap: "1.25rem",
                }}
            >

                {isAuthenticated && (
                <div
                    className="date"
                    style={{
                        textAlign: "left",
                        width: "100%",
                        boxShadow:
                            "var(--sombra-contenedor)",
                    }}
                >
                    <h3>
                        <i className="fa-solid fa-people-group"></i>{" "}
                        Equipo SENA
                    </h3>

                    <br />

                    <p
                        style={{
                            color: "var(--texto2)",
                            fontSize: "1rem",
                        }}
                    >
                        Proyecto formativo desarrollado por aprendices
                        de Análisis y Desarrollo de Software del Centro
                        Nacional Minero, SENA - Sogamoso, Boyacá.
                    </p>

                    <br />

                    {/* ================= TABLA ================= */}

                    <div
                        style={{
                            width: "100%",
                            overflowX: "auto",
                        }}
                    >
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                color: "var(--texto)",
                                tableLayout: "fixed",
                            }}
                        >
                            <thead>
                                <tr
                                    style={{
                                        background:
                                            "var(--principal)",
                                        color: "var(--blanco)",
                                    }}
                                >
                                    <th
                                        style={{
                                            width: "60%",
                                            padding:
                                                "1rem 1.2rem",
                                            textAlign: "left",
                                            fontSize: "1rem",
                                        }}
                                    >
                                        Integrante
                                    </th>

                                    <th
                                        style={{
                                            width: "40%",
                                            padding:
                                                "1rem 1.2rem",
                                            textAlign: "left",
                                            fontSize: "1rem",
                                        }}
                                    >
                                        Rol
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {equipoDesarrollo.map(
                                    (persona) => (
                                        <tr
                                            key={
                                                persona.nombre
                                            }
                                            style={{
                                                borderBottom:
                                                    "0.0625rem solid var(--hover-principal)",
                                            }}
                                        >
                                            <td
                                                style={{
                                                    padding:
                                                        "1rem 1.2rem",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display:
                                                            "flex",
                                                        alignItems:
                                                            "center",
                                                        gap: "1rem",
                                                    }}
                                                >
                                                    <img
                                                        src={
                                                            persona.imagen
                                                        }
                                                        alt={`Avatar de ${persona.nombre}`}
                                                        style={{
                                                            width: "3.5rem",
                                                            height: "3.5rem",
                                                            borderRadius:
                                                                "50%",
                                                            objectFit:
                                                                "cover",
                                                            flexShrink: 0,
                                                            border:
                                                                "0.15rem solid var(--principal)",
                                                        }}
                                                    />

                                                    <strong
                                                        style={{
                                                            fontSize:
                                                                "1rem",
                                                            color:
                                                                "var(--texto)",
                                                        }}
                                                    >
                                                        {
                                                            persona.nombre
                                                        }
                                                    </strong>
                                                </div>
                                            </td>

                                            <td
                                                style={{
                                                    padding:
                                                        "1rem 1.2rem",
                                                    color:
                                                        "var(--texto2)",
                                                    fontSize:
                                                        "1rem",
                                                }}
                                            >
                                                {persona.rol}
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                )}

                {/* ================= CONTACTO ================= */}

                <div
                    className="date"
                    style={{
                        textAlign: "left",
                        width: "100%",
                        boxShadow:
                            "var(--sombra-contenedor)",
                    }}
                >
                    <h3>
                        <i className="fa-solid fa-address-card"></i>{" "}
                        Contáctanos
                    </h3>

                    <br />

                    <FilaContacto
                        icono="fa-solid fa-envelope"
                        titulo="Correo"
                        texto="mantiadso@gmail.com"
                    />

                    <FilaContacto
                        icono="fa-solid fa-phone"
                        titulo="Mesa de ayuda"
                        texto="320 5783729 (SENA)"
                    />

                    <FilaContacto
                        icono="fa-solid fa-location-dot"
                        titulo="Ubicación"
                        texto="Centro Nacional Minero, Sogamoso, Boyacá"
                    />
                </div>

            </div>

            <br />
            <br />

            {/* ================= BOTONES ================= */}

                <div className="btn-container">

                <a href="mailto:mantiadso@gmail.com" className="btn-azul">
        <i className="fa-solid fa-envelope"></i>
        Escríbenos
            </a>

                <Link to="/ayuda">
                    <button className="btn-2">
                        <i className="fa-solid fa-circle-question"></i>
                        Ir a Ayuda
                    </button>
                </Link>

            </div>

            <br />

        </div>
        </Layout>
    );
}

export default AcercaDe;