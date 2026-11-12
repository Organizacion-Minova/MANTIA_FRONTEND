import api from './axios';

export const obtenerCategoriasUbicacion = async () => {
    try {
        const response = await api.get('/api/location-category');
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        console.error('Error en obtenerCategoriasUbicacion:', error);
        return [];
    }
};

export const guardarCategoriaUbicacion = async (datos) => {
    const response = await api.post('/api/location-category', datos);
    return response.data;
};

export const actualizarCategoriaUbicacion = async (id, datos) => {
    const response = await api.put(`/api/location-category/${id}`, datos);
    return response.data;
};

export const eliminarCategoriaUbicacion = async (id) => {
    const response = await api.delete(`/api/location-category/${id}`);
    return response.data;
};
