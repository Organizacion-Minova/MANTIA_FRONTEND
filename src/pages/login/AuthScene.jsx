import React from "react";
import "../../styles/animations/login.css";
import "../../styles/variables.css";
import "../../styles/global.css";
import "../../styles/components.modules.css";

const AuthScene = ({ children }) => {
    return (
        <div className="login-page">
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
                    <linearGradient id="cielo-auth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#181928" />
                        <stop offset="52%" stopColor="#2a2e45" />
                        <stop offset="100%" stopColor="#3d435e" />
                    </linearGradient>
                    <linearGradient id="montana-auth-back" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#143e37" />
                        <stop offset="100%" stopColor="#0c2723" />
                    </linearGradient>
                    <linearGradient id="montana-auth-front" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1b534a" />
                        <stop offset="100%" stopColor="#0e302b" />
                    </linearGradient>
                    <pattern id="patron-auth" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path
                            d="M 0 0 L 20 20 M 20 0 L 0 20 M 0 0 L 20 0 L 20 20 L 0 20 Z"
                            fill="none"
                            stroke="#0e3832"
                            strokeWidth="1.2"
                        />
                    </pattern>
                </defs>

                <rect width="1920" height="1080" fill="url(#cielo-auth)" />

                <g className="astro-transicion">
                    <circle cx="1250" cy="220" r="80" fill="#e2e8f0" opacity="0.15" />
                    <circle cx="1250" cy="220" r="55" fill="#f8fafc" opacity="0.85" />
                </g>

                <g id="capa-estrellas">
                    <circle className="estrella" style={{ "--duracion": "2s" }} cx="280" cy="150" r="2" fill="#fff" />
                    <circle className="estrella" style={{ "--duracion": "3s" }} cx="520" cy="90" r="1.5" fill="#fff" />
                    <circle className="estrella" style={{ "--duracion": "2.5s" }} cx="780" cy="190" r="2" fill="#fff" />
                    <circle className="estrella" style={{ "--duracion": "4s" }} cx="1510" cy="120" r="1.5" fill="#fff" />
                    <circle className="estrella" style={{ "--duracion": "3.5s" }} cx="1740" cy="260" r="2" fill="#fff" />
                    <circle className="estrella" style={{ "--duracion": "2.2s" }} cx="1050" cy="100" r="1.5" fill="#fff" />
                </g>

                <path
                    d="M 0,550 Q 450,510 960,560 T 1920,520 L 1920,1080 L 0,1080 Z"
                    fill="url(#montana-auth-back)"
                />
                <path
                    d="M 0,660 Q 500,610 1050,670 T 1920,630 L 1920,1080 L 0,1080 Z"
                    fill="url(#montana-auth-front)"
                />
                <polygon points="0,720 700,720 400,1080 0,1080" fill="#092420" />
                <polygon points="900,1080 1150,750 1920,750 1920,1080" fill="#071d1a" />

                <g id="gruas-auth">
                    <g id="grua-auth-left">
                        <rect x="285" y="240" width="22" height="420" fill="url(#patron-auth)" stroke="#0e3832" strokeWidth="2" />
                        <rect x="140" y="240" width="440" height="20" fill="url(#patron-auth)" stroke="#0e3832" strokeWidth="2" />
                        <line x1="285" y1="180" x2="160" y2="240" stroke="#0e3832" strokeWidth="3" />
                        <line x1="307" y1="180" x2="520" y2="240" stroke="#0e3832" strokeWidth="3" />
                        <line x1="490" y1="260" x2="490" y2="380" stroke="#111" strokeWidth="2" />
                        <rect x="470" y="380" width="40" height="25" fill="#07201c" rx="3" stroke="#1b534a" strokeWidth="1.5" />
                        <circle cx="296" cy="175" r="4" id="luz-grua-1" />
                    </g>
                    <g id="grua-auth-right">
                        <rect x="1625" y="220" width="22" height="460" fill="url(#patron-auth)" stroke="#0e3832" strokeWidth="2" />
                        <rect x="1280" y="220" width="500" height="20" fill="url(#patron-auth)" stroke="#0e3832" strokeWidth="2" />
                        <line x1="1625" y1="160" x2="1300" y2="220" stroke="#0e3832" strokeWidth="3" />
                        <line x1="1647" y1="160" x2="1750" y2="220" stroke="#0e3832" strokeWidth="3" />
                        <line x1="1450" y1="240" x2="1450" y2="360" stroke="#111" strokeWidth="2" />
                        <rect x="1425" y="360" width="50" height="28" fill="#07201c" rx="3" stroke="#1b534a" strokeWidth="1.5" />
                        <circle cx="1636" cy="155" r="4" id="luz-grua-2" />
                    </g>
                </g>
            </svg>

            {children}

            <button type="button" className="btn-azul">
                ☀️ Modo Día
            </button>
        </div>
    );
};

export default AuthScene;
