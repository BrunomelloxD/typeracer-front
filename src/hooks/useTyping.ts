import { useEffect, useMemo, useRef, useState } from 'react';

export interface TypingMetrics {
    typed: string;
    correctChars: number;
    totalKeystrokes: number;
    progress: number; // 0..100
    accuracy: number; // 0..100
    isComplete: boolean;
    setTyped: (value: string) => void;
    reset: () => void;
}

/**
 * Compara `typed` vs `target` caractere a caractere.
 *  - correctChars: prefixo correto contínuo (usado para WPM)
 *  - totalKeystrokes: monotonicamente crescente (acurácia "honesta")
 *  - progress: correctChars / target.length * 100
 */
export function useTyping(target: string): TypingMetrics {
    const [typed, setTypedRaw] = useState('');
    const totalKeystrokesRef = useRef(0);
    const correctRef = useRef(0);
    const lastTypedRef = useRef('');

    const setTyped = (value: string) => {
        if (value.length > target.length) {
            value = value.slice(0, target.length);
        }
        // conta nova tecla quando o tamanho aumentou
        if (value.length > lastTypedRef.current.length) {
            const newChars = value.length - lastTypedRef.current.length;
            totalKeystrokesRef.current += newChars;
            for (let i = lastTypedRef.current.length; i < value.length; i++) {
                if (value[i] === target[i]) correctRef.current += 1;
            }
        }
        lastTypedRef.current = value;
        setTypedRaw(value);
    };

    const reset = () => {
        totalKeystrokesRef.current = 0;
        correctRef.current = 0;
        lastTypedRef.current = '';
        setTypedRaw('');
    };

    // sempre que o target muda, zera
    useEffect(() => {
        reset();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [target]);

    const correctPrefix = useMemo(() => {
        let n = 0;
        for (let i = 0; i < typed.length && i < target.length; i++) {
            if (typed[i] === target[i]) n += 1;
            else break;
        }
        return n;
    }, [typed, target]);

    const progress = target.length === 0 ? 0 : (correctPrefix / target.length) * 100;
    const accuracy =
        totalKeystrokesRef.current === 0
            ? 100
            : (correctRef.current / totalKeystrokesRef.current) * 100;

    return {
        typed,
        correctChars: correctPrefix,
        totalKeystrokes: totalKeystrokesRef.current,
        progress,
        accuracy: Math.max(0, Math.min(100, accuracy)),
        isComplete: typed.length === target.length && correctPrefix === target.length,
        setTyped,
        reset,
    };
}
