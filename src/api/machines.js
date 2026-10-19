import api from './axios';

export async function obtenerMaquinas() {
    const { data } = await api.get('/api/machines');
    return data;
}

export async function crearMaquina(datos) {
    const { data } = await api.post('/api/machines', datos);
    return data;
}

export async function obtenerUbicaciones() {
    const { data } = await api.get('/api/locations');
    return data;
}

export async function obtenerCategoriasMaquina() {
    const { data } = await api.get('/api/machine-categories');
    return data;
}