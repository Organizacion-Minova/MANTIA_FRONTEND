import { useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/Components.modules.css";
import { useAuth } from "../../context/AuthContext.jsx";
import AppLayout from "../../components/layout/AppLayout.jsx";
import PublicLayout from "../../components/layout/PublicLayout.jsx";

/* ---------- pequeños bloques reutilizables de la página ---------- */

function Circulo({ icono, tamano = "2.5rem" }) {
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
                fontSize: "1rem",
                flexShrink: 0,
            }}
        >
            <i className={icono}></i>
        </div>
    );
}

function TarjetaCategoria({ icono, nombre, activa, onClick }) {
    const [hover, setHover] = useState(false);
    return (
        <button
            type="button"
            onClick={onClick}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            className="date"
            style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                textAlign: "left",
                cursor: "pointer",
                border: activa ? "0.125rem solid var(--secundario)" : "0.125rem solid transparent",
                boxShadow: hover || activa ? "var(--sombra-contenedor-hover)" : "var(--sombra-contenedor)",
                transform: hover ? "translateY(-0.2rem)" : "translateY(0)",
                transition: "box-shadow .2s ease, transform .2s ease, border-color .2s ease",
                width: "100%",
                font: "inherit",
            }}
        >
            <Circulo icono={icono} />
            <strong style={{ color: "var(--texto)" }}>{nombre}</strong>
        </button>
    );
}

function FilaContacto({ icono, titulo, texto }) {
    return (
        <div className="contact-row" style={{ display: "flex", alignItems: "center", gap: "0.9rem", padding: "0.85rem 0" }}>
            <Circulo icono={icono} />
            <div>
                <strong style={{ display: "block", color: "var(--texto)" }}>{titulo}</strong>
                <span style={{ color: "var(--texto2)" }}>{texto}</span>
            </div>
        </div>
    );
}

/* ---------------------------- contenido ---------------------------- */

const categorias = [
    { id: "ubicaciones", icono: "fa-solid fa-map-marker-alt", nombre: "Ubicaciones" },
    { id: "herramientas", icono: "fa-solid fa-screwdriver-wrench", nombre: "Herramientas" },
    { id: "equipos", icono: "fa-solid fa-gears", nombre: "Equipos y máquinas" },
    { id: "cuentas", icono: "fa-solid fa-user-shield", nombre: "Cuenta y acceso" },
];

const preguntas = [
    {
        id: "p1",
        categoria: "ubicaciones",
        pregunta: "¿Cómo registro una nueva ubicación?",
        respuesta: "Ingresa al módulo Ubicaciones desde el menú lateral, presiona el botón 'Nueva Ubicación' y completa el nombre, la descripción y la categoría correspondiente.",
    },
    {
        id: "p2",
        categoria: "ubicaciones",
        pregunta: "¿Puedo agrupar las ubicaciones por categoría?",
        respuesta: "Sí. Desde 'Ubicaciones' entra a 'Categoría ubicaciones' para crear, editar o consultar las categorías disponibles.",
    },
    {
        id: "p3",
        categoria: "herramientas",
        pregunta: "¿Cómo agrego una herramienta consumible o no consumible?",
        respuesta: "Dirígete a Herramientas en el menú lateral y elige Consumibles o No consumibles según corresponda; allí podrás registrar nuevas herramientas y su cantidad disponible.",
    },
    {
        id: "p4",
        categoria: "equipos",
        pregunta: "¿Cómo consulto el estado de un equipo o una máquina?",
        respuesta: "En los módulos Equipos y Máquinas puedes buscar por nombre, descripción o categoría para revisar el estado actual y el historial de mantenimiento.",
    },
    {
        id: "p5",
        categoria: "cuentas",
        pregunta: "¿Olvidé mi contraseña, qué hago?",
        respuesta: "Comunícate con el administrador del sistema o escribe a mantiadso@gmail.com para solicitar el restablecimiento de tu contraseña.",
    },
    {
        id: "p6",
        categoria: "cuentas",
        pregunta: "¿A quién reporto una falla del sistema?",
        respuesta: "Puedes escribirnos a mantiadso@gmail.com o comunicarte con la mesa de ayuda MANTIA para reportar cualquier inconveniente técnico.",
    },
];

const preguntasPublicas = [
    {
        id: "pub1",
        categoria: "general",
        pregunta: "¿Qué es MANTIA?",
        respuesta: "MANTIA es un sistema de mantenimiento e inventario de activos para el sector minero, que centraliza el control de máquinas, equipos, herramientas y ubicaciones.",
    },
    {
        id: "pub2",
        categoria: "general",
        pregunta: "¿Cómo inicio sesión?",
        respuesta: "Presiona el botón 'Iniciar sesión' en la parte superior y usa las credenciales que te asignó tu administrador.",
    },
    preguntas.find((p) => p.id === "p5"),
    preguntas.find((p) => p.id === "p6"),
];

function Ayuda() {

    const { isAuthenticated } = useAuth();
    const Layout = isAuthenticated ? AppLayout : PublicLayout;
    const [busqueda, setBusqueda] = useState("");
    const [categoriaActiva, setCategoriaActiva] = useState(null);
    const [abierta, setAbierta] = useState(null);

    const preguntasBase = isAuthenticated ? preguntas : preguntasPublicas;

    const preguntasFiltradas = preguntasBase.filter((p) => {
        const coincideTexto = (p.pregunta + p.respuesta).toLowerCase().includes(busqueda.toLowerCase());
        const coincideCategoria = !categoriaActiva || p.categoria === categoriaActiva;
        return coincideTexto && coincideCategoria;
    });

    const alternar = (id) => setAbierta(abierta === id ? null : id);

    const alternarCategoria = (id) => setCategoriaActiva(categoriaActiva === id ? null : id);

    return (
        <Layout>
        <div className="public-page">
            <div
                style={{
                    background: "var(--principal)",
                    color: "var(--blanco)",
                    borderRadius: "1.25rem",
                    padding: "2.75rem 2rem",
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
                    <i className="fa-solid fa-headset"></i> CENTRO DE AYUDA
                </span>
                <h1 style={{ fontSize: "2rem" }}>¿En qué podemos ayudarte?</h1>
                <p style={{ maxWidth: "36rem", margin: "0.6rem auto 0", opacity: 0.92 }}>
                    Resuelve tus dudas sobre el uso de MANTIA o escríbenos directamente.
                </p>

                <div style={{ marginTop: "1.5rem", display: "inline-flex" }}>
                    <div className="date" style={{ boxShadow: "0 0.25rem 1rem rgba(0,0,0,.18)" }}>
                        <i className="fa-regular fa-calendar"></i>
                    
                    </div>
                </div>
            </div>

            <br /><br />

            <div className="search-main">
                <div className="search-wrapper">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <input
                        type="text"
                        id="q"
                        placeholder="Buscar en preguntas frecuentes"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>
                <button className="btn-buscar" type="button">
                    <i className="fa-solid fa-magnifying-glass"></i> Buscar
                </button>
            </div>

            <br />

            {isAuthenticated && (
                <>
                    <h2>Explora por tema</h2>
                    <br />
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(13rem, 1fr))", gap: "1rem" }}>
                        {categorias.map((c) => (
                            <TarjetaCategoria
                                key={c.id}
                                icono={c.icono}
                                nombre={c.nombre}
                                activa={categoriaActiva === c.id}
                                onClick={() => alternarCategoria(c.id)}
                            />
                        ))}
                    </div>

                    <br /><br />
                </>
            )}

            <h2>Preguntas frecuentes</h2>
            <br />
            <div className="date" style={{ boxShadow: "var(--sombra-contenedor)" }}>
                {preguntasFiltradas.length === 0 && (
                    <p style={{ color: "var(--texto2)" }}>No encontramos resultados para tu búsqueda.</p>
                )}

                <ul style={{ listStyle: "none" }}>
                    {preguntasFiltradas.map((p) => (
                        <li
                            key={p.id}
                            className={`menu-desplegable ${abierta === p.id ? "activo" : ""}`}
                        >
                            <a
                                onClick={() => alternar(p.id)}
                                style={{
                                    cursor: "pointer",
                                    color: "var(--texto)",
                                    display: "flex",
                                    gap: "0.8rem",
                                    alignItems: "center",
                                    padding: "0.7rem 0",
                                }}
                            >
                                <i className="fa-solid fa-chevron-down flecha"></i>
                                <span style={{ flex: 1 }}><strong>{p.pregunta}</strong></span>
                            </a>
                            <ul className="submenu">
                                <li><p style={{ color: "var(--texto2)" }}>{p.respuesta}</p></li>
                            </ul>
                        </li>
                    ))}
                </ul>
            </div>

            <br /><br />

            <h2>¿Necesitas más ayuda?</h2>
            <br />
            <div className="date" style={{ boxShadow: "var(--sombra-contenedor)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(15rem, 1fr))" }}>
                    <FilaContacto icono="fa-solid fa-envelope" titulo="Correo" texto="mantiadso@gmail.com" />
                    <FilaContacto icono="fa-solid fa-phone" titulo="Mesa de ayuda" texto="320 5783729 (SENA)" />
                    <FilaContacto icono="fa-solid fa-location-dot" titulo="Ubicación" texto="Centro Nacional Minero, Sogamoso, Boyacá" />
                </div>
            </div>

            <br /><br />

            <div className="btn-container">
                <a href="mailto:mantiadso@gmail.com" className="btn-azul">
                    <i className="fa-solid fa-headset"></i>
                    Contactar soporte
                </a>
                <Link to="/about">
                    <button className="btn-2">
                        <i className="fa-solid fa-info-circle"></i>
                        Acerca de MANTIA
                    </button>
                </Link>
            </div>
            <br />
        </div>
        </Layout>
    );
}

export default Ayuda;