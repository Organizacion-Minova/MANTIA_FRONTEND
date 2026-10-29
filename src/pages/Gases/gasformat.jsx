import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Boton, BotonLink } from "../../components/common/Button";
import { PageWelcome, Searcher } from "../../components/common/welcome";
import { Form, Text, Textarea, Select, Dropzone } from '../../components/common/forms';
import { obtenerMedicionPorId, actualizarDetalleGases, actualizarCabeceraGases } from "../../api/gasMeasurement";
import { useSearch } from "../../hooks/useSearch";
import LoadingScreen from "../../components/LoadingScreen";
import { useToast } from "../../context/ToastContext.jsx";
import { validarGroserias } from "../../components/common/Validations";
import { exportarGasExcelUnitario, exportarGasPdfUnitario } from "../../api/gasMeasurement";

const gases = [
    { key: 'oxygen', label: 'O2', nombre: 'Oxígeno', simbolo: '%', max: 100 },
    { key: 'methane', label: 'CH4', nombre: 'Metano', simbolo: '%', max: 100 },
    { key: 'carbon_dioxide', label: 'CO2', nombre: 'Dióxido de carbono', simbolo: '%', max: 100 },
    { key: 'carbon_monoxide', label: 'CO', nombre: 'Monóxido de carbono', simbolo: 'PPM', max: 999 },
    { key: 'hydrogen_sulfide', label: 'H2S', nombre: 'Ácido sulfhídrico', simbolo: 'PPM', max: 999 },
    { key: 'nitrogen_dioxide', label: 'NO₂', nombre: 'Dióxido de nitrógeno', simbolo: 'PPM', max: 999 },
];

const camposBusqueda = [...gases.map((g) => g.key), 'responsible_name', 'observation'];

const diligenciada = (detalle) => {
    if (!detalle) return false;
    return gases.some((g) => {
        const val = detalle[g.key];
        return val !== null && val !== undefined && String(val).trim() !== "";
    });
};

