import api from './axios';

// formData: name, last_name, document_type, document_number y (opcional) photo o remove_photo
export async function actualizarPerfil(formData) {
    const { data } = await api.post('/api/profile', formData);
    return data;
}

export async function cambiarPassword(actual, nueva, confirmacion) {
    const { data } = await api.put('/api/profile/password', {
        current_password: actual,
        password: nueva,
        password_confirmation: confirmacion,
    });
    return data;
}
