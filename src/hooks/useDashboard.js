import { useCallback, useEffect, useState } from "react";
import { getDashboard } from "../api/dashboard";

export default function useDashboard() {
  const [data, setData] = useState(null);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const body = await getDashboard();
      setData(body.data);
      setMeta(body.meta);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, meta, loading, error, reload: load };
}