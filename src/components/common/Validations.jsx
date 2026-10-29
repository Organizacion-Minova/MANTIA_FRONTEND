const groserias = [
    "Papoi", "Papoy", "Puto", "Puta", "Pendejo", "Pendeja",
    "Estupido", "Estupida", "Estúpido", "Estúpida",
    "Mierda", "Perra", "Perro", "Cabrón", "Cabron", "Zorra",

    // Insultos colombianos comunes
    "Gonorrea", "Gonorreas", "Hijueputa", "Hijueputas",
    "Hijuepucha", "Jueputa", "Jueputas", "Malparido",
    "Malparida", "Malparidos", "Malparidas",
    "Carechimba", "Carechimbas", "Careverga",
    "Caremonda", "Caremondas", "Careculo", "Careculos",
    "Marica", "Maricas", "Maricón", "Maricon",
    "Maricona", "Pirobo", "Piroba", "Pirobos", "Pirobas",
    "Guevon", "Guevón", "Guevona", "Guevonas",
    "Huevon", "Huevón", "Huevona", "Huevonas",
    "Webon", "Webona", "Güevón", "Güevona",
    "Güevon", "Güevona", "Imbecil", "Imbécil",
    "Idiota", "Tarado", "Tarada", "Bruto", "Bruta",
    "Bobo", "Boba", "Baboso", "Babosa", "Payaso",
    "Payasa", "Cretino", "Cretina", "Patán", "Patan",

    // Groserías vulgares
    "Chimba", "Chimbo", "Chimbada", "Chimbadas",
    "Chimbísimo", "Chimbisimo", "Rechimba",
    "Verga", "Vergas", "Vergajo", "Vergón", "Vergona",
    "Monda", "Mondá", "Mondada", "Mondao",
    "Picha", "Picho", "Pichurria", "Pichar",
    "Culo", "Culos", "Culero", "Culera",
    "Culiado", "Culiada", "Culiar", "Culear",
    "Cagada", "Cagado", "Cagada", "Cagar", "Cague",
    "Cagón", "Cagon", "Cagona", "Cagadero",
    "Mierdoso", "Mierdosa", "Mierdero", "Mierderos",
    "Coño", "Concha", "Joder", "Jodido", "Jodida",
    "Jódase", "Jodase", "Carajo", "Carajos",
    "Maldito", "Maldita", "Malditos", "Malditas",
    "Puta", "Putas", "Putero", "Putería", "Puteria",
    "Putear", "Puteada", "Puteado", "Putísimo",
    "Putisimo", "Zorrón", "Zorron", "Zorrilla",
    "Perra", "Perreo", "Perrear",

    // Insultos y descalificaciones
    "Desgraciado", "Desgraciada", "Desgraciados",
    "Desgraciadas", "Lambón", "Lambon", "Lambona",
    "Sapo", "Sapa", "Sapos", "Sapas", "Soplón",
    "Soplon", "Soplona", "Metido", "Metida",
    "Mamón", "Mamon", "Mamona", "Mamerto", "Mamerta",
    "Guache", "Guaricha", "Zángano", "Zangano",
    "Pendejos", "Pendejas", "Estúpidos", "Estúpidas",
    "Imbéciles", "Idiotas", "Tarados", "Taradas",
    "Brutos", "Brutas", "Bestia", "Bestias",
    "Animal", "Animales", "Menso", "Mensa",
    "Inútil", "Inutil", "Inútiles", "Inutiles",
    "Ridículo", "Ridicula", "Ridículo", "Ridiculos",
    "Patético", "Patetico", "Patética", "Patetica",
    "Fastidioso", "Fastidiosa", "Asqueroso", "Asquerosa",
    "Repugnante", "Despreciable", "Idiotez",
    "Estupidez", "Pendejada", "Pendejadas",
    "Gilipollas", "Capullo", "Payasada", "Mamarracho",
    "Mamarracha", "Lameculos", "Lamebotas",
    "Lamehuevos", "Lamevergas", "Lambebolas",
    "Pelmazo", "Pelmazos", "Bocón", "Bocon",
    "Bocona", "Hocicón", "Hocicon", "Lengüilargo",
    "Chismoso", "Chismosa", "Caretabla", "Carepalo",
    "Caremondá", "Caremondas", "Carechucha",

    // Insultos con "HP"
    "Hp", "H P", "Hpta", "Hptas", "Hpt", "Hpts",
    "Hpp", "Hijuep", "Hijueput", "Hijuemadre",
    "Hijuemadre", "Hijuemadres", "Gonorrieta",
    "Gonorriotas", "Gonorrión", "Gonorrion",

    // Expresiones compuestas
    "Hijo De Puta", "Hija De Puta",
    "Hijos De Puta", "Hijas De Puta",
    "Hijo De Perra", "Hija De Perra",
    "Pedazo De Mierda", "Pedazo De Gonorrea",
    "Malparido Hijueputa", "Gonorrea Malparida",
    "Coma Mierda", "Comer Mierda",
    "Vete A La Mierda", "Váyase A La Mierda",
    "Que Se Joda", "Vete Al Carajo",
    "Vete A La Verga", "La Puta Madre",
    "Porquería", "Porqueria", "Porquerías", "Porquerias",
    "Basura Humana", "Caremondá", "Caremondas",
    "Gran Hijueputa", "Maldito Gonorrea",
    "Gonorrea Hijueputa", "Sapo Hijueputa",
    "Marica Hijueputa", "Pirobo Hijueputa",
    "Malparido De Mierda", "Pedazo De Idiota",
    "Pedazo De Estúpido", "Pedazo De Estupido",
    "Pedazo De Animal", "Pedazo De Imbécil",
    "No Sea Tan Gonorrea", "No Sea Tan Marica",
    "Váyase Pal Carajo", "Vayase Pal Carajo",
    "Hágame El Hijueputa Favor", "Hagame El Hijueputa Favor",
    "Me Vale Mierda", "Me Importa Un Culo",
    "Me Importa Una Mierda", "Pura Mierda",
    "Pura Porquería", "Qué Pendejada", "Que Pendejada",
    "Qué Gonorrea", "Que Gonorrea",
    "Qué Hijueputa", "Que Hijueputa",

    // Variaciones frecuentes de escritura
    "Gonorrea", "Gonorrea!", "Gonorrea?",
    "Gonorrea.", "Gonorrea,", "Gonorrea...",
    "Hijueputa!", "Hijueputa?", "Hijueputa.",
    "Malparido!", "Malparido?", "Malparido.",
    "Marica!", "Marica?", "Marica.",
    "Mierda!", "Mierda?", "Mierda.",
    "Pirobo!", "Pirobo?", "Pirobo.",
    "Chimba!", "Chimba?", "Chimba."
];

function normalizarTexto(texto) {
    return String(texto ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase("es")
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
}

export function soloLetras(texto) {
    const patron = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    return patron.test(texto);
}

export function soloNumeros(texto) {
    const patron = /^[0-9]+$/;
    return patron.test(texto);
}

export function sinCaracteresEspeciales(texto) {
    const patron = /^[\p{L}\p{M}\p{N}\s]+$/u;
    return patron.test(texto);
}

export function validarCaracteresEspeciales(campos) {
    return Object.fromEntries(
        Object.entries(campos)
            .filter(([, texto]) => texto !== "" && !sinCaracteresEspeciales(texto))
            .map(([campo]) => [campo, ["Solo se permiten letras, números y espacios."]])
    );
}

export function tieneGroserias(texto) {
    const textoNormalizado = ` ${normalizarTexto(texto)} `;
    return groserias.some((palabra) =>
        textoNormalizado.includes(` ${normalizarTexto(palabra)} `)
    );
}

export function validarGroserias(campos) {
    return Object.fromEntries(
        Object.entries(campos)
            .filter(([, texto]) => tieneGroserias(texto))
            .map(([campo]) => [campo, ["No se permiten palabras inapropiadas."]])
    );
}

export function capitalizarPrimeraLetra(texto) {
    return String(texto ?? "").replace(/\p{L}/u, (letra) => letra.toLocaleUpperCase("es"));
}

export function formatearFechaCorta(fecha) {
    if (!fecha) return "—";
    return new Date(`${fecha.slice(0, 10)}T00:00:00`).toLocaleDateString("es-CO");
}