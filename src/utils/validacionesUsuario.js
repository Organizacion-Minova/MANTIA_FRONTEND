// Validaciones de datos de personas (crear cuenta, recuperar contraseña, perfil y usuarios del panel).
// Son las MISMAS reglas del backend (app/Support/ReglasUsuario.php y app/Rules/ContrasenaSegura.php):
// si cambias una, cambia la otra. El frontend filtra lo que se escribe y avisa antes de enviar;
// el backend vuelve a validar todo (doble validación).

export const TIPOS_DOCUMENTO = [
    { valor: "CC", etiqueta: "Cédula de ciudadanía" },
    { valor: "CE", etiqueta: "Cédula de extranjería" },
    { valor: "TI", etiqueta: "Tarjeta de identidad" },
    { valor: "PA", etiqueta: "Pasaporte" },
];

// Reglas por tipo de documento
export const REGLAS_DOCUMENTO = {
    CC: { soloNumeros: true, min: 6, max: 10, patron: /^[1-9][0-9]{5,9}$/, ejemplo: "Ej: 1020304050",
        mensaje: "La cédula de ciudadanía debe tener solo números, entre 6 y 10 dígitos (sin empezar en 0)." },
    CE: { soloNumeros: true, min: 6, max: 10, patron: /^[0-9]{6,10}$/, ejemplo: "Ej: 4567890",
        mensaje: "La cédula de extranjería debe tener solo números, entre 6 y 10 dígitos." },
    TI: { soloNumeros: true, min: 10, max: 11, patron: /^[0-9]{10,11}$/, ejemplo: "Ej: 1001234567",
        mensaje: "La tarjeta de identidad debe tener solo números, entre 10 y 11 dígitos." },
    PA: { soloNumeros: false, min: 6, max: 12, patron: /^[A-Z0-9]{6,12}$/, ejemplo: "Ej: AB123456",
        mensaje: "El pasaporte debe tener entre 6 y 12 caracteres, solo letras y números." },
};

const PATRON_NOMBRE = /^\p{L}+( \p{L}+)*$/u;
const PATRON_CORREO = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

// ---------- Filtros: lo que se puede ESCRIBIR en cada campo ----------

// Nombres: solo letras y espacios (no deja dos espacios seguidos ni empezar con espacio)
export function filtrarNombre(texto) {
    return String(texto ?? "")
        .replace(/[^\p{L} ]/gu, "")
        .replace(/^ +/, "")
        .replace(/ {2,}/g, " ")
        .slice(0, 50);
}

// Documento según su tipo: cédula solo números (máx. 10), pasaporte letras y números en mayúscula
export function filtrarDocumento(texto, tipo) {
    const regla = REGLAS_DOCUMENTO[tipo];
    let limpio = String(texto ?? "").toUpperCase();

    limpio = regla?.soloNumeros ? limpio.replace(/\D/g, "") : limpio.replace(/[^A-Z0-9]/g, "");

    return limpio.slice(0, regla?.max ?? 12);
}

// Código de recuperación: solo números, máximo 6
export function filtrarCodigo(texto) {
    return String(texto ?? "").replace(/\D/g, "").slice(0, 6);
}

export function filtrarCorreo(texto) {
    return String(texto ?? "").replace(/\s/g, "").slice(0, 100);
}

// Contraseñas y claves: sin espacios, máximo 64
export function filtrarContrasena(texto) {
    return String(texto ?? "").replace(/\s/g, "").slice(0, 64);
}

// ---------- Validadores: devuelven el mensaje de error o null ----------

export function validarNombre(texto, campo = "El nombre") {
    const valor = String(texto ?? "").trim();
    if (!valor) return `${campo} es obligatorio.`;
    if (valor.length < 2) return `${campo} debe tener al menos 2 letras.`;
    if (valor.length > 50) return `${campo} no puede superar los 50 caracteres.`;
    if (!PATRON_NOMBRE.test(valor)) return `${campo} solo puede tener letras y espacios.`;
    return null;
}

export function validarCorreo(texto) {
    const valor = String(texto ?? "").trim();
    if (!valor) return "El correo electrónico es obligatorio.";
    if (valor.length > 100) return "El correo electrónico no puede superar los 100 caracteres.";
    if (!PATRON_CORREO.test(valor)) return "Ingresa un correo electrónico válido (ej: nombre@correo.com).";
    return null;
}

export function validarDocumento(tipo, numero) {
    if (!tipo) return "Selecciona el tipo de documento.";
    const regla = REGLAS_DOCUMENTO[tipo];
    if (!regla) return "El tipo de documento seleccionado no es válido.";
    if (!numero) return "El número de documento es obligatorio.";
    if (!regla.patron.test(numero)) return regla.mensaje;
    return null;
}

// Lo que le falta a una contraseña (para la lista de requisitos)
export function requisitosContrasena(texto) {
    const valor = String(texto ?? "");
    return [
        { id: "largo", texto: "Entre 8 y 64 caracteres", cumple: valor.length >= 8 && valor.length <= 64 },
        { id: "mayuscula", texto: "Una letra mayúscula", cumple: /\p{Lu}/u.test(valor) },
        { id: "minuscula", texto: "Una letra minúscula", cumple: /\p{Ll}/u.test(valor) },
        { id: "numero", texto: "Un número", cumple: /\d/.test(valor) },
        { id: "espacios", texto: "Sin espacios", cumple: valor.length > 0 && !/\s/.test(valor) },
    ];
}

export function validarContrasena(texto, campo = "La contraseña") {
    const valor = String(texto ?? "");
    if (!valor) return `${campo} es obligatoria.`;
    if (valor.length < 8) return `${campo} debe tener mínimo 8 caracteres.`;
    if (valor.length > 64) return `${campo} no puede superar los 64 caracteres.`;
    if (/\s/.test(valor)) return `${campo} no puede tener espacios.`;
    if (!/\p{Lu}/u.test(valor)) return `${campo} debe tener al menos una letra mayúscula.`;
    if (!/\p{Ll}/u.test(valor)) return `${campo} debe tener al menos una letra minúscula.`;
    if (!/\d/.test(valor)) return `${campo} debe tener al menos un número.`;
    return null;
}

export function validarConfirmacion(valor, confirmacion) {
    if (!confirmacion) return "Confirma la contraseña.";
    if (valor !== confirmacion) return "Las contraseñas no coinciden.";
    return null;
}

export function validarCodigo(texto) {
    if (!texto) return "Escribe el código que te llegó al correo.";
    if (!/^\d{6}$/.test(texto)) return "El código debe tener exactamente 6 números.";
    return null;
}

// Junta errores { campo: mensaje } quitando los vacíos
export function soloErrores(errores) {
    return Object.fromEntries(Object.entries(errores).filter(([, msg]) => Boolean(msg)));
}

// Convierte los errores 422 del backend ({ campo: ["msg"] }) a { campo: "msg" }
export function erroresDelServidor(err) {
    const errores = err?.response?.data?.errors;
    if (!errores || typeof errores !== "object") return {};
    return Object.fromEntries(Object.entries(errores).map(([campo, lista]) => [campo, Array.isArray(lista) ? lista[0] : String(lista)]));
}
