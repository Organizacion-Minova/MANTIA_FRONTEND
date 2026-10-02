import api from './axios';

export async function obtenerUbicaciones() {
    const { data } = await api.get('/api/locations');
    return data;
}

export async function crearUbicacion(datos) {
    const { data } = await api.post('/api/locations', datos);
    return data;
}

export async function obtenerCategoriasUbicacion() {
    const { data } = await api.get('/api/location-categories');
    return data;
}