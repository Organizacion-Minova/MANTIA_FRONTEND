import api from './axios';

// Categorias Herramientas
export async function GetCategoryTools() {
    const { data } = await api.get("/api/category-tools");
    return data;
}

export async function CreateCategoryTools(categoria) {
    const { data } = await api.post("/api/category-tools", categoria);
    return data;
}

export async function DeleteCategoryTools(id) {
    const { data } = await api.delete(`/api/category-tools/${id}`);
    return data;
}

export async function UpdateCategoryTools(id, categoria) {
    const { data } = await api.put(`/api/category-tools/${id}`, categoria);
    return data;
}
export async function GetCategoryToolById(id) {
    const { data } = await api.get(`/api/category-tools/${id}`);
    return data;
}