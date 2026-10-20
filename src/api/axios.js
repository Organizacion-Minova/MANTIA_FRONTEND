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
    'company': { nombre: 'Empresa', f: true },
    'location': { nombre: 'Ubicación', f: true },
    'machines': { nombre: 'Máquina', f: true },
    'equipment': { nombre: 'Equipo', f: false },
    'tools': { nombre: 'Herramienta', f: true },
    'inspections': { nombre: 'Inspección', f: true },
};

// método -> [masculino, femenino]
const ACCIONES = {
    post: ['creado', 'creada'],
    put: ['editado', 'editada'],
    patch: ['editado', 'editada'],
    delete: ['eliminado', 'eliminada'],
};

// Estas pantallas ya muestran sus propios errores en el formulario
const MANEJAN_SUS_ERRORES = ['login', 'dev-login', 'register', 'forgot-password', 'reset-password'];

function segmentos(url = '') {
    const ruta = url.replace(/^https?:\/\/[^/]+/, '').split('?')[0];
    return ruta.split('/').filter(Boolean); // ['api', 'machine-categories', '5']
}

function esMutacion(metodo = 'get') {
    return ['post', 'put', 'patch', 'delete'].includes(metodo.toLowerCase());
}

function esIgnorada(url) {
    const partes = segmentos(url);
    return url?.includes('csrf-cookie') || partes[1] === 'notificaciones';
}

function mensajeExito(metodo, url) {
    const m = metodo.toLowerCase();
    const partes = segmentos(url);
    const recurso = partes[1];

    if (recurso === 'login' || recurso === 'dev-login') return 'Sesión iniciada correctamente';
    if (recurso === 'logout') return 'Sesión cerrada correctamente';
    if (recurso === 'register') return 'Solicitud de registro enviada correctamente';
    if (recurso === 'forgot-password') return 'Te enviamos un código de recuperación al correo';
    if (recurso === 'reset-password') return 'Contraseña actualizada correctamente';
    if (recurso === 'admin' && partes[2] === 'approve') return 'Solicitud aprobada correctamente';
    if (recurso === 'admin' && partes[2] === 'reject') return 'Solicitud rechazada correctamente';
    if (recurso === 'gas-measurements' && m === 'post') return 'Medición de gas guardada correctamente';

    const info = RECURSOS[recurso];
    const accion = ACCIONES[m];
    if (info && accion) {
        return `${info.nombre} ${info.f ? accion[1] : accion[0]} correctamente`;
    }
    return 'Operación realizada correctamente';
}

function mensajeError(error) {
    if (!error.response) return 'No se pudo conectar con el servidor.';

    const { status, data } = error.response;
    if (status === 422 && data?.errors) {
        return Object.values(data.errors).flat()[0] ?? 'Revisa los datos del formulario.';
    }
    if (status === 403) return 'No tienes permiso para realizar esta acción.';
    if (status >= 500) return 'Error del servidor. Intenta de nuevo.';
    return data?.message ?? 'No se pudo completar la acción.';
}

function avisar(tipo, mensaje, titulo) {
    window.dispatchEvent(new CustomEvent('app:toast', { detail: { tipo, mensaje, titulo } }));
}

api.interceptors.response.use(
    (respuesta) => {
        const { method, url } = respuesta.config;

        if (esMutacion(method) && !esIgnorada(url)) {
            avisar('success', mensajeExito(method, url), 'Operación exitosa');

            // Refresca la campana al instante (el cierre de sesión no lo necesita)
            if (segmentos(url)[1] !== 'logout') {
                window.dispatchEvent(new Event('notificaciones:actualizar'));
            }
        }
        return respuesta;
    },
    (error) => {
        const config = error.config;

        if (
            config &&
            esMutacion(config.method) &&
            !esIgnorada(config.url) &&
            !MANEJAN_SUS_ERRORES.includes(segmentos(config.url)[1]) &&
            error.response?.status !== 401
        ) {
            avisar('danger', mensajeError(error), 'Ocurrió un error');
        }
        return Promise.reject(error);
    }
);

export default api;