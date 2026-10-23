const NO_DATA_MESSAGE = {
  unavailable: "Sin datos disponibles",
  error: "No se pudo cargar",
};

export function getNoDataMessage(state) {
  return NO_DATA_MESSAGE[state] ?? "Sin datos disponibles";
}