import { useState, useEffect } from 'react';
import { PageWelcome } from "../../components/common/welcome";
import { Boton } from "../../components/common/Button";
import { DropzoneProfile } from "../../components/common/DropzoneProfile";
import { Text, Select } from "../../components/common/forms";
import { getUser, getPendingRequests, approveRequest, rejectRequest } from "../../api/auth";


function Profile() {
    const [fotoArchivo, setFotoArchivo] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [user, setUser] = useState(null);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        getUser().then((data) => {
            setUser(data);
            // Si es admin, cargamos solicitudes
            const isAdmin = data.email === 'mantiaadso@gmail.com' || data.roles?.some(r => r.name === 'Administrador');
            if (isAdmin) {
                loadRequests();
            }
        }).catch(() => {});
    }, []);

    const loadRequests = async () => {
        try {
            const reqs = await getPendingRequests();
            setPendingRequests(reqs);
        } catch (err) {
            console.error(err);
        }
    };

    const handleApprove = async (id) => {
        try {
            await approveRequest(id);
            setMessage("Usuario aprobado correctamente.");
            loadRequests();
        } catch (err) {
            setMessage("Error al aprobar usuario.");
        }
    };

    const handleReject = async (id) => {
        try {
            await rejectRequest(id);
            setMessage("Usuario rechazado.");
            loadRequests();
        } catch (err) {
            setMessage("Error al rechazar usuario.");
        }
    };

    const isAdmin = user?.email === 'mantiaadso@gmail.com' || user?.roles?.some(r => r.name === 'Administrador');

    const handleImageChange = (e) => { 
        const file = e.target.files[0];
        if (file) {
            setFotoArchivo(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    return (
        <div className='grid-profile'>
            <PageWelcome
                titulo="MI PERFIL"
                descripcion="Información personal y configuración de la cuenta."
            />
            {message && <div style={{ padding: "10px", background: "#e8f5e9", color: "#2e7d32", borderRadius: "6px", marginBottom: "15px" }}>{message}</div>}
            
            {isAdmin && (
                <section className='cards2' style={{ marginBottom: '20px' }}>
                    <div className='card'>
                        <div className="card-title">
                            <div className="icon blue"><i className="fa-solid fa-user-shield icono-titulo"></i></div>
                            <h3>Panel de Administración - Solicitudes Pendientes</h3>
                        </div>
                        <p>Aprueba o rechaza las solicitudes de registro de nuevos usuarios.</p><br/>
                        {pendingRequests.length === 0 ? (
                            <p style={{ color: "#706f6c" }}>No hay solicitudes pendientes en este momento.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {pendingRequests.map((req) => (
                                    <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f9f9f9', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                                        <div>
                                            <strong>{req.name}</strong><br/>
                                            <span style={{ fontSize: '13px', color: '#666' }}>{req.email}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button 
                                                onClick={() => handleApprove(req.id)}
                                                style={{ background: '#28a745', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                                            >
                                                Aprobar
                                            </button>
                                            <button 
                                                onClick={() => handleReject(req.id)}
                                                style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                                            >
                                                Rechazar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            )}
            <section className='cards'>
                <div className='card' style={{ display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <DropzoneProfile
                        nombre="papoi papoi"
                        rol="Rol" 
                        id="fotoPerfil"
                        name="fotoPerfil"
                        onChange={handleImageChange}
                        preview={previewUrl}
                    />
                </div>
                <div className='card'>
                    <div className="card-title">
                        <div className="icon blue"><i className="fa-solid fa-address-card icono-titulo"></i></div>
                        <h3>Información de contacto</h3>
                    </div>
                    <p>Datos registrados en el sistema.</p>
                    <ul className="steps">
                        <li><span className="step-num"><i className="fa-solid fa-id-card"></i></span><span>CC ___________</span></li>
                        <li><span className="step-num"><i className="fa-regular fa-envelope"></i></span><span>correo@ejemplo.co</span></li>
                        <li><span className="step-num"><i className="fa-solid fa-phone"></i></span><span>300 000 0000</span></li>
                        <li><span className="step-num"><i className="fa-regular fa-calendar-check"></i></span><span>Miembro desde ___</span></li>
                    </ul>
                </div>
            </section>       
            <section className="cards2">
                <div className="card">
                    <div className="card-title">
                        <div className="icon blue"><i className="fa-solid fa-user icono-titulo"></i></div>
                        <h3>Datos personales</h3>
                        <div style={{ marginLeft: 'auto' }}>
                            <Boton 
                                clase="btn-azul"
                                icono="fa-solid fa-pen-to-square"
                                texto="Editar"
                                id="btnEditarDatos"
                                name="btnEditarDatos"
                            />
                        </div>
                    </div>
                    <p>Edita tu información personal.</p><br/>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: '16px' }}>
                        <div className="col-span-3">
                            <Text
                                label="Nombre"
                                id="inputNombre"
                                name="inputNombre"
                                placeholder="Nombre"
                                required
                            />
                        </div>
                        <div className="col-span-3">
                            <Text
                                label="Apellido"
                                id="inputApellido"
                                name="inputApellido"
                                placeholder="Apellido"
                                required
                            />
                        </div>
                        <div className="col-span-3">
                            <Select
                                label="Tipo de documento"
                                id="inputTipoDoc"
                                name="inputTipoDoc"
                                opciones={['Selecciona…', 'Cédula de ciudadanía', 'Cédula de extranjería', 'Pasaporte']}
                                required
                            />
                        </div>
                        <div className="col-span-3">
                            <Text
                                label="Número de documento"
                                id="inputDoc"
                                name="inputDoc"
                                placeholder="Número de documento"
                                required
                            />
                        </div>
                        <div className="col-span-3">
                            <Text
                                label="Correo electrónico"
                                id="inputCorreo"
                                name="inputCorreo"
                                placeholder="correo@ejemplo.co"
                                required
                            />
                        </div>
                        <div className="col-span-3">
                            <Text
                                label="Teléfono"
                                id="inputTelefono"
                                name="inputTelefono"
                                placeholder="300 000 0000"
                                required
                            />
                        </div>
                        <div className="col-span-6">
                            <Text
                                label="Dirección"
                                id="inputDireccion"
                                name="inputDireccion"
                                placeholder="Calle, Ciudad"
                                required
                            />
                        </div>
                    </div>
                    <div style={{ marginTop: '20px' }}>
                        <Boton
                            clase="btn-azul"
                            icono="fa-solid fa-floppy-disk"
                            texto="Guardar cambios"
                            id="btnGuardar"
                            name="btnGuardar"
                        />
                    </div>
                </div>
            </section>     
            <section className="middle">
                <div className="card">
                    <div className="card-title"> 
                        <div className="icon blue"><i className="fa-solid fa-lock icono-titulo"></i></div>
                        <h3>Seguridad</h3>
                    </div>
                    <p>Contraseña y acceso a la cuenta.</p>
                    <div className="seguridad-item">
                        <div className="seg-info">
                            <div className="seg-icon"><i className="fa-solid fa-key"></i></div>
                            <div>
                                <div className="seg-label">Contraseña</div>
                                <div className="seg-desc">Última actualización: —</div>
                            </div>
                        </div>
                        <Boton
                            clase="btn-azul"
                            icono="fa-solid fa-rotate-right"
                            texto="Cambiar"
                            id="btnCambiar"
                            name="btnCambiar"
                        />
                    </div>

                    <div className="seguridad-item">
                        <div className="seg-info">
                            <div className="seg-icon"><i className="fa-solid fa-mobile-screen"></i></div>
                            <div>
                                <div className="seg-label">Autenticación en dos pasos</div>
                                <div className="seg-desc">No configurada</div>
                            </div>
                        </div>
                        <Boton
                            clase="btn-azul"
                            icono="fa-solid fa-plus"
                            texto="Activar"
                            id="btnActivar"
                            name="btnActivar"
                        />
                    </div>
                </div>

                <div className="card">
                    <div className="card-title">
                        <div className="icon blue"><i className="fa-solid fa-clock-rotate-left icono-titulo"></i></div>
                        <h3>Últimos accesos</h3>
                    </div>
                    <p>Historial reciente de sesiones.</p>

                    <div className="historial-wrap">
                        <div className="historial-item">
                            <span>—</span>
                            <span>— · —</span>
                        </div>
                        <div className="historial-item">
                            <span>—</span>
                            <span>— · —</span>
                        </div>
                        <div className="historial-item">
                            <span>—</span>
                            <span>— · —</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}


export default Profile;