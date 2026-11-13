import api from './axios';
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



// Machines

export async function GetMachine() {
    const { data } = await api.get("/api/machines");
    return data;
}

export async function CreateMachine(maquina) {
    const { data } = await api.post("/api/machines", maquina);
    return data;
}
export async function DeleteMachine(id) {
    const { data } = await api.delete(`/api/machines/${id}`);
    return data;
}
export async function UpdateMachine(id, maquina) {
    maquina.append("_method", "PUT");
    const { data } = await api.post(`/api/machines/${id}`, maquina);
    return data;
}
export async function GetMachineById(id) {
    const { data } = await api.get(`/api/machines/${id}`);
    return data;
}

export async function GetMachineOptions() {
    const { data } = await api.get("/api/machine-options");
    return data;
}

// Exportaciones

export const exportarFichaTecnicaMaquinaExcelUnitario = async (id, name) => {
    const response = await api.get(`/api/machine/${id}/export/excel`, { responseType: 'blob' });
    descargarBlob(response.data, `Ficha técnica ${name}.xlsx`);
};

export const exportarFichaTecnicaMaquinaPdfUnitario = async (id, name) => {
    const response = await api.get(`/api/machine/${id}/export/pdf`, { responseType: 'blob' });
    descargarBlob(response.data, `Ficha técnica ${name}.pdf`, 'application/pdf');
};

export const exportarInspeccionMaquinaPdfUnitario = async (inspectionId, machineName, date) => {
    const response = await api.get(`/api/inspection-machine/${inspectionId}/export/pdf`, { responseType: 'blob' });
    descargarBlob(response.data, `Inspección ${machineName} ${date}.pdf`, 'application/pdf');
};

export const exportarInspeccionMaquinaExcelUnitario = async (inspectionId, machineName, date) => {
    const response = await api.get(`/api/inspection-machine/${inspectionId}/export/excel`, { responseType: 'blob' });
    descargarBlob(response.data, `Inspección ${machineName} ${date}.xlsx`);
};

export const exportarPreoperacionalMaquinaPdfUnitario = async (preoperationalId, machineName, date) => {
    const response = await api.get(`/api/preoperational-machine/${preoperationalId}/export/pdf`, { responseType: 'blob' });
    descargarBlob(response.data, `Preoperacional ${machineName} ${date}.pdf`, 'application/pdf');
};

export const exportarPreoperacionalMaquinaExcelUnitario = async (preoperationalId, machineName, date) => {
    const response = await api.get(`/api/preoperational-machine/${preoperationalId}/export/excel`, { responseType: 'blob' });
    descargarBlob(response.data, `Preoperacional ${machineName} ${date}.xlsx`);
};

export const exportarInspeccionMaquinaExcelRango = async (machineId, machineName, fechaInicio, fechaFin) => {
    const response = await api.get(`/api/machines/${machineId}/inspection-machine/export/range/excel?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`, { responseType: 'blob' });
    descargarBlob(response.data, `Inspecciones ${machineName} ${fechaInicio} al ${fechaFin}.xlsx`);
};

export const exportarInspeccionMaquinaPdfRango = async (machineId, machineName, fechaInicio, fechaFin) => {
    const response = await api.get(`/api/machines/${machineId}/inspection-machine/export/range/pdf?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`, { responseType: 'blob' });
    descargarBlob(response.data, `Inspecciones ${machineName} ${fechaInicio} al ${fechaFin}.pdf`, 'application/pdf');
};

export const exportarPreoperacionalMaquinaExcelRango = async (machineId, machineName, weekStart, weekEnd) => {
    const response = await api.get(`/api/machines/${machineId}/preoperational-machine/export/range/excel?week_start=${weekStart}&week_end=${weekEnd}`, { responseType: 'blob' });
    descargarBlob(response.data, `Preoperacionales ${machineName} ${weekStart} al ${weekEnd}.xlsx`);
};

export const exportarPreoperacionalMaquinaPdfRango = async (machineId, machineName, weekStart, weekEnd) => {
    const response = await api.get(`/api/machines/${machineId}/preoperational-machine/export/range/pdf?week_start=${weekStart}&week_end=${weekEnd}`, { responseType: 'blob' });
    descargarBlob(response.data, `Preoperacionales ${machineName} ${weekStart} al ${weekEnd}.pdf`, 'application/pdf');
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

// Formato inspeccion y preoperacional

export async function GetMachineFormat(machineId) {
    const { data } = await api.get(`/api/machines/${machineId}/inspection-format`);
    return data;
}

export async function CreateMachineFormat(datos) {
    const { data } = await api.post("/api/inspection-formats-machine", datos);
    return data;
}

export async function UpdateMachineFormat(id, datos) {
    const { data } = await api.put(`/api/inspection-formats-machine/${id}`, datos);
    return data;
}

export async function GetMachineRecords(machineId, kind) {
    const { data } = await api.get(`/api/machines/${machineId}/records/${kind}`);
    return data;
}

export async function GetMachineRecordPeriod(machineId, kind, date) {
    const { data } = await api.get(`/api/machines/${machineId}/records/${kind}/period`, {
        params: { date },
    });
    return data;
}

export async function GetMachineRecord(kind, id) {
    const { data } = await api.get(`/api/machine-records/${kind}/${id}`);
    return data;
}

export async function SaveMachineRecord(kind, { signature_image, ...contenido }) {
    const formData = new FormData();
    formData.append("data", JSON.stringify(contenido));
    if (signature_image) formData.append("signature_image", signature_image);
    const { data } = await api.post(`/api/machine-records/${kind}`, formData);
    return data;
}

// Consumibles maquinas

export async function GetMachineTools(machineId) {
    const { data } = await api.get("/api/machine-tools", {
        params: { machine_id: machineId },
    });
    return data;
}

export async function GetConsumableTools(machineId) {
    const { data } = await api.get("/api/consumable-tools", {
        params: { machine_id: machineId },
    });
    return data;
}

export async function CreateMachineTool(payload) {
    const { data } = await api.post("/api/machine-tools", payload);
    return data;
}

export async function UpdateMachineTool(id, payload) {
    const { data } = await api.put(`/api/machine-tools/${id}`, payload);
    return data;
}

export async function DeleteMachineTool(id) {
    await api.delete(`/api/machine-tools/${id}`);
}

export async function GetInspectionOverviewMachines() {
    const { data } = await api.get("/api/inspection-overview/machines");
    return data;
}