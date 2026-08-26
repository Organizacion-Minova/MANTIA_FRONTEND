import React from 'react';
import { useState } from "react";
import { Boton, BotonLink } from "../../components/common/Button";
import { PageWelcome, Searcher } from "../../components/common/welcome";
import { Form, Text, Textarea, Dropzone } from '../../components/common/forms';
import '../../styles/Gases/gases.css';

function FormularioGases({onCancel}){
    return(
        <Form
           titulo="Agregar nuevo registro" 
           descripcion="Ingresa los datos del formulario diario de gases"
           onCancel={onCancel}
           textoBoton="Guardar"
           iconoBoton="fa-solid fa-floppy-disk"
        >
            <div className="col-span-6">
                <Text
                    label="Ubicación:"
                    id="ubicacion"
                    name="ubicacion"
                    placeholder="Ubicación"
                />
            </div>
            <div className="col-span-3">
                <Text
                    label="Oxígeno:"
                    id="nivelOxigeno"
                    name="nivelOxigeno"
                    placeholder="Nivel de O2"
                    required
                />
            </div>
            <div className="col-span-3">
                <Text
                    label="Metano:"
                    id="nivelMetano"
                    name="nivelMetano"
                    placeholder="Nivel de CH4"
                    required
                />
            </div>
            <div className="col-span-3">
                <Text
                    label="Dióxido de carbono:"
                    id="nivelDioxidoDeCarbono"
                    name="nivelDioxidoDeCarbono"
                    placeholder="Nivel de CO2"
                    required
                />
            </div>
            <div className="col-span-3">
                <Text
                    label="Monóxido de carbono:"
                    id="nivelMonoxidoDeCarbono"
                    name="nivelMonoxidoDeCarbono"
                    placeholder="Nivel de CO"
                    required
                />
            </div>
            <div className="col-span-3">
                <Text
                    label="Ácido sulfhídrico:"
                    id="nivelAcidoSulfhidrico"
                    name="nivelAcidoSulfhidrico"
                    placeholder="Nivel de H2S"
                    required
                />
            </div>
            <div className="col-span-3">
                <Text
                    label="Dióxido de nitrógeno:"
                    id="nivelDioxidoDeNitrogeno"
                    name="nivelDioxidoDeNitrogeno"
                    placeholder="Nivel de NO₂" 
                    required
                />
            </div>
            <div className="col-span-6">
                <Text
                    label="Responsable de la medición:"
                    id="responsableMedicion"
                    name="responsableMedicion"
                    placeholder="Nombre responsable" 
                    required
                />
            </div>
            <div className="col-span-6">
                <Textarea
                    label="Observaciones"
                    id="observaciones"
                    name="observaciones"
                    rows={4}
                    placeholder="Observaciones"
                    required
                />
            </div>
        </Form>
    )
}

export function FormatoGases() {
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    return (
        <div>
            <PageWelcome
                titulo="FORMATO DE GASES"
                descripcion="Este es el formato de la medición de gases."
            />
            <Searcher placeholder="Buscar por ubicación, nivel de gas, responsable, observaciones"/>
            <br />
            <table className="form">
                <tbody>
                    <tr>
                        <th colSpan="10">FORMATO MEDICIÓN DE GASES MINA DIDÁCTICA</th>
                    </tr>
                    <tr>
                        <th colSpan="4" rowSpan="2">Mina Didáctica Sena</th>
                        <th colSpan="3">Fecha de medición:</th>
                        <th data-label="dia"></th>
                        <th data-label="mes"></th>
                        <th data-label="año"></th>  
                    </tr>
                    <tr>
                        <th colSpan="3">Hora Ingreso a Monitoreo:</th>
                        <th data-label="dia"></th>
                        <th data-label="mes"></th>
                        <th data-label="año"></th>  
                    </tr>

                    <tr>
                        <th rowspan="2">Labor/Hora</th>
                        <th colSpan="9">REPORTE REGISTRO Y MEDICIÓN DE GASES </th>
                    </tr>
                    <tr>
                        <th>%<br/>O2</th>
                        <th>%<br/>CH4</th>
                        <th>%<br/>CO2</th>
                        <th>%<br/>CO</th>
                        <th>%<br/>H2S</th>
                        <th>%<br/>NO₂</th>
                        <th>Responsable de la<br/>medición</th>
                        <th>Observaciones</th>
                        <th></th>
                    </tr>
                    <tr>
                        <th>TUNEL 1</th>
                        <td data-label="Valor O2"></td>
                        <td data-label="Valor CH4"></td>
                        <td data-label="Valor CO2"></td>
                        <td data-label="Valor CO"></td>
                        <td data-label="Valor H2S"></td>
                        <td data-label="Valor NO2"></td>
                        <td data-label="Responsable de la medición"></td>
                        <td data-label="Observaciones"></td>
                        <td>
                            <div className="btn-container">
                                <Boton
                                    clase="btn-azul"
                                    icono="fa-solid fa-plus"
                                    title="Agregar"
                                    onClick={() => setMostrarFormulario(true)}
                                />
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <th colSpan="2" rowSpan="3">VLP valores límites<br/>permisibles para gases<br/>en PPM y %</th>
                        <th>CH4</th> 
                        <th>CO2</th> 
                        <th>CO</th> 
                        <th>H2S</th> 
                        <th>NO₂</th> 
                        <th colSpan="3" rowSpan="3">La concentración de oxígeno en el aire debe ser mínimo<br/>O2 = 19.5% y no mayor a O2 = 23.5% en volumen.</th>
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
                            <div className='card-firma'>
                                <Dropzone 
                                    label="FIRMA DE JEFE DE MINA:"
                                    id="firmaJefeMina"
                                    name="firmaJefeMina"
                                    ayuda=""
                                    required
                                />
                            </div>
                        </td>
                        <td colSpan="4">
                            <div className='card-firma'>
                                <Dropzone 
                                    label="Vo. Bo. LIDER SST:"
                                    id="firmaResponsable"
                                    name="firmaResponsable"
                                    ayuda=""
                                    required
                                />
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
            <br/>
            <div className="btn-container">
                <Boton
                    clase="btn-azul"
                    icono="fa-solid fa-file-excel"
                    texto="Exportar Excel"
                />
                <Boton
                    clase="btn-azul"
                    icono="fa-solid fa-file-pdf"
                    texto="Exportar PDF"
                />
                <BotonLink
                    link="/gases"
                    clase="btn-2"
                    icono="fa-solid fa-arrow-left"
                    texto="Regresar"
                />
            </div>
            {mostrarFormulario && (
                <FormularioGases onCancel={() => setMostrarFormulario(false)} />
            )}
        </div>
    );
}
