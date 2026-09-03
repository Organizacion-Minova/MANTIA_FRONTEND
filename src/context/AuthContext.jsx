import { createContext, useContext, useState, useEffect } from "react";
import { login as loginRequest, logout as logoutRequest, getUser, quickLogin } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(null);
    const [cargando, setCargando] = useState(true);

    const isAuthenticated = !!usuario;

    async function login(email, password) {
        try {
            const data = await loginRequest(email, password);
            setUsuario(data);
        } catch (err) {
            if (err.response?.status === 401) {
                throw new Error("Credenciales incorrectas.");
            }
            throw new Error("No se pudo conectar con el servidor.");
        }
    }

    // Login rápido de desarrollo: recibe una sola letra (D, S, J, L, K)
    // y entra directo como ese usuario, sin verificar contraseña.
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
        }
    }

    useEffect(() => {
        cargarUsuarioActual().finally(() => setCargando(false));
    }, []);

    const value = { usuario, isAuthenticated, login, loginConLetra, logout, cargarUsuarioActual, cargando };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}