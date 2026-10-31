// Imagen con las iniciales de la persona, para cuando no tiene foto de perfil.
export function avatarPorDefecto(nombre = "") {
    const partes = String(nombre).trim().split(/\s+/).filter(Boolean);
    const limpias = (t) => (t || "").replace(/[^\p{L}\p{N}]/gu, "");
    const iniciales = (limpias(partes[0]?.[0]) + limpias(partes[1]?.[0])).toUpperCase() || "U";

    const svg =
        `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">` +
        `<rect width="128" height="128" fill="#0f766e"/>` +
        `<text x="50%" y="50%" dy=".35em" text-anchor="middle" font-family="Arial, sans-serif" ` +
        `font-size="52" font-weight="700" fill="#ffffff">${iniciales}</text></svg>`;

    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
