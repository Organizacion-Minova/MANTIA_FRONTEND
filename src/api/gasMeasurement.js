import api from './axios';

export const obtenerMedicionesGases = async () => {
    try {
        const response = await api.get('/api/gas-measurements');
        return response.data;
    } catch (error) {
        console.error('Error en obtenerMedicionesGases:', error);
        return { data: [] };
    }
};

export const crearMedicionGases = async (datos) => {
    const response = await api.post('/api/gas-measurements', datos);
    return response.data;
};

export const obtenerMedicionPorId = async (id) => {
    const response = await api.get(`/api/gas-measurements/${id}`);
    return response.data;
};

export const actualizarDetalleGases = async (detailId, datos) => {
    const response = await api.put(`/api/gas-measurements/detail/${detailId}`, datos);
    return response.data;
};

export const actualizarCabeceraGases = async (id, datos) => {
    const response = await api.put(`/api/gas-measurements/header/${id}`, datos);
    return response.data;
};

export const eliminarMedicionGases = async (id) => {
    const response = await api.delete(`/api/gas-measurements/${id}`);
    return response.data;
};

export const exportarGasExcelUnitario = async (id, fecha) => {
    const response = await api.get(`/api/gas-measurements/${id}/export/excel`, { responseType: 'blob' });
    descargarBlob(response.data, `Medición_gases_${fecha}.xlsx`);
};

export const exportarGasPdfUnitario = async (id, fecha) => {
    const response = await api.get(`/api/gas-measurements/${id}/export/pdf`, { responseType: 'blob' });
    descargarBlob(response.data, `Medición_gases_${fecha}.pdf`, 'application/pdf');
};

export const exportarGasExcelRango = async (fechaInicio, fechaFin) => {
    const response = await api.get(`/api/gas-measurements/export/range/excel?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`, { responseType: 'blob' });
    descargarBlob(response.data, `Medición_gases_${fechaInicio}_al_${fechaFin}.xlsx`);
};

export const exportarGasPdfRango = async (fechaInicio, fechaFin) => {
    const response = await api.get(`/api/gas-measurements/export/range/pdf?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`, { responseType: 'blob' });
    descargarBlob(response.data, `Medición_gases_${fechaInicio}_al_${fechaFin}.pdf`, 'application/pdf');
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