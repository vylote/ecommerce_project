import { useCallback, useEffect, useEffectEvent, useState } from "react";

export default function useReloadableRequest(load, onError) {
  const [version, setVersion] = useState(0);
  const [completed, setCompleted] = useState(null);
  const reportError = useEffectEvent(onError);
  const reload = useCallback(() => setVersion((current) => current + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    async function run() {
      try {
        await load(signal);
      } catch (error) {
        if (!signal.aborted) reportError(error);
      } finally {
        if (!signal.aborted) setCompleted({ load, version });
      }
    }

    void run();
    return () => controller.abort();
  }, [load, version]);

  return { loading: completed?.load !== load || completed?.version !== version, reload };
}
