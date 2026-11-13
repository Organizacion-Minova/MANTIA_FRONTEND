import '../../styles/Profile/profile.css';

export function DropzoneProfile ({ nombre = "", rol = "", id, name, onChange, preview }) {
    
    const obtenerIniciales = (nombreCompleto) => {
        const partes = nombreCompleto.trim().split(" ");
        if (partes.length >= 2) {
            return (partes[0][0] + partes[1][0]).toUpperCase();
        }
        return partes[0] ? partes[0][0].toUpperCase() : "U";
    };

    const iniciales = obtenerIniciales(nombre);

    return (
        <div className="avatar-section">
            <label htmlFor={id}>
                <div className="avatar-wrap">
                    <div className="avatar-wrap-img">
                        <input
                            id={id}
                            name={name}
                            type="file"
                            accept="image/*"
                            onChange={onChange}
                            className="sr-only"
                        />

                        {preview ? (
                            <img 
                                src={preview} 
                                alt={`Foto de perfil de ${nombre}`} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            <p style={{ color: 'white', fontSize: '4rem', margin: 0 }}>
                                {iniciales}
                            </p>
                        )}

                        <div className='avatar-overlay'>
                            <i className="fa-solid fa-camera"></i>
                            <p style={{ color: 'white' }}>Cambiar foto</p>
                        </div>
                    </div>
                </div>
            </label>
            <p style={{ textTransform: 'capitalize', fontWeight: 'bold', marginTop: '0.5rem'}}>{nombre}</p>
            <span className="rol-badge"><i className="fa-solid fa-shield-halved"></i>{rol}</span>
        </div>
    );
}