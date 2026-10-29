
import { Link } from "react-router-dom";
import "../../styles/Components.modules.css";
import "../../styles/grid_content.css";
import { useAuth } from "../../context/AuthContext.jsx";
import AppLayout from "../../components/layout/AppLayout.jsx";
import PublicLayout from "../../components/layout/PublicLayout.jsx";
import { PageWelcome } from "../../components/common/welcome";
import { useMemo, useRef, useState } from "react";


/* ---------- pequeños bloques reutilizables de la página ---------- */

function Circulo({ icono, tamano = "2.5rem" }) {
    return (
        <div
            style={{
                width: tamano,
                height: tamano,
                borderRadius: "50%",
                background: "var(--hover-principal)",
                color: "var(--secundario)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1rem",
                flexShrink: 0,
            }}
        >
            <i className={icono}></i>
        </div>
    );
}

function TarjetaCategoria({ icono, nombre, cantidad, activa, onClick }) {
    const [hover, setHover] = useState(false);
    return (
        <button
            type="button"
            onClick={onClick}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            className="date"
            aria-pressed={activa}
            style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                textAlign: "left",
                cursor: "pointer",
                border: activa ? "0.125rem solid var(--secundario)" : "0.125rem solid transparent",
                boxShadow: hover || activa ? "var(--sombra-contenedor-hover)" : "var(--sombra-contenedor)",
                transform: hover ? "translateY(-0.2rem)" : "translateY(0)",
                transition: "box-shadow .2s ease, transform .2s ease, border-color .2s ease",
                width: "100%",
                font: "inherit",
            }}
        >
            <Circulo icono={icono} />
            <div style={{ flex: 1 }}>
                <strong style={{ display: "block", color: "var(--texto)" }}>{nombre}</strong>
                <span style={{ fontSize: "0.8rem", color: "var(--texto2)" }}>
                    {cantidad} {cantidad === 1 ? "pregunta" : "preguntas"}
                </span>
            </div>
        </button>
    );
}

function FilaContacto({ icono, titulo, texto }) {
    return (
        <div className="contact-row" style={{ display: "flex", alignItems: "center", gap: "0.9rem", padding: "0.85rem 0" }}>
            <Circulo icono={icono} />
            <div>
                <strong style={{ display: "block", color: "var(--texto)" }}>{titulo}</strong>
                <span style={{ color: "var(--texto2)" }}>{texto}</span>
            </div>
        </div>
    );
}

/* ----------------------- utilidades de búsqueda ----------------------- */

// Palabras que no aportan a la búsqueda ("cómo", "de", "la"...).
const PALABRAS_VACIAS = new Set([
    "a", "al", "algo", "como", "con", "cual", "cuales", "de", "del", "donde", "el", "en", "es", "esta",
    "hago", "hay", "la", "las", "le", "lo", "los", "me", "mi", "mis", "no", "o", "para", "por", "puedo",
    "que", "quiero", "se", "si", "su", "sus", "te", "tengo", "un", "una", "y", "yo",
]);

