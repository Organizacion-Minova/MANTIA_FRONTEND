import api from './axios';

// --- Usuarios ---
export async function obtenerUsuarios() {
    const { data } = await api.get('/api/admin/users');
    return data.users;
}

export async function alternarActivoUsuario(id) {
    const { data } = await api.put(`/api/admin/users/${id}/toggle-active`);
    return data;
}

export async function cambiarPasswordUsuario(id, password, password_confirmation) {
    const { data } = await api.put(`/api/admin/users/${id}/password`, { password, password_confirmation });
    return data;
}

export async function cambiarRolUsuario(id, role) {
    const { data } = await api.put(`/api/admin/users/${id}/role`, { role });
    return data;
}

// --- Roles ---
export async function obtenerRoles() {
    const { data } = await api.get('/api/admin/roles');
    return data.roles;
}

export async function crearRol(name, permissions = []) {
    const { data } = await api.post('/api/admin/roles', { name, permissions });
    return data;
}

export async function actualizarRol(id, name, permissions = []) {
    const { data } = await api.put(`/api/admin/roles/${id}`, { name, permissions });
    return data;
}

export async function alternarActivoRol(id) {
    const { data } = await api.put(`/api/admin/roles/${id}/toggle-active`);
    return data;
}

export async function eliminarRol(id) {
    const { data } = await api.delete(`/api/admin/roles/${id}`);
    return data;
}

// --- Backups ---
export async function obtenerOpcionesBackup() {
    const { data } = await api.get('/api/admin/backups/options');
    return data.opciones;
}

export async function obtenerBackups() {
    const { data } = await api.get('/api/admin/backups');
    return data.backups;
}

export async function crearBackup(tablas) {
    const { data } = await api.post('/api/admin/backups', { tablas });
    return data.backup;
}

export async function obtenerPermisosDisponibles() {
    const { data } = await api.get('/api/admin/permissions');
    return data.grupos;
}
// Las tres acciones siguientes piden la contraseña del usuario.
export async function descargarBackup(archivo, password) {
    // Se pide como texto para guardar el archivo EXACTAMENTE como está en el servidor.
    // Si axios lo convierte en objeto y se vuelve a escribir, el contenido cambia y el hash ya no coincide.
    const response = await api.post(
        `/api/admin/backups/${archivo}/download`,
        { password },
        { responseType: 'text', transformResponse: [(texto) => texto] }
    );
    const blob = new Blob([response.data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.setAttribute('download', archivo);
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    window.URL.revokeObjectURL(url);
}

export async function eliminarBackup(archivo, password) {
    const { data } = await api.delete(`/api/admin/backups/${archivo}`, { data: { password } });
    return data;
}

export async function restaurarBackup(archivo, password) {
    const { data } = await api.post(`/api/admin/backups/${archivo}/restore`, { password });
    return data;
}
