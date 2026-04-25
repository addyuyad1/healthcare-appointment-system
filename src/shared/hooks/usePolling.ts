import { useEffect, useRef } from "react";

export function usePolling(
  callback: () => void,
  delay: number,
  enabled = true,
) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const intervalId = window.setInterval(() => {
      callbackRef.current();
    }, delay);

    return () => window.clearInterval(intervalId);
  }, [delay, enabled]);
}
