import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    useLocation,
    useNavigate,
    useNavigationType,
} from "react-router-dom";

import { useAuth } from "./AuthContext.jsx";

import {
    obtenerInterfazHistorial,
} from "../utils/navigationHistory.js";

const NavigationHistoryContext = createContext(null);

const MAXIMO_ENTRADAS = 8;
const CLAVE_HISTORIAL = "mantia_historial_navegacion";

const HISTORIAL_VACIO = {
    entradas: [],
    indiceActual: -1,
};

function limitarEntradas(entradas, indiceActual) {
    if (entradas.length <= MAXIMO_ENTRADAS) {
        return {
            entradas,
            indiceActual,
        };
    }

    const cantidadEliminar = entradas.length - MAXIMO_ENTRADAS;

    return {
        entradas: entradas.slice(cantidadEliminar),
        indiceActual: Math.max(
            0,
            indiceActual - cantidadEliminar
        ),
    };
}

function crearEntrada(interfaz, locationKey) {
    return {
        ...interfaz,
        locationKey,
    };
}

function obtenerClaveHistorial(idUsuario) {
    return `${CLAVE_HISTORIAL}_${idUsuario}`;
}

function recuperarHistorial(idUsuario) {
    try {
        const clave = obtenerClaveHistorial(idUsuario);
        const historialGuardado = sessionStorage.getItem(clave);

        if (!historialGuardado) {
            return HISTORIAL_VACIO;
        }

        const historialParseado = JSON.parse(historialGuardado);

        if (
            !historialParseado ||
            !Array.isArray(historialParseado.entradas) ||
            !Number.isInteger(historialParseado.indiceActual)
        ) {
            return HISTORIAL_VACIO;
        }

        const entradasValidas = historialParseado.entradas
            .filter((entrada) =>
                entrada &&
                typeof entrada.pathname === "string" &&
                typeof entrada.titulo === "string" &&
                typeof entrada.locationKey === "string" &&
                obtenerInterfazHistorial(entrada.pathname) !== null
            )
            .slice(-MAXIMO_ENTRADAS)
            .map((entrada) => {
                const interfaz = obtenerInterfazHistorial(
                    entrada.pathname
                );

                return {
                    ...entrada,
                    titulo: interfaz.titulo,
                };
            });

        if (entradasValidas.length === 0) {
            return HISTORIAL_VACIO;
        }

        const indiceActual = Math.min(
            Math.max(historialParseado.indiceActual, 0),
            entradasValidas.length - 1
        );

        return {
            entradas: entradasValidas,
            indiceActual,
        };
    } catch {
        return HISTORIAL_VACIO;
    }
}

function guardarHistorial(idUsuario, historial) {
    try {
        const clave = obtenerClaveHistorial(idUsuario);

        sessionStorage.setItem(
            clave,
            JSON.stringify(historial)
        );
    } catch (error) {
        console.error(
            "No se pudo guardar el historial de navegación:",
            error
        );
    }
}

function eliminarHistorial(idUsuario) {
    if (idUsuario === null || idUsuario === undefined) {
        return;
    }

    try {
        sessionStorage.removeItem(
            obtenerClaveHistorial(idUsuario)
        );
    } catch (error) {
        console.error(
            "No se pudo eliminar el historial de navegación:",
            error
        );
    }
}

