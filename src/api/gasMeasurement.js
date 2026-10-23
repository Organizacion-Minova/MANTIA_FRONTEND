import api from './axios';

export const obtenerMedicionesGases = async () => {
    try {
        const response = await api.get('/api/gas-measurements');
        return response.data;
    } catch (error) {
        console.error('Error en obtenerMedicionesGases:', error);
        return { data: [] };
    }
};

export const crearMedicionGases = async (datos) => {
    const response = await api.post('/api/gas-measurements', datos);
    return response.data;
};

export const obtenerMedicionPorId = async (id) => {
    const response = await api.get(`/api/gas-measurements/${id}`);
    return response.data;
};

export const actualizarDetalleGases = async (detailId, datos) => {
    const response = await api.put(`/api/gas-measurements/detail/${detailId}`, datos);
    return response.data;
};

export const actualizarCabeceraGases = async (id, datos) => {
    const response = await api.put(`/api/gas-measurements/header/${id}`, datos);
    return response.data;
};

export const eliminarMedicionGases = async (id) => {
    const response = await api.delete(`/api/gas-measurements/${id}`);
    return response.data;
};