import { useState } from 'react';
import { PageWelcome } from "../../components/common/welcome";
import { Boton } from "../../components/common/Button";
import { DropzoneProfile } from "../../components/common/DropzoneProfile";
import { Text, Select } from "../../components/common/forms";
import '../../styles/Profile/profile.css';

function Profile() {
    const [fotoArchivo, setFotoArchivo] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const handleImageChange = (e) => { 
        const file = e.target.files[0];
        if (file) {
            setFotoArchivo(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    return (
        <div className='grid-contenedor-3'>
            <PageWelcome
                titulo="MI PERFIL"
                descripcion="Información personal y configuración de la cuenta."
            />
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