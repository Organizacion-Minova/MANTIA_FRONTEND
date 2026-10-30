import api from './axios';

// Envía la pregunta al backend (que es quien habla con la IA) y devuelve el texto de la respuesta.
// MantiaAI le pasa el historial: [{ role: 'user' | 'assistant', content: '...' }]
// y la pantalla actual (ej: "/machines/cardMachine/5") para que la IA sepa de qué se habla.
// Devuelve { respuesta, acciones }: "acciones" trae lo que la IA propone a un administrador
// (crear rol, desactivar usuario...) y que espera el botón "Confirmar" del chat.
export async function sendAiMessage(texto, historial, pantalla) {
    try {
        const { data } = await api.post('/api/ai/chat', { mensaje: texto, historial, pantalla });
        return { respuesta: data.respuesta, acciones: data.acciones ?? [] };
    } catch (error) {
        const mensaje =
            error.response?.data?.message ??
            error.response?.data?.errors?.mensaje?.[0] ??
            'No pude responder en este momento. Intenta de nuevo.';
        throw new Error(mensaje);
    }
}