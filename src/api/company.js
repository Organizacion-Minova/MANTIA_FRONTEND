import api from './axios';

export const obtenerEmpresas = async () => {
  try {
    const response = await api.get('/api/company');
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error en obtenerEmpresas:', error);
    return [];
  }
};

export const guardarEmpresa = async (datos) => {
  const response = await api.post('/api/company', datos);
  return response.data;
};

export const actualizarEmpresa = async (id, datos) => {
  const response = await api.put(`/api/company/${id}`, datos);
  return response.data;
};

export const eliminarEmpresa = async (id) => {
  const response = await api.delete(`/api/company/${id}`);
  return response.data;
};