const regex_responsable = /^[\p{L}\s.'\-]+$/u;
const regex_observacion = /^[\p{L}\p{N}\s.,;:()\-/%°#¿?¡!]+$/u;
const tipos_firma = ['image/png', 'image/jpeg', 'image/webp'];
const peso_maximo_firma = 2 * 1024 * 1024;

const validar = (datos) => {
    for (const g of gases) {
        const valor = datos[g.key];
        if (valor === null) continue;
        if (!/^-?\d+(\.\d+)?$/.test(valor)) return `El valor de ${g.nombre.toLowerCase()} debe ser un número.`;
        if (Number(valor) < 0) return `${g.nombre} no puede ser menor a 0.`;
        if (Number(valor) > g.max) return `${g.nombre} no puede superar ${g.max}${g.simbolo === '%' ? '%' : ''}.`;
        if (!/^\d+(\.\d{1,2})?$/.test(valor)) return `${g.nombre} admite máximo 2 decimales.`;
    }
    if (datos.responsible_name) {
        if (datos.responsible_name.length > 100) return "El nombre del responsable no puede superar los 100 caracteres.";
        if (!regex_responsable.test(datos.responsible_name)) return "El nombre del responsable solo puede contener letras, espacios, puntos, apóstrofes y guiones.";
    }
    if (datos.observation) {
        if (datos.observation.length > 100) return "La observación no puede superar los 100 caracteres.";
        if (!regex_observacion.test(datos.observation)) return "La observación contiene caracteres no permitidos.";
    }
    const erroresGroserias = validarGroserias({ 
        responsible_name: datos.responsible_name, 
        observation: datos.observation
    });
    if (erroresGroserias.responsible_name) return erroresGroserias.responsible_name;
    if (erroresGroserias.observation) return erroresGroserias.observation;
    return null;
};

function FormularioGases({ detalle, onCancel, onSuccess }) {
    const isEditing = diligenciada(detalle);
    const [formData, setFormData] = useState({
        ...Object.fromEntries(gases.map((g) => [g.key, detalle[g.key] ?? ''])),
        responsible_name: detalle.responsible_name ?? '',
        observation: detalle.observation ?? ''
    });
    const [cargando, setCargando] = useState(false);
    const { advertencia } = useToast(); 

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        const datos = Object.fromEntries(Object.entries(formData).map(([campo, valor]) => [campo, String(valor).trim() === '' ? null : String(valor).trim()]));
        const errorValidacion = validar(datos);
        if (errorValidacion) {
            advertencia(errorValidacion, "Error de validación"); 
            return;
        }

        setCargando(true);

        try {
            await actualizarDetalleGases(detalle.id, datos);
            onSuccess();
            onCancel();
        } catch (err) {
            const errores = err.response?.data?.errors;
            const mensajeError = errores ? Object.values(errores).flat()[0] : err.response?.data?.message || "Error al procesar la solicitud.";
            advertencia(mensajeError, "Error del servidor"); 
        } finally {
            setCargando(false);
        }
    };

    return (
        <Form
            titulo={isEditing ? "Editar registro" : "Agregar nuevo registro"}
            descripcion={isEditing ? "Modifica los datos de la medición" : "Ingresa los datos del formulario diario de gases"}
            onCancel={onCancel}
            onSubmit={handleSubmit}
            textoBoton={cargando ? "Guardando..." : isEditing ? "Actualizar" : "Guardar"}
            iconoBoton="fa-solid fa-floppy-disk"
        >
            <div className="col-span-6">
                <Text
                    label="Ubicación:"
                    id="ubicacion"
                    name="ubicacion"
                    value={detalle.ubicacion}
                    disabled
                />
            </div>
            {gases.map((g) => (
                <div className="col-span-3" key={g.key}>
                    <Text
                        label={`${g.nombre}:`}
                        id={g.key}
                        name={g.key}
                        type="number"
                        step="any"
                        min="0"
                        max={g.max}
                        placeholder={`Nivel de ${g.label}`}
                        value={formData[g.key]}
                        onChange={handleChange}
                    />
                </div>
            ))}
            <div className="col-span-6">
                <Text
                    label="Responsable de la medición:"
                    id="responsible_name"
                    name="responsible_name"
                    placeholder="Nombre responsable"
                    value={formData.responsible_name}
                    onChange={handleChange}
                    maxLength={100}
                />
            </div>
            <div className="col-span-6">
                <Textarea
                    label="Observaciones"
                    id="observation"
                    name="observation"
                    rows={4}
                    maxLength={100}
                    placeholder="Observaciones"
                    value={formData.observation}
                    onChange={handleChange}
                />
            </div>
        </Form>
    );
}

export function FormatoGases() {
    const { advertencia } = useToast();
    const { id } = useParams();
    const [medicion, setMedicion] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [detalleEditar, setDetalleEditar] = useState(null);

    const detalles = useMemo(
        () => (medicion?.detail || []).map((d) => ({ ...d, ubicacion: d.location?.name })),
        [medicion]
    );

    const { busqueda, setBusqueda, filtrosEspeciales, setFiltroEspecial, itemsFiltrados: detallesFiltrados } = useSearch(
        detalles,
        camposBusqueda
    );

    const cargarDatos = async () => {
        try {
        const respuesta = await obtenerMedicionPorId(id);
        setMedicion(respuesta.data); 
        } catch (err) {
            console.error("Error al cargar la medición:", err);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, [id]);

    const guardarCabecera = async (datos) => {
        setMedicion((prev) => ({ ...prev, ...datos }));
        try {
            await actualizarCabeceraGases(id, datos);
        } catch (err) {
    // El aviso de error lo muestra api/axios.js; aquí solo se restaura lo guardado
    console.error("No se pudieron guardar los datos:", err);
    cargarDatos();
        }       
    };

    const handleHora = (e) => guardarCabecera({ measurement_time: e.target.value || null });

    const handleFirma = (campo) => (e) => {
        const archivo = e.target.files[0];
        e.target.value = '';
        if (!archivo) return;
        if (!tipos_firma.includes(archivo.type)) {
            advertencia("La firma debe ser una imagen PNG, JPG o WEBP.");
            return;
        }
        if (archivo.size > peso_maximo_firma) {
            advertencia("La firma es demasiado pesada (máx. 2 MB).");
            return;
        }
        const lector = new FileReader();
        lector.onload = () => guardarCabecera({ [campo]: lector.result });
        lector.readAsDataURL(archivo);
    };

    const [anio, mes, dia] = useMemo(() => {
        if (!medicion || !medicion.measurement_date) {
            return ['', '', ''];
        }
        return medicion.measurement_date.split('-');
    }, [medicion]);

    const opcionesUbicacion = [
        { valor: "", etiqueta: "Todas las ubicaciones" },
        ...[...new Set(detalles.map((d) => d.ubicacion))].map((u) => ({ valor: u, etiqueta: u }))
    ];
    const opcionesResponsable = [
        { valor: "", etiqueta: "Todos los responsables" },
        ...[...new Set(detalles.map((d) => d.responsible_name).filter(Boolean))].map((r) => ({ valor: r, etiqueta: r }))
    ];

    if (cargando) return <LoadingScreen indeterminado/>
    return (
        <div className="list-grid">
            <header className="bienvenida">
                <PageWelcome
                    titulo="FORMATO DE GASES"
                    descripcion="Este es el formato de la medición de gases."
                    mostrarHistorial={true}
                />
                <Searcher
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar por nivel de gas, responsable, observaciones"
                    filtrosAdicionales={
                        <>
                            <Select
                                id="filtroUbicacion"
                                name="filtroUbicacion"
                                value={filtrosEspeciales.ubicacion || ""}
                                onChange={(e) => setFiltroEspecial('ubicacion', e.target.value)}
                                opciones={opcionesUbicacion}
                            />
                            <Select
                                id="filtroResponsable"
                                name="filtroResponsable"
                                value={filtrosEspeciales.responsible_name || ""}
                                onChange={(e) => setFiltroEspecial('responsible_name', e.target.value)}
                                opciones={opcionesResponsable}
                            />
                        </>
                    }
                />
            </header>
            <div className="table-responsive">
                <table className="form">
                    <tbody>
                        <tr>
                            <th colSpan="10">FORMATO MEDICIÓN DE GASES MINA DIDÁCTICA</th>
                        </tr>
                        <tr>
                            <th colSpan="4" rowSpan="2">Mina Didáctica Sena</th>
                            <th colSpan="3">Fecha de medición:</th>
                            <th data-label="dia">{dia || "--"}</th>
                            <th data-label="mes">{mes || "--"}</th>
                            <th data-label="año">{anio || "----"}</th>
                        </tr>
                        <tr>
                            <th colSpan="3">Hora Ingreso a Monitoreo:</th>
                            <td colSpan="3" data-label="hora">
                                <input
                                    type="time"
                                    className="form-input"
                                    value={medicion?.measurement_time?.slice(0, 5) || ''}
                                    onChange={handleHora}
                                    disabled={!medicion}
                                />
                            </td>
                        </tr>

                        <tr>
                            <th rowSpan="2">Labor/Hora</th>
                            <th colSpan="9">REPORTE REGISTRO Y MEDICIÓN DE GASES </th>
                        </tr>
                        <tr>
                            {gases.map((g) => (
                                <th key={g.key}>{g.simbolo}<br />{g.label}</th>
                            ))}
                            <th>Responsable de la<br />medición</th>
                            <th>Observaciones</th>
                            <th></th>
                        </tr>
                        {cargando ? (
                            <tr>
                                <td colSpan="10" style={{ textAlign: "center" }}>Cargando formato...</td>
                            </tr>
                        ) : detallesFiltrados.length > 0 ? (
                            detallesFiltrados.map((d) => (
                                <tr key={d.id}>
                                    <th>{d.ubicacion}</th>
                                    {gases.map((g) => (
                                        <td key={g.key} data-label={`Valor ${g.label}`}>
                                            {d[g.key] !== null ? Number(d[g.key]) : ''}
                                        </td>
                                    ))}
                                    <td data-label="Responsable de la medición">{d.responsible_name}</td>
                                    <td data-label="Observaciones">{d.observation}</td>
                                    <td>
                                        <div className="btn-container">
                                            <Boton
                                                clase="btn-azul"
                                                icono={diligenciada(d) ? "fa-solid fa-edit" : "fa-solid fa-plus"}
                                                titulo={diligenciada(d) ? "Editar registro" : "Agregar registro"}
                                                onClick={() => setDetalleEditar(d)}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="10" style={{ textAlign: "center" }}>
                                    {detalles.length ? "No se encontraron resultados" : "No hay ubicaciones en este formato"}
                                </td>
                            </tr>
                        )}
                        <tr>
                            <th colSpan="2" rowSpan="3">VLP valores límites<br />permisibles para gases<br />en PPM y %</th>
                            <th>CH4</th>
                            <th>CO2</th>
                            <th>CO</th>
                            <th>H2S</th>
                            <th>NO₂</th>
                            <th colSpan="3" rowSpan="3">La concentración de oxígeno en el aire debe ser mínimo<br />O2 = 19.5% y no mayor a O2 = 23.5% en volumen.</th>
                        </tr>
                        <tr>
                            <th>%</th>
                            <th>%</th>
                            <th>PPM</th>
                            <th>PPM</th>
                            <th>PPM</th>
                        </tr>
                        <tr>
                            <th>1</th>
                            <th>0.5</th>
                            <th>25</th>
                            <th>1</th>
                            <th>0.2</th>
                        </tr>
                        <tr>
                            <td colSpan="6">
                                <Dropzone
                                    label="FIRMA DE JEFE DE MINA:"
                                    id="firmaJefeMina"
                                    name="firmaJefeMina"
                                    ayuda="Formatos de imagen, hasta 2 MB"
                                    accept="image/png,image/jpeg,image/webp"
                                    preview={medicion?.chief_signature || ""}
                                    previewLabel="Firma Jefe"
                                    onChange={handleFirma('chief_signature')}
                                    onRemove={() => guardarCabecera({ chief_signature: null })}
                                />
                            </td>
                            <td colSpan="4">
                                <Dropzone
                                    label="Vo. Bo. LÍDER SST:"
                                    id="firmaResponsable"
                                    name="firmaResponsable"
                                    ayuda="Formatos de imagen, hasta 2 MB"
                                    accept="image/png,image/jpeg,image/webp"
                                    preview={medicion?.sst_signature || ""}
                                    previewLabel="Firma SST"
                                    onChange={handleFirma('sst_signature')}
                                    onRemove={() => guardarCabecera({ sst_signature: null })}
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className="btn-container">
                <Boton
                    clase="btn-azul"
                    icono="fa-solid fa-file-excel"
                    texto="Exportar Excel"
                    onClick={() => exportarGasExcelUnitario(medicion.id, medicion.measurement_date)}
                    titulo="Exportar en un archivo de Excel"
                />
                <Boton
                    clase="btn-azul"
                    icono="fa-solid fa-file-pdf"
                    texto="Exportar PDF"
                    onClick={() => exportarGasPdfUnitario(medicion.id, medicion.measurement_date)}
                    titulo="Exportar en un archivo PDF"
                />
                <BotonLink
                    link="/gases"
                    clase="btn-2"
                    icono="fa-solid fa-arrow-left"
                    texto="Regresar"
                    titulo="Ir a la página de Medición de gases"
                />
            </div>
            {detalleEditar && (
                <FormularioGases
                    detalle={detalleEditar}
                    onCancel={() => setDetalleEditar(null)}
                    onSuccess={cargarDatos}
                />
            )}
        </div>
    );
}
