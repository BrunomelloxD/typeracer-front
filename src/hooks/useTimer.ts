import { useEffect, useRef, useState } from 'react';

export interface TimerState {
    remainingMs: number;
    elapsedMs: number;
    running: boolean;
    start: () => void;
    stop: () => void;
    reset: () => void;
}

/**
 * Countdown regressivo de `durationMs`. Atualiza a cada 100ms.
 */
export function useTimer(durationMs: number): TimerState {
    const [running, setRunning] = useState(false);
    const [elapsedMs, setElapsedMs] = useState(0);
    const startedAtRef = useRef<number | null>(null);
    const intervalRef = useRef<number | null>(null);

    useEffect(
        () => () => {
            if (intervalRef.current) window.clearInterval(intervalRef.current);
        },
        [],
    );

    const start = () => {
        if (running) return;
        startedAtRef.current = Date.now() - elapsedMs;
        setRunning(true);
        intervalRef.current = window.setInterval(() => {
            const elapsed = Date.now() - (startedAtRef.current ?? Date.now());
            if (elapsed >= durationMs) {
                setElapsedMs(durationMs);
                stop();
            } else {
                setElapsedMs(elapsed);
            }
        }, 100);
    };

    const stop = () => {
        if (intervalRef.current) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setRunning(false);
    };

    const reset = () => {
        stop();
        setElapsedMs(0);
        startedAtRef.current = null;
    };

    return {
        remainingMs: Math.max(0, durationMs - elapsedMs),
        elapsedMs,
        running,
        start,
        stop,
        reset,
    };
}
