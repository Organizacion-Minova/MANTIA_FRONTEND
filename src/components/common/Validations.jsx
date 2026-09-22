import palabrasEspanol from "an-array-of-spanish-words";
import { Profanity, CensorType } from "@2toad/profanity";

const diccionario = new Set(palabrasEspanol);

const filtroGroserias = new Profanity({
    languages: ["es"], // le decimos que revise español
});

const listaBlanca = new Set([
    "sandvik",
    "compresor",
    "compresores",
    "mantia",
    "electrobombas",
]);

export function soloLetras(texto) {
    const patron = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    return patron.test(texto);
}

export function soloNumeros(texto) {
    const patron = /^[0-9]+$/;
    return patron.test(texto);
}

export function sinCaracteresEspeciales(texto) {
    const patron = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+$/;
    return patron.test(texto);
}

export function esPalabraCoherente(texto) {
    const palabras = texto.toLowerCase().trim().split(/\s+/);

    return palabras.every(
        (palabra) => diccionario.has(palabra) || listaBlanca.has(palabra)
    );
}
filtroGroserias.addWords([
    "Papoi",
    "papoi",
    "Papoy",
    "puto",
    "puta",
    "pendejo",
    "estupido",
    "estupida",
    "mierda",
    "perra",
    "perro",
    "cabrón",
    "zorra",
    "cabron",
]);

export function tieneGroserias(texto) {
    return filtroGroserias.exists(texto);
}