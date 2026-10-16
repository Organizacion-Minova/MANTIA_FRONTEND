import api from './axios';

export async function GetEquipments() {
    const { data } = await api.get("/api/equipment");
    return data;
}

export async function CreateEquipment(equipo){
    const {data}=await api.post("/api/equipment",equipo);
    return data;
};
export async function DeleteEquipment(id) {
    const {data}=await api.post(`/api/equipment/${id}`);
    return data;
}