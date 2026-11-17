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

// --- Usuarios: crear desde el panel ---
export async function crearUsuario(datos) {
    const { data } = await api.post('/api/admin/users', datos);
    return data;
}

export async function obtenerPermisosDisponibles() {
    const { data } = await api.get('/api/admin/permissions');
    return data.grupos;
}

// --- Backups generales ---
export async function obtenerBackups() {
    const { data } = await api.get('/api/admin/backups');
    return data; // { backups, primer_backup, clave_admin_configurada, resumen }
}

export async function crearPrimerBackup(password) {
    const { data } = await api.post('/api/admin/backups', { password });
    return data;
}

export async function crearBackup(clave_admin) {
    const { data } = await api.post('/api/admin/backups', { clave_admin });
    return data.backup;
}

export async function descargarBackup(archivo, clave_admin) {
    // Se pide como texto para guardar el archivo EXACTAMENTE como está en el servidor.
    // Si axios lo convierte en objeto y se vuelve a escribir, el contenido cambia y el hash ya no coincide.
    const response = await api.post(
        `/api/admin/backups/${encodeURIComponent(archivo)}/download`,
        { clave_admin },
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

export async function eliminarBackup(archivo, clave_admin) {
    const { data } = await api.delete(`/api/admin/backups/${encodeURIComponent(archivo)}`, { data: { clave_admin } });
    return data;
}

export async function restaurarBackup(archivo, clave_admin) {
    const { data } = await api.post(`/api/admin/backups/${encodeURIComponent(archivo)}/restore`, { clave_admin });
    return data;
}

// --- Historial de cambios ---
export async function obtenerHistorial(filtros = {}) {
    const params = Object.fromEntries(Object.entries(filtros).filter(([, v]) => v !== "" && v != null));
    const { data } = await api.get('/api/admin/activity', { params });
    return data;
}

export async function obtenerCambio(id) {
    const { data } = await api.get(`/api/admin/activity/${id}`);
    return data.cambio;
}

export async function revertirCambio(id, password, forzar = false) {
    const { data } = await api.post(`/api/admin/activity/${id}/revert`, { password, forzar });
    return data;
}

// --- Pruebas automatizadas (solo Superadministrador) ---
export async function obtenerPruebas() {
    const { data } = await api.get('/api/admin/tests');
    return data;
}

export async function correrPruebas() {
    // Pueden tardar varios minutos
    const { data } = await api.post('/api/admin/tests/run', {}, { timeout: 11 * 60 * 1000 });
    return data;
}
