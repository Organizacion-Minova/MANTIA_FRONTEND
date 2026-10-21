// Un archivo pequeño que traduce las claves de highlights a ícono y texto con pluralización
const HIGHLIGHTS = {
  upcoming_preoperational: {
    icon: "fa-solid fa-clock",
    text: (n) => (n === 1 ? "1 preoperacional próximo" : `${n} preoperacionales próximos`),
  },
  upcoming_diagnostics: {
    icon: "fa-solid fa-clock",
    text: (n) => (n === 1 ? "1 diagnóstico próximo" : `${n} diagnósticos próximos`),
  },
  upcoming_calibrations: {
    icon: "fa-solid fa-clock",
    text: (n) => (n === 1 ? "1 calibración próxima" : `${n} calibraciones próximas`),
  },
};

export function getHighlight(key, value) {
  const config = HIGHLIGHTS[key];
  if (!config) return null;
  return { key, icon: config.icon, text: config.text(value) };
}