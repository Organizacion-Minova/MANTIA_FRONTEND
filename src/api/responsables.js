import api from './axios';

export async function obtenerRolesResponsables() {
    const { data } = await api.get('/api/roles-responsables');
    return data.roles;
}
