import React, { useState } from 'react';
import { Form, Text, Textarea, Select, Dropzone, Checkbox, Date, Time, DateTime, Radio } from '../../components/common/forms';


function PlantillaFormulario({ onCancel }) {
    const [formData, setFormData] = useState({
        campoTexto: '',
        campoSeleccion: '',
        campoTextarea: '',
        campoArchivo: null,
        campoCheckbox: false,
        campoFecha: '',
        campoHora: '',
        campoFechaHora: '',
        campoRadio: '',
    });


    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value,
        }));
    };


    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Datos enviados:', formData);
        alert(`Formulario Enviado:\n${JSON.stringify(formData, null, 2)}`);
    };


    return (
        <Form
        titulo="Título del Formulario"
        descripcion="Escribe aquí la descripción o instrucciones del formulario."
        onSubmit={handleSubmit}
        onCancel={onCancel}
        textoBoton="Guardar"
        iconoBoton="fa-solid fa-floppy-disk"
        >


            <div className="col-span-3">
                <Text
                label="Campo de Texto"
                id="campoTexto"
                name="campoTexto"
                placeholder="Ingrese texto aquí"
                value={formData.campoTexto}
                onChange={handleChange}
                required
                />
            </div>


            <div className="col-span-3">
                <Select
                label="Campo de Selección"
                id="campoSeleccion"
                name="campoSeleccion"
                value={formData.campoSeleccion}
                onChange={handleChange}
                opciones={['Opción 1', 'Opción 2', 'Opción 3', 'Opción 4']}
                required
                />
            </div>


            <div className="col-span-2">
                <Date
                label="Campo de Fecha"
                id="campoFecha"
                name="campoFecha"
                value={formData.campoFecha}
                onChange={handleChange}
                required
                />
            </div>


            <div className="col-span-2">
                <Time
                label="Campo de Hora"
                id="campoHora"
                name="campoHora"
                value={formData.campoHora}
                onChange={handleChange}
                required
                />
            </div>


            <div className="col-span-2">
                <DateTime
                label="Fecha y Hora"
                id="campoFechaHora"
                name="campoFechaHora"
                value={formData.campoFechaHora}
                onChange={handleChange}
                required
                />
            </div>


            <div className="col-span-6">
                <Textarea
                label="Campo de Textarea"
                id="campoTextarea"
                name="campoTextarea"
                rows={3}
                placeholder="Ingrese descripción aquí"
                value={formData.campoTextarea}
                onChange={handleChange}
                ayuda="Texto de ayuda o indicación."
                required
                />
            </div>


            <div className="col-span-6">
                <Dropzone
                label="Campo de Dropzone"
                id="campoArchivo"
                name="campoArchivo"
                onChange={handleChange}
                ayuda="PNG, JPG, PDF hasta 10MB"
                required
                />
            </div>


            <div className="col-span-3">
                <Radio
                label="Campo de Radio"
                id="campoRadio"
                name="campoRadio"
                value={formData.campoRadio}
                onChange={handleChange}
                opciones={['Opción 1', 'Opción 2', 'Opción 3']}
                required
                />
            </div>


            <div className="col-span-3">
                <Checkbox
                label="Campo de Checkbox"
                descripcion="Descripción opcional de la casilla."
                id="campoCheckbox"
                name="campoCheckbox"
                checked={formData.campoCheckbox}
                onChange={handleChange}
                />
            </div>
        </Form>
    );
}


export default PlantillaFormulario;