// Pasa a minúsculas, quita tildes y signos: "¿Contraseña?" -> "contrasena"
function normalizar(texto = "") {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9ñ\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

// Raíz simple para que "agregar", "agrego" y "agregando" coincidan,
// o "herramientas" con "herramienta".
function raiz(palabra) {
    return palabra.length > 5 ? palabra.slice(0, palabra.length - 2) : palabra;
}

function obtenerTerminos(busqueda) {
    return normalizar(busqueda)
        .split(" ")
        .filter((p) => p.length > 1 && !PALABRAS_VACIAS.has(p))
        .map(raiz);
}

// Devuelve un puntaje: más alto si la palabra aparece en la pregunta,
// luego en las palabras clave y por último en la respuesta. 0 = no coincide.
function puntuar(p, terminos) {
    if (terminos.length === 0) return 1;

    const enPregunta = normalizar(p.pregunta);
    const enClaves = normalizar((p.claves || []).join(" "));
    const enRespuesta = normalizar(p.respuesta);

    let puntaje = 0;
    let encontrados = 0;

    terminos.forEach((t) => {
        let encontrado = false;
        if (enPregunta.includes(t)) { puntaje += 3; encontrado = true; }
        if (enClaves.includes(t)) { puntaje += 2; encontrado = true; }
        if (enRespuesta.includes(t)) { puntaje += 1; encontrado = true; }
        if (encontrado) encontrados++;
    });

    // Con una o dos palabras deben coincidir todas; con más, al menos el 60 %.
    const minimo = terminos.length <= 2 ? terminos.length : Math.ceil(terminos.length * 0.6);
    return encontrados >= minimo ? puntaje : 0;
}

/* ---------------------------- contenido ---------------------------- */

// visible: "todos" (con y sin sesión), "publico" (solo sin sesión), "privado" (solo con sesión)

const categoriasPublicas = [
    { id: "general", icono: "fa-solid fa-circle-info", nombre: "Sobre MANTIA" },
    { id: "cuentas", icono: "fa-solid fa-user-shield", nombre: "Cuenta y acceso" },
    { id: "soporte", icono: "fa-solid fa-headset", nombre: "Soporte" },
];

const categoriasPrivadas = [
    { id: "general", icono: "fa-solid fa-compass", nombre: "Uso general" },
    { id: "cuentas", icono: "fa-solid fa-user-shield", nombre: "Cuenta y acceso" },
    { id: "ubicaciones", icono: "fa-solid fa-map-marker-alt", nombre: "Ubicaciones" },
    { id: "herramientas", icono: "fa-solid fa-screwdriver-wrench", nombre: "Herramientas" },
    { id: "maquinas", icono: "fa-solid fa-gears", nombre: "Máquinas e inspecciones" },
    { id: "equipos", icono: "fa-solid fa-wind", nombre: "Equipos y gases" },
    { id: "soporte", icono: "fa-solid fa-headset", nombre: "Alertas y soporte" },
];

const preguntas = [
    /* ---------------- Sobre MANTIA / uso general ---------------- */
    {
        id: "g1", categoria: "general", visible: "todos",
        pregunta: "¿Qué es MANTIA?",
        respuesta: "MANTIA es un sistema web de mantenimiento e inventario de activos para el sector minero. Centraliza en un solo lugar el control de máquinas, equipos, herramientas, ubicaciones, inspecciones y mediciones de gases.",
        claves: ["que es", "para que sirve", "sistema", "plataforma", "aplicacion", "mantenimiento", "inventario"],
    },
    {
        id: "g2", categoria: "general", visible: "todos",
        pregunta: "¿Qué puedo hacer dentro de MANTIA?",
        respuesta: "Puedes registrar y consultar ubicaciones, herramientas consumibles y no consumibles, máquinas y equipos; llevar la hoja de vida de cada máquina o equipo; registrar el uso diario, las inspecciones y las mediciones de gases; y exportar algunos formatos a Excel o PDF.",
        claves: ["funciones", "modulos", "servicios", "caracteristicas", "opciones"],
    },
    {
        id: "g3", categoria: "general", visible: "todos",
        pregunta: "¿Quién puede usar MANTIA?",
        respuesta: "El personal de la operación con una cuenta aprobada. Al solicitar la cuenta se elige un rol: Administrador, Técnico (Electricista, Minero o Mecánico) o Invitado. El administrador revisa y aprueba cada solicitud.",
        claves: ["usuarios", "roles", "tecnico", "administrador", "invitado", "quien"],
    },
    {
        id: "g4", categoria: "general", visible: "todos",
        pregunta: "¿Necesito instalar algún programa?",
        respuesta: "No. MANTIA funciona desde el navegador (Chrome, Edge, Firefox u otro actualizado). Solo necesitas conexión a internet y tu cuenta.",
        claves: ["instalar", "descargar", "navegador", "celular", "computador", "requisitos"],
    },
    {
        id: "g11", categoria: "general", visible: "publico",
        pregunta: "¿Qué puedo ver sin iniciar sesión?",
        respuesta: "Sin iniciar sesión puedes consultar el Inicio, Acerca de y este Centro de ayuda. Los módulos de inventario y mantenimiento (máquinas, equipos, herramientas, ubicaciones, inspecciones y gases) solo están disponibles para usuarios con una cuenta aprobada.",
        claves: ["sin cuenta", "sin sesion", "publico", "visitante", "ver informacion", "modulos"],
    },
    {
        id: "g12", categoria: "general", visible: "publico",
        pregunta: "¿Puedo usar MANTIA desde el celular?",
        respuesta: "Sí, puedes abrir MANTIA desde el navegador del celular o la tableta. Para diligenciar formatos extensos o revisar tablas grandes te recomendamos usar un computador.",
        claves: ["celular", "movil", "tablet", "telefono", "app", "aplicacion"],
    },
    {
        id: "g13", categoria: "general", visible: "publico",
        pregunta: "¿Quién desarrolló MANTIA?",
        respuesta: "MANTIA es un proyecto formativo del SENA, Centro Nacional Minero de Sogamoso, Boyacá, pensado para la industria minera colombiana. Encuentra más detalles en 'Acerca de MANTIA'.",
        claves: ["quien", "desarrollo", "creadores", "sena", "proyecto", "autores"],
    },
    {
        id: "g5", categoria: "general", visible: "privado",
        pregunta: "¿Qué muestra el Panel de Control?",
        respuesta: "El Panel de Control (Dashboard) es la primera pantalla del menú lateral y te da un resumen general de la actividad del sistema para que tengas una vista rápida antes de entrar a cada módulo.",
        claves: ["dashboard", "inicio", "resumen", "panel", "estadisticas"],
    },
    {
        id: "g6", categoria: "general", visible: "privado",
        pregunta: "¿Cómo uso el buscador y los filtros de las tablas?",
        respuesta: "En la parte superior de cada módulo hay un buscador: escribe y la tabla se filtra al instante (por nombre, código, descripción, responsable, etc., según el módulo). En varios módulos también hay un filtro de estado para ver solo los registros Activos o Inactivos.",
        claves: ["buscar", "filtrar", "encontrar", "tabla", "filtro", "estado"],
    },
    {
        id: "g7", categoria: "general", visible: "privado",
        pregunta: "¿Cómo paso a la siguiente página de una tabla?",
        respuesta: "Las tablas muestran unos pocos registros por página. Usa los botones de paginación en la parte inferior derecha de la tabla para avanzar o retroceder.",
        claves: ["paginacion", "pagina", "siguiente", "anterior", "mas registros", "ver mas"],
    },
    {
        id: "g8", categoria: "general", visible: "privado",
        pregunta: "¿Cómo edito o elimino un registro?",
        respuesta: "En la columna Acciones de cada tabla encontrarás el ícono de lápiz para editar y el de papelera para eliminar. Antes de eliminar, el sistema te pide confirmar. El ícono de ojo abre el detalle o la hoja de vida del registro.",
        claves: ["editar", "modificar", "eliminar", "borrar", "actualizar", "acciones", "lapiz", "papelera"],
    },
    {
        id: "g9", categoria: "general", visible: "privado",
        pregunta: "¿Por qué no se guarda el formulario?",
        respuesta: "Revisa los mensajes en rojo debajo de cada campo y el aviso en pantalla. Los motivos más comunes son: campos obligatorios vacíos, nombres con números o símbolos (algunos campos solo aceptan letras y espacios), texto sin sentido o palabras inapropiadas. Si guardas una edición sin cambiar nada, el formulario simplemente se cierra.",
        claves: ["error", "no guarda", "no deja", "validacion", "formulario", "falla", "no funciona"],
    },
    {
        id: "g10", categoria: "general", visible: "privado",
        pregunta: "¿Cómo oculto o muestro el menú lateral?",
        respuesta: "Usa el botón de menú en la parte superior izquierda. Al ocultarlo tendrás más espacio para ver las tablas; vuelve a presionarlo para abrirlo.",
        claves: ["menu", "sidebar", "barra lateral", "ocultar", "esconder", "mostrar"],
    },

    /* ---------------- Cuenta y acceso ---------------- */
    {
        id: "c1", categoria: "cuentas", visible: "publico",
        pregunta: "¿Cómo inicio sesión?",
        respuesta: "Presiona 'Iniciar sesión' en la parte superior, escribe tu correo y tu contraseña y presiona 'Iniciar Sesión'. Si aún no tienes cuenta, primero debes solicitarla.",
        claves: ["login", "ingresar", "entrar", "acceder", "iniciar sesion"],
    },
    {
        id: "c2", categoria: "cuentas", visible: "publico",
        pregunta: "¿Cómo me registro o solicito una cuenta?",
        respuesta: "En la pantalla de inicio de sesión presiona '¿No tienes una cuenta? Solicitar'. Completa nombre, apellido, correo, tipo y número de documento, el rol que necesitas (Administrador, Técnico o Invitado; si eres técnico, también tu especialidad) y una contraseña. Un administrador revisará tu solicitud.",
        claves: ["registrarme", "registro", "crear cuenta", "nueva cuenta", "solicitar", "inscribirme"],
    },
    {
        id: "c3", categoria: "cuentas", visible: "todos",
        pregunta: "Ya me registré, ¿por qué no puedo entrar?",
        respuesta: "Toda solicitud de cuenta debe ser aprobada por un administrador antes de poder iniciar sesión. Si ya pasó un tiempo prudente, comunícate con el administrador o escribe a mantiadso@gmail.com.",
        claves: ["no puedo entrar", "pendiente", "aprobacion", "aprobada", "no me deja", "acceso denegado"],
    },
    {
        id: "c4", categoria: "cuentas", visible: "todos",
        pregunta: "¿Olvidé mi contraseña, qué hago?",
        respuesta: "En la pantalla de inicio de sesión presiona '¿No recuerdas tu contraseña? Restablecer'. Escribe tu correo registrado, ingresa el código de 6 dígitos que te llegará y crea tu nueva contraseña.",
        claves: ["olvide", "recuperar", "restablecer", "cambiar contrasena", "clave", "password", "no recuerdo"],
    },
    {
        id: "c5", categoria: "cuentas", visible: "todos",
        pregunta: "No me llegó el código para restablecer la contraseña",
        respuesta: "Revisa la carpeta de spam o correo no deseado y confirma que escribiste el mismo correo con el que te registraste. En la pantalla del código puedes usar '¿No recibiste el código? Volver a enviar'.",
        claves: ["codigo", "no llega", "correo", "spam", "verificacion", "6 digitos"],
    },
    {
        id: "c6", categoria: "cuentas", visible: "todos",
        pregunta: "El sistema dice que el código es inválido o expiró",
        respuesta: "El código debe tener exactamente 6 dígitos y solo sirve por un tiempo limitado. Si te aparece como inválido o expirado, vuelve a solicitar uno nuevo y úsalo de inmediato.",
        claves: ["codigo invalido", "expirado", "vencido", "no sirve", "error codigo"],
    },
    {
        id: "c7", categoria: "cuentas", visible: "todos",
        pregunta: "¿Qué requisitos debe cumplir la contraseña?",
        respuesta: "Debe tener al menos 8 caracteres y la confirmación debe ser exactamente igual. Te recomendamos combinar letras, números y símbolos.",
        claves: ["contrasena", "clave", "segura", "caracteres", "requisitos", "password"],
    },
    {
        id: "c8", categoria: "cuentas", visible: "publico",
        pregunta: "¿Qué documentos de identidad acepta el registro?",
        respuesta: "Cédula de ciudadanía, cédula de extranjería, tarjeta de identidad y pasaporte.",
        claves: ["documento", "cedula", "pasaporte", "tarjeta de identidad", "identificacion"],
    },
    {
        id: "c9", categoria: "cuentas", visible: "privado",
        pregunta: "¿Cómo veo o actualizo mis datos personales?",
        respuesta: "Presiona tu foto o nombre en la parte superior derecha y elige 'Ver mi perfil'. Allí presiona 'Editar', modifica nombre, apellido, documento, correo, teléfono o dirección y presiona 'Guardar cambios'.",
        claves: ["perfil", "mis datos", "editar perfil", "telefono", "direccion", "correo", "actualizar"],
    },
    {
        id: "c10", categoria: "cuentas", visible: "privado",
        pregunta: "¿Cómo cambio mi contraseña estando dentro del sistema?",
        respuesta: "Por ahora la forma de cambiarla es cerrar sesión y usar '¿No recuerdas tu contraseña? Restablecer' en la pantalla de inicio de sesión; recibirás un código en tu correo para crear la nueva contraseña.",
        claves: ["cambiar contrasena", "nueva contrasena", "clave", "seguridad", "password"],
    },
    {
        id: "c11", categoria: "cuentas", visible: "privado",
        pregunta: "Soy administrador, ¿cómo apruebo a los nuevos usuarios?",
        respuesta: "Entra a 'Ver mi perfil'. Si tu cuenta es de administrador verás el 'Panel de Administración - Solicitudes Pendientes', donde puedes aprobar o rechazar cada solicitud de registro.",
        claves: ["aprobar", "rechazar", "solicitudes", "usuarios nuevos", "administrador", "admin", "pendientes"],
    },
    {
        id: "c12", categoria: "cuentas", visible: "privado",
        pregunta: "¿Cómo cierro sesión?",
        respuesta: "Presiona tu foto o nombre en la parte superior derecha y elige 'Cerrar sesión'. También encontrarás la opción al final del menú lateral.",
        claves: ["salir", "cerrar sesion", "logout", "desconectar"],
    },

    /* ---------------- Ubicaciones ---------------- */
    {
        id: "u1", categoria: "ubicaciones", visible: "privado",
        pregunta: "¿Cómo registro una nueva ubicación?",
        respuesta: "Ingresa a Ubicaciones desde el menú lateral, presiona 'Nueva Ubicación' y completa el nombre, la descripción y la categoría correspondiente.",
        claves: ["agregar ubicacion", "crear ubicacion", "nueva ubicacion", "lugar", "frente", "bodega"],
    },
    {
        id: "u2", categoria: "ubicaciones", visible: "privado",
        pregunta: "¿Cómo creo categorías de ubicaciones?",
        respuesta: "En Ubicaciones presiona 'Categorías Ubicaciones'. Allí puedes crear con 'Nueva Categoría', editar o eliminar las categorías, y volver con 'Volver a Ubicaciones'.",
        claves: ["categoria ubicacion", "agrupar", "clasificar", "tipo de ubicacion"],
    },
    {
        id: "u3", categoria: "ubicaciones", visible: "privado",
        pregunta: "¿Para qué sirven las ubicaciones?",
        respuesta: "Indican dónde se encuentra cada herramienta, máquina o equipo. Por eso conviene registrarlas primero: luego podrás elegirlas al crear los demás registros.",
        claves: ["para que", "donde esta", "ubicacion", "asignar ubicacion"],
    },

    /* ---------------- Herramientas ---------------- */
    {
        id: "h1", categoria: "herramientas", visible: "privado",
        pregunta: "¿Qué diferencia hay entre herramientas consumibles y no consumibles?",
        respuesta: "Las consumibles se gastan o se reemplazan con el uso (por ejemplo, brocas o discos). Las no consumibles son de uso repetido y duran en el tiempo (por ejemplo, llaves o martillos). Cada tipo tiene su propio módulo dentro de Herramientas.",
        claves: ["diferencia", "consumible", "no consumible", "tipos de herramienta"],
    },
    {
        id: "h2", categoria: "herramientas", visible: "privado",
        pregunta: "¿Cómo creo una categoría (tipo) de herramienta?",
        respuesta: "En el menú lateral abre Herramientas y elige Consumibles o No consumibles. Presiona 'Agregar tipo herramienta', escribe el nombre y la descripción y guarda.",
        claves: ["tipo herramienta", "categoria herramienta", "agregar tipo", "nueva categoria"],
    },
    {
        id: "h3", categoria: "herramientas", visible: "privado",
        pregunta: "¿Cómo agrego una herramienta a una categoría?",
        respuesta: "En Consumibles o No consumibles presiona el ícono de ojo de la categoría. Dentro, presiona 'Nueva Herramienta' y completa el nombre, la ubicación y las cantidades en estado bueno, regular y malo.",
        claves: ["agregar herramienta", "registrar herramienta", "nueva herramienta", "crear herramienta"],
    },
    {
        id: "h4", categoria: "herramientas", visible: "privado",
        pregunta: "¿Qué significan cantidad buena, regular y mala?",
        respuesta: "Es el inventario según el estado físico de la herramienta: 'buena' está en perfecto estado, 'regular' funciona pero tiene desgaste y 'mala' está dañada o no se puede usar. Así sabes cuántas hay disponibles realmente.",
        claves: ["cantidad", "estado", "buena", "regular", "mala", "danada", "stock", "inventario"],
    },
    {
        id: "h5", categoria: "herramientas", visible: "privado",
        pregunta: "¿Cómo desactivo una categoría de herramientas sin eliminarla?",
        respuesta: "Presiona el ícono de lápiz de la categoría, cambia el Estado a 'Inactivo' y guarda. Luego puedes usar el filtro de estado para ver solo las activas o las inactivas.",
        claves: ["desactivar", "inactivo", "activo", "estado", "ocultar categoria"],
    },
    {
        id: "h6", categoria: "herramientas", visible: "privado",
        pregunta: "¿Cómo encuentro rápido una herramienta?",
        respuesta: "Dentro de la categoría usa el buscador superior: puedes buscar por nombre de la herramienta o por su ubicación.",
        claves: ["buscar herramienta", "encontrar", "donde esta la herramienta"],
    },

    /* ---------------- Máquinas e inspecciones ---------------- */
    {
        id: "m1", categoria: "maquinas", visible: "privado",
        pregunta: "¿Cómo registro una máquina?",
        respuesta: "Entra a Máquinas desde el menú lateral y presiona 'Nueva Máquina'. Completa código, nombre, marca, modelo, número de serie, categoría, ubicación, responsable, estado, fecha y costo de adquisición, garantía, características e imagen.",
        claves: ["agregar maquina", "nueva maquina", "crear maquina", "registrar maquina"],
    },
    {
        id: "m2", categoria: "maquinas", visible: "privado",
        pregunta: "¿Cómo creo categorías de máquinas?",
        respuesta: "En Máquinas, presiona 'Categorías de máquinas'. Allí puedes crear una con 'Nueva categoría', editarla, cambiar su estado o eliminarla.",
        claves: ["categoria maquina", "tipo de maquina", "clasificar maquinas"],
    },
    {
        id: "m3", categoria: "maquinas", visible: "privado",
        pregunta: "¿Cómo consulto la hoja de vida de una máquina?",
        respuesta: "En la tabla de Máquinas presiona el ícono de ojo. Se abre la hoja de vida con sus datos y los accesos a Uso diario, Pre operacional e Inspección.",
        claves: ["hoja de vida", "detalle", "historial", "ver maquina", "estado de la maquina", "mantenimiento"],
    },
    {
        id: "m4", categoria: "maquinas", visible: "privado",
        pregunta: "¿Cómo registro el uso diario de una máquina?",
        respuesta: "Desde la hoja de vida de la máquina presiona 'Uso diario' y luego 'Nuevo Registro'. Indica la máquina, el responsable a cargo, la hora de inicio y fin de operación, la verificación del estado de funcionamiento y las observaciones.",
        claves: ["uso diario", "operacion", "horas", "registro diario", "bitacora", "turno"],
    },
    {
        id: "m5", categoria: "maquinas", visible: "privado",
        pregunta: "¿Puedo exportar los registros de uso diario?",
        respuesta: "Sí. En Uso diario encontrarás los botones 'Exportar Excel' y 'Exportar Pdf' para descargar los registros.",
        claves: ["exportar", "excel", "pdf", "descargar", "reporte", "imprimir"],
    },
    {
        id: "m6", categoria: "maquinas", visible: "privado",
        pregunta: "¿Cómo creo un formato de inspección?",
        respuesta: "En el módulo de inspección escribe el nombre del formato (por ejemplo, 'Inspección Compresor'), agrega cada pregunta con 'Agregar Pregunta' y presiona 'Guardar formulario'.",
        claves: ["formato inspeccion", "crear inspeccion", "preguntas inspeccion", "checklist", "lista de chequeo"],
    },
    {
        id: "m7", categoria: "maquinas", visible: "privado",
        pregunta: "¿Cómo diligencio una inspección?",
        respuesta: "Desde el formato presiona 'Llenar Formulario', responde cada pregunta, agrega observaciones si las hay y presiona 'Enviar Inspección'. Después puedes revisar el resumen con 'Ver inspección'.",
        claves: ["llenar inspeccion", "diligenciar", "realizar inspeccion", "enviar inspeccion", "preoperacional"],
    },

    /* ---------------- Equipos y gases ---------------- */
    {
        id: "e1", categoria: "equipos", visible: "privado",
        pregunta: "¿Cómo registro un equipo?",
        respuesta: "Entra a Equipos desde el menú lateral y presiona 'Nuevo equipo'. Completa el código, nombre, marca, modelo, número de serie, ubicación, responsable, estado, fecha de ingreso, descripción e imagen.",
        claves: ["agregar equipo", "nuevo equipo", "crear equipo", "registrar equipo", "detector"],
    },
    {
        id: "e2", categoria: "equipos", visible: "privado",
        pregunta: "¿Cómo veo la hoja de vida de un equipo?",
        respuesta: "En la tabla de Equipos presiona el ícono de ojo. Verás sus datos y los accesos a Medición gases, Calibración y Diagnóstico.",
        claves: ["hoja de vida", "detalle equipo", "calibracion", "diagnostico", "estado del equipo"],
    },
    {
        id: "e3", categoria: "equipos", visible: "privado",
        pregunta: "¿Cómo registro una medición de gases?",
        respuesta: "Desde la hoja de vida del equipo presiona 'Medición gases' y luego 'Nueva Medición'. El formato incluye ubicación, fecha y hora, niveles medidos, responsable de la medición, observaciones, firma del jefe de mina y el Vo. Bo. del líder SST.",
        claves: ["gases", "medicion", "nueva medicion", "metano", "oxigeno", "monoxido", "sst", "atmosfera"],
    },
    {
        id: "e4", categoria: "equipos", visible: "privado",
        pregunta: "¿Cómo comparo mediciones de gases?",
        respuesta: "En Medición de gases presiona 'Comparar mediciones' para ver el análisis comparativo entre los registros.",
        claves: ["comparar", "comparacion", "analisis", "grafica", "tendencia", "gases"],
    },
    {
        id: "e5", categoria: "equipos", visible: "privado",
        pregunta: "¿Puedo exportar el formato de gases?",
        respuesta: "Sí. Abre el formato de la medición y usa 'Exportar Excel' o 'Exportar PDF'.",
        claves: ["exportar gases", "pdf", "excel", "descargar formato", "imprimir"],
    },

    /* ---------------- Alertas y soporte ---------------- */
    {
        id: "s1", categoria: "soporte", visible: "privado",
        pregunta: "¿Dónde veo mis notificaciones y alertas?",
        respuesta: "Presiona la campana en la parte superior derecha para ver tus notificaciones; allí puedes marcarlas como leídas una por una o todas a la vez. En el módulo de Alertas puedes revisar cada alerta y elegir 'Atender' o 'Escalar'.",
        claves: ["notificaciones", "campana", "alertas", "avisos", "atender", "escalar"],
    },
    {
        id: "s2", categoria: "soporte", visible: "todos",
        pregunta: "¿A quién reporto una falla del sistema?",
        respuesta: "Escríbenos a mantiadso@gmail.com o llama a la mesa de ayuda al 320 5783729 (SENA). Si puedes, incluye qué estabas haciendo, en qué pantalla y una captura del error.",
        claves: ["falla", "error", "bug", "problema", "reportar", "no funciona", "pantalla en blanco"],
    },
    {
        id: "s3", categoria: "soporte", visible: "todos",
        pregunta: "¿Cómo me comunico con soporte?",
        respuesta: "Correo: mantiadso@gmail.com. Mesa de ayuda: 320 5783729 (SENA). Ubicación: Centro Nacional Minero, Sogamoso, Boyacá. También puedes usar el botón 'Contactar soporte' al final de esta página.",
        claves: ["contacto", "telefono", "correo", "soporte", "ayuda", "whatsapp", "llamar"],
    },
    {
        id: "s4", categoria: "soporte", visible: "todos",
        pregunta: "La página se queda en blanco o carga mal, ¿qué hago?",
        respuesta: "Recarga la página (F5 o Ctrl + F5), revisa tu conexión a internet y vuelve a iniciar sesión. Si continúa, repórtalo a soporte indicando en qué módulo ocurrió.",
        claves: ["pantalla en blanco", "no carga", "lento", "se congela", "error", "recargar"],
    },
    {
        id: "s5", categoria: "soporte", visible: "todos",
        pregunta: "¿Dónde conozco más sobre el proyecto MANTIA?",
        respuesta: "En la sección 'Acerca de' encontrarás la información del proyecto y del equipo. Puedes abrirla con el botón 'Acerca de MANTIA' al final de esta página.",
        claves: ["acerca de", "proyecto", "equipo", "sena", "quienes somos"],
    },
];

const sugerenciasPublicas = ["Solicitar cuenta", "Olvidé mi contraseña", "Código", "Contacto"];
const sugerenciasPrivadas = ["Agregar herramienta", "Uso diario", "Medición de gases", "Exportar", "Perfil"];

function Ayuda() {

    const { isAuthenticated } = useAuth();
    const Layout = isAuthenticated ? AppLayout : PublicLayout;
    const [busqueda, setBusqueda] = useState("");
    const [categoriaActiva, setCategoriaActiva] = useState(null);
    const [abierta, setAbierta] = useState(null);
    const resultadosRef = useRef(null);

    const categorias = isAuthenticated ? categoriasPrivadas : categoriasPublicas;
    const sugerencias = isAuthenticated ? sugerenciasPrivadas : sugerenciasPublicas;

    // Preguntas que le corresponden a quien está viendo la página
    const preguntasBase = useMemo(
        () => preguntas.filter((p) =>
            p.visible === "todos" || p.visible === (isAuthenticated ? "privado" : "publico")
        ),
        [isAuthenticated]
    );

    const terminos = useMemo(() => obtenerTerminos(busqueda), [busqueda]);
    const hayBusqueda = busqueda.trim() !== "";

    const preguntasFiltradas = useMemo(() => {
        return preguntasBase
            .filter((p) => !categoriaActiva || p.categoria === categoriaActiva)
            .map((p) => ({ ...p, puntaje: puntuar(p, terminos) }))
            .filter((p) => p.puntaje > 0)
            .sort((a, b) => (hayBusqueda ? b.puntaje - a.puntaje : 0));
    }, [preguntasBase, categoriaActiva, terminos, hayBusqueda]);

    // Si la búsqueda no encuentra nada dentro de la categoría, avisamos cuántas hay en las demás
    const resultadosEnOtrasCategorias = useMemo(() => {
        if (!categoriaActiva || !hayBusqueda || preguntasFiltradas.length > 0) return 0;
        return preguntasBase.filter((p) => puntuar(p, terminos) > 0).length;
    }, [categoriaActiva, hayBusqueda, preguntasFiltradas.length, preguntasBase, terminos]);

    const contarPorCategoria = (id) => preguntasBase.filter((p) => p.categoria === id).length;

    const alternar = (id) => setAbierta(abierta === id ? null : id);

    const alternarCategoria = (id) => {
        setCategoriaActiva(categoriaActiva === id ? null : id);
        setAbierta(null);
    };

    const cambiarBusqueda = (valor) => {
        setBusqueda(valor);
        setAbierta(null);
    };

    // Al presionar "Buscar" o Enter: baja a los resultados y abre la mejor coincidencia
    const ejecutarBusqueda = (e) => {
        e?.preventDefault();
        if (preguntasFiltradas.length > 0 && hayBusqueda) {
            setAbierta(preguntasFiltradas[0].id);
        }
        resultadosRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const limpiar = () => {
        setBusqueda("");
        setCategoriaActiva(null);
        setAbierta(null);
    };

    const nombreCategoriaActiva = categorias.find((c) => c.id === categoriaActiva)?.nombre;

    /* ================= SIN SESIÓN: misma página pública de siempre ================= */
    if (!isAuthenticated) {
        return (
            <PublicLayout>
            <div className="public-page help-grid">
                <section className="help-intro">
                <div className="mt-legal__ruta">
                    <Link to="/">Inicio</Link>
                    <span aria-hidden="true">/</span>
                    <span>Ayuda</span>
                </div>
                <PageWelcome
                    titulo="Centro de ayuda"
                    descripcion="Resuelve tus dudas sobre MANTIA, tu cuenta y el acceso, o escríbenos directamente."
                />
                </section>

                <div className="search-main help-search">
                    <div className="search-wrapper">
                        <i className="fa-solid fa-magnifying-glass"></i>
                        <input
                            type="text"
                            id="q"
                            placeholder="Buscar en preguntas frecuentes"
                            value={busqueda}
                            onChange={(e) => cambiarBusqueda(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") ejecutarBusqueda(e); }}
                            autoComplete="off"
                        />
                    </div>
                    <button className="btn-buscar" type="button" onClick={ejecutarBusqueda}>
                        <i className="fa-solid fa-magnifying-glass"></i> Buscar
                    </button>
                </div>

                <section className="help-faq">
                    <h2 ref={resultadosRef} style={{ scrollMarginTop: "6rem" }}>Preguntas frecuentes</h2>
                    <div className="date" style={{ boxShadow: "var(--sombra-contenedor)" }}>
                    {preguntasFiltradas.length === 0 && (
                        <p style={{ color: "var(--texto2)" }}>No encontramos resultados para tu búsqueda.</p>
                    )}

                    <ul style={{ listStyle: "none" }}>
                        {preguntasFiltradas.map((p) => (
                            <li
                                key={p.id}
                                className={`menu-desplegable ${abierta === p.id ? "activo" : ""}`}
                            >
                                <a
                                    onClick={() => alternar(p.id)}
                                    style={{
                                        cursor: "pointer",
                                        color: "var(--texto)",
                                        display: "flex",
                                        gap: "0.8rem",
                                        alignItems: "center",
                                        padding: "0.7rem 0",
                                    }}
                                >
                                    <i className="fa-solid fa-chevron-down flecha"></i>
                                    <span style={{ flex: 1 }}><strong>{p.pregunta}</strong></span>
                                </a>
                                <div className="submenu faq-answer">
                                    <p>{p.respuesta}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                    </div>
                </section>

                <section className="help-contact">
                    <h2>¿Necesitas más ayuda?</h2>
                    <div className="date" style={{ boxShadow: "var(--sombra-contenedor)" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(15rem, 1fr))" }}>
                            <FilaContacto icono="fa-solid fa-envelope" titulo="Correo" texto="mantiaCM@gmail.com" />
                            <FilaContacto icono="fa-solid fa-location-dot" titulo="Ubicación" texto="Centro Nacional Minero, Sogamoso, Boyacá" />
                        </div>
                    </div>
                </section>

                <div className="btn-container help-actions">
                    <Link to="/about">
                        <button className="btn-2" title="ir a acerca de">
                            <i className="fa-solid fa-info-circle"></i>
                            Acerca de MANTIA
                        </button>
                    </Link>
                </div>
            </div>
            </PublicLayout>
        );
    }

    /* ================= CON SESIÓN: centro de ayuda completo ================= */
    return (
        <Layout>
        <div className="public-page help-grid help-grid-authenticated">
            <section className="help-intro">
                <PageWelcome
                    titulo="Centro de ayuda"
                    descripcion="Busca cómo usar cada módulo de MANTIA o escríbenos directamente."
                />
            </section>

            <form className="search-main help-search" onSubmit={ejecutarBusqueda} role="search">
                <div className="search-wrapper">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <input
                        type="text"
                        id="q"
                        placeholder="Escribe tu duda, por ejemplo: olvidé mi contraseña"
                        value={busqueda}
                        onChange={(e) => cambiarBusqueda(e.target.value)}
                        autoComplete="off"
                        aria-label="Buscar en preguntas frecuentes"
                    />
                    {busqueda && (
                        <i
                            className="fa-solid fa-xmark"
                            onClick={() => cambiarBusqueda("")}
                            title="Borrar búsqueda"
                            style={{ cursor: "pointer" }}
                        ></i>
                    )}
                </div>
                <button className="btn-buscar" type="submit">
                    <i className="fa-solid fa-magnifying-glass"></i> Buscar
                </button>
            </form>

            <div className="help-suggestions" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
                <span style={{ color: "var(--texto2)", fontSize: "0.85rem" }}>Búsquedas frecuentes:</span>
                {sugerencias.map((s) => (
                    <button
                        key={s}
                        type="button"
                        onClick={() => cambiarBusqueda(s)}
                        style={{
                            border: "0.0625rem solid var(--secundario)",
                            background: "transparent",
                            color: "var(--secundario)",
                            borderRadius: "3.125rem",
                            padding: "0.25rem 0.8rem",
                            fontSize: "0.8rem",
                            cursor: "pointer",
                            font: "inherit",
                        }}
                    >
                        {s}
                    </button>
                ))}
            </div>

            <section className="help-categories">
                <h2>Explora por tema</h2>
                <div className="help-category-list">
                    {categorias.map((c) => (
                        <TarjetaCategoria
                            key={c.id}
                            icono={c.icono}
                            nombre={c.nombre}
                            cantidad={contarPorCategoria(c.id)}
                            activa={categoriaActiva === c.id}
                            onClick={() => alternarCategoria(c.id)}
                        />
                    ))}
                </div>
            </section>

            <div
                ref={resultadosRef}
                className="help-results-heading"
                style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", justifyContent: "space-between", gap: "0.5rem", scrollMarginTop: "6rem" }}
            >
                <h2>
                    {hayBusqueda ? "Resultados de la búsqueda" : "Preguntas frecuentes"}
                    {nombreCategoriaActiva && <span style={{ color: "var(--texto2)", fontWeight: 400 }}> · {nombreCategoriaActiva}</span>}
                </h2>
                <span style={{ color: "var(--texto2)", fontSize: "0.9rem" }}>
                    {preguntasFiltradas.length} {preguntasFiltradas.length === 1 ? "resultado" : "resultados"}
                    {(hayBusqueda || categoriaActiva) && (
                        <>
                            {" · "}
                            <a onClick={limpiar} style={{ cursor: "pointer", color: "var(--secundario)" }}>
                                Ver todas
                            </a>
                        </>
                    )}
                </span>
            </div>
            <div className="date help-faq" style={{ boxShadow: "var(--sombra-contenedor)" }}>
                {preguntasFiltradas.length === 0 && (
                    <div style={{ color: "var(--texto2)" }}>
                        <p>
                            No encontramos resultados para <strong>"{busqueda}"</strong>
                            {nombreCategoriaActiva ? ` en ${nombreCategoriaActiva}` : ""}.
                        </p>
                        {resultadosEnOtrasCategorias > 0 ? (
                            <p style={{ marginTop: "0.5rem" }}>
                                Hay {resultadosEnOtrasCategorias} {resultadosEnOtrasCategorias === 1 ? "resultado" : "resultados"} en otros temas.{" "}
                                <a onClick={() => setCategoriaActiva(null)} style={{ cursor: "pointer", color: "var(--secundario)" }}>
                                    Buscar en todos los temas
                                </a>
                            </p>
                        ) : (
                            <p style={{ marginTop: "0.5rem" }}>
                                Prueba con otras palabras (por ejemplo "contraseña", "herramienta" o "gases") o escríbenos a{" "}
                                <a href="mailto:mantiadso@gmail.com" style={{ color: "var(--secundario)" }}>mantiadso@gmail.com</a>.
                            </p>
                        )}
                    </div>
                )}

                <ul style={{ listStyle: "none" }}>
                    {preguntasFiltradas.map((p) => (
                        <li
                            key={p.id}
                            className={`menu-desplegable ${abierta === p.id ? "activo" : ""}`}
                        >
                            <a
                                onClick={() => alternar(p.id)}
                                role="button"
                                tabIndex={0}
                                aria-expanded={abierta === p.id}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        alternar(p.id);
                                    }
                                }}
                                style={{
                                    cursor: "pointer",
                                    color: "var(--texto)",
                                    display: "flex",
                                    gap: "0.8rem",
                                    alignItems: "center",
                                    padding: "0.7rem 0",
                                }}
                            >
                                <i className="fa-solid fa-chevron-down flecha"></i>
                                <span style={{ flex: 1 }}><strong>{p.pregunta}</strong></span>
                            </a>
                            <div className="submenu faq-answer">
                                <p>{p.respuesta}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <section className="help-contact">
                <h2>¿Necesitas más ayuda?</h2>
                <div className="date" style={{ boxShadow: "var(--sombra-contenedor)" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(15rem, 1fr))" }}>
                        <FilaContacto icono="fa-solid fa-envelope" titulo="Correo" texto="MantiaCM@gmail.com" />
                        <FilaContacto icono="fa-solid fa-location-dot" titulo="Ubicación" texto="Centro Nacional Minero, Sogamoso, Boyacá" />
                    </div>
                </div>
            </section>

            <div className="btn-container help-actions">
                <Link to="/about">
                    <button className="btn-2" title="ir a acerca de">
                        <i className="fa-solid fa-info-circle"></i>
                        Acerca de MANTIA
                    </button>
                </Link>
            </div>
        </div>
        </Layout>
    );
}

export default Ayuda;