import { useState } from 'react';
import { Boton, BotonLink } from "../../components/common/Button";
import { PageWelcome } from "../../components/common/welcome";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Bar } from 'react-chartjs-2';
import '../../styles/Gases/gases.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    annotationPlugin
);

const ubicaciones = [
    "Tunel 2", "Galeria 1 centro", "Galeria 2 centro", "Galeria 2 norte",
    "Transversal norte", "Galeria 3 norte", "Galeria 3 centro", "Cruzada 33",
    "Galeria 33", "Pozo", "Galeria 4", "Galeria 3 sur",
    "Galeria 2 sur", "Transversal sur", "Tunel 3", "Tunel 1"
];

const limitesGases = {
    oxigeno: { limite: 19.5, tipo: 'min', unidad: '%', label: 'Oxígeno (O₂)' },
    metano: { limite: 1.0, tipo: 'max', unidad: '%', label: 'Metano (CH₄)' },
    dioxido_carbono: { limite: 0.5, tipo: 'max', unidad: '%', label: 'Dióxido de Carbono (CO₂)' },
    acido_sulfhidrico: { limite: 1.0, tipo: 'max', unidad: 'ppm', label: 'Ácido Sulfhídrico (H₂S)' },
    monoxido_carbono: { limite: 25.0, tipo: 'max', unidad: 'ppm', label: 'Monóxido de Carbono (CO)' },
    dioxido_nitrogeno: { limite: 0.2, tipo: 'max', unidad: 'ppm', label: 'Dióxido de Nitrógeno (NO₂)' }
};

const getCssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

const getChartOptions = (meta, esAmpliado = false) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        annotation: {
            annotations: {
                lineaLimite: {
                    type: 'line',
                    yMin: meta.limite,
                    yMax: meta.limite,
                    borderColor: getCssVar('--rojo'),
                    borderWidth: 2,
                    borderDash: esAmpliado ? [5, 5] : [4, 4],
                    label: {
                        display: true,
                        content: `Límite: ${meta.limite} ${meta.unidad} ${meta.tipo}`,
                        position: esAmpliado ? 'start' : 'end',
                        backgroundColor: getCssVar('--rojo'),
                        color: getCssVar('--contenedor'),
                        font: { size: esAmpliado ? 12 : 9 }
                    }
                }
            }
        }
    },
    scales: {
        y: { beginAtZero: true }
    }
});

const getChartData = (meta, esAmpliado = false) => ({
    labels: ['15/03/2026', '16/03/2026'],
    datasets: [{
        label: `${meta.label} (${meta.unidad})`,
        data: [meta.limite * 0.8, meta.limite * 0.9],
        backgroundColor: [
        getCssVar('--acento-mantia'),
        getCssVar('--secundario') 
        ],
        borderRadius: esAmpliado ? 6 : 4,
        barThickness: esAmpliado ? 50 : undefined
    }]
});

function CompararGases() {
    const [gasAmpliadoKey, setGasAmpliadoKey] = useState(null);
    const metaAmpliada = gasAmpliadoKey ? limitesGases[gasAmpliadoKey] : null;

    return (
        <div className="cards-grid">
            <PageWelcome
                titulo="COMPARACIÓN DE GASES"
                descripcion="Este es el análisis comparativo de gases."
            />
            <section className="seccion1">
                <div className="panel-filtros-horizontal">
                    <div className="control-input">
                        <label>Ubicación</label>
                        <select defaultValue={ubicaciones[0]}>
                            {ubicaciones.map((ubi) => (
                            <option key={ubi} value={ubi}>
                                {ubi}
                            </option>
                            ))}
                        </select>
                    </div>

                    <div className="control-input">
                        <label>Último Registro</label>
                        <input readOnly />
                    </div>

                    <div className="control-input">
                        <label>Penúltimo Registro</label>
                        <input readOnly />
                    </div>
                </div>
            </section>
            <section className="seccion2">
                {metaAmpliada ? (
                    <div id="vistaAmpliada" className='card-mini-grafica'>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{fontFamily: 'var(--fuente-principal)', fontWeight: '400'}}>{metaAmpliada.label}</h2>
                            <Boton 
                                clase="btn-azul" 
                                onClick={() => setGasAmpliadoKey(null)}
                                icono="fa-solid fa-xmark"
                            />
                        </div>
                        <div style={{ height: '400px', width: '100%' }}>
                            <Bar
                                options={getChartOptions(metaAmpliada, true)}
                                data={getChartData(metaAmpliada, true)}
                            />
                        </div>
                    </div>
                ) : (
                    <div id="vistaTablero" className="grid-multigas">
                        {Object.keys(limitesGases).map((key) => {
                            const meta = limitesGases[key];

                            return (
                                <div
                                    key={key}
                                    className="card-mini-grafica"
                                    onClick={() => setGasAmpliadoKey(key)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <h3>
                                    <span>{meta.label} <strong>[{meta.unidad}]</strong></span>
                                    <i className="fa-solid fa-expand" title="Ampliar gráfica"></i>
                                    </h3>
                                    <div className="contenedor-canvas-mini">
                                        <Bar
                                            options={getChartOptions(meta)}
                                            data={getChartData(meta)}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
         
            <div className="btn-container">
                <BotonLink
                    link="/gases"
                    clase="btn-2"
                    icono="fa-solid fa-arrow-left"
                    texto="Regresar"
                />
            </div>
        </div>
    );
}

export default CompararGases;