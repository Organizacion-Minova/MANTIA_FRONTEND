import api from './axios';

export async function login(email, password) {
    // 1. Pedir la cookie CSRF antes de loguear (requisito de Sanctum)
    await api.get('/sanctum/csrf-cookie');

    // 2. Enviar credenciales
    await api.post('/api/login', { email, password });

    // 3. Confirmar que quedamos logueados, trayendo los datos del usuario
    const { data } = await api.get('/api/user');

    return data;
}

export async function getUser() {
    const { data } = await api.get('/api/user');
    return data;
}

export async function logout() {
    await api.post('/api/logout');
}
