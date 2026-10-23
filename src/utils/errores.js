// Convierte un error de axios en un texto legible para mostrarlo en un toast.
// Prioriza el primer error de validación (422) y luego el "message" del backend.
export function mensajeDeError(error, porDefecto = "No se pudo completar la acción.") {
    if (!error?.response) return "No se pudo conectar con el servidor.";

    const { status, data } = error.response;

    // Un 500 trae el texto crudo de la excepción (SMTP, SQL...): nunca se le muestra al usuario
    if (status === 500) return "Error del servidor. Intenta de nuevo.";

    if (status === 422 && data?.errors) {
        return Object.values(data.errors).flat()[0] ?? data.message ?? porDefecto;
    }
    return data?.message ?? porDefecto;
}

// Primer mensaje de un objeto de errores { campo: ["mensaje", ...] }.
export function primerError(errores = {}) {
    return Object.values(errores).flat().find(Boolean) ?? null;
}