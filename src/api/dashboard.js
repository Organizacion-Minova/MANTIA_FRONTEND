import api from './axios';

export async function getDashboard() {
    const { data: body } = await api.get('/api/dashboard');
    return body;   // { data: {...secciones}, meta: { generatedAt, sections } }
}