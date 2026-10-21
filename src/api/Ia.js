import api from './axios';

// Envía la pregunta al backend (que es quien habla con la IA) y devuelve el texto de la respuesta.
// MantiaAI le pasa el historial: [{ role: 'user' | 'assistant', content: '...' }]
export async function sendAiMessage(texto, historial) {
    try {
        const { data } = await api.post('/api/ai/chat', { mensaje: texto, historial });
        return data.respuesta;
    } catch (error) {
        const mensaje =
            error.response?.data?.message ??
            error.response?.data?.errors?.mensaje?.[0] ??
            'No pude responder en este momento. Intenta de nuevo.';
        throw new Error(mensaje);
    }
}