export const PUNTO_POR_TIPO = {
    danger: "punto-rojo",
    warning: "punto-amarillo",
    success: "punto-verde",
    info: "punto-azul",
};

const ETIQUETAS_CATEGORIA = {
    login: "Inicio de sesión",
    logout: "Cierre de sesión",
    maquina: "Máquina",
    equipo: "Equipo",
    herramienta: "Herramienta",
    ubicacion: "Ubicación",
    categoria: "Categoría",
    empresa: "Empresa",
    inspeccion: "Inspección",
    gas: "Medición de gas",
};

function formatearHora(fechaISO) {
    const diffMs = Date.now() - new Date(fechaISO).getTime();
    const minutos = Math.floor(diffMs / 60000);
    if (minutos < 1) return "Ahora";
    if (minutos < 60) return `${minutos} min`;
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `${horas} h`;
    return `${Math.floor(horas / 24)} d`;
}

// Convierte un registro de la tabla `notifications` de Laravel
// al formato que usan los componentes visuales.
export function mapearNotificacionBackend(registro) {
    const { tipo: categoria, mensaje, nivel } = registro.data;

    return {
        id: registro.id,
        tipo: nivel, // 'info' | 'warning' | 'danger'
        titulo: ETIQUETAS_CATEGORIA[categoria] ?? categoria,
        mensaje,
        hora: formatearHora(registro.created_at),
        leida: registro.read_at !== null,
    };
}