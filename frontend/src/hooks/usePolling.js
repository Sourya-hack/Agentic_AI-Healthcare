import { useEffect, useRef } from "react";

export function usePolling(callback, enabled, intervalMs = 3000) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!enabled) return undefined;
    const id = setInterval(() => callbackRef.current(), intervalMs);
    return () => clearInterval(id);
  }, [enabled, intervalMs]);
}

