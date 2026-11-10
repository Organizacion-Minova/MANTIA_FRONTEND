/* =====================================================================
   MANTIA IA · Almacén de la conversación
   El chat vive aquí y no dentro del componente, así que NO se pierde al
   cambiar de página (aunque el componente se vuelva a montar). También se
   guarda en sessionStorage: sobrevive a recargar la página y se borra al
   cerrar la pestaña o al cerrar sesión.
   Si una respuesta de la IA llega mientras el usuario está en otra página,
   igual queda guardada aquí.
   ===================================================================== */
const CLAVE = 'mantia-ia-chat-v1';

const base = (usuarioId = null) => ({
  usuarioId,                  // dueño de la conversación (si cambia el usuario, se reinicia)
  mensajes: [],               // vacío = se muestra el mensaje de bienvenida
  abierto: false,             // ventana abierta o cerrada
  sinLeer: true,              // badge "1" del botón flotante
  valor: '',                  // texto que el usuario está escribiendo
  pantallaUltimaPregunta: null,
  enviando: false,
  acciones: {},               // resultado de las tarjetas de administrador por id
});

function cargar() {
  try {
    const crudo = sessionStorage.getItem(CLAVE);
    if (!crudo) return base();
    const guardado = JSON.parse(crudo);

    // Si se recargó la página con una respuesta en camino, esa respuesta ya no llegará:
    // se quita el "escribiendo…" y se excluye la pregunta del historial.
    const mensajes = [];
    (guardado.mensajes ?? []).forEach((m) => {
      if (m.escribiendo) {
        const anterior = mensajes[mensajes.length - 1];
        if (anterior) anterior.excluir = true;
        return;
      }
      mensajes.push(m);
    });
    const acciones = Object.fromEntries(
      Object.entries(guardado.acciones ?? {}).filter(([, a]) => a?.estado !== 'enviando')
    );

    return { ...base(), ...guardado, mensajes, acciones, enviando: false };
  } catch {
    return base();
  }
}

let estado = cargar();
const oyentes = new Set();

const guardar = () => {
  try {
    sessionStorage.setItem(CLAVE, JSON.stringify(estado));
  } catch {
    // Sin sessionStorage el chat sigue funcionando mientras no se recargue la página.
  }
};

const avisar = () => oyentes.forEach((fn) => fn());

// Los ids de los mensajes continúan después del mayor que ya exista
let contador = estado.mensajes.reduce((mayor, m) => Math.max(mayor, m.id || 0), 0);
export const nuevoId = () => ++contador;

export const obtenerEstado = () => estado;

export const suscribir = (fn) => {
  oyentes.add(fn);
  return () => oyentes.delete(fn);
};

// Acepta un objeto con los campos a cambiar o una función (estadoActual) => cambios
export function actualizar(cambio) {
  const parcial = typeof cambio === 'function' ? cambio(estado) : cambio;
  estado = { ...estado, ...parcial };
  guardar();
  avisar();
}

export function guardarAccion(id, resultado) {
  actualizar((prev) => ({ acciones: { ...prev.acciones, [id]: resultado } }));
}

// Si entra otro usuario, no debe ver la conversación del anterior
export function asegurarUsuario(usuarioId) {
  if (usuarioId == null || estado.usuarioId === usuarioId) return;
  estado = base(usuarioId);
  guardar();
  avisar();
}

// Al cerrar sesión
export function limpiarChatIA() {
  estado = base();
  try {
    sessionStorage.removeItem(CLAVE);
  } catch {
    // nada que borrar
  }
  avisar();
}