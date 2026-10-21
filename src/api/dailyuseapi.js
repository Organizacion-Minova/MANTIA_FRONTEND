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