import { useCallback, useEffect, useRef, useState } from "react";
import { getDashboard } from "../api/dashboard";

export default function useDashboard() {
  const [data, setData] = useState(null);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Evita que StrictMode o varios botones disparen cargas simultáneas.
  const solicitudEnCurso = useRef(null);

  const load = useCallback(async () => {
    if (solicitudEnCurso.current) {
      return solicitudEnCurso.current;
    }

    setLoading(true);
    setError(null);

    const solicitud = Promise.resolve().then(async () => {
      try {
        const body = await getDashboard();
        setData(body.data);
        setMeta(body.meta);
        return body;
      } catch (err) {
        setError(err);
        return null;
      } finally {
        setLoading(false);
        solicitudEnCurso.current = null;
      }
    });

    solicitudEnCurso.current = solicitud;
    return solicitud;
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, meta, loading, error, reload: load };
}
