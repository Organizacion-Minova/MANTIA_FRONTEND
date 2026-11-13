import api from "../api/axios";

export function urlImagen(imagen) {
    if (!imagen) return "";
    if (/^(data:|https?:\/\/)/i.test(imagen)) return imagen;

    const ruta = imagen.replace(/^\/+/, "").replace(/^storage\//, "");
    return `${api.defaults.baseURL.replace(/\/+$/, "")}/storage/${ruta}`;
}
