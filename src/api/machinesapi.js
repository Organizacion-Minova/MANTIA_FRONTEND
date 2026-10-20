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