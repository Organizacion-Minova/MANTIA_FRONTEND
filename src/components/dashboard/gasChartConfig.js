const limitesGases = {
  oxigeno: { campo: "oxygen", limite: 19.5, tipo: "min", unidad: "%", label: "Oxígeno (O₂)" },
  metano: { campo: "methane", limite: 1.0, tipo: "max", unidad: "%", label: "Metano (CH₄)" },
  dioxido_carbono: { campo: "carbon_dioxide", limite: 0.5, tipo: "max", unidad: "%", label: "Dióxido de Carbono (CO₂)" },
  acido_sulfhidrico: { campo: "hydrogen_sulfide", limite: 1.0, tipo: "max", unidad: "ppm", label: "Ácido Sulfhídrico (H₂S)" },
  monoxido_carbono: { campo: "carbon_monoxide", limite: 25.0, tipo: "max", unidad: "ppm", label: "Monóxido de Carbono (CO)" },
  dioxido_nitrogeno: { campo: "nitrogen_dioxide", limite: 0.2, tipo: "max", unidad: "ppm", label: "Dióxido de Nitrógeno (NO₂)" },
};

const formatearFecha = (fecha) => fecha.split("-").reverse().join("/");
const getCssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

const getChartOptions = (meta, esAmpliado = false) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    annotation: {
      annotations: {
        lineaLimite: {
          type: "line",
          yMin: meta.limite,
          yMax: meta.limite,
          borderColor: getCssVar("--rojo"),
          borderWidth: 2,
          borderDash: esAmpliado ? [5, 5] : [4, 4],
          label: {
            display: true,
            content: `Límite: ${meta.limite} ${meta.unidad} ${meta.tipo}`,
            position: esAmpliado ? "start" : "end",
            backgroundColor: getCssVar("--rojo"),
            color: getCssVar("--contenedor"),
            font: { size: esAmpliado ? 12 : 9 },
          },
        },
      },
    },
  },
  scales: {
    y: { beginAtZero: true },
  },
});

const getChartData = (meta, registros, esAmpliado = false) => ({
  labels: registros.map((registro) => formatearFecha(registro.fecha)),
  datasets: [{
    label: `${meta.label} (${meta.unidad})`,
    data: registros.map((registro) => registro.detalle[meta.campo] === null
      ? null
      : Number(registro.detalle[meta.campo])),
    backgroundColor: [
      getCssVar("--acento-mantia"),
      getCssVar("--secundario"),
    ].slice(-registros.length),
    borderRadius: esAmpliado ? 6 : 4,
    barThickness: esAmpliado ? 50 : undefined,
  }],
});

export { limitesGases, getChartOptions, getChartData, formatearFecha };
