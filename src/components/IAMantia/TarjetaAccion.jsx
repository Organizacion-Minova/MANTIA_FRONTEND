/* =====================================================================
   MANTIA IA · Tarjeta de acción de administrador
   Cuando un administrador le pide al asistente algo como "crea el rol
   Supervisor" o "desactiva a juan@correo.com", la IA solo PROPONE la
   acción. Esta tarjeta muestra el resumen y los botones; la acción se
   hace en el backend solo al pulsar "Confirmar".
   ===================================================================== */
import { useSyncExternalStore } from 'react';
import api from '../../api/axios';
import { mensajeDeError } from '../../utils/errores';
import { guardarAccion, obtenerEstado, suscribir } from './chatStore.js';
import '../../styles/IA-acciones.css';

// pendiente → enviando → hecha | cancelada | error
export default function TarjetaAccion({ accion }) {
  // El estado de la tarjeta se guarda en chatStore: al cambiar de página no vuelve a "pendiente"
  const guardada = useSyncExternalStore(suscribir, () => obtenerEstado().acciones[accion.id]);
  const estado = guardada?.estado ?? 'pendiente';
  const mensaje = guardada?.mensaje ?? '';

  const responder = async (confirmar) => {
    guardarAccion(accion.id, { estado: 'enviando', mensaje: '' });
    try {
      const { data } = await api.post(`/api/ai/acciones/${accion.id}/${confirmar ? 'confirmar' : 'cancelar'}`);
      guardarAccion(accion.id, { estado: confirmar ? 'hecha' : 'cancelada', mensaje: data.message });
    } catch (error) {
      guardarAccion(accion.id, { estado: 'error', mensaje: mensajeDeError(error, 'No se pudo completar la acción.') });
    }
  };

  const abierta = estado === 'pendiente' || estado === 'enviando';

  return (
    <div className={`mc-accion mc-accion-${estado}`} role="group" aria-label="Acción por confirmar">
      <p className="mc-accion-titulo">
        <i className="fa-solid fa-user-shield" aria-hidden="true" /> {accion.resumen}
      </p>

      {abierta ? (
        <div className="mc-accion-botones">
          <button
            type="button"
            className="mc-accion-confirmar"
            disabled={estado === 'enviando'}
            onClick={() => responder(true)}
          >
            {estado === 'enviando' ? 'Procesando…' : 'Confirmar'}
          </button>
          <button
            type="button"
            className="mc-accion-cancelar"
            disabled={estado === 'enviando'}
            onClick={() => responder(false)}
          >
            Cancelar
          </button>
        </div>
      ) : (
        <p className="mc-accion-resultado" aria-live="polite">{mensaje}</p>
      )}
    </div>
  );
}