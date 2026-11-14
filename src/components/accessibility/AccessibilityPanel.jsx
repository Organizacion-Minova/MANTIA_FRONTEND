import { useState, useEffect } from "react";
import "../../styles/accessibility.css";
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
import negritaIcon from "../../assets/icons/negrita.svg";
import resaltarIcon from "../../assets/icons/resaltar-enlaces.svg";
import eyeIcon from "../../assets/icons/ver.svg";
import protanopiaIcon from "../../assets/icons/protanopia.svg";
import deuteranopiaIcon from "../../assets/icons/deuteranopia.svg";
import tritanopiaIcon from "../../assets/icons/paleta.svg";

const NIVELES = [13, 14, 15, 16, 17, 18, 19, 20];
const NIVEL_INICIAL = 3;

const preferenciasDefecto = {
    tamanoTexto: NIVEL_INICIAL,
    modoOscuro: false,
    altoContraste: false,
    negrita: false,
    resaltarEnlaces: false,
    daltonismo: null,
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
    const [daltonismoActivo, setDaltonismoActivo] = useState(() => Boolean(preferencias.daltonismo));

    // Único efecto: guardar y aplicar cada vez que cambian las preferencias
    useEffect(() => {
        localStorage.setItem("accesibilidad", JSON.stringify(preferencias));
        document.documentElement.style.fontSize = NIVELES[preferencias.tamanoTexto] + "px";
        document.documentElement.classList.toggle("dark-theme", preferencias.modoOscuro);
        document.documentElement.classList.toggle("alto-contraste", preferencias.altoContraste);
        document.documentElement.classList.toggle("texto-negrita", preferencias.negrita);
        document.documentElement.classList.toggle("resaltar-enlaces", preferencias.resaltarEnlaces);
        document.documentElement.classList.toggle("daltonismo-protanopia", preferencias.daltonismo === "protanopia");
        document.documentElement.classList.toggle("daltonismo-deuteranopia", preferencias.daltonismo === "deuteranopia");
        document.documentElement.classList.toggle("daltonismo-tritanopia", preferencias.daltonismo === "tritanopia");
    }, [preferencias]);

    // ...el resto de las funciones (aumentarTexto, alternarModoOscuro, etc.) igual que antes
    const tamanoModificado = preferencias.tamanoTexto !== NIVEL_INICIAL;
    const grupoVisible = textoActivo || tamanoModificado;

    function alternarGrupoTexto() {
    if (tamanoModificado) return; // no se puede cerrar mientras el tamaño no sea el original
    setTextoActivo(!textoActivo);
    }

    function alternarGrupoDaltonismo() {
        if (preferencias.daltonismo) {
            setDaltonismoActivo(true);
            return;
        }

        setDaltonismoActivo((activo) => !activo);
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

    function alternarNegrita() {
        setPreferencias({ ...preferencias, negrita: !preferencias.negrita });
    }

    function alternarResaltado() {
        setPreferencias({ ...preferencias, resaltarEnlaces: !preferencias.resaltarEnlaces });
    }

    function alternarDaltonismo(tipo) {
        setDaltonismoActivo(true);
        setPreferencias({
            ...preferencias,
            daltonismo: preferencias.daltonismo === tipo ? null : tipo,
        });
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
                    <button
                        type="button"
                        className={preferencias.negrita ? "activo" : ""}
                        onClick={alternarNegrita}
                        aria-pressed={Boolean(preferencias.negrita)}
                        title={preferencias.negrita ? "Desactivar texto en negrita" : "Activar texto en negrita"}
                    >
                        <img className="accessibility-option-icon" src={negritaIcon} alt="" aria-hidden="true" />
                        <span>Negrita</span>
                    </button>

                    <button
                        type="button"
                        className={preferencias.resaltarEnlaces ? "activo" : ""}
                        onClick={alternarResaltado}
                        aria-pressed={Boolean(preferencias.resaltarEnlaces)}
                        title={preferencias.resaltarEnlaces ? "Desactivar resaltado de enlaces" : "Activar resaltado de enlaces"}
                    >
                        <img className="accessibility-option-icon" src={resaltarIcon} alt="" aria-hidden="true" />
                        <span>Resaltar enlaces</span>
                    </button>

                </div>
                <div
                    className={`contenedor-texto ${daltonismoActivo ? "activo daltonismo-activo" : ""}`}
                    id="grupoDaltonismo"
                    onClick={alternarGrupoDaltonismo}
                    aria-expanded={daltonismoActivo}
                    aria-controls="opcionesDaltonismo"
                    title={
                        preferencias.daltonismo
                            ? "Desactiva el tipo seleccionado para cerrar las opciones"
                            : daltonismoActivo
                                ? "Cerrar opciones de daltonismo"
                                : "Abrir opciones de daltonismo"
                    }
                >
                    <img className="accessibility-option-icon" src={eyeIcon} alt="" aria-hidden="true" />
                    <span>Daltonismo</span>
                    <div className="grupo-botones grupo-daltonismo" id="opcionesDaltonismo">
                        <button
                            type="button"
                            className={`btn-daltonismo ${preferencias.daltonismo === "protanopia" ? "activo" : ""}`}
                            onClick={(event) => {
                                event.stopPropagation();
                                alternarDaltonismo("protanopia");
                            }}
                            aria-pressed={preferencias.daltonismo === "protanopia"}
                            title={preferencias.daltonismo === "protanopia" ? "Desactivar protanopía" : "Activar protanopía"}
                        >
                            <img className="accessibility-option-icon" src={protanopiaIcon} alt="" aria-hidden="true" />
                            <span>Protanopía</span>
                            <span className="daltonismo-paleta" aria-hidden="true">
                                <span className="muestra-rojo" />
                                <span className="muestra-verde" />
                                <span className="muestra-amarillo" />
                                <span className="muestra-secundario" />
                            </span>
                        </button>
                        <button
                            type="button"
                            className={`btn-daltonismo ${preferencias.daltonismo === "deuteranopia" ? "activo" : ""}`}
                            onClick={(event) => {
                                event.stopPropagation();
                                alternarDaltonismo("deuteranopia");
                            }}
                            aria-pressed={preferencias.daltonismo === "deuteranopia"}
                            title={preferencias.daltonismo === "deuteranopia" ? "Desactivar deuteranopía" : "Activar deuteranopía"}
                        >
                            <img className="accessibility-option-icon" src={deuteranopiaIcon} alt="" aria-hidden="true" />
                            <span>Deuteranopía</span>
                            <span className="daltonismo-paleta" aria-hidden="true">
                                <span className="muestra-rojo" />
                                <span className="muestra-verde" />
                                <span className="muestra-amarillo" />
                                <span className="muestra-secundario" />
                            </span>
                        </button>
                        <button
                            type="button"
                            className={`btn-daltonismo ${preferencias.daltonismo === "tritanopia" ? "activo" : ""}`}
                            onClick={(event) => {
                                event.stopPropagation();
                                alternarDaltonismo("tritanopia");
                            }}
                            aria-pressed={preferencias.daltonismo === "tritanopia"}
                            title={preferencias.daltonismo === "tritanopia" ? "Desactivar tritanopía" : "Activar tritanopía"}
                        >
                            <img className="accessibility-option-icon" src={tritanopiaIcon} alt="" aria-hidden="true" />
                            <span>Tritanopía</span>
                            <span className="daltonismo-paleta" aria-hidden="true">
                                <span className="muestra-rojo" />
                                <span className="muestra-verde" />
                                <span className="muestra-amarillo" />
                                <span className="muestra-secundario" />
                            </span>
                        </button>
                    </div>
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