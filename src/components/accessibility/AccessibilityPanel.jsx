import { useState, useEffect } from "react";

const NIVELES = [13, 14, 15, 16, 17, 18, 19, 20];
const NIVEL_INICIAL = 3;

const preferenciasDefecto = {
    tamanoTexto: NIVEL_INICIAL,
    modoOscuro: false,
    altoContraste: false,
};

function AccessibilityPanel() {
    const [abierto, setAbierto] = useState(false);
    const [textoActivo, setTextoActivo] = useState(false);
    const [leyendo, setLeyendo] = useState(false);

    // Estado inicial perezoso: lee localStorage UNA sola vez, antes de cualquier efecto
    const [preferencias, setPreferencias] = useState(() => {
        const guardadas = localStorage.getItem("accesibilidad");
        return guardadas ? JSON.parse(guardadas) : preferenciasDefecto;
    });

    // Único efecto: guardar y aplicar cada vez que cambian las preferencias
    useEffect(() => {
        localStorage.setItem("accesibilidad", JSON.stringify(preferencias));
        document.documentElement.style.fontSize = NIVELES[preferencias.tamanoTexto] + "px";
        document.documentElement.classList.toggle("dark-theme", preferencias.modoOscuro);
        document.documentElement.classList.toggle("alto-contraste", preferencias.altoContraste);
    }, [preferencias]);

    // ...el resto de las funciones (aumentarTexto, alternarModoOscuro, etc.) igual que antes
    const tamanoModificado = preferencias.tamanoTexto !== NIVEL_INICIAL;
    const grupoVisible = textoActivo || tamanoModificado;

    function alternarGrupoTexto() {
    if (tamanoModificado) return; // no se puede cerrar mientras el tamaño no sea el original
    setTextoActivo(!textoActivo);
    }

    function aumentarTexto() {
        if (preferencias.tamanoTexto < NIVELES.length - 1) {
            setPreferencias({ ...preferencias, tamanoTexto: preferencias.tamanoTexto + 1 });
        }
    }

    function disminuirTexto() {
        if (preferencias.tamanoTexto > 0) {
            setPreferencias({ ...preferencias, tamanoTexto: preferencias.tamanoTexto - 1 });
        }
    }

    function alternarModoOscuro() {
        setPreferencias({ ...preferencias, modoOscuro: !preferencias.modoOscuro });
    }

    function alternarAltoContraste() {
        setPreferencias({ ...preferencias, altoContraste: !preferencias.altoContraste });
    }

    function restablecerPreferencias() {
        speechSynthesis.cancel();
        setLeyendo(false);
        setPreferencias(preferenciasDefecto);
    }

    function alternarLectura() {
        if (!leyendo) {
            const texto = document.body.innerText;
            const voz = new SpeechSynthesisUtterance(texto);
            voz.onend = () => setLeyendo(false);
            speechSynthesis.speak(voz);
            setLeyendo(true);
        } else {
            speechSynthesis.cancel();
            setLeyendo(false);
        }
    }

    const indicador = preferencias.tamanoTexto - NIVEL_INICIAL;
    const textoIndicador = indicador > 0 ? "+" + indicador : indicador;

    return (
        <>
            <button
                id="btnAccesibilidad"
                className="btn-accesibilidad"
                type="button"
                aria-label="Abrir accesibilidad"
                onClick={() => setAbierto(!abierto)}
            >
                <i className="fa-solid fa-universal-access"></i>
            </button>

            <div className={`panel-accesibilidad ${abierto ? "activo" : ""}`}>
                <div className="header-accesibilidad">
                    <img src="/src/assets/icons/accesibilidad.svg" alt="Accesibilidad" />
                    <div className="texto-header">
                        <h3><strong>Accesibilidad</strong></h3>
                        <small>Personaliza MANTIA</small>
                    </div>
                    <img
                        src="/src/assets/icons/cerrar.svg"
                        alt="Cerrar"
                        onClick={() => setAbierto(false)}
                        style={{ cursor: "pointer" }}
                        className="cerrar-accesibilidad"
                    />
                </div>

                <div className="contenedor-btns">
                    <div
                        className={`contenedor-texto ${grupoVisible ? "activo" : ""}`}
                        id="contenedorTexto"
                        onClick={alternarGrupoTexto}
                    >
                        <i className="fa-solid fa-font"></i>
                       <span>Tamaño</span>
                       <div className="grupo-botones">
                            <button
                            className="btn-texto"
                            type="button"
                                    disabled={preferencias.tamanoTexto === 0}
                                    onClick={(e) => { e.stopPropagation(); disminuirTexto(); }}
                                >
                                −
                            </button>
                                <span className="nivel-texto">{textoIndicador}</span>
                            <button
                                className="btn-texto"
                                type="button"
                                disabled={preferencias.tamanoTexto === NIVELES.length - 1}
                                onClick={(e) => { e.stopPropagation(); aumentarTexto(); }}
                                >
                                 +
                            </button>
                        </div>
                    </div>

                    <button
                        type="button"
                        className={preferencias.modoOscuro ? "activo" : ""}
                        onClick={alternarModoOscuro}
                    >
                        <i className="fa-solid fa-moon"></i>
                        <span>Modo oscuro</span>
                    </button>
                    <button
                        type="button"
                        className={preferencias.altoContraste ? "activo" : ""}
                        onClick={alternarAltoContraste}
                    >
                        <i className="fa-solid fa-circle-half-stroke"></i>
                        <span>Alto contraste</span>
                    </button>
                    <button
                        type="button"
                        className={leyendo ? "activo" : ""}
                        onClick={alternarLectura}
                    >
                        <i className="fa-solid fa-volume-high"></i>
                        <span>{leyendo ? "Detener lectura" : "Leer página"}</span>
                    </button>
                </div>

                <button type="button" onClick={restablecerPreferencias}>
                    <i className="fa-solid fa-rotate-left"></i>
                    <span>Restablecer</span>
                </button>
            </div>
        </>
    );
}

export default AccessibilityPanel;