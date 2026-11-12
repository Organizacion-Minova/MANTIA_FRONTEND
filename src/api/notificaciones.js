import api from './axios';

export async function obtenerNotificaciones() {
    const { data } = await api.get('/api/notificaciones');
    return data;
}

export async function marcarComoLeida(id) {
    await api.post(`/api/notificaciones/${id}/leer`);
}

export async function marcarTodasComoLeidas() {
    await api.post('/api/notificaciones/leer-todas');
}

// Historial para la pantalla Alertas (la campana solo trae las últimas 50)
export async function obtenerHistorialNotificaciones() {
    const { data } = await api.get('/api/notificaciones/historial');
    return data;
}

export const exportarAlertasExcelRango = async (fechaInicio, fechaFin, nivel = '') => {
    const response = await pedirExportacion('excel', fechaInicio, fechaFin, nivel);
    descargarBlob(response.data, `Alertas_${fechaInicio}_al_${fechaFin}.xlsx`);
};

export const exportarAlertasPdfRango = async (fechaInicio, fechaFin, nivel = '') => {
    const response = await pedirExportacion('pdf', fechaInicio, fechaFin, nivel);
    descargarBlob(response.data, `Alertas_${fechaInicio}_al_${fechaFin}.pdf`, 'application/pdf');
};

const pedirExportacion = async (formato, fechaInicio, fechaFin, nivel) => {
    const params = new URLSearchParams({ fecha_inicio: fechaInicio, fecha_fin: fechaFin });
    if (nivel) params.set('nivel', nivel);

    try {
        return await api.get(`/api/notificaciones/export/${formato}?${params}`, { responseType: 'blob' });
    } catch (error) {
        // Con responseType 'blob' el mensaje de error del servidor llega como archivo: se lee aquí
        // para que la pantalla pueda mostrarlo (ej: "No hay alertas en el rango seleccionado.").
        error.mensajeServidor = await leerMensajeDeError(error);
        throw error;
    }
};

const leerMensajeDeError = async (error) => {
    const datos = error.response?.data;
    try {
        const json = datos instanceof Blob ? JSON.parse(await datos.text()) : datos;
        return (json?.errors && Object.values(json.errors).flat()[0]) || json?.message || null;
    } catch {
        return null;
    }
};

const descargarBlob = (data, filename, mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') => {
    const blob = new Blob([data], { type: mimeType });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};