import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * A pausable stopwatch. Time is computed from Date.now() rather than by
 * counting ticks, so it stays accurate if the interval runs late.
 */
export function useStopwatch() {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const accumulatedMs = useRef(0); // time banked before the current run
  const startedAt = useRef<number | null>(null);
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentMs = () =>
    accumulatedMs.current + (startedAt.current ? Date.now() - startedAt.current : 0);

  const clearTick = () => {
    if (interval.current) clearInterval(interval.current);
    interval.current = null;
  };

  const start = useCallback(() => {
    if (startedAt.current !== null) return;
    startedAt.current = Date.now();
    setIsRunning(true);
    interval.current = setInterval(() => {
      setElapsedSeconds(Math.floor(currentMs() / 1000));
    }, 1000);
  }, []);

  /** Stops the clock and returns the total elapsed seconds. */
  const pause = useCallback((): number => {
    if (startedAt.current !== null) {
      accumulatedMs.current = currentMs();
      startedAt.current = null;
      clearTick();
      setIsRunning(false);
    }
    const seconds = Math.floor(accumulatedMs.current / 1000);
    setElapsedSeconds(seconds);
    return seconds;
  }, []);

  const reset = useCallback(() => {
    clearTick();
    accumulatedMs.current = 0;
    startedAt.current = null;
    setIsRunning(false);
    setElapsedSeconds(0);
  }, []);

  useEffect(() => clearTick, []);

  return { elapsedSeconds, isRunning, start, pause, reset };
}
