import { createContext, useContext, useState } from "react";

// 1. Creamos el "canal" de contexto. Empieza en null porque
//    todavía no tiene ningún valor real.
const AuthContext = createContext(null);

// 2. Usuario de prueba fijo (sin base de datos por ahora).
const USUARIO_PRUEBA = {
    email: "admin@mantia.com",
    password: "admin123",
    nombre: "Administrador MANTIA",
};

// 3. El Provider es un componente que ENVUELVE tu app y le
//    inyecta el valor del contexto a todo lo que esté adentro.
export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(null);

    const isAuthenticated = !!usuario; // true si usuario no es null

    function login(email, password) {
        if (email !== USUARIO_PRUEBA.email || password !== USUARIO_PRUEBA.password) {
            throw new Error("Credenciales incorrectas.");
        }
        setUsuario({ nombre: USUARIO_PRUEBA.nombre, email });
    }

    function logout() {
        setUsuario(null);
    }

    // 4. Todo lo que pongas aquí es lo que van a poder leer
    //    los demás componentes con useAuth().
    const value = { usuario, isAuthenticated, login, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 5. Hook de conveniencia: en vez de que cada componente escriba
//    useContext(AuthContext), escriben useAuth().
export function useAuth() {
    return useContext(AuthContext);
}