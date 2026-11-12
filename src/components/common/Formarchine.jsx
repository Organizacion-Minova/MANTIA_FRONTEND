export const TIPOS = {
    preoperational: { titulo: "Preoperacional", formato: "FORMATO PREOPERACIONAL DE INSPECCIÓN", diario: true },
    inspection: { titulo: "Inspección", formato: "FORMATO DE INSPECCIÓN", diario: false },
};

export const DIAS = ["LU", "MA", "MI", "JU", "VI", "SA", "DO"];
export const OPCIONES = ["SI", "NO", "N/A"];

// Ajusta esta ruta a la de la hoja de vida de tu máquina
export const rutaMaquina = (id) => `/machines/cardmachine/${id}`;
export const rutaForm = (id, kind, sub = "") => `/machines/cardMachine/${id}/${kind}${sub}`;

export const letraSeccion = (posicion) => String.fromCharCode(64 + posicion);

// Grupos: 1. / 2.   Preguntas de un grupo: 1.1, 1.2   Sin grupo: 1, 2, 3
export function numerarPreguntas(filas) {
    let grupo = 0;
    let item = 0;
    return filas.map((f) => {
        if (f.type === "group") {
            grupo += 1;
            item = 0;
            return { ...f, numero: `${grupo}.` };
        }
        item += 1;
        return { ...f, numero: grupo > 0 ? `${grupo}.${item}` : `${item}` };
    });
}