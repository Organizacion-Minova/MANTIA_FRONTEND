// Protege una pantalla según permiso o rol.
// Uso: <RutaConPermiso permiso="tool.view"><Pantalla /></RutaConPermiso>
//      <RutaConPermiso roles={["Jefe de mina"]}><Pantalla /></RutaConPermiso>
import { useAuth } from "../context/AuthContext.jsx";

function RutaConPermiso({ permiso, roles, children }) {
    const { tienePermiso, tieneRol } = useAuth();

    const permitido = roles ? tieneRol(...roles) : tienePermiso(permiso);

    if (!permitido) {
        return (
            <div className="list-grid">
                <p role="alert">No tienes permiso para ver esta sección.</p>
            </div>
        );
    }

    return children;
}

export default RutaConPermiso;