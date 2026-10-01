import { useState, useEffect } from "react";
import { PageWelcome, Searcher } from "../../components/common/welcome";
import { Boton } from "../../components/common/Button";
import { Form, Text } from '../../components/common/forms';
import { obtenerEmpresas, guardarEmpresa, actualizarEmpresa, eliminarEmpresa } from "../../api/company";
import { useSearch } from "../../hooks/useSearch";

function Formulario({ onCancel, onSuccess, empresaEditar = null }) {
    const [formData, setFormData] = useState({
        nit: empresaEditar ? empresaEditar.nit : '',
        nombre: empresaEditar ? empresaEditar.name : '',
        telefono: empresaEditar ? empresaEditar.phone : '',
        correo: empresaEditar ? empresaEditar.email : '',
        direccion: empresaEditar ? empresaEditar.address : ''
    });

    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);
    const isEditing = Boolean(empresaEditar);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setCargando(true);
        setError(null);

        try {
            if (isEditing) {
                await actualizarEmpresa(empresaEditar.tax_id, formData);
            } else {
                await guardarEmpresa(formData);
            }
            onSuccess();
            onCancel();
        } catch (err) {
            const mensajeServidor = err.response?.data?.message || "Error al procesar la solicitud.";
            setError(mensajeServidor);
        } finally {
            setCargando(false);
        }
    };

    return (
        <Form
            titulo={isEditing ? "Editar empresa" : "Agregar nueva empresa"}
            descripcion={isEditing ? "Modifique los datos de la empresa" : "Ingrese los datos de la nueva empresa"}
            onCancel={onCancel}
            onSubmit={handleSubmit}
            textoBoton={cargando ? "Guardando..." : isEditing ? "Actualizar" : "Guardar"}
            iconoBoton="fa-solid fa-floppy-disk"
        >
            {error && (
                <div className="col-span-6">
                    {error}
                </div>
            )}
            <div className="col-span-3">
                <Text
                    label="NIT:"
                    id="nit"
                    name="nit"
                    placeholder="NIT de la empresa"
                    value={formData.nit}
                    onChange={handleChange}
                    disabled={!!empresaEditar}
                    required
                />
            </div>
            <div className="col-span-3">
                <Text
                    label="Nombre:"
                    id="nombre"
                    name="nombre"
                    placeholder="Nombre de la empresa"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="col-span-3">
                <Text
                    label="Teléfono:"
                    id="telefono"
                    name="telefono"
                    type="tel"
                    placeholder="Teléfono de la empresa"
                    value={formData.telefono}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="col-span-3">
                <Text
                    label="Correo electrónico:"
                    id="correo"
                    name="correo"
                    type="email"
                    placeholder="Correo electrónico de la empresa"
                    value={formData.correo}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="col-span-6">
                <Text
                    label="Dirección:"
                    id="direccion"
                    name="direccion"
                    placeholder="Dirección de la empresa"
                    value={formData.direccion}
                    onChange={handleChange}
                    required
                />
            </div>
        </Form>
    );
}

function Empresas() {
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [empresaAEditar, setEmpresaAEditar] = useState(null);
    const [empresas, setEmpresas] = useState([]);
    const [cargando, setCargando] = useState(true);

    const { busqueda, setBusqueda, itemsFiltrados: empresasFiltradas } = useSearch(
        empresas,
        ['nit', 'name', 'phone', 'email', 'address']
    );

    const cargarLista = async () => {
        setCargando(true);
        try {
            const data = await obtenerEmpresas();
            setEmpresas(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error al cargar empresas:", err);
            setEmpresas([]);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarLista();
    }, []);

    const handleCrear = () => {
        setEmpresaAEditar(null);
        setMostrarFormulario(true);
    };

    const handleEditar = (empresa) => {
        setEmpresaAEditar(empresa);
        setMostrarFormulario(true);
    };

    const handleEliminar = async (id) => {
        if (window.confirm("¿Está seguro de eliminar esta empresa?")) {
            try {
                await eliminarEmpresa(id);
                cargarLista();
            } catch (err) {
                console.error("Error al eliminar la empresa:", err);
                if (err.response && err.response.data && err.response.data.message) {
                    alert(err.response.data.message);
                }
            }
        }
    };

    return (
        <div className="list-grid">
            <header className="bienvenida">
                <PageWelcome
                    titulo="Empresas"
                    descripcion="Este es el formato de las empresas"
                />
                <Searcher
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar por NIT, nombre, teléfono, correo electrónico o dirección"
                />
            </header>
            <div className="table-responsive">
                <table className="table">
                    <thead>
                        <tr>
                            <th>NIT</th>
                            <th>Nombre</th>
                            <th>Teléfono</th>
                            <th>Correo electrónico</th>
                            <th>Dirección</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cargando ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: "center" }}>Cargando empresas...</td>
                            </tr>
                        ) : empresasFiltradas.length > 0 ? (
                            empresasFiltradas.map((emp) => (
                                <tr key={emp.tax_id}>
                                    <td>{emp.nit}</td>
                                    <td>{emp.name}</td>
                                    <td>{emp.phone}</td>
                                    <td>{emp.email}</td>
                                    <td>{emp.address}</td>
                                    <td>
                                        <div className="btn-container">
                                            <Boton
                                                clase="btn-azul"
                                                title="Ver registro"
                                                icono="fa-solid fa-eye"
                                            />
                                            <Boton
                                                clase="btn-azul"
                                                onClick={() => handleEditar(emp)}
                                                title="Editar registro"
                                                icono="fa-solid fa-edit"
                                            />
                                            <Boton
                                                clase="btn-azul"
                                                onClick={() => handleEliminar(emp.tax_id)}
                                                title="Eliminar registro"
                                                icono="fa-solid fa-trash"
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: "center" }}>
                                    {busqueda ? "No se encontraron resultados" : "No hay empresas registradas"}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="btn-container">
                <Boton
                    clase="btn-azul"
                    texto="Nueva Empresa"
                    icono="fa-solid fa-plus"
                    onClick={handleCrear}
                    title="Registrar nueva empresa"
                />
                {mostrarFormulario && (
                    <Formulario
                        empresaEditar={empresaAEditar}
                        onCancel={() => setMostrarFormulario(false)}
                        onSuccess={cargarLista}
                    />
                )}
            </div>
        </div>
    );
}

export default Empresas;