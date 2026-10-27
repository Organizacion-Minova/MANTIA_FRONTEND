export const PUNTO_POR_TIPO = {
    danger: "punto-rojo",
    warning: "punto-amarillo",
    success: "punto-verde",
    info: "punto-azul",
};

export const ETIQUETAS_CATEGORIA = {
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
    uso_diario: "Uso diario",
};

// Pantalla por categoría, para alertas que no traen "enlace" (las guardadas antes del cambio)
const RUTA_POR_CATEGORIA = {
    gas: "/gases",
    maquina: "/machines",
    equipo: "/equipment",
    herramienta: "/consumables/tools",
    ubicacion: "/ubications",
    empresa: "/companies",
    categoria: "/machines/categoriesmachines",
    inspeccion: "/inspection",
    uso_diario: "/dailyuse",
};

// Solo rutas internas de MANTIA ("/machines/..."), nunca otra página
const esRutaInterna = (ruta) => typeof ruta === "string" && /^\/(?!\/)[\w\-/]*$/.test(ruta);

// Pantalla a la que lleva una alerta al hacer clic (null si no lleva a ninguna, ej: inicio de sesión)
export function rutaDeAlerta(notificacion) {
    if (esRutaInterna(notificacion?.enlace)) return notificacion.enlace;
    return RUTA_POR_CATEGORIA[notificacion?.categoria] ?? null;
}

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
    const { tipo: categoria, mensaje, nivel, enlace } = registro.data;

    return {
        id: registro.id,
        tipo: nivel, // 'info' | 'warning' | 'danger'
        titulo: ETIQUETAS_CATEGORIA[categoria] ?? categoria,
        mensaje,
        categoria,
        enlace: enlace ?? null, // pantalla exacta (ej: /machines/cardMachine/5)
        fecha: registro.created_at,
        hora: formatearHora(registro.created_at),
        leida: registro.read_at !== null,
    };
}