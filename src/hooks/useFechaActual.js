import { useEffect, useState } from "react";

export function useFechaActual() {
  const [fechaActual, setFechaActual] = useState("");

  useEffect(() => {
    const fecha = new Date();

    const opciones = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    };

    setFechaActual(fecha.toLocaleDateString("es-ES", opciones));
  }, []);

  return fechaActual;
}
