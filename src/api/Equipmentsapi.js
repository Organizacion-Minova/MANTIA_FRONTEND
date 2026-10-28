import api from './axios';

export async function GetEquipments() {
    const { data } = await api.get("/api/equipment");
    return data;
};

export async function CreateEquipment(formData){
    const {data}=await api.post("/api/equipment",formData);
    return data;
};

export async function DeleteEquipment(id) {
    const {data}=await api.delete(`/api/equipment/${id}`);
    return data;
};

export async function UpdateEquipment(id, formData) {
    formData.append("_method", "PUT");
    const {data} = await api.post(`/api/equipment/${id}`, formData);
    return data; 
};
export async function GetEquipmentById(id) {
    const { data } = await api.get(`/api/equipment/${id}`);
    return data;
}

// preguntas inspeccion

export async function GetEquipmentQuestions(equipmentId, includeInactive = false) {
    const { data } = await api.get("/api/equipment-questions", {
        params: {
            equipment_id: equipmentId,
            include_inactive: includeInactive ? 1 : 0,
        },
    });
    return data;
}

export async function CreateEquipmentQuestion(question) {
    const { data } = await api.post("/api/equipment-questions", question);
    return data;
}



// Formato inspeccion

export async function CreateEquipmentInspection(formData) {
    const { data } = await api.post("/api/equipment-inspections", formData);
    return data;
}

export async function GetEquipmentInspections(equipmentId) {
    const { data } = await api.get("/api/equipment-inspections", {
        params: { equipment_id: equipmentId },
    });
    return data;
}

export async function GetEquipmentInspectionById(id) {
    const { data } = await api.get(`/api/equipment-inspections/${id}`);
    return data;
}

// Exportaciones

export const exportarFichaTecnicaEquipoExcelUnitario = async (id, name) => {
    const response = await api.get(`/api/equipment/${id}/export/excel`, { responseType: 'blob' });
    descargarBlob(response.data, `Ficha_técnica_${name}.xlsx`);
};

export const exportarFichaTecnicaEquipoPdfUnitario = async (id, name) => {
    const response = await api.get(`/api/equipment/${id}/export/pdf`, { responseType: 'blob' });
    descargarBlob(response.data, `Ficha_técnica_${name}.pdf`, 'application/pdf');
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
