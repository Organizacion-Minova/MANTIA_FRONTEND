import api from './axios';

export async function GetDailyUse() {
    const { data } = await api.get("/api/dailyuse");
    return data;
}

export async function CreateDailyUse(formData) {
    const { data } = await api.post("/api/dailyuse", formData);
    return data;
}

export async function UpdateDailyUse(id, formData) {
    formData.append("_method", "PUT");
    const { data } = await api.post(`/api/dailyuse/${id}`, formData);
    return data;
}

export async function DeleteDailyUse(id) {
    const { data } = await api.delete(`/api/dailyuse/${id}`);
    return data;
}

export const exportarUsoDiarioExcelUnitario = async (id, name) => {
    const response = await api.get(`/api/dailyuse/${id}/export/excel`, { responseType: 'blob' });
    descargarBlob(response.data, `Uso_diario_${name}.xlsx`);
};

export const exportarUsoDiarioPdfUnitario = async (id, name) => {
    const response = await api.get(`/api/dailyuse/${id}/export/pdf`, { responseType: 'blob' });
    descargarBlob(response.data, `Uso_diario_${name}.pdf`, 'application/pdf');
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