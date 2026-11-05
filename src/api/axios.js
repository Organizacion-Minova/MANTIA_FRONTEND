import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000',
    withCredentials: true,
    withXSRFToken: true,
});

const RECURSOS = {
    'machine-categories': { nombre: 'Categoría de máquina', f: true },
    'location-category': { nombre: 'Categoría de ubicación', f: true },
    'category-tools': { nombre: 'Categoría de herramienta', f: true },
    'gas-measurements': { nombre: 'Medición de gas', f: true },
    'location': { nombre: 'Ubicación', f: true },
    'machines': { nombre: 'Máquina', f: true },
    'equipment': { nombre: 'Equipo', f: false },
    'tools': { nombre: 'Herramienta', f: true },
    'dailyuse': { nombre: 'Registro de uso diario', f: false },
    'inspections': { nombre: 'Inspección', f: true },
    'inspection-formats-equipment': { nombre: 'Formato de inspección', f: false },
};

// método -> [masculino, femenino]
const ACCIONES = {
    post: ['creado', 'creada'],
    put: ['editado', 'editada'],
    patch: ['editado', 'editada'],
    delete: ['eliminado', 'eliminada'],
};

// Estas pantallas ya muestran sus propios errores en el formulario
const MANEJAN_SUS_ERRORES = [
    'login',
    'dev-login',
    'register',
    'forgot-password',
    'reset-password',
    'inspection-formats-equipment',
];

function segmentos(url = '') {
    const ruta = url.replace(/^https?:\/\/[^/]+/, '').split('?')[0];
    return ruta.split('/').filter(Boolean); // ['api', 'machine-categories', '5']
}

function esMutacion(metodo = 'get') {
    return ['post', 'put', 'patch', 'delete'].includes(metodo.toLowerCase());
}

function metodoEfectivo(config = {}) {
    const metodo = (config.method || 'get').toLowerCase();
    const datos = config.data;
    const metodoSobrescrito = typeof FormData !== 'undefined' && datos instanceof FormData
        ? datos.get('_method')
        : datos && typeof datos === 'object'
            ? datos._method
            : null;

    return typeof metodoSobrescrito === 'string' &&
        ['put', 'patch', 'delete'].includes(metodoSobrescrito.toLowerCase())
        ? metodoSobrescrito.toLowerCase()
        : metodo;
}

function esIgnorada(url) {
    const partes = segmentos(url);
    return url?.includes('csrf-cookie') || partes[1] === 'notificaciones' || partes[1] === 'ai';
}

// El cuerpo del error puede llegar como texto (descargas): se intenta leer como JSON
function cuerpoDeError(error) {
    const datos = error.response?.data;
    if (typeof datos !== 'string') return datos;
    try { return JSON.parse(datos); } catch { return null; }
}

// Comparte únicamente peticiones GET idénticas que todavía están en curso.
// No guarda respuestas en caché: una consulta posterior vuelve a llegar al servidor.
const solicitudesGetEnCurso = new Map();
const getOriginal = api.get.bind(api);

function claveSolicitudGet(url, config = {}) {
    let params = "";
    let headers = "";

    try {
        params = JSON.stringify(config.params ?? null);
    } catch {
        params = String(config.params);
    }

    try {
        headers = JSON.stringify(config.headers ?? null);
    } catch {
        headers = "";
    }

    return JSON.stringify({
        url: String(url),
        params,
        headers,
        responseType: config.responseType ?? "json",
    });
}

api.get = (url, config = {}) => {
    // No compartir peticiones de autenticación: una sesión puede cambiar
    // entre el inicio de sesión y una verificación que ya estaba en curso.
    const ruta = String(url);
    if (
        config.signal ||
        config.cancelToken ||
        ruta.includes("/api/user") ||
        ruta.includes("csrf-cookie")
    ) {
        return getOriginal(url, config);
    }

    const clave = claveSolicitudGet(url, config);
    const existente = solicitudesGetEnCurso.get(clave);

    if (existente) {
        return existente;
    }

    const solicitud = getOriginal(url, config).finally(() => {
        if (solicitudesGetEnCurso.get(clave) === solicitud) {
            solicitudesGetEnCurso.delete(clave);
        }
    });

    solicitudesGetEnCurso.set(clave, solicitud);
    return solicitud;
};

// Estos recursos tienen observadores en Laravel que pueden crear notificaciones.
// Las demás mutaciones no necesitan volver a consultar la campana.
const RECURSOS_QUE_GENERAN_ALERTAS = new Set([
    "machine-categories",
    "location-category",
    "location",
    "category-tools",
    "tools",
    "equipment",
    "machines",
    "gas-measurements",
    "dailyuse",
    "inspections",
]);

