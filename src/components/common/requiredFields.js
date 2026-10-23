export function validarCamposRequeridos(campos) {
    const faltantes = Object.entries(campos)
        .filter(([, valor]) => valor == null || String(valor).trim() === "")
        .map(([campo]) => campo);

    if (faltantes.length === 0) return true;

    window.dispatchEvent(new CustomEvent("app:toast", {
        detail: {
            tipo: "warning",
            titulo: "Campos obligatorios",
            mensaje: `Completa los siguientes campos: ${faltantes.join(", ")}.`,
        },
    }));

    return false;
}