export function NavigationHistoryProvider({ children }) {
    const { usuario, isAuthenticated } = useAuth();

    const location = useLocation();
    const navigate = useNavigate();
    const navigationType = useNavigationType();

    const [historial, setHistorial] = useState(HISTORIAL_VACIO);
    const [historialInicializado, setHistorialInicializado] =
        useState(false);

    const identidadAnterior = useRef(null);
    const ultimaLocationKey = useRef(null);
    const destinoHistorial = useRef(null);
    const usuarioAnterior = useRef(null);

    const identidadUsuario = isAuthenticated
        ? usuario?.id ?? null
        : null;

    /*
     * Recuperar el historial cuando se identifica al usuario.
     */
    useEffect(() => {
        if (!isAuthenticated || identidadUsuario === null) {
            const usuarioAnteriorId = usuarioAnterior.current;

            if (usuarioAnteriorId !== null) {
                eliminarHistorial(usuarioAnteriorId);
            }

            usuarioAnterior.current = null;
            identidadAnterior.current = null;
            ultimaLocationKey.current = null;
            destinoHistorial.current = null;

            setHistorial(HISTORIAL_VACIO);
            setHistorialInicializado(false);

            return;
        }

        usuarioAnterior.current = identidadUsuario;

        if (identidadAnterior.current === identidadUsuario) {
            return;
        }

        identidadAnterior.current = identidadUsuario;
        ultimaLocationKey.current = location.key;
        destinoHistorial.current = null;

        const historialGuardado = recuperarHistorial(
            identidadUsuario
        );

        const interfazActual = obtenerInterfazHistorial(
            location.pathname
        );

        /*
         * Si la ruta actual ya está registrada, sincronizar
         * su ubicación y la posición actual.
         */
        const indiceRutaActual = historialGuardado.entradas.findIndex(
            (entrada) => entrada.pathname === location.pathname
        );

        let historialInicial = historialGuardado;

        if (indiceRutaActual !== -1) {
            const entradas = [...historialGuardado.entradas];

            entradas[indiceRutaActual] = crearEntrada(
                obtenerInterfazHistorial(location.pathname),
                location.key
            );

            historialInicial = {
                entradas,
                indiceActual: indiceRutaActual,
            };
        } else if (interfazActual) {
            /*
             * Si se abre una ruta funcional que no estaba
             * registrada, añadirla al recorrido recuperado.
             */
            const entradasAnteriores =
                historialGuardado.indiceActual >= 0
                    ? historialGuardado.entradas.slice(
                        0,
                        historialGuardado.indiceActual + 1
                    )
                    : [];

            const entradas = [
                ...entradasAnteriores,
                crearEntrada(interfazActual, location.key),
            ];

            historialInicial = limitarEntradas(
                entradas,
                entradas.length - 1
            );
        }

        setHistorial(historialInicial);
        setHistorialInicializado(true);
    }, [
        isAuthenticated,
        identidadUsuario,
        location.key,
        location.pathname,
    ]);

    /*
     * Registrar y sincronizar las navegaciones.
     */
    useEffect(() => {
        if (
            !isAuthenticated ||
            identidadUsuario === null ||
            !historialInicializado
        ) {
            return;
        }

        /*
         * Ignorar la ubicación ya procesada durante la
         * inicialización del historial.
         */
        if (ultimaLocationKey.current === location.key) {
            return;
        }

        ultimaLocationKey.current = location.key;

        const interfaz = obtenerInterfazHistorial(
            location.pathname
        );

        /*
         * No registrar rutas públicas o desconocidas.
         */
        if (!interfaz) {
            destinoHistorial.current = null;
            return;
        }

        const nuevaEntrada = crearEntrada(
            interfaz,
            location.key
        );

        /*
         * Caso 1: navegación seleccionada desde el historial visual.
         */
        if (destinoHistorial.current === interfaz.pathname) {
            destinoHistorial.current = null;

            setHistorial((actual) => {
                const indiceEncontrado = actual.entradas.findIndex(
                    (entrada) => entrada.pathname === interfaz.pathname
                );

                if (indiceEncontrado === -1) {
                    return {
                        entradas: [nuevaEntrada],
                        indiceActual: 0,
                    };
                }

                const entradas = actual.entradas.slice(
                    0,
                    indiceEncontrado + 1
                );

                entradas[indiceEncontrado] = nuevaEntrada;

                return {
                    entradas,
                    indiceActual: indiceEncontrado,
                };
            });

            return;
        }

        /*
         * Caso 2: Atrás o Adelante del navegador.
         */
        if (navigationType === "POP") {
            setHistorial((actual) => {
                const indicePorClave = actual.entradas.findIndex(
                    (entrada) => entrada.locationKey === location.key
                );

                if (indicePorClave !== -1) {
                    return {
                        ...actual,
                        indiceActual: indicePorClave,
                    };
                }

                const indicePorRuta = actual.entradas.findIndex(
                    (entrada) => entrada.pathname === interfaz.pathname
                );

                if (indicePorRuta !== -1) {
                    const entradas = [...actual.entradas];

                    entradas[indicePorRuta] = nuevaEntrada;

                    return {
                        entradas,
                        indiceActual: indicePorRuta,
                    };
                }

                const entradasAnteriores = actual.entradas.slice(
                    0,
                    actual.indiceActual + 1
                );

                const entradas = [
                    ...entradasAnteriores,
                    nuevaEntrada,
                ];

                return limitarEntradas(
                    entradas,
                    entradas.length - 1
                );
            });

            return;
        }

        /*
         * Caso 3: reemplazo de la ubicación actual.
         */
        if (navigationType === "REPLACE") {
            setHistorial((actual) => {
                if (actual.indiceActual === -1) {
                    return {
                        entradas: [nuevaEntrada],
                        indiceActual: 0,
                    };
                }

                const entradas = actual.entradas.slice(
                    0,
                    actual.indiceActual + 1
                );

                entradas[actual.indiceActual] = nuevaEntrada;

                return {
                    entradas,
                    indiceActual: actual.indiceActual,
                };
            });

            return;
        }

        /*
         * Caso 4: navegación normal.
         */
        setHistorial((actual) => {
            const indiceEncontrado = actual.entradas.findIndex(
                (entrada) => entrada.pathname === interfaz.pathname
            );

            if (indiceEncontrado !== -1) {
                const entradas = actual.entradas.slice(
                    0,
                    indiceEncontrado + 1
                );

                entradas[indiceEncontrado] = nuevaEntrada;

                return {
                    entradas,
                    indiceActual: indiceEncontrado,
                };
            }

            const entradasAnteriores = actual.entradas.slice(
                0,
                actual.indiceActual + 1
            );

            const entradas = [
                ...entradasAnteriores,
                nuevaEntrada,
            ];

            return limitarEntradas(
                entradas,
                entradas.length - 1
            );
        });
    }, [
        location.key,
        location.pathname,
        navigationType,
        isAuthenticated,
        identidadUsuario,
        historialInicializado,
    ]);

    /*
     * Guardar los cambios del historial después de inicializarlo.
     */
    useEffect(() => {
        if (
            !isAuthenticated ||
            identidadUsuario === null ||
            !historialInicializado
        ) {
            return;
        }

        guardarHistorial(identidadUsuario, historial);
    }, [
        historial,
        historialInicializado,
        isAuthenticated,
        identidadUsuario,
    ]);

    /*
     * Navegar a una interfaz seleccionada visualmente.
     */
    const navegarAlHistorial = useCallback(
        (entrada) => {
            if (!entrada?.pathname) {
                return;
            }

            if (location.pathname === entrada.pathname) {
                return;
            }

            destinoHistorial.current = entrada.pathname;
            navigate(entrada.pathname);
        },
        [location.pathname, navigate]
    );

    const valor = useMemo(
        () => ({
            entradas: historial.entradas,
            indiceActual: historial.indiceActual,
            navegarAlHistorial,
        }),
        [
            historial.entradas,
            historial.indiceActual,
            navegarAlHistorial,
        ]
    );

    return (
        <NavigationHistoryContext.Provider value={valor}>
            {children}
        </NavigationHistoryContext.Provider>
    );
}

export function useNavigationHistory() {
    const contexto = useContext(NavigationHistoryContext);

    if (!contexto) {
        throw new Error(
            "useNavigationHistory debe utilizarse dentro de NavigationHistoryProvider."
        );
    }

    return contexto;
}

