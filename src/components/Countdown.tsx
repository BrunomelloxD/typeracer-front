interface CountdownProps {
    value: number; // 0 mostra "Já"
}

export function Countdown({ value }: CountdownProps) {
    const text = value === 0 ? 'Já' : String(value);
    return (
        <div role="status" aria-live="polite" aria-atomic="true" className="flex flex-col items-center gap-2">
            <span key={value} className="countdown-pop font-mono text-7xl text-accent tabular-nums sm:text-8xl">
                {text}
            </span>
            {value !== 0 && <span className="text-sm text-muted">prepare-se</span>}
        </div>
    );
}
