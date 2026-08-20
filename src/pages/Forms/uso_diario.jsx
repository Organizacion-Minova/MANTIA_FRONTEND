import React from 'react';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { ChevronDownIcon } from '@heroicons/react/16/solid';
import { Boton } from '../../components/common/Button.jsx';
import '../../styles/Form/Form.css';

// Base del formulario
export function Form({ titulo, descripcion, onSubmit, onCancel, children, textoBoton = "Guardar", iconoBoton = "fa-solid fa-floppy-disk" }) {
    return (
        <div className="form-modal-overlay" onClick={onCancel}>
            <form onSubmit={onSubmit} className="form-container" onClick={(e) => e.stopPropagation()}>
                {onCancel && (
                <button
                    type="button"
                    onClick={onCancel}
                    className="form-cancel-btn"
                    title="Cancelar"
                >
                    <span className="sr-only">Cancelar</span>
                    <XMarkIcon className="form-cancel-icon" aria-hidden="true" />
                </button>
                )}

                <div className="form-body-wrapper">
                    <div className="form-header-section">
                        {titulo && <h2 className="form-title">{titulo}</h2>}
                        {descripcion && <p className="form-description">{descripcion}</p>}

                        <div className="form-grid">
                        {children}
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <Boton
                        clase="btn-azul"
                        icono={iconoBoton}
                        texto={textoBoton}
                    />
                </div>
            </form>
        </div>
    );
}

// Campo de texto
export function Text({ label, id, name, type = "text", placeholder, value, onChange, prefix, required = false }) {
    return (
        <div className="form-field-wrapper">
            <label htmlFor={id} className="form-label">
                {label} {required && <span className="form-required-star">*</span>}
            </label>
            <div style={{ marginTop: '0.5rem' }}>
                <div className={`form-input-container ${prefix ? 'has-prefix' : ''}`}>
                    {prefix && <div className="form-prefix-text">{prefix}</div>}
                    <input
                        id={id}
                        name={name}
                        type={type}
                        placeholder={placeholder}
                        value={value}
                        onChange={onChange}
                        required={required}
                        className={`form-input ${prefix ? 'with-prefix' : ''}`}
                    />
                </div>
            </div>
        </div>
    );
}

// Textarea
export function Textarea({ label, id, name, rows = 3, placeholder, value, onChange, ayuda, required = false }) {
    return (
        <div className="form-field-wrapper">
            <label htmlFor={id} className="form-label">
                {label} {required && <span className="form-required-star">*</span>}
            </label>
            <div style={{ marginTop: '0.5rem' }}>
                <textarea
                id={id}
                name={name}
                rows={rows}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="form-textarea"
                required={required}
                />
            </div>
            {ayuda && <p className="form-help-text">{ayuda}</p>}
        </div>
    );
}

// Select
export function Select({ label, id, name, value, onChange, opciones = [], required = false }) {
    return (
        <div className="form-field-wrapper">
            <label htmlFor={id} className="form-label">
                {label} {required && <span className="form-required-star">*</span>}
            </label>
            <div style={{ marginTop: '0.5rem' }} className="form-select-wrapper">
                <select
                id={id}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                className="form-select"
                >
                {opciones.map((op, idx) => (
                    <option key={idx} value={op.valor || op}>
                    {op.etiqueta || op}
                    </option>
                ))}
                </select>
                <ChevronDownIcon aria-hidden="true" className="form-select-icon" />
            </div>
        </div>
    );
}

// Carga de archivos
export function Dropzone({ label, id, name, onChange, ayuda = "PNG, JPG, PDF hasta 10MB", required = false }) {
    return (
        <div className="form-field-wrapper">
            <label htmlFor={id} className="form-label">
                {label} {required && <span className="form-required-star">*</span>}
            </label>
            <div className="form-dropzone-container">
                <div>
                    <PhotoIcon aria-hidden="true" className="form-dropzone-icon" />
                    <div className="form-dropzone-text-group">
                        <label htmlFor={id} className="form-dropzone-label">
                        <span>Subir un archivo</span>
                        <input
                            id={id}
                            name={name}
                            type="file"
                            onChange={onChange}
                            className="sr-only"
                            required={required}
                        />
                        </label>
                        <p className="form-dropzone-subtext">o arrastrar y soltar</p>
                    </div>
                    <p className="form-dropzone-help">{ayuda}</p>
                </div>
            </div>
        </div>
    );
}

// Checkbox
export function Checkbox({ label, descripcion, id, name, checked, onChange }) {
    return (
        <div className="form-checkbox-field">
            <div className="form-checkbox-container">
                <input
                id={id}
                name={name}
                type="checkbox"
                checked={checked}
                onChange={onChange}
                className="form-checkbox"
                />
            </div>
            <div className="form-checkbox-label-group">
                <label htmlFor={id} className="form-checkbox-label">
                {label}
                </label>
                {descripcion && <p className="form-checkbox-description">{descripcion}</p>}
            </div>
        </div>
    );
}

// Date
export function Date({ label, id, name, value, onChange, required = false }) {
    return (
        <div className="form-field-wrapper">
            <label htmlFor={id} className="form-label">
                {label} {required && <span className="form-required-star">*</span>}
            </label>
            <div style={{ marginTop: '0.5rem' }}>
                <input
                id={id}
                name={name}
                type="date"
                value={value}
                onChange={onChange}
                required={required}
                className="form-input"
                style={{ border: '1px solid #d1d5db' }}
                />
            </div>
        </div>
    );
}

// Time
export function Time({ label, id, name, value, onChange, required = false }) {
    return (
        <div className="form-field-wrapper">
            <label htmlFor={id} className="form-label">
                {label} {required && <span className="form-required-star">*</span>}
            </label>
            <div style={{ marginTop: '0.5rem' }}>
                <input
                id={id}
                name={name}
                type="time"
                value={value}
                onChange={onChange}
                required={required}
                className="form-input"
                style={{ border: '1px solid #d1d5db' }}
                />
            </div>
        </div>
    );
}

// DateTime
export function DateTime({ label, id, name, value, onChange, required = false }) {
    return (
        <div className="form-field-wrapper">
            <label htmlFor={id} className="form-label">
                {label} {required && <span className="form-required-star">*</span>}
            </label>
            <div style={{ marginTop: '0.5rem' }}>
                <input
                id={id}
                name={name}
                type="datetime-local"
                value={value}
                onChange={onChange}
                required={required}
                className="form-input"
                style={{ border: '1px solid #d1d5db' }}
                />
            </div>
        </div>
    );
}

// Selección única
export function Radio({ label, id, name, value, onChange, opciones = [], required = false }) {
    return (
        <div className="form-field-wrapper">
            <label className="form-label">
                {label} {required && <span className="form-required-star">*</span>}
            </label>
            <div className="form-radio-group">
                {opciones.map((op, idx) => (
                <div key={idx} className="form-radio-item">
                    <input
                    id={`${id}-${idx}`}
                    name={name}
                    type="radio"
                    value={op.valor || op}
                    checked={value === (op.valor || op)}
                    onChange={onChange}
                    className="form-radio-input"
                    />
                    <label htmlFor={`${id}-${idx}`} className="form-radio-label">
                    {op.etiqueta || op}
                    </label>
                </div>
                ))}
            </div>
        </div>
    );
}