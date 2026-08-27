import { createContext, useContext, useState } from "react";
import { login as loginRequest, logout as logoutRequest, getUser } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(null);

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

    async function logout() {
        await logoutRequest();
        setUsuario(null);
    }

    async function cargarUsuarioActual() {
        try {
            const data = await getUser();
            setUsuario(data);
        } catch {
            setUsuario(null);
        }
    }

    const value = { usuario, isAuthenticated, login, logout, cargarUsuarioActual };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}