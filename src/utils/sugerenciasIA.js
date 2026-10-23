// Preguntas rápidas del chat MANTIA IA según la pantalla en la que está el usuario.
// La IA ya sabe qué máquina, equipo o medición está abierta (se lo dice el backend),
// por eso aquí basta con decir "esta máquina", "este equipo", etc.
//
// Para agregar sugerencias a una pantalla nueva, añade una entrada a REGLAS.
// La primera regla cuyo patrón coincida con la ruta es la que se usa.

const REGLAS = [
    {
        patron: /^\/machines\/cardMachine\/\d+$/i,
        chips: ['¿Cuándo se usó esta máquina?', '¿Tiene inspecciones?', '¿Cómo registro su uso diario?'],
    },
    {
        patron: /^\/equipment\/cardequipment\/\d+$/i,
        chips: ['¿En qué estado está este equipo?', '¿Cómo registro una medición de gases?'],
    },
    {
        patron: /^\/gases\/gas_format\/\d+$/i,
        chips: ['¿Esta medición tiene gases fuera de rango?', '¿Cuáles son los límites permitidos?'],
    },
    {
        patron: /^\/gases/i,
        chips: ['¿Hay gases fuera de rango?', 'Última medición de gases', '¿Cuáles son los límites permitidos?'],
    },
    {
        patron: /^\/types\/(consumables|noconsumables)\/tools\/\d+$/i,
        chips: ['¿Cuáles de estas herramientas tienen stock bajo?', '¿Cuántas están en mal estado?'],
    },
    {
        patron: /^\/types/i,
        chips: ['¿Qué herramientas tienen stock bajo?', '¿Qué categorías de herramientas hay?'],
    },
    {
        patron: /^\/machines/i,
        chips: ['Máquinas en mantenimiento', '¿Qué máquinas no están en operación?', '¿Cómo registro una máquina?'],
    },
    {
        patron: /^\/equipment/i,
        chips: ['Equipos en mantenimiento', '¿Cómo registro un equipo?'],
    },
    {
        patron: /^\/ubications/i,
        chips: ['¿Qué hay en el Almacén Central?', '¿Qué ubicaciones tienen más activos?'],
    },
    {
        patron: /^\/companies/i,
        chips: ['¿Qué empresas están registradas?', '¿Cómo registro una empresa?'],
    },
    {
        patron: /^\/alerts/i,
        chips: ['¿Tengo alertas graves sin atender?', 'Resume mis alertas recientes'],
    },
    {
        patron: /^\/profile/i,
        chips: ['¿Hay solicitudes de cuenta pendientes?', '¿Cómo apruebo una cuenta?'],
    },
];

// Panel de control y cualquier otra pantalla
const POR_DEFECTO = ['¿Cómo está todo hoy?', '¿Hay gases fuera de rango?', 'Máquinas en mantenimiento'];

export function sugerenciasPorPantalla(ruta = '') {
    return REGLAS.find((regla) => regla.patron.test(ruta))?.chips ?? POR_DEFECTO;
}

// Rutas internas a las que la IA puede enlazar. Cualquier otra se muestra como texto normal.
// Deben coincidir con ContextoPantalla::RUTAS del backend y con las rutas de main.jsx.
const RUTAS_PERMITIDAS = [
    /^\/(dashboard|machines|equipment|ubications|companies|gases|alerts|profile|help|about)$/i,
    /^\/machines\/categoriesmachines$/i,
    /^\/ubications\/categoriesubications$/i,
    /^\/types\/(consumables|noconsumables)$/i,
    /^\/gases\/compare_gases$/i,
    /^\/machines\/cardMachine\/\d+$/i,
    /^\/equipment\/cardequipment\/\d+$/i,
    /^\/gases\/gas_format\/\d+$/i,
    /^\/types\/(consumables|noconsumables)\/tools\/\d+$/i,
];

export function esRutaPermitida(ruta = '') {
    return RUTAS_PERMITIDAS.some((patron) => patron.test(ruta));
}