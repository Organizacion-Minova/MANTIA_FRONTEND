import { useState, useEffect } from "react";
import accesibilidadBtnIcon from "../../assets/icons/accesibilidad-btn.svg";
import accesibilidadIcon from "../../assets/icons/accesibilidad.svg";
import cerrarIcon from "../../assets/icons/cerrar.svg";
import fuenteIcon from "../../assets/icons/fuente.svg";
import oscuroIcon from "../../assets/icons/oscuro.svg";
import claroIcon from "../../assets/icons/claro.svg";
import contrasteIcon from "../../assets/icons/contraste.svg";
import leerIcon from "../../assets/icons/leer.svg";
import dejaLeerIcon from "../../assets/icons/deja-leer.svg";
import reestablecerIcon from "../../assets/icons/reestablecer.svg";

const NIVELES = [13, 14, 15, 16, 17, 18, 19, 20];
const NIVEL_INICIAL = 3;

const preferenciasDefecto = {
    tamanoTexto: NIVEL_INICIAL,
    modoOscuro: false,
    altoContraste: false,
};

function AccessibilityPanel({ onModoOscuroChange }) {
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
        const modoOscuro = !preferencias.modoOscuro;
        setPreferencias({ ...preferencias, modoOscuro });
        onModoOscuroChange?.(modoOscuro);
    }

    function alternarAltoContraste() {
        setPreferencias({ ...preferencias, altoContraste: !preferencias.altoContraste });
    }

    function restablecerPreferencias() {
        speechSynthesis.cancel();
        setLeyendo(false);
        setPreferencias(preferenciasDefecto);
        onModoOscuroChange?.(preferenciasDefecto.modoOscuro);
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
                title={abierto ? "Cerrar panel de accesibilidad" : "Abrir accesibilidad"}
            >
                <img src={accesibilidadBtnIcon} alt="Accesibilidad" />
            </button>

            <div className={`panel-accesibilidad ${abierto ? "activo" : ""}`}>
                <div className="header-accesibilidad">
                    <img src={accesibilidadIcon} alt="Accesibilidad" />
                    <div className="texto-header">
                        <h3><strong>Accesibilidad</strong></h3>
                        <small>Personaliza MANTIA</small>
                    </div>
                    <img
                        src={cerrarIcon}
                        alt="Cerrar"
                        onClick={() => setAbierto(false)}
                        style={{ cursor: "pointer" }}
                        className="cerrar-accesibilidad"
                        title="Cerrar panel de accesibilidad"
                    />
                </div>

                <div className="contenedor-btns">
                    <div
                        className={`contenedor-texto ${grupoVisible ? "activo" : ""}`}
                        id="contenedorTexto"
                        onClick={alternarGrupoTexto}
                        title={tamanoModificado ? "Restablecer tamaño de texto para cerrar" : "Abrir opciones de tamaño de texto"}
                    >
                        <img className="accessibility-option-icon" src={fuenteIcon} alt="" aria-hidden="true" />
                       <span>Tamaño</span>
                       <div className="grupo-botones">
                            <button
                            className={`btn-texto ${tamanoModificado ? "activo" : ""}`}
                            type="button"
                                    disabled={preferencias.tamanoTexto === 0}
                                    onClick={(e) => { e.stopPropagation(); disminuirTexto(); }}
                                >
                                −
                            </button>
                                <span className="nivel-texto">{textoIndicador}</span>
                            <button
                                className={`btn-texto ${tamanoModificado ? "activo" : ""}`}
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
                        title={preferencias.modoOscuro ? "Desactivar modo oscuro" : "Activar modo oscuro"}
                    >
                        <img
                            className="accessibility-option-icon"
                            src={preferencias.modoOscuro ? claroIcon : oscuroIcon}
                            alt=""
                            aria-hidden="true"
                        />
                        <span>{preferencias.modoOscuro ? "Modo claro" : "Modo oscuro"}</span>
                    </button>
                    <button
                        type="button"
                        className={preferencias.altoContraste ? "activo" : ""}
                        onClick={alternarAltoContraste}
                        title={preferencias.altoContraste ? "Desactivar alto contraste" : "Activar alto contraste"}
                    >
                        <img className="accessibility-option-icon" src={contrasteIcon} alt="" aria-hidden="true" />
                        <span>Alto contraste</span>
                    </button>
                    <button
                        type="button"
                        className={leyendo ? "activo" : ""}
                        onClick={alternarLectura}
                        title={leyendo ? "Detener lectura de la página" : "Leer página en voz alta"}
                    >
                        <img
                            className="accessibility-option-icon"
                            src={leyendo ? dejaLeerIcon : leerIcon}
                            alt=""
                            aria-hidden="true"
                        />
                        <span>{leyendo ? "Detener lectura" : "Leer página"}</span>
                    </button>
                </div>

                <button type="button" 
                        onClick={restablecerPreferencias} 
                        title="Restablecer preferencias"
                >
                    <img className="accessibility-option-icon" src={reestablecerIcon} alt="" aria-hidden="true" />
                    <span>Restablecer</span>
                </button>
            </div>
        </>
    );
}

export default AccessibilityPanel;