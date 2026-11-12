// Preguntas rápidas del chat MANTIA IA según la pantalla en la que está el usuario.
// La IA ya sabe qué máquina, equipo o medición está abierta (se lo dice el backend),
// por eso aquí basta con decir "esta máquina", "este equipo", etc.
//
// Para agregar sugerencias a una pantalla nueva, añade una entrada a REGLAS.
// La primera regla cuyo patrón coincida con la ruta es la que se usa.

const normalizarRuta = (ruta = '') => String(ruta).trim().replace(/[?#].*$/, '').replace(/\/+$/, '') || '/';

const REGLAS = [
    {
        patron: /^\/machines\/cardMachine\/\d+(?:\/.*)?$/i,
        chips: ['¿Cuándo se usó esta máquina?', '¿Tiene inspecciones?', '¿Cómo registro su uso diario?'],
    },
    {
        patron: /^\/equipment\/cardequipment\/\d+(?:\/.*)?$/i,
        chips: ['¿En qué estado está este equipo?', '¿Cómo registro una medición de gases?'],
    },
    {
        patron: /^\/gases\/gas_format\/\d+(?:\/.*)?$/i,
        chips: ['¿Esta medición tiene gases fuera de rango?', '¿Cuáles son los límites permitidos?'],
    },
    {
        patron: /^\/gases/i,
        chips: ['¿Hay gases fuera de rango?', 'Última medición de gases', '¿Cuáles son los límites permitidos?'],
    },
    {
        patron: /^\/(consumables|noconsumables)\/tools\/types/i,
        chips: ['¿Qué herramientas tienen stock bajo?', '¿Qué categorías de herramientas hay?'],
    },
    {
        patron: /^\/(consumables|noconsumables)\/tools/i,
        chips: ['¿Cuáles de estas herramientas tienen stock bajo?', '¿Cuántas están en mal estado?'],
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
    const rutaNormalizada = normalizarRuta(ruta);
    return REGLAS.find((regla) => regla.patron.test(rutaNormalizada))?.chips ?? POR_DEFECTO;
}

// Rutas internas a las que la IA puede enlazar. Cualquier otra se muestra como texto normal.
// Deben coincidir con ContextoPantalla::RUTAS del backend y con las rutas de main.jsx.
// (Quién puede entrar a cada una lo decide el backend por rol/permiso, ver ContextoPantalla.)
const RUTAS_PERMITIDAS = [
    /^\/(dashboard|machines|equipment|ubications|dailyuse|inspection|gases|admin|help|about)(?:\/.*)?$/i,
    /^\/machines\/categoriesmachines(?:\/.*)?$/i,
    /^\/ubications\/categoriesubications(?:\/.*)?$/i,
    /^\/(consumables|noconsumables)\/tools(?:\/.*)?$/i,
    /^\/(consumables|noconsumables)\/tools\/types(?:\/.*)?$/i,
    /^\/gases\/compare_gases(?:\/.*)?$/i,
    /^\/machines\/cardMachine\/\d+(?:\/.*)?$/i,
    /^\/equipment\/cardequipment\/\d+(?:\/.*)?$/i,
    /^\/gases\/gas_format\/\d+(?:\/.*)?$/i,
];

export function esRutaPermitida(ruta = '') {
    const rutaNormalizada = normalizarRuta(ruta);
    return RUTAS_PERMITIDAS.some((patron) => patron.test(rutaNormalizada));
x}