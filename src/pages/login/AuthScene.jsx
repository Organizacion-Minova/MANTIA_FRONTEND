import React, { useState } from "react";
import "../../styles/animations/login.css";
import "../../styles/variables.css";
import "../../styles/global.css";
import "../../styles/components.modules.css";
import { Boton } from "../../components/common/Button";

/**
 * NOTA para integrar en tu proyecto:
 * - Se agregó un estado `esDeDia` que controla el ciclo día/noche.
 * - Asumo que <Boton /> reenvía props extra como onClick al <button> interno
 *   (spread de props). Si no es así, solo agrega onClick={...} dentro de Boton.
 * - Agregué un <style> embebido con las animaciones (camión, ruedas,
 *   carretera, transición día/noche) para no depender de que edites
 *   login.css a ciegas. Si prefieres, puedes mover ese bloque a tu CSS.
 *
 * Cambios de esta versión (más sobria, mismo movimiento):
 * - Paleta desaturada (cielo, montañas, naranja del camión ya no son "caramelo").
 * - Luna/sol con un solo halo, sin efecto "brillo mágico".
 * - Grúas más esbeltas y con menos repetición de patrón (menos "juguete").
 * - Camión con cabina angulosa tipo carga real, sin faro redondo tipo "ojo".
 * - Montañas con curvas más planas (menos onda "amigable").
 */

const AuthScene = ({ children }) => {
    const [esDeDia, setEsDeDia] = useState(false);

    const alternarCicloDia = () => setEsDeDia((prev) => !prev);

    return (
        <div className={`login-page ${esDeDia ? "modo-dia" : "modo-noche"}`}>
            <nav className="mantia-nav">
                <a href="#inicio">Inicio</a>
                <a href="#ayuda">Ayuda</a>
                <a href="#nosotros">Nosotros</a>
            </nav>

            <svg
                className="escena-svg"
                viewBox="0 0 1920 1080"
                preserveAspectRatio="xMidYMid slice"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <linearGradient id="cielo-auth-noche" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#14161f" />
                        <stop offset="52%" stopColor="#20232e" />
                        <stop offset="100%" stopColor="#2c3038" />
                    </linearGradient>
                    <linearGradient id="cielo-auth-dia" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6f8fa8" />
                        <stop offset="55%" stopColor="#a3bcc9" />
                        <stop offset="100%" stopColor="#dde6e9" />
                    </linearGradient>

                    <linearGradient id="montana-auth-back-noche" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#17352f" />
                        <stop offset="100%" stopColor="#0f221e" />
                    </linearGradient>
                    <linearGradient id="montana-auth-back-dia" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3c7f6a" />
                        <stop offset="100%" stopColor="#2c5f4f" />
                    </linearGradient>

                    <linearGradient id="montana-auth-front-noche" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1c443c" />
                        <stop offset="100%" stopColor="#122b26" />
                    </linearGradient>
                    <linearGradient id="montana-auth-front-dia" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#48937b" />
                        <stop offset="100%" stopColor="#316b58" />
                    </linearGradient>

                    <pattern id="patron-auth" width="34" height="34" patternUnits="userSpaceOnUse">
                        <path
                            d="M 0 0 L 34 34 M 34 0 L 0 34"
                            fill="none"
                            stroke="#132e29"
                            strokeWidth="1"
                        />
                    </pattern>

                    <linearGradient id="carroceria-sena" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#c9581f" />
                        <stop offset="100%" stopColor="#a3441a" />
                    </linearGradient>
                </defs>

                {/* Cielo con transición suave entre día y noche */}
                <rect width="1920" height="1080" fill="url(#cielo-auth-noche)" />
                <rect
                    width="1920"
                    height="1080"
                    fill="url(#cielo-auth-dia)"
                    style={{
                        opacity: esDeDia ? 1 : 0,
                        transition: "opacity 1.4s ease",
                    }}
                />

                {/* Sol / luna: un solo halo discreto, sin efecto "brillo mágico" */}
                <g
                    className="astro-transicion"
                    style={{
                        transform: esDeDia ? "translateY(-40px)" : "translateY(0px)",
                        transition: "transform 1.4s ease",
                    }}
                >
                    <circle
                        cx="1250"
                        cy="220"
                        r="62"
                        fill={esDeDia ? "#f4c667" : "#e7ebef"}
                        opacity={esDeDia ? 0.14 : 0.1}
                        style={{ transition: "fill 1.4s ease, opacity 1.4s ease" }}
                    />
                    <circle
                        cx="1250"
                        cy="220"
                        r="46"
                        fill={esDeDia ? "#f6d488" : "#dfe4ea"}
                        stroke={esDeDia ? "#dba748" : "#b8bfc9"}
                        strokeWidth="1.5"
                        style={{ transition: "fill 1.4s ease, stroke 1.4s ease" }}
                    />
                </g>

                {/* Estrellas: tamaños/opacidades variadas para que no lean como confeti */}
                <g id="capa-estrellas" style={{ opacity: esDeDia ? 0 : 1, transition: "opacity 1.2s ease" }}>
                    <circle className="estrella" style={{ "--duracion": "3s" }} cx="280" cy="150" r="1.3" fill="#c9d2dc" />
                    <circle className="estrella" style={{ "--duracion": "4s" }} cx="520" cy="90" r="1" fill="#c9d2dc" />
                    <circle className="estrella" style={{ "--duracion": "3.5s" }} cx="780" cy="190" r="1.3" fill="#c9d2dc" />
                    <circle className="estrella" style={{ "--duracion": "5s" }} cx="1510" cy="120" r="1" fill="#c9d2dc" />
                    <circle className="estrella" style={{ "--duracion": "4.5s" }} cx="1740" cy="260" r="1.3" fill="#c9d2dc" />
                    <circle className="estrella" style={{ "--duracion": "3.2s" }} cx="1050" cy="100" r="1" fill="#c9d2dc" />
                </g>

                {/* Montañas: curvas más planas, transición de color menos abrupta entre capas */}
                <path d="M 0,560 Q 480,535 960,565 T 1920,545 L 1920,1080 L 0,1080 Z" fill="url(#montana-auth-back-noche)" />
                <path
                    d="M 0,560 Q 480,535 960,565 T 1920,545 L 1920,1080 L 0,1080 Z"
                    fill="url(#montana-auth-back-dia)"
                    style={{ opacity: esDeDia ? 1 : 0, transition: "opacity 1.4s ease" }}
                />
                <path d="M 0,665 Q 500,640 1050,675 T 1920,650 L 1920,1080 L 0,1080 Z" fill="url(#montana-auth-front-noche)" />
                <path
                    d="M 0,665 Q 500,640 1050,675 T 1920,650 L 1920,1080 L 0,1080 Z"
                    fill="url(#montana-auth-front-dia)"
                    style={{ opacity: esDeDia ? 1 : 0, transition: "opacity 1.4s ease" }}
                />
                <polygon points="0,720 700,720 400,1080 0,1080" fill="#0d221e" style={{ opacity: esDeDia ? 0.5 : 1, transition: "opacity 1.4s ease" }} />
                <polygon points="900,1080 1150,750 1920,750 1920,1080" fill="#0a1c19" style={{ opacity: esDeDia ? 0.5 : 1, transition: "opacity 1.4s ease" }} />

                {/* Grúas: torres y pluma más esbeltas, sin bloque de gancho tan "solido y juguete" */}
                <g id="gruas-auth">
                    <g id="grua-auth-left">
                        <rect x="290" y="240" width="14" height="420" fill="url(#patron-auth)" stroke="#132e29" strokeWidth="1.5" />
                        <rect x="170" y="240" width="380" height="12" fill="url(#patron-auth)" stroke="#132e29" strokeWidth="1.5" />
                        <line x1="297" y1="200" x2="185" y2="240" stroke="#132e29" strokeWidth="2" />
                        <line x1="297" y1="200" x2="530" y2="240" stroke="#132e29" strokeWidth="2" />
                        <line x1="480" y1="252" x2="480" y2="370" stroke="#0a1a17" strokeWidth="1.5" />
                        <rect x="465" y="370" width="30" height="18" fill="#2c3238" rx="1" stroke="#181c20" strokeWidth="1" />
                        <circle
                            cx="297"
                            cy="197"
                            r="3"
                            id="luz-grua-1"
                            className={esDeDia ? "" : "luz-parpadeo"}
                            fill={esDeDia ? "#6b6f75" : "#d64545"}
                            style={{ transition: "fill 1s ease" }}
                        />
                    </g>
                    <g id="grua-auth-right">
                        <rect x="1631" y="220" width="14" height="460" fill="url(#patron-auth)" stroke="#132e29" strokeWidth="1.5" />
                        <rect x="1330" y="220" width="430" height="12" fill="url(#patron-auth)" stroke="#132e29" strokeWidth="1.5" />
                        <line x1="1638" y1="182" x2="1345" y2="220" stroke="#132e29" strokeWidth="2" />
                        <line x1="1638" y1="182" x2="1740" y2="220" stroke="#132e29" strokeWidth="2" />
                        <line x1="1460" y1="232" x2="1460" y2="350" stroke="#0a1a17" strokeWidth="1.5" />
                        <rect x="1443" y="350" width="34" height="20" fill="#2c3238" rx="1" stroke="#181c20" strokeWidth="1" />
                        <circle
                            cx="1638"
                            cy="179"
                            r="3"
                            id="luz-grua-2"
                            className={esDeDia ? "" : "luz-parpadeo"}
                            fill={esDeDia ? "#6b6f75" : "#d64545"}
                            style={{ transition: "fill 1s ease" }}
                        />
                    </g>
                </g>

                {/* Carretera con línea central que se mueve, para reforzar la sensación de avance del camión */}
                <g id="carretera-auth">
                    <rect x="0" y="960" width="1920" height="120" fill={esDeDia ? "#43434a" : "#131316"} style={{ transition: "fill 1.4s ease" }} />
                    <rect x="0" y="955" width="1920" height="6" fill={esDeDia ? "#2a2a30" : "#000"} opacity="0.5" />
                    <line
                        x1="0"
                        y1="1020"
                        x2="1920"
                        y2="1020"
                        stroke="#d9a83f"
                        strokeWidth="5"
                        strokeDasharray="60 40"
                        className="linea-carretera"
                    />
                </g>

                {/* Camión del SENA: cabina angulosa de carga real, sin faro tipo "ojo" */}
                <g className="camion-sena">
                    <g transform="translate(0,860)">
                        {/* sombra */}
                        <ellipse cx="150" cy="150" rx="180" ry="12" fill="#000" opacity="0.32" />

                        {/* contenedor / caja de carga */}
                        <rect x="10" y="20" width="230" height="110" rx="3" fill="url(#carroceria-sena)" stroke="#5c260d" strokeWidth="2" />
                        <rect x="10" y="20" width="230" height="26" fill="#1f5c44" opacity="0.95" />
                        <text x="125" y="76" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="28" fill="#ffffff" letterSpacing="1">
                            SENA
                        </text>
                        <text x="125" y="102" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="12" fill="#3a1c0c">
                            Servicio Nacional de Aprendizaje
                        </text>

                        {/* cabina: perfil angulosa, capó definido, sin curvas infantiles */}
                        <path d="M 240,72 L 262,72 L 278,48 L 320,48 L 320,130 L 240,130 Z" fill="#1f5c44" stroke="#0c2e21" strokeWidth="2" />
                        <rect x="284" y="56" width="30" height="30" rx="2" fill="#a9c8d6" opacity="0.9" />
                        {/* faro rectangular, integrado en la carrocería, sin efecto "ojo" */}
                        <rect x="313" y="96" width="10" height="8" rx="1" fill={esDeDia ? "#d8cfa0" : "#f2dd7a"} className={esDeDia ? "" : "faro-camion"} />
                        {/* parrilla / parachoques */}
                        <rect x="320" y="108" width="14" height="20" fill="#2b2b2e" />

                        {/* ruedas: 2 ejes (caja y cabina), el punto de giro lo da la clase CSS (fill-box + center) */}
                        <g className="rueda-camion">
                            <circle cx="80" cy="140" r="26" fill="#161616" />
                            <circle cx="80" cy="140" r="10" fill="#6b6b6b" />
                        </g>
                        <g className="rueda-camion">
                            <circle cx="295" cy="140" r="24" fill="#161616" />
                            <circle cx="295" cy="140" r="9" fill="#6b6b6b" />
                        </g>
                    </g>
                </g>
            </svg>

            {children}

            <Boton
                clase="btn-azul-2"
                texto={esDeDia ? "🌙 Modo Noche" : "☀️ Modo Día"}
                onClick={alternarCicloDia}
            />

            <style>{`
                .luz-parpadeo {
                    animation: parpadeo-luz 1.4s ease-in-out infinite;
                }
                @keyframes parpadeo-luz {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.25; }
                }

                .faro-camion {
                    animation: parpadeo-luz 2s ease-in-out infinite;
                }

                .linea-carretera {
                    animation: mover-linea 1.2s linear infinite;
                }
                @keyframes mover-linea {
                    from { stroke-dashoffset: 0; }
                    to { stroke-dashoffset: -100; }
                }

                .camion-sena {
                    animation: recorrido-camion 14s linear infinite;
                }
                @keyframes recorrido-camion {
                    0%   { transform: translateX(-380px); }
                    100% { transform: translateX(1960px); }
                }

                .rueda-camion {
                    animation: girar-rueda 0.5s linear infinite;
                    transform-box: fill-box;
                    transform-origin: center;
                }
                @keyframes girar-rueda {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }

                @media (prefers-reduced-motion: reduce) {
                    .camion-sena, .rueda-camion, .linea-carretera, .faro-camion, .luz-parpadeo {
                        animation: none !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default AuthScene;