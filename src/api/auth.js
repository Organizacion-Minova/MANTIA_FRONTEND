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

export async function quickLogin(letra) {
    await api.get('/sanctum/csrf-cookie');
    const { data } = await api.post(`/api/dev-login/${letra}`);
    return data.user;   // ← extraemos el usuario de adentro del wrapper
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