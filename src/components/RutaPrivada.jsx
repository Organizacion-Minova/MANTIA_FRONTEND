// Envuelve las rutas que solo deben verse con sesión iniciada.
// Si no hay sesión, redirige a /login en vez de mostrar el contenido.
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function RutaPrivada({ children }) {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default RutaPrivada;