import { useState, useEffect, useMemo } from 'react';
import { Boton, BotonLink } from "../../components/common/Button";
import { Select, Text } from '../../components/common/forms';
import { PageWelcome } from "../../components/common/welcome";
import LoadingScreen from "../../components/LoadingScreen";
import { obtenerMedicionesGases } from "../../api/gasMeasurement";
import { obtenerUbicaciones } from "../../api/location";
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

const limitesGases = {
    oxigeno: { campo: 'oxygen', limite: 19.5, tipo: 'min', unidad: '%', label: 'Oxígeno (O₂)' },
    metano: { campo: 'methane', limite: 1.0, tipo: 'max', unidad: '%', label: 'Metano (CH₄)' },
    dioxido_carbono: { campo: 'carbon_dioxide', limite: 0.5, tipo: 'max', unidad: '%', label: 'Dióxido de Carbono (CO₂)' },
    acido_sulfhidrico: { campo: 'hydrogen_sulfide', limite: 1.0, tipo: 'max', unidad: 'ppm', label: 'Ácido Sulfhídrico (H₂S)' },
    monoxido_carbono: { campo: 'carbon_monoxide', limite: 25.0, tipo: 'max', unidad: 'ppm', label: 'Monóxido de Carbono (CO)' },
    dioxido_nitrogeno: { campo: 'nitrogen_dioxide', limite: 0.2, tipo: 'max', unidad: 'ppm', label: 'Dióxido de Nitrógeno (NO₂)' }
};

const formatearFecha = (fecha) => fecha.split('-').reverse().join('/');

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

const getChartData = (meta, registros, esAmpliado = false) => ({
    labels: registros.map((r) => formatearFecha(r.fecha)),
    datasets: [{
        label: `${meta.label} (${meta.unidad})`,
        data: registros.map((r) => r.detalle[meta.campo] === null ? null : Number(r.detalle[meta.campo])),
        backgroundColor: [
            getCssVar('--acento-mantia'),
            getCssVar('--secundario')
        ].slice(-registros.length),
        borderRadius: esAmpliado ? 6 : 4,
        barThickness: esAmpliado ? 50 : undefined
    }]
});

function CompararGases() {
    const [gasAmpliadoKey, setGasAmpliadoKey] = useState(null);
    const [mediciones, setMediciones] = useState([]);
    const [ubicaciones, setUbicaciones] = useState([]);
    const [ubicacionId, setUbicacionId] = useState('');
    const [cargando, setCargando] = useState(true);
    const metaAmpliada = gasAmpliadoKey ? limitesGases[gasAmpliadoKey] : null;

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const [respuestaMediciones, respuestaUbicaciones] = await Promise.all([obtenerMedicionesGases(), obtenerUbicaciones()]);
                const mina = (respuestaUbicaciones.ubicaciones || []).filter((u) => u.location_category?.name === 'Mina');
                setMediciones(respuestaMediciones.data || []);
                setUbicaciones(mina);
                setUbicacionId(mina[0]?.id ?? '');
            } catch (err) {
            } finally {
                setCargando(false);
            }
        };
        cargarDatos();
    }, []);

    const registros = useMemo(() => mediciones
        .map((m) => ({ fecha: m.measurement_date, detalle: m.detail?.find((d) => String(d.location_id) === String(ubicacionId)) }))
        .filter((r) => r.detalle && Object.values(limitesGases).some((g) => r.detalle[g.campo] !== null))
        .slice(0, 2),
    [mediciones, ubicacionId]);

    const [ultimo, penultimo] = registros;
    const comparados = [...registros].reverse(); 

    if (cargando) return <LoadingScreen indeterminado/>
    return (
        <div className="cards-grid">
            <PageWelcome
                titulo="COMPARACIÓN DE GASES"
                descripcion="Este es el análisis comparativo de gases."
                mostrarHistorial={true}
            />
            <section className="seccion1">
                <div className="panel-filtros-horizontal">
                    <div>
                        <Select
                            label="Ubicación"
                            value={ubicacionId}
                            onChange={(e) => setUbicacionId(e.target.value)}
                            opciones={ubicaciones.map((ubi) => ({ valor: ubi.id, etiqueta: ubi.name }))}
                        />
                    </div>
                    <div>
                        <Text
                            label="Último Registro"
                            disabled
                            value={ultimo ? formatearFecha(ultimo.fecha) : ''}
                        />
                    </div>
                    <div>
                        <Text
                            label="Penúltimo Registro"
                            disabled
                            value={penultimo ? formatearFecha(penultimo.fecha) : ''}
                        />
                    </div>
                </div>
            </section>
            <section className="seccion2">
                {!registros.length ? (
                    <p>No hay mediciones registradas para esta ubicación.</p>
                ) : metaAmpliada ? (
                    <div id="vistaAmpliada" className='card-mini-grafica'>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{fontFamily: 'var(--fuente-principal)', fontWeight: '400'}}>{metaAmpliada.label}</h2>
                            <Boton
                                clase="btn-azul"
                                onClick={() => setGasAmpliadoKey(null)}
                                icono="fa-solid fa-xmark"
                                titulo="Disminuir gráfica"
                            />
                        </div>
                        <div style={{ height: '400px', width: '100%' }}>
                            <Bar
                                options={getChartOptions(metaAmpliada, true)}
                                data={getChartData(metaAmpliada, comparados, true)}
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
                                            data={getChartData(meta, comparados)}
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
                    titulo="Ir a la página de Medición de gases"
                />
            </div>
        </div>
    );
}

export default CompararGases;