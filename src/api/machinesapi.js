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
