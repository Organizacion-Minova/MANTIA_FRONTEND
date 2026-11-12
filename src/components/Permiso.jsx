// Muestra su contenido solo si el usuario tiene el permiso. Sirve para ocultar botones.
// Uso: <Permiso necesita="tool.create"><button>Agregar</button></Permiso>
import { useAuth } from "../context/AuthContext.jsx";

function Permiso({ necesita, children }) {
    const { tienePermiso } = useAuth();
    return tienePermiso(necesita) ? children : null;
}

export default Permiso;
