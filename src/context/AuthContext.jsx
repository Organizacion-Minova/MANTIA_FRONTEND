import { createContext, useContext, useState, useEffect } from "react";
import { login as loginRequest, logout as logoutRequest, getUser, quickLogin } from "../api/auth";
import { mensajeDeError } from "../utils/errores";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(null);
    const [cargando, setCargando] = useState(true);

    const isAuthenticated = !!usuario;

    async function login(email, password, captchaToken) {
        try {
            const data = await loginRequest(email, password, captchaToken);
            setUsuario(data);
        } catch (err) {
        if (err.response?.status === 401) {
        throw new Error("Credenciales incorrectas.");
    }
        // Deja pasar el mensaje real del backend (cuenta pendiente, rechazada, 422, sin conexión...)
        throw new Error(mensajeDeError(err, "No se pudo iniciar sesión."));
        }
    }

    async function loginConLetra(letra) {
        try {
            const data = await quickLogin(letra);
            setUsuario(data);
        } catch (err) {
            throw new Error("Esa letra no corresponde a ningún desarrollador.");
        }
    }

    async function logout() {
        await logoutRequest();
        setUsuario(null);
    }

    async function cargarUsuarioActual() {
        try {
            const data = await getUser();
            setUsuario(data);
            return true;
        } catch {
            setUsuario(null);
            return false;
        } finally {
            setCargando(false); // NUEVO: pase lo que pase, ya terminamos de verificar
        }
    }

    useEffect(() => {
        cargarUsuarioActual().finally(() => setCargando(false));
    }, []);

    // Permisos y roles que llegan desde el backend (GET /api/user)
    const permisos = usuario?.permission_names ?? [];
    const roles = (usuario?.roles ?? []).map((r) => r.name);
    const tienePermiso = (permiso) => permisos.includes(permiso);
    const tieneRol = (...nombres) => nombres.some((n) => roles.includes(n));

    const value = { usuario, isAuthenticated, login, loginConLetra, logout, cargarUsuarioActual, cargando, tienePermiso, tieneRol, roles };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}