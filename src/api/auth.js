import api from './axios';

export async function login(email, password, captchaToken) {
    // 1. Pedir la cookie CSRF antes de loguear (requisito de Sanctum)
    await api.get('/sanctum/csrf-cookie');

    // 2. Enviar credenciales
    await api.post('/api/login', { email, password, captcha_token: captchaToken });

    // 3. Confirmar que quedamos logueados, trayendo los datos del usuario
    const { data } = await api.get('/api/user');

    return data;
}

export async function getUser() {
    const { data } = await api.get('/api/user');
    return data;
}

// Sesión actual sin exigir login: devuelve el usuario o null (nunca un 401).
// Se usa al abrir la página y en las revisiones periódicas, así las páginas
// públicas no muestran errores de red antes de iniciar sesión.
export async function getSession() {
    const { data } = await api.get('/api/session');
    return data?.user ?? null;
}

export async function logout() {
    await api.post('/api/logout');
}

export async function register(userData) {
    await api.get('/sanctum/csrf-cookie');
    const { data } = await api.post('/api/register', userData);
    return data;
}

export async function GetCategoryMachine() {
    const { data } = await api.get("/api/machine-categories");
    return data;
}

export async function CreateCategoryMachine(categoria) {
    const { data } = await api.post("/api/machine-categories", categoria);
    return data;
}

export async function DeleteCategoryMachine(id) {
    const { data } = await api.delete(`/api/machine-categories/${id}`);
    return data;
}

export async function UpdateCategoryMachine(id, categoria) {
    const { data } = await api.put(`/api/machine-categories/${id}`, categoria);
    return data;
}

export async function getPendingRequests() {
    const { data } = await api.get('/api/admin/requests');
    return data.requests;
}

export async function approveRequest(id) {
    const { data } = await api.post(`/api/admin/approve/${id}`);
    return data;
}

export async function rejectRequest(id) {
    const { data } = await api.post(`/api/admin/reject/${id}`);
    return data;
}