import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { login as loginRequest, logout as logoutRequest, getUser, quickLogin } from "../api/auth";
import { mensajeDeError } from "../utils/errores";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(null);
    const [cargando, setCargando] = useState(true);

    // Comparte una única petición GET /api/user cuando varios procesos la solicitan a la vez.
    const solicitudUsuarioRef = useRef(null);

    // Identifica cambios de sesión para ignorar respuestas antiguas que lleguen tarde.
    const versionSesionRef = useRef(0);

    // Evita que focus + intervalo provoquen verificaciones repetidas en pocos milisegundos.
    const ultimaRevisionRef = useRef(0);

    const isAuthenticated = !!usuario;

    const obtenerUsuarioCompartido = useCallback(() => {
        if (solicitudUsuarioRef.current) {
            return solicitudUsuarioRef.current;
        }

        const solicitud = getUser().finally(() => {
            if (solicitudUsuarioRef.current === solicitud) {
                solicitudUsuarioRef.current = null;
            }
        });

        solicitudUsuarioRef.current = solicitud;
        return solicitud;
    }, []);

    async function login(email, password, captchaToken) {
        try {
            const data = await loginRequest(email, password, captchaToken);
            versionSesionRef.current += 1;
            setUsuario(data);
            ultimaRevisionRef.current = Date.now();
        } catch (err) {
            if (err.response?.status === 401) {
                throw new Error("Credenciales incorrectas.");
            }

            // Deja pasar el mensaje real del backend (cuenta pendiente, rechazada, 422, sin conexión...).
            throw new Error(mensajeDeError(err, "No se pudo iniciar sesión."));
        }
    }

    async function loginConLetra(letra) {
        try {
            const data = await quickLogin(letra);
            versionSesionRef.current += 1;
            setUsuario(data);
            ultimaRevisionRef.current = Date.now();
        } catch (err) {
            throw new Error("Esa letra no corresponde a ningún desarrollador.");
        }
    }

    async function logout() {
        try {
            await logoutRequest();
        } catch {
            // Aunque el servidor ya haya cerrado la sesión, aquí también se cierra.
        } finally {
            versionSesionRef.current += 1;
            setUsuario(null);
            ultimaRevisionRef.current = 0;
        }
    }

    const cargarUsuarioActual = useCallback(async () => {
        try {
            const data = await obtenerUsuarioCompartido();
            setUsuario(data);
            ultimaRevisionRef.current = Date.now();
            return true;
        } catch {
            setUsuario(null);
            return false;
        } finally {
            setCargando(false);
        }
    }, [obtenerUsuarioCompartido]);

    // La petición compartida impide que StrictMode genere dos GET /api/user al iniciar.
    useEffect(() => {
        let activo = true;
        const versionInicial = versionSesionRef.current;

        obtenerUsuarioCompartido()
            .then((data) => {
                if (!activo || versionSesionRef.current !== versionInicial) return;
                setUsuario(data);
                ultimaRevisionRef.current = Date.now();
            })
            .catch(() => {
                if (!activo || versionSesionRef.current !== versionInicial) return;
                setUsuario(null);
            })
            .finally(() => {
                if (activo) setCargando(false);
            });

        return () => {
            activo = false;
        };
    }, [obtenerUsuarioCompartido]);

    // El servidor dijo que la cuenta o el rol están desactivados: se cierra la sesión al instante.
    useEffect(() => {
        const cerrar = () => {
            versionSesionRef.current += 1;
            setUsuario(null);
            ultimaRevisionRef.current = 0;
        };

        window.addEventListener("sesion:cerrada", cerrar);
        return () => window.removeEventListener("sesion:cerrada", cerrar);
    }, []);

    // Comprueba sesión, rol y permisos cada minuto y al volver a la pestaña.
    useEffect(() => {
        if (!isAuthenticated) return undefined;

        let activo = true;

        const revisar = async () => {
            if (document.visibilityState === "hidden") return;

            const ahora = Date.now();
            // Evita que varios eventos focus/visibilitychange consecutivos consulten repetidamente.
            if (ahora - ultimaRevisionRef.current < 5000) return;
            ultimaRevisionRef.current = ahora;

            const versionActual = versionSesionRef.current;

            try {
                const nuevo = await obtenerUsuarioCompartido();
                if (!activo || versionSesionRef.current !== versionActual) return;

                setUsuario((previo) => (
                    JSON.stringify(previo) === JSON.stringify(nuevo) ? previo : nuevo
                ));
            } catch (err) {
                if (activo && versionSesionRef.current === versionActual && err.response?.status === 401) {
                    setUsuario(null);
                }
            }
        };

        const intervalo = window.setInterval(revisar, 60000);
        window.addEventListener("focus", revisar);
        document.addEventListener("visibilitychange", revisar);

        return () => {
            activo = false;
            window.clearInterval(intervalo);
            window.removeEventListener("focus", revisar);
            document.removeEventListener("visibilitychange", revisar);
        };
    }, [isAuthenticated, obtenerUsuarioCompartido]);

    // Permisos y roles que llegan desde el backend (GET /api/user).
    const permisos = usuario?.permission_names ?? [];
    const roles = (usuario?.roles ?? []).map((r) => r.name);
    const tienePermiso = (permiso) => permisos.includes(permiso);
    const tieneRol = (...nombres) => nombres.some((n) => roles.includes(n));

    const value = {
        usuario,
        isAuthenticated,
        login,
        loginConLetra,
        logout,
        cargarUsuarioActual,
        cargando,
        tienePermiso,
        tieneRol,
        roles,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}
