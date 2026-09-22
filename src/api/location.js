import api from './axios';

export const obtenerUbicaciones = async () => {
    try {
        const response = await api.get('/api/location');
        return response.data;
    } catch (error) {
        console.error('Error en obtenerUbicaciones:', error);
        return { ubicaciones: [], categorias: [] };
    }
};

export const guardarUbicacion = async (datos) => {
    const response = await api.post('/api/location', datos);
    return response.data;
};

export const actualizarUbicacion = async (id, datos) => {
    const response = await api.put(`/api/location/${id}`, datos);
    return response.data;
};

export const eliminarUbicacion = async (id) => {
    const response = await api.delete(`/api/location/${id}`);
    return response.data;
};
