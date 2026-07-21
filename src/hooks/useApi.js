import { useState, useEffect, useCallback } from "react";

/**
 * Hook générique pour appels API.
 *
 * const { data, loading, error, refetch } = useApi(() => MonService.liste());
 */
export function useApi(fn, deps = []) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      setData(result);
    } catch (err) {
      setError(err.message ?? "Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

/**
 * Hook pour actions manuelles (POST, PUT, PATCH, DELETE).
 *
 * const { execute, loading, error } = useAction(MonService.creer);
 * await execute(payload);
 */
export function useAction(fn) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      return await fn(...args);
    } catch (err) {
      setError(err.message ?? "Une erreur est survenue.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fn]);

  return { execute, loading, error };
}
