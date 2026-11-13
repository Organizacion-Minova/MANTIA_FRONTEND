import api from './axios';

export const obtenerUbicaciones = async () => {
    try {
        const response = await api.get('/api/location');
        return response.data;
    } catch (error) {
        console.error('Error en obtenerUbicaciones:', error);
        return { ubicaciones: [], categorias: [] };
    }
};

export const guardarUbicacion = async (datos) => {
    const response = await api.post('/api/location', datos);
    return response.data;
};

export const actualizarUbicacion = async (id, datos) => {
    const response = await api.put(`/api/location/${id}`, datos);
    return response.data;
};

export const eliminarUbicacion = async (id) => {
    const response = await api.delete(`/api/location/${id}`);
    return response.data;
};

export const obtenerOpcionesUbicaciones = async ()=>{
    const response = await api.get(`/api/location-options`);
    return response.data;
}
// Ficha de la ubicación: máquinas, equipos, herramientas y mediciones de gases que tiene
export const obtenerInventarioUbicacion = async (id) => {
    const response = await api.get(`/api/location/${id}/inventory`);
    return response.data;
};
// Descarga del inventario de la ubicación (Excel y PDF), con lo que el usuario tiene permiso de ver
export const exportarInventarioUbicacionExcel = async (id, nombre) => {
    const response = await api.get(`/api/location/${id}/export/excel`, { responseType: 'blob' });
    descargarBlob(response.data, `${nombreArchivoInventario(nombre)}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
};

export const exportarInventarioUbicacionPdf = async (id, nombre) => {
    const response = await api.get(`/api/location/${id}/export/pdf`, { responseType: 'blob' });
    descargarBlob(response.data, `${nombreArchivoInventario(nombre)}.pdf`, 'application/pdf');
};

// "Zona de Pruebas" => "Inventario_Zona_de_Pruebas"
const nombreArchivoInventario = (nombre) =>
    'Inventario_' + String(nombre).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');

const descargarBlob = (data, filename, mimeType) => {
    const blob = new Blob([data], { type: mimeType });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};