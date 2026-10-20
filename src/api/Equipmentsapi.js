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