import { useEffect, useRef, useState } from 'react';
import { btnPrimary, btnSecondary } from '../lib/ui';

interface CopyButtonProps {
    value: string;
    label?: string;
    copiedLabel?: string;
    variant?: 'primary' | 'secondary';
    className?: string;
}

type CopyState = 'idle' | 'copied' | 'failed';

const RESET_MS = 1800;
const FAILED_LABEL = 'Não foi possível copiar';

export function CopyButton({
    value,
    label = 'Copiar código',
    copiedLabel = 'Copiado',
    variant = 'secondary',
    className = '',
}: CopyButtonProps) {
    const [state, setState] = useState<CopyState>('idle');
    const timeoutRef = useRef<number | undefined>(undefined);

    useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

    const show = (next: CopyState) => {
        setState(next);
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = window.setTimeout(() => setState('idle'), RESET_MS);
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            show('copied');
        } catch {
            show('failed');
        }
    };

    const visible = state === 'copied' ? copiedLabel : state === 'failed' ? FAILED_LABEL : label;
    const announcement = state === 'copied' ? copiedLabel : state === 'failed' ? FAILED_LABEL : '';
    const base = variant === 'primary' ? btnPrimary : btnSecondary;

    return (
        <>
            <button type="button" onClick={handleCopy} className={`${base} ${className}`}>
                {state === 'copied' && (
                    <svg
                        aria-hidden="true"
                        viewBox="0 0 16 16"
                        className="size-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M3.5 8.5l3 3 6-7" />
                    </svg>
                )}
                {visible}
            </button>
            <span className="sr-only" role="status" aria-live="polite">
                {announcement}
            </span>
        </>
    );
}