function debeActualizarNotificaciones(url) {
    const partes = segmentos(url);
    const recurso = partes[1];

    // El inicio de sesión genera una notificación desde el listener de Laravel.
    if (recurso === "login" || recurso === "dev-login") return true;

    return RECURSOS_QUE_GENERAN_ALERTAS.has(recurso);
}

function mensajeExito(metodo, url) {
    const m = metodo.toLowerCase();
    const partes = segmentos(url);
    const recurso = partes[1];

    if (recurso === 'login' || recurso === 'dev-login') return 'Sesión iniciada correctamente';
    if (recurso === 'logout') return 'Sesión cerrada correctamente';
    if (recurso === 'register') return 'Solicitud enviada. Tu cuenta quedará pendiente de aprobación del administrador.';
    if (recurso === 'forgot-password') return 'Te enviamos un código de recuperación al correo';
    if (recurso === 'reset-password') return 'Contraseña actualizada correctamente';
    if (recurso === 'admin' && partes[2] === 'approve') return 'Solicitud aprobada correctamente';
    if (recurso === 'admin' && partes[2] === 'reject') return 'Solicitud rechazada correctamente';
    if (recurso === 'gas-measurements' && m === 'post') return 'Medición de gas guardada correctamente';
    if (recurso === 'profile' && partes[2] === 'password') return 'Contraseña actualizada correctamente';
    if (recurso === 'profile') return 'Perfil actualizado correctamente';
    if (recurso === 'admin' && partes[2] === 'roles' && m === 'put') return 'Rol editado correctamente';
    if (recurso === 'admin' && partes[2] === 'backups') {
        if (partes[4] === 'restore') return 'Copia restaurada correctamente';
        if (partes[4] === 'download') return 'Copia descargada correctamente';
        if (m === 'delete') return 'Copia de seguridad eliminada correctamente';
        return 'Copia de seguridad generada correctamente';
    }

    const info = RECURSOS[recurso];
    const accion = ACCIONES[m];
    if (info && accion) {
        return `${info.nombre} ${info.f ? accion[1] : accion[0]} correctamente`;
    }
    if (m === 'put' || m === 'patch') return 'Registro editado correctamente';
    return 'Operación realizada correctamente';
}

function mensajeError(error) {
    if (!error.response) return 'No se pudo conectar con el servidor.';

    const { status } = error.response;
    const data = cuerpoDeError(error);
    if (status === 422 && data?.errors) {
        return Object.values(data.errors).flat()[0] ?? 'Revisa los datos del formulario.';
    }
    if (status === 403) return 'No tienes permiso para realizar esta acción.';
    if (status >= 500) return 'Error del servidor. Intenta de nuevo.';
    return data?.message ?? 'No se pudo completar la acción.';
}

function avisar(tipo, mensaje, titulo, duracion) {
    window.dispatchEvent(new CustomEvent('app:toast', { detail: { tipo, mensaje, titulo, duracion } }));
}

api.interceptors.response.use(
    (respuesta) => {
        const { url } = respuesta.config;
        const method = metodoEfectivo(respuesta.config);

        if (esMutacion(method) && !esIgnorada(url)) {
            // El mensaje del registro es más largo, así que se deja más tiempo en pantalla
            const duracion = segmentos(url)[1] === 'register' ? 7000 : undefined;
            avisar('success', mensajeExito(method, url), 'Operación exitosa', duracion);

            // Refresca la campana al instante (el cierre de sesión no lo necesita)
            if (segmentos(url)[1] !== 'logout') {
                window.dispatchEvent(new Event('notificaciones:actualizar'));
            }
        }
          if (debeActualizarNotificaciones(url)) {
                window.dispatchEvent(new Event('notificaciones:actualizar'));
            }
        return respuesta;
    },
    (error) => {
        const config = error.config;

        // La cuenta o el rol se desactivaron con la sesión abierta: se avisa y se cierra la sesión
        const cuerpo = cuerpoDeError(error);
        if (error.response?.status === 401 && cuerpo?.codigo === 'cuenta_inactiva') {
            avisar('warning', cuerpo.message, 'Acceso bloqueado', 8000);
            window.dispatchEvent(new Event('sesion:cerrada'));
            return Promise.reject(error);
        }

        if (
            config &&
            esMutacion(config.method) &&
            !esIgnorada(config.url) &&
            !MANEJAN_SUS_ERRORES.includes(segmentos(config.url)[1]) &&
            error.response?.status !== 401
        ) {
            avisar('danger', mensajeError(error), 'No se pudo completar la acción', 6000);
        }
        return Promise.reject(error);
    }
);

export default api;