import api from './axios';

export async function obtenerNotificaciones() {
    const { data } = await api.get('/api/notificaciones');
    return data;
}

export async function marcarComoLeida(id) {
    await api.post(`/api/notificaciones/${id}/leer`);
}