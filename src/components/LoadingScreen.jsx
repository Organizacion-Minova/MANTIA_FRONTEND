import { useState, useEffect } from "react";
import senaLogo from "../assets/img/sena-logo.png";

export default function LoadingScreen({ duracion = 3600, indeterminado = false, onFinish }) {
    const [progreso, setProgreso] = useState(0);

    useEffect(() => {
        if (indeterminado) return;
        const inicio = Date.now();
        const intervalo = setInterval(() => {
            const transcurrido = Date.now() - inicio;
            const pct = Math.min(100, Math.round((transcurrido / duracion) * 100));
            setProgreso(pct);
            if (pct >= 100) {
                clearInterval(intervalo);
                if (onFinish) onFinish();
            }
        }, 30);
        return () => clearInterval(intervalo);
    }, [duracion, onFinish, indeterminado]);

    return (
        <div style={styles.overlay}>
            <div style={styles.pista}>
                <div style={styles.via} />

                <div className="mantia-tren">
                    {/*
                     
                    */}

                    <img src={senaLogo} alt="SENA" className="mantia-logo" />
                    <div className="mantia-vagon">
                        <div className="mantia-rueda" style={{ left: 14 }} />
                        <div className="mantia-rueda" style={{ left: 78 }} />
                    </div>
                </div>
            </div>

            <div style={styles.barTrack}>
                {indeterminado ? (
                    <div className="mantia-bar-loop" />
                ) : (
                    <div style={{ ...styles.barFill, width: `${progreso}%` }} />
                )}
            </div>
            <span style={styles.label}>Cargando MANTIA...</span>

            <style>{`
                .mantia-tren {
                    position: absolute;
                    bottom: 26px;
                    left: 0;
                    animation: mantia-recorrido ${duracion}ms cubic-bezier(.45,0,.55,1) infinite;
                }
                @keyframes mantia-recorrido {
                    0%   { transform: translateX(-100px) translateY(0); }
                    48%  { transform: translateX(150px) translateY(-1px); }
                    50%  { transform: translateX(155px) translateY(1px); }
                    52%  { transform: translateX(160px) translateY(-1px); }
                    100% { transform: translateX(320px) translateY(0); }
                }

                .mantia-vagon {
                    width: 110px;
                    height: 50px;
                    border-radius: 6px;
                    background: var(--sidebar, #063B38);
                    border: 2px solid #03211f;
                    outline: 2px solid var(--secundario, #19C3A6);
                    outline-offset: -4px;
                    position: relative;
                    animation: mantia-vaiven 0.5s ease-in-out infinite;
                }
                @keyframes mantia-vaiven {
                    0%, 100% { transform: rotate(0deg); }
                    50%      { transform: rotate(0.6deg); }
                }

                .mantia-rueda {
                    position: absolute;
                    bottom: -9px;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: #1c1c1c;
                    border: 2px solid #444;
                    animation: mantia-girar 0.35s linear infinite;
                }
                .mantia-rueda::after {
                    content: "";
                    position: absolute;
                    inset: 4px;
                    border-radius: 50%;
                    background: #888;
                }
                @keyframes mantia-girar {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }

                .mantia-logo {
                    position: absolute;
                    top: -46px;
                    left: 50%;
                    width: 56px;
                    height: 56px;
                    animation: mantia-salto 0.85s ease-in-out infinite;
                }
                .mantia-logo-placeholder {
                    border-radius: 10px;
                    border: 2px dashed var(--acento-mantia, #A3D65C);
                    background: rgba(255,255,255,0.08);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 9px;
                    color: var(--fondo, #E8F0EE);
                    text-align: center;
                    line-height: 1.2;
                    font-family: var(--fuente-secundaria, sans-serif);
                }
                @keyframes mantia-salto {
                    0%, 100% { transform: translateX(-50%) translateY(0) scale(1); }
                    40%      { transform: translateX(-50%) translateY(-14px) scale(1.04); }
                }

                .mantia-bar-loop {
                    height: 100%;
                    background: linear-gradient(90deg, var(--secundario), var(--acento-mantia));
                    border-radius: 999px;
                    animation: mantia-bar-llenar 1.4s ease-in-out infinite;
                }
                @keyframes mantia-bar-llenar {
                    0%   { width: 0%; }
                    85%  { width: 100%; }
                    100% { width: 100%; }
                }
            `}</style>
        </div>
    );
}

const styles = {
    overlay: {
        position: "fixed",
        inset: 0,
        background: "var(--principal)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
    },
    pista: {
        position: "relative",
        width: 280,
        height: 150,
        overflow: "hidden",
    },
    via: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 26,
        height: 4,
        background: "#0a2b28",
    },
    barTrack: {
        width: 220,
        height: 10,
        background: "rgba(255,255,255,0.22)",
        borderRadius: 999,
        overflow: "hidden",
        marginTop: 10,
    },
    barFill: {
        height: "100%",
        background: "linear-gradient(90deg, var(--secundario), var(--acento-mantia))",
        borderRadius: 999,
        transition: "width 0.1s linear",
    },
    label: {
        color: "var(--fondo)",
        fontFamily: "var(--fuente-secundaria)",
        fontSize: 12,
        marginTop: 10,
    },
};